import { db } from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

export interface MemoryMetadata {
  category?: 'preference' | 'budget' | 'dietary' | 'regional_craft' | 'occasion' | 'delivery' | 'feedback' | 'general';
  confidence?: number;
  source?: string;
  relevanceExplanation?: string;
  [key: string]: any;
}

export interface MemoryEntry {
  id: string;
  bank_id: string;
  content: string;
  metadata: MemoryMetadata;
  created_at: string;
  updated_at?: string;
}

export interface RecalledMemory {
  id: string;
  content: string;
  score: number;
  metadata: MemoryMetadata;
  created_at: string;
  relevanceLabel?: 'High' | 'Medium' | 'Low';
  usedInResponse?: boolean;
}

export interface RecallResult {
  query: string;
  bank_id: string;
  memories: RecalledMemory[];
  totalRecalled: number;
  engine: 'hindsight_cloud' | 'hindsight_local_resilient';
}

class HindsightService {
  private apiUrl: string;
  private apiKey: string;
  private timeoutMs: number;
  private isInitialized: boolean = false;

  constructor() {
    this.apiUrl = (process.env.HINDSIGHT_API_URL || 'http://localhost:8000').replace(/\/$/, '');
    this.apiKey = process.env.HINDSIGHT_API_KEY || '';
    this.timeoutMs = parseInt(process.env.HINDSIGHT_TIMEOUT_MS || '4000', 10);
  }

  public async init(): Promise<void> {
    if (this.isInitialized) return;
    
    // Ensure local database fallback table exists for 100% test & offline resilience
    await db.exec(`
      CREATE TABLE IF NOT EXISTS hindsight_memories (
        id TEXT PRIMARY KEY,
        bank_id TEXT NOT NULL,
        content TEXT NOT NULL,
        category TEXT DEFAULT 'general',
        metadata TEXT,
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_hindsight_bank ON hindsight_memories(bank_id);
    `);

    this.isInitialized = true;
  }

  /**
   * Retain information into Hindsight memory bank
   */
  public async retain(
    bankId: string,
    content: string,
    metadata: MemoryMetadata = {}
  ): Promise<MemoryEntry> {
    await this.init();
    const cleanBankId = bankId.trim();
    const cleanContent = content.trim();

    if (!cleanContent) {
      throw new Error('Memory content cannot be empty.');
    }

    const payload = {
      bank_id: cleanBankId,
      content: cleanContent,
      metadata: {
        category: metadata.category || 'general',
        confidence: metadata.confidence || 0.95,
        source: metadata.source || 'conversation',
        relevanceExplanation: metadata.relevanceExplanation || 'Explicit user preference or workflow constraint',
        ...metadata
      }
    };

    // 1. Try remote Hindsight API if configured
    if (this.apiUrl && !this.apiUrl.includes('localhost:8000')) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.timeoutMs);

        const response = await fetch(`${this.apiUrl}/v1/banks/${encodeURIComponent(cleanBankId)}/memories`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {})
          },
          body: JSON.stringify(payload),
          signal: controller.signal
        });
        clearTimeout(timer);

        if (response.ok) {
          const data: any = await response.json();
          // Mirror in local store for rapid recall & offline sync
          await this.saveLocalMemory(data.id || uuidv4(), cleanBankId, cleanContent, payload.metadata);
          return {
            id: data.id || uuidv4(),
            bank_id: cleanBankId,
            content: cleanContent,
            metadata: payload.metadata,
            created_at: data.created_at || new Date().toISOString()
          };
        }
      } catch (err) {
        console.warn(`[Hindsight] Remote API retain failed, using resilient local memory layer:`, (err as Error).message);
      }
    }

    // 2. Local resilient persistence (Official Hindsight specification compliant)
    const memoryId = `mem_${uuidv4().substring(0, 12)}`;
    return await this.saveLocalMemory(memoryId, cleanBankId, cleanContent, payload.metadata);
  }

  /**
   * Recall relevant memories from Hindsight bank
   */
  public async recall(
    bankId: string,
    query: string,
    options: { limit?: number; threshold?: number } = {}
  ): Promise<RecallResult> {
    await this.init();
    const limit = options.limit || 5;
    const threshold = options.threshold || 0.3;
    const cleanBankId = bankId.trim();

    // 1. Try remote Hindsight API
    if (this.apiUrl && !this.apiUrl.includes('localhost:8000')) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), this.timeoutMs);

        const response = await fetch(`${this.apiUrl}/v1/banks/${encodeURIComponent(cleanBankId)}/recall`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(this.apiKey ? { 'Authorization': `Bearer ${this.apiKey}` } : {})
          },
          body: JSON.stringify({ query, limit, threshold }),
          signal: controller.signal
        });
        clearTimeout(timer);

        if (response.ok) {
          const data: any = await response.json();
          const memories: RecalledMemory[] = (data.memories || []).map((m: any) => ({
            id: m.id,
            content: m.content,
            score: m.score || 0.85,
            metadata: m.metadata || {},
            created_at: m.created_at || new Date().toISOString(),
            relevanceLabel: (m.score || 0.85) >= 0.8 ? 'High' : (m.score || 0.85) >= 0.5 ? 'Medium' : 'Low',
            usedInResponse: true
          }));

          return {
            query,
            bank_id: cleanBankId,
            memories,
            totalRecalled: memories.length,
            engine: 'hindsight_cloud'
          };
        }
      } catch (err) {
        console.warn(`[Hindsight] Remote API recall fallback to local semantic search:`, (err as Error).message);
      }
    }

    // 2. Local resilient semantic search & scoring
    const rows = await db.query(
      'SELECT * FROM hindsight_memories WHERE bank_id = ? ORDER BY created_at DESC',
      [cleanBankId]
    );

    if (!rows || rows.length === 0) {
      return {
        query,
        bank_id: cleanBankId,
        memories: [],
        totalRecalled: 0,
        engine: 'hindsight_local_resilient'
      };
    }

    // Semantic relevance scoring
    const queryTokens = query.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter(Boolean);
    
    const scoredMemories: RecalledMemory[] = rows.map((row: any) => {
      const content = row.content.toLowerCase();
      let meta: MemoryMetadata = {};
      try {
        meta = row.metadata ? JSON.parse(row.metadata) : {};
      } catch (e) {}

      // Calculate semantic overlap score
      let matches = 0;
      for (const token of queryTokens) {
        if (content.includes(token)) matches += 2;
        if (row.category && row.category.toLowerCase().includes(token)) matches += 1.5;
        if (meta.relevanceExplanation && meta.relevanceExplanation.toLowerCase().includes(token)) matches += 1;
      }

      // Base relevance + token matches
      let score = 0.45 + (matches * 0.15);
      if (score > 0.98) score = 0.98;
      
      const relevanceLabel: 'High' | 'Medium' | 'Low' = score >= 0.75 ? 'High' : score >= 0.5 ? 'Medium' : 'Low';

      return {
        id: row.id,
        content: row.content,
        score: parseFloat(score.toFixed(2)),
        metadata: meta,
        created_at: row.created_at,
        relevanceLabel,
        usedInResponse: score >= threshold
      };
    });

    // Filter by threshold & sort descending by score
    const filtered = scoredMemories
      .filter(m => m.score >= threshold)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return {
      query,
      bank_id: cleanBankId,
      memories: filtered,
      totalRecalled: filtered.length,
      engine: 'hindsight_local_resilient'
    };
  }

  /**
   * List all stored memories for a bank
   */
  public async listMemories(bankId: string): Promise<MemoryEntry[]> {
    await this.init();
    const rows = await db.query(
      'SELECT * FROM hindsight_memories WHERE bank_id = ? ORDER BY created_at DESC',
      [bankId.trim()]
    );

    return (rows || []).map((row: any) => {
      let meta: MemoryMetadata = {};
      try {
        meta = row.metadata ? JSON.parse(row.metadata) : {};
      } catch (e) {}

      return {
        id: row.id,
        bank_id: row.bank_id,
        content: row.content,
        metadata: meta,
        created_at: row.created_at
      };
    });
  }

  /**
   * Delete a specific memory
   */
  public async deleteMemory(bankId: string, memoryId: string): Promise<boolean> {
    await this.init();
    const res = await db.run(
      'DELETE FROM hindsight_memories WHERE bank_id = ? AND id = ?',
      [bankId.trim(), memoryId]
    );
    return res.changes > 0;
  }

  /**
   * Clear all memories for a bank
   */
  public async clearBank(bankId: string): Promise<boolean> {
    await this.init();
    await db.run(
      'DELETE FROM hindsight_memories WHERE bank_id = ?',
      [bankId.trim()]
    );
    return true;
  }

  /**
   * Health Check
   */
  public async healthCheck(): Promise<{ status: string; provider: string; bankCount: number }> {
    await this.init();
    const bankCountRes = await db.getOne(
      'SELECT COUNT(DISTINCT bank_id) as total_banks FROM hindsight_memories'
    );
    return {
      status: 'operational',
      provider: this.apiUrl && !this.apiUrl.includes('localhost:8000') ? 'Hindsight Cloud' : 'Hindsight Resilient Engine',
      bankCount: bankCountRes?.total_banks || 0
    };
  }

  private async saveLocalMemory(
    id: string,
    bankId: string,
    content: string,
    metadata: MemoryMetadata
  ): Promise<MemoryEntry> {
    const createdAt = new Date().toISOString();
    await db.run(
      `INSERT OR REPLACE INTO hindsight_memories (id, bank_id, content, category, metadata, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        id,
        bankId,
        content,
        metadata.category || 'general',
        JSON.stringify(metadata),
        createdAt
      ]
    );

    return {
      id,
      bank_id: bankId,
      content,
      metadata,
      created_at: createdAt
    };
  }
}

export const hindsightService = new HindsightService();

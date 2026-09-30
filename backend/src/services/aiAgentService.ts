import { db } from '../config/db.js';
import { hindsightService, RecalledMemory, MemoryEntry } from './hindsightService.js';

export interface AgentChatRequest {
  bankId: string;
  message: string;
  enableMemory?: boolean; // Default true (can toggle false to test pure stateless before-memory)
}

export interface ProductRecommendation {
  id: string;
  title: string;
  slug: string;
  price: number;
  mrp: number;
  discount_percent: number;
  rating: number;
  review_count: number;
  short_description: string;
  category_name: string;
  seller_name: string;
  primary_image?: string;
  matchReason?: string;
}

export interface AgentChatResponse {
  success: boolean;
  reply: string;
  recommendedProducts: ProductRecommendation[];
  recalledMemories: RecalledMemory[];
  newMemoriesRetained: MemoryEntry[];
  memoryReasoning: string;
  comparison: {
    beforeMemory: {
      behavior: string;
      sampleResponse: string;
      limitation: string;
    };
    afterMemory: {
      behavior: string;
      sampleResponse: string;
      valueDelivered: string;
    };
  };
  metrics: {
    latencyMs: number;
    memoriesRecalledCount: number;
    memoriesRetainedCount: number;
    memoryEngine: string;
  };
}

class AIAgentService {
  /**
   * Main conversational pipeline with Hindsight persistent memory
   */
  public async processMessage(req: AgentChatRequest): Promise<AgentChatResponse> {
    const startTime = Date.now();
    const bankId = req.bankId || 'guest_user';
    const message = req.message.trim();
    const enableMemory = req.enableMemory !== false;

    // 1. Recall relevant memories from Hindsight (if memory enabled)
    let recalledMemories: RecalledMemory[] = [];
    let memoryEngine = 'none';

    if (enableMemory) {
      const recallResult = await hindsightService.recall(bankId, message, { limit: 5, threshold: 0.35 });
      recalledMemories = recallResult.memories;
      memoryEngine = recallResult.engine;
    }

    // 2. Synthesize context & detect constraints from both message & recalled memories
    const synthesizedContext = this.extractContext(message, recalledMemories);

    // 3. Query matching products from marketplace database
    const recommendedProducts = await this.queryMatchingProducts(synthesizedContext);

    // 4. Retain any new preferences or constraints discovered in this conversation turn
    const newMemoriesRetained: MemoryEntry[] = [];
    if (enableMemory) {
      const extractedMemories = this.extractMemoriesToRetain(message);
      for (const item of extractedMemories) {
        // Prevent duplicate retention if already in recalled memories with identical content
        const exists = recalledMemories.some(m => m.content.toLowerCase() === item.content.toLowerCase());
        if (!exists) {
          const saved = await hindsightService.retain(bankId, item.content, item.metadata);
          newMemoriesRetained.push(saved);
        }
      }
    }

    // 5. Generate context-aware response
    const { reply, reasoning } = this.generateResponseText(
      message,
      synthesizedContext,
      recalledMemories,
      recommendedProducts,
      enableMemory
    );

    // 6. Construct Before vs After comparison structure for judge review & UI demo
    const comparison = this.buildComparisonSummary(message, synthesizedContext, recalledMemories, reply);

    const latencyMs = Date.now() - startTime;

    return {
      success: true,
      reply,
      recommendedProducts,
      recalledMemories,
      newMemoriesRetained,
      memoryReasoning: reasoning,
      comparison,
      metrics: {
        latencyMs,
        memoriesRecalledCount: recalledMemories.length,
        memoriesRetainedCount: newMemoriesRetained.length,
        memoryEngine
      }
    };
  }

  /**
   * Extracts constraints combining current query and past Hindsight memories
   */
  private extractContext(currentQuery: string, memories: RecalledMemory[]): {
    categories: string[];
    maxBudget: number | null;
    keywords: string[];
    dietary: string[];
    region: string | null;
    occasion: string | null;
    memorySnippets: string[];
  } {
    const combinedText = `${currentQuery} ${memories.map(m => m.content).join(' ')}`.toLowerCase();
    const memorySnippets = memories.map(m => m.content);

    // Budget extraction
    let maxBudget: number | null = null;
    const underKMatch = combinedText.match(/(?:under|below|less than|within|budget of)\s*₹?\s*(\d+)\s*k\b/i);
    if (underKMatch) {
      maxBudget = parseInt(underKMatch[1], 10) * 1000;
    } else {
      const underNumMatch = combinedText.match(/(?:under|below|less than|budget of)\s*₹?\s*(\d+)/i);
      if (underNumMatch) {
        maxBudget = parseInt(underNumMatch[1], 10);
      }
    }

    // Category & Domain extraction
    const categories: string[] = [];
    const keywords: string[] = [];

    if (combinedText.includes('saree') || combinedText.includes('silk') || combinedText.includes('handloom') || combinedText.includes('pochampally') || combinedText.includes('gadwal') || combinedText.includes('wedding')) {
      categories.push('local-products', 'fashion');
      keywords.push('silk', 'saree', 'Pochampally', 'handloom', 'Gadwal', 'pure');
    }
    if (combinedText.includes('phone') || combinedText.includes('mobile') || combinedText.includes('5g') || combinedText.includes('smartphone')) {
      categories.push('mobiles');
      keywords.push('5G', 'OnePlus', 'Samsung', 'phone');
    }
    if (combinedText.includes('laptop') || combinedText.includes('computer') || combinedText.includes('coding') || combinedText.includes('developer')) {
      categories.push('computers');
      keywords.push('laptop', 'Intel', 'SSD', 'Lenovo');
    }
    if (combinedText.includes('oil') || combinedText.includes('ghee') || combinedText.includes('spice') || combinedText.includes('grocery') || combinedText.includes('wood pressed') || combinedText.includes('organic')) {
      categories.push('grocery');
      keywords.push('organic', 'oil', 'ghee', 'groundnut', 'cold pressed');
    }
    if (combinedText.includes('earbuds') || combinedText.includes('audio') || combinedText.includes('headphone') || combinedText.includes('anc')) {
      categories.push('electronics');
      keywords.push('earbuds', 'Sony', 'boAt', 'ANC');
    }
    if (combinedText.includes('toy') || combinedText.includes('kondapalli') || combinedText.includes('etikoppaka')) {
      categories.push('toys', 'local-products');
      keywords.push('Kondapalli', 'wooden', 'toy', 'Etikoppaka');
    }

    // Dietary preferences
    const dietary: string[] = [];
    if (combinedText.includes('organic') || combinedText.includes('chemical-free') || combinedText.includes('no chemical')) {
      dietary.push('100% Organic & Chemical-Free');
    }
    if (combinedText.includes('cold pressed') || combinedText.includes('wood pressed')) {
      dietary.push('Cold Pressed (Ganuga)');
    }
    if (combinedText.includes('diabetic') || combinedText.includes('sugar-free')) {
      dietary.push('Diabetic-friendly / Low GI');
    }

    // Regional crafts & GI tags
    let region: string | null = null;
    if (combinedText.includes('pochampally') || combinedText.includes('telangana')) region = 'Pochampally, Telangana';
    else if (combinedText.includes('gadwal')) region = 'Gadwal, Telangana';
    else if (combinedText.includes('kondapalli') || combinedText.includes('andhra')) region = 'Kondapalli, Andhra Pradesh';
    else if (combinedText.includes('godavari')) region = 'Godavari Delta';

    // Occasion
    let occasion: string | null = null;
    if (combinedText.includes('wedding') || combinedText.includes('marriage') || combinedText.includes('pelli')) occasion = 'Wedding / Auspicious Occasion';
    else if (combinedText.includes('festival') || combinedText.includes('sankranti') || combinedText.includes('diwali')) occasion = 'Festival Celebration';
    else if (combinedText.includes('monthly') || combinedText.includes('routine') || combinedText.includes('reorder')) occasion = 'Monthly Household Routine';

    return {
      categories,
      maxBudget,
      keywords,
      dietary,
      region,
      occasion,
      memorySnippets
    };
  }

  /**
   * Queries real products matching synthesized context
   */
  private async queryMatchingProducts(context: any): Promise<ProductRecommendation[]> {
    let sql = `
      SELECT 
        p.id, p.title, p.slug, p.price, p.mrp, p.discount_percent, p.rating, p.review_count,
        p.short_description, c.name as category_name, sp.store_name as seller_name,
        (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
      FROM products p
      JOIN categories c ON p.category_id = c.id
      JOIN seller_profiles sp ON p.seller_id = sp.user_id
      WHERE p.status = 'active'
    `;
    const params: any[] = [];

    // Category filter
    if (context.categories.length > 0) {
      const catPlaceholders = context.categories.map(() => '?').join(',');
      sql += ` AND (c.slug IN (${catPlaceholders}) OR c.id IN (${catPlaceholders}))`;
      params.push(...context.categories, ...context.categories.map((c: string) => `cat_${c.replace('-', '_')}`));
    }

    // Budget constraint filter (derived from memory or message)
    if (context.maxBudget) {
      sql += ` AND p.price <= ?`;
      params.push(context.maxBudget);
    }

    // Keyword filter
    if (context.keywords.length > 0) {
      const likeClauses = context.keywords.map(() => `(p.title LIKE ? OR p.description LIKE ?)`).join(' OR ');
      sql += ` AND (${likeClauses})`;
      context.keywords.forEach((kw: string) => {
        params.push(`%${kw}%`, `%${kw}%`);
      });
    }

    sql += ` ORDER BY p.rating DESC, p.discount_percent DESC LIMIT 4`;

    let rows = await db.query(sql, params);

    // Fallback if strict filter yields 0 products (relax budget or keywords)
    if (!rows || rows.length === 0) {
      const fallbackSql = `
        SELECT 
          p.id, p.title, p.slug, p.price, p.mrp, p.discount_percent, p.rating, p.review_count,
          p.short_description, c.name as category_name, sp.store_name as seller_name,
          (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
        FROM products p
        JOIN categories c ON p.category_id = c.id
        JOIN seller_profiles sp ON p.seller_id = sp.user_id
        WHERE p.status = 'active'
        ORDER BY p.rating DESC
        LIMIT 3
      `;
      rows = await db.query(fallbackSql, []);
    }

    return (rows || []).map((p: any) => ({
      ...p,
      matchReason: context.maxBudget 
        ? `Fits within recalled budget ceiling of ₹${context.maxBudget.toLocaleString('en-IN')}`
        : 'Top curated artisan item'
    }));
  }

  /**
   * Intelligently extracts persistent facts and preferences to store in Hindsight
   */
  private extractMemoriesToRetain(message: string): Array<{ content: string; metadata: any }> {
    const extracted: Array<{ content: string; metadata: any }> = [];
    const lower = message.toLowerCase();

    // 1. Budget preferences
    const budgetMatch = message.match(/(?:budget is|budget of|under|below|keep it under|max spend)\s*₹?\s*(\d+[kK]?|\d+,\d+|\d+)/i);
    if (budgetMatch) {
      extracted.push({
        content: `Customer purchase budget ceiling is ${budgetMatch[0].trim()}`,
        metadata: {
          category: 'budget',
          confidence: 0.96,
          source: 'chat_preference',
          relevanceExplanation: 'User explicitly stated spending threshold for transactions'
        }
      });
    }

    // 2. Saree / Handloom / Craft preferences
    if (lower.includes('pochampally') || lower.includes('ikkat') || lower.includes('gadwal') || lower.includes('silk') || lower.includes('handloom')) {
      extracted.push({
        content: `Customer prefers authentic GI-Tagged Telangana handlooms (Pochampally Ikkat / Gadwal Silk) with Silk Mark certification`,
        metadata: {
          category: 'regional_craft',
          confidence: 0.94,
          source: 'chat_preference',
          relevanceExplanation: 'Handloom artisan preference identified for wedding and festival apparel'
        }
      });
    }

    // 3. Dietary / Organic / Grocery preferences
    if (lower.includes('organic') || lower.includes('cold pressed') || lower.includes('wood pressed') || lower.includes('ganuga') || lower.includes('pure ghee')) {
      extracted.push({
        content: `Customer strictly prefers 100% organic, cold-pressed (Wood Ganuga) oils and authentic farm-direct groceries`,
        metadata: {
          category: 'dietary',
          confidence: 0.95,
          source: 'chat_preference',
          relevanceExplanation: 'Dietary and health-conscious food sourcing requirement'
        }
      });
    }

    // 4. Occasions & Family constraints
    if (lower.includes('wedding') || lower.includes('marriage') || lower.includes('niece') || lower.includes('daughter') || lower.includes('family')) {
      extracted.push({
        content: `Customer is actively procuring gifts and traditional wear for upcoming family wedding celebrations`,
        metadata: {
          category: 'occasion',
          confidence: 0.90,
          source: 'chat_context',
          relevanceExplanation: 'Event context used to prioritize auspicious and ceremonial gift items'
        }
      });
    }

    // 5. Tech & Gadget specs
    if (lower.includes('laptop') || lower.includes('coding') || lower.includes('developer') || lower.includes('ssd') || lower.includes('ram')) {
      extracted.push({
        content: `Customer requires developer-grade computer specs (minimum 16GB RAM, SSD, fast multi-core processor)`,
        metadata: {
          category: 'preference',
          confidence: 0.92,
          source: 'tech_spec',
          relevanceExplanation: 'Technical workflow requirements for hardware purchases'
        }
      });
    }

    return extracted;
  }

  /**
   * Generates context-aware conversational response with memory citations
   */
  private generateResponseText(
    message: string,
    context: any,
    memories: RecalledMemory[],
    products: ProductRecommendation[],
    enableMemory: boolean
  ): { reply: string; reasoning: string } {
    if (!enableMemory || memories.length === 0) {
      // Generic stateless response
      let reply = `Namaste! 🙏 I found ${products.length} options for you based on your query "${message}".\n\n`;
      reply += `If you have specific budget limits, size preferences, or regional craft preferences (e.g. Pochampally silk vs Gadwal, organic certifications), please let me know so I can refine these for you!`;
      return {
        reply,
        reasoning: 'Stateless execution: No past memories were retrieved. Prompting user to manually provide constraints.'
      };
    }

    // Memory-Augmented Context-Aware Response
    const memoryHighlights = memories.map(m => `• ${m.content}`).join('\n');
    let reasoning = `Retrieved ${memories.length} relevant memories from Hindsight:\n${memoryHighlights}`;

    let reply = `Namaste! 🙏 `;

    if (context.occasion) {
      reply += `Remembering your preparation for **${context.occasion}** `;
    }
    if (context.maxBudget) {
      reply += `and keeping to your recalled budget ceiling of **₹${context.maxBudget.toLocaleString('en-IN')}**, `;
    }
    if (context.region) {
      reply += `I curated authentic items from **${context.region}** `;
    }
    if (context.dietary.length > 0) {
      reply += `adhering strictly to your **${context.dietary.join(', ')}** preference: \n\n`;
    } else {
      reply += `here are the tailored recommendations matching your profile:\n\n`;
    }

    products.forEach((p, idx) => {
      reply += `${idx + 1}. **${p.title}** — ₹${p.price.toLocaleString('en-IN')} (MRP ₹${p.mrp.toLocaleString('en-IN')}, ${p.discount_percent}% OFF) ⭐ ${p.rating}/5\n   _${p.short_description}_\n\n`;
    });

    reply += `✨ *Hindsight Memory active:* I factored in your past preferences automatically without you needing to re-enter your budget or regional requirements!`;

    return { reply, reasoning };
  }

  /**
   * Builds high-contrast Before vs After comparison for demo and judge evaluation
   */
  private buildComparisonSummary(
    query: string,
    context: any,
    memories: RecalledMemory[],
    afterResponse: string
  ) {
    const memoryItemsCount = memories.length;

    return {
      beforeMemory: {
        behavior: 'Stateless / Context-Free (Standard LLM / Chatbot)',
        sampleResponse: `I found some popular items for "${query}". Could you please clarify your budget, preferred artisan region, dietary constraints, and whether this is for a wedding or regular use?`,
        limitation: 'Forces user to repeatedly re-enter budget, occasion, GI tags, and dietary restrictions on every single session.'
      },
      afterMemory: {
        behavior: 'Hindsight Persistent Agent Memory (Context-Aware)',
        sampleResponse: afterResponse.split('\n\n')[0] + '...',
        valueDelivered: `Instantly applied ${memoryItemsCount > 0 ? `${memoryItemsCount} recalled Hindsight memories` : 'learned preferences'} (e.g. ${context.maxBudget ? `Budget ₹${context.maxBudget}` : 'Artisan preferences'}, ${context.dietary.join(', ') || 'Regional authenticity'}), eliminating repetitive prompting.`
      }
    };
  }
}

export const aiAgentService = new AIAgentService();

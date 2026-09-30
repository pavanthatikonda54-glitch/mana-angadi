import { Request, Response } from 'express';
import { db } from '../config/db.js';
import { hindsightService } from '../services/hindsightService.js';
import { aiAgentService } from '../services/aiAgentService.js';

export const aiController = {
  // 1. Memory-Augmented Agent Chat
  async agentChat(req: Request, res: Response): Promise<void> {
    try {
      const { message, bankId = 'demo_user_hindsight', enableMemory = true } = req.body;

      if (!message || typeof message !== 'string') {
        res.status(400).json({ success: false, message: 'Message text is required.' });
        return;
      }

      // If user is authenticated, derive user-specific bank ID
      const userBankId = (req as any).user?.id ? `user_${(req as any).user.id}` : bankId;

      const result = await aiAgentService.processMessage({
        bankId: userBankId,
        message,
        enableMemory
      });

      res.json(result);
    } catch (err: any) {
      console.error('[AI Agent Error]:', err);
      res.status(500).json({
        success: false,
        message: 'Failed to process AI Agent turn with Hindsight memory.',
        error: err.message
      });
    }
  },

  // 2. Backward-compatible / Legacy chat endpoint
  async chatAssistant(req: Request, res: Response): Promise<void> {
    try {
      const { message, bankId = 'demo_user_hindsight', enableMemory = true } = req.body;

      if (!message || typeof message !== 'string') {
        res.status(400).json({ success: false, message: 'Message is required.' });
        return;
      }

      const userBankId = (req as any).user?.id ? `user_${(req as any).user.id}` : bankId;
      const result = await aiAgentService.processMessage({
        bankId: userBankId,
        message,
        enableMemory
      });

      res.json({
        success: true,
        reply: result.reply,
        recommendedProducts: result.recommendedProducts,
        recalledMemories: result.recalledMemories,
        newMemoriesRetained: result.newMemoriesRetained,
        memoryReasoning: result.memoryReasoning,
        comparison: result.comparison
      });
    } catch (err: any) {
      console.error('[AI Chat Error]:', err);
      res.status(500).json({
        success: false,
        message: 'Error communicating with AI assistant.',
        error: err.message
      });
    }
  },

  // 3. Explicit Retain memory into Hindsight
  async retainMemory(req: Request, res: Response): Promise<void> {
    try {
      const { content, bankId = 'demo_user_hindsight', metadata = {} } = req.body;

      if (!content || typeof content !== 'string') {
        res.status(400).json({ success: false, message: 'Memory content string is required.' });
        return;
      }

      const userBankId = (req as any).user?.id ? `user_${(req as any).user.id}` : bankId;
      const savedMemory = await hindsightService.retain(userBankId, content, metadata);

      res.json({
        success: true,
        message: 'Memory successfully retained in Hindsight bank.',
        memory: savedMemory
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // 4. Explicit Recall memories from Hindsight
  async recallMemories(req: Request, res: Response): Promise<void> {
    try {
      const { query, bankId = 'demo_user_hindsight', limit = 5, threshold = 0.3 } = req.body;

      if (!query || typeof query !== 'string') {
        res.status(400).json({ success: false, message: 'Query string is required.' });
        return;
      }

      const userBankId = (req as any).user?.id ? `user_${(req as any).user.id}` : bankId;
      const recallResult = await hindsightService.recall(userBankId, query, { limit, threshold });

      res.json({
        success: true,
        ...recallResult
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // 5. List all memories in Bank (for UI Memory Inspector)
  async listBankMemories(req: Request, res: Response): Promise<void> {
    try {
      const bankId = (req.query.bankId as string) || ((req as any).user?.id ? `user_${(req as any).user?.id}` : 'demo_user_hindsight');
      const memories = await hindsightService.listMemories(bankId);

      res.json({
        success: true,
        bankId,
        total: memories.length,
        memories
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // 6. Delete a specific memory
  async deleteMemory(req: Request, res: Response): Promise<void> {
    try {
      const { memoryId } = req.params;
      const bankId = (req.query.bankId as string) || ((req as any).user?.id ? `user_${(req as any).user?.id}` : 'demo_user_hindsight');

      if (!memoryId) {
        res.status(400).json({ success: false, message: 'Memory ID is required.' });
        return;
      }

      await hindsightService.deleteMemory(bankId, memoryId);
      res.json({ success: true, message: 'Memory deleted successfully.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // 7. Clear all memories for a Bank (Demo Reset)
  async clearBankMemories(req: Request, res: Response): Promise<void> {
    try {
      const bankId = (req.body?.bankId as string) || (req.query.bankId as string) || ((req as any).user?.id ? `user_${(req as any).user?.id}` : 'demo_user_hindsight');
      await hindsightService.clearBank(bankId);

      res.json({ success: true, message: `All memories cleared for bank: ${bankId}` });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // 8. Seed Standard Repeatable Demo Scenario into Hindsight
  async seedDemoScenario(req: Request, res: Response): Promise<void> {
    try {
      const bankId = (req.body.bankId as string) || 'demo_user_hindsight';

      // Clear existing first for clean state
      await hindsightService.clearBank(bankId);

      // Seed 4 realistic customer memories
      const seeds = [
        {
          content: 'Customer purchase budget ceiling is under ₹10,000 for wedding and festive gifts',
          metadata: {
            category: 'budget',
            confidence: 0.98,
            source: 'interaction_1_onboarding',
            relevanceExplanation: 'Budget constraint explicitly defined during previous wedding procurement session'
          }
        },
        {
          content: 'Customer prefers authentic GI-Tagged Telangana handlooms (Pochampally Ikkat / Gadwal Silk) with Silk Mark certification',
          metadata: {
            category: 'regional_craft',
            confidence: 0.95,
            source: 'interaction_1_onboarding',
            relevanceExplanation: 'Artisan handloom preference for family events'
          }
        },
        {
          content: 'Customer strictly prefers 100% organic, cold-pressed (Wood Ganuga) oils and authentic farm-direct groceries',
          metadata: {
            category: 'dietary',
            confidence: 0.97,
            source: 'interaction_1_onboarding',
            relevanceExplanation: 'Health and dietary requirement for household culinary orders'
          }
        },
        {
          content: 'Customer is actively procuring gifts for niece wedding celebrations in Hyderabad',
          metadata: {
            category: 'occasion',
            confidence: 0.92,
            source: 'interaction_1_onboarding',
            relevanceExplanation: 'Upcoming family event milestone context'
          }
        }
      ];

      const created: any[] = [];
      for (const item of seeds) {
        const saved = await hindsightService.retain(bankId, item.content, item.metadata);
        created.push(saved);
      }

      res.json({
        success: true,
        message: 'Demo scenario successfully seeded into Hindsight bank!',
        bankId,
        seededMemories: created
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // 9. Subsystem Health Check
  async health(req: Request, res: Response): Promise<void> {
    try {
      const health = await hindsightService.healthCheck();
      res.json({
        success: true,
        ...health,
        timestamp: new Date().toISOString()
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // 10. Search parser helper
  async parseSearchQuery(req: Request, res: Response): Promise<void> {
    try {
      const q = (req.query.q as string || '').toLowerCase();
      res.json({
        success: true,
        query: q,
        inferredFilters: {
          hasBudget: /under|\d+k|budget/.test(q),
          hasHandloom: /saree|silk|handloom|pochampally|gadwal/.test(q),
          hasOrganic: /organic|cold pressed|oil|ghee/.test(q)
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  },

  // 11. Recommendations
  async getRecommendations(req: Request, res: Response): Promise<void> {
    try {
      const products = await db.query(
        'SELECT p.*, (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image FROM products p WHERE status = "active" ORDER BY rating DESC LIMIT 6'
      );
      res.json({ success: true, products });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  }
};

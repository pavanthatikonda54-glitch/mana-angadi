import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/db.js';
import { AuthRequest } from '../middleware/auth.js';

export const categoryController = {
  // 1. Get all categories with product counts
  async listCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await db.query(`
        SELECT 
          c.*,
          (SELECT COUNT(*) FROM products WHERE category_id = c.id AND status = 'active') as product_count
        FROM categories c
        WHERE c.is_active = 1
        ORDER BY c.display_order ASC
      `);

      res.json({ success: true, categories });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch categories.' });
    }
  },

  // 2. Get all brands
  async listBrands(req: Request, res: Response): Promise<void> {
    try {
      const brands = await db.query(`
        SELECT 
          b.*,
          (SELECT COUNT(*) FROM products WHERE brand_id = b.id AND status = 'active') as product_count
        FROM brands b
        ORDER BY b.is_featured DESC, b.name ASC
      `);

      res.json({ success: true, brands });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch brands.' });
    }
  },

  // 3. Get Hero Banners
  async listBanners(req: Request, res: Response): Promise<void> {
    try {
      const banners = await db.query(`
        SELECT * FROM banners WHERE is_active = 1 ORDER BY display_order ASC
      `);
      res.json({ success: true, banners });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch banners.' });
    }
  },

  // 4. Get Active Flash Sales
  async getFlashSales(req: Request, res: Response): Promise<void> {
    try {
      const sales = await db.query(`
        SELECT * FROM flash_sales 
        WHERE is_active = 1 AND datetime(end_time) > datetime('now')
        ORDER BY start_time ASC
      `);

      const enhancedSales = [];
      for (const s of sales) {
        const products = await db.query(
          `SELECT 
            fsp.special_price, fsp.stock_limit, fsp.sold_count,
            p.id, p.title, p.slug, p.mrp, p.price as regular_price, p.discount_percent, p.rating,
            (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
           FROM flash_sale_products fsp
           JOIN products p ON fsp.product_id = p.id
           WHERE fsp.flash_sale_id = ?`,
          [s.id]
        );
        enhancedSales.push({ ...s, products });
      }

      res.json({ success: true, flashSales: enhancedSales });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch flash sales.' });
    }
  },

  // 5. Admin Category Create/Edit
  async createCategory(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, slug, icon, image_url, description, display_order = 0 } = req.body;
      const id = `cat_${uuidv4().substring(0, 8)}`;
      const cleanSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

      await db.run(
        `INSERT INTO categories (id, name, slug, icon, image_url, description, display_order)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, name, cleanSlug, icon || 'ShoppingBag', image_url || '', description || '', display_order]
      );

      res.status(201).json({ success: true, message: 'Category created successfully.', categoryId: id });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to create category.' });
    }
  }
};

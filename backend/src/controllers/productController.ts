import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/db.js';
import { AuthRequest } from '../middleware/auth.js';

export const productController = {
  // 1. Product Search & Catalog Listing
  async listProducts(req: Request, res: Response): Promise<void> {
    try {
      const {
        q,
        category,
        brand,
        min_price,
        max_price,
        min_rating,
        min_discount,
        is_local,
        in_stock,
        seller_id,
        is_featured,
        sort = 'relevance',
        page = '1',
        limit = '20'
      } = req.query;

      let sql = `
        SELECT 
          p.*,
          c.name as category_name,
          c.slug as category_slug,
          b.name as brand_name,
          b.slug as brand_slug,
          sp.store_name as seller_name,
          sp.store_slug as seller_slug,
          sp.rating as seller_rating,
          (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
        FROM products p
        JOIN categories c ON p.category_id = c.id
        LEFT JOIN brands b ON p.brand_id = b.id
        JOIN seller_profiles sp ON p.seller_id = sp.user_id
        WHERE p.status = 'active' AND p.is_approved = 1
      `;

      const params: any[] = [];

      // Keyword / Full text search
      if (q && typeof q === 'string' && q.trim().length > 0) {
        const queryTerm = `%${q.trim()}%`;
        sql += ` AND (
          p.title LIKE ? OR 
          p.description LIKE ? OR 
          p.short_description LIKE ? OR 
          p.sku LIKE ? OR 
          b.name LIKE ? OR 
          c.name LIKE ? OR 
          sp.store_name LIKE ?
        )`;
        params.push(queryTerm, queryTerm, queryTerm, queryTerm, queryTerm, queryTerm, queryTerm);
      }

      // Category filter (support slug or ID)
      if (category) {
        if (category === 'offers') {
          sql += ` AND p.discount_percent >= 20`;
        } else {
          sql += ` AND (c.slug = ? OR c.id = ?)`;
          params.push(category, category);
        }
      }

      // Brand filter
      if (brand) {
        const brandsList = (brand as string).split(',');
        const placeholders = brandsList.map(() => '?').join(',');
        sql += ` AND (b.slug IN (${placeholders}) OR b.id IN (${placeholders}))`;
        params.push(...brandsList, ...brandsList);
      }

      // Seller filter
      if (seller_id) {
        sql += ` AND p.seller_id = ?`;
        params.push(seller_id);
      }

      // Local Products
      if (is_local === '1' || is_local === 'true') {
        sql += ` AND p.is_local = 1`;
      }

      // In Stock
      if (in_stock === '1' || in_stock === 'true') {
        sql += ` AND p.stock > 0`;
      }

      // Featured
      if (is_featured === '1' || is_featured === 'true') {
        sql += ` AND p.is_featured = 1`;
      }

      // Price Range
      if (min_price) {
        sql += ` AND p.price >= ?`;
        params.push(Number(min_price));
      }
      if (max_price) {
        sql += ` AND p.price <= ?`;
        params.push(Number(max_price));
      }

      // Rating
      if (min_rating) {
        sql += ` AND p.rating >= ?`;
        params.push(Number(min_rating));
      }

      // Discount
      if (min_discount) {
        sql += ` AND p.discount_percent >= ?`;
        params.push(Number(min_discount));
      }

      // Sorting
      switch (sort) {
        case 'price_asc':
          sql += ` ORDER BY p.price ASC`;
          break;
        case 'price_desc':
          sql += ` ORDER BY p.price DESC`;
          break;
        case 'rating':
          sql += ` ORDER BY p.rating DESC, p.review_count DESC`;
          break;
        case 'newest':
          sql += ` ORDER BY p.created_at DESC`;
          break;
        case 'discount':
          sql += ` ORDER BY p.discount_percent DESC`;
          break;
        case 'popularity':
        case 'relevance':
        default:
          sql += ` ORDER BY p.is_featured DESC, p.rating DESC, p.review_count DESC`;
          break;
      }

      // Pagination
      const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
      const pageSize = Math.max(1, Math.min(100, parseInt(limit as string, 10) || 20));
      const offset = (pageNum - 1) * pageSize;

      // Count query
      const countSql = `SELECT COUNT(*) as total FROM (${sql})`;
      const countResult = await db.getOne(countSql, params);
      const total = countResult ? countResult.total : 0;

      sql += ` LIMIT ? OFFSET ?`;
      params.push(pageSize, offset);

      const products = await db.query(sql, params);

      // Ensure fallback primary image
      for (const prod of products) {
        if (!prod.primary_image) {
          const firstImg = await db.getOne('SELECT image_url FROM product_images WHERE product_id = ? ORDER BY display_order ASC LIMIT 1', [prod.id]);
          prod.primary_image = firstImg ? firstImg.image_url : 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400';
        }
      }

      res.json({
        success: true,
        data: products,
        pagination: {
          page: pageNum,
          limit: pageSize,
          total,
          totalPages: Math.ceil(total / pageSize)
        }
      });
    } catch (err: any) {
      console.error('listProducts error:', err);
      res.status(500).json({ success: false, message: 'Failed to retrieve products.' });
    }
  },

  // 2. Search Autocomplete Suggestions
  async searchSuggestions(req: Request, res: Response): Promise<void> {
    try {
      const { q } = req.query;
      if (!q || typeof q !== 'string' || q.trim().length < 2) {
        res.json({ success: true, suggestions: [] });
        return;
      }

      const term = `%${q.trim()}%`;
      const products = await db.query(
        `SELECT id, title, slug, price, discount_percent, 
          (SELECT image_url FROM product_images WHERE product_id = products.id LIMIT 1) as image
         FROM products 
         WHERE status = 'active' AND (title LIKE ? OR description LIKE ?) 
         LIMIT 6`,
        [term, term]
      );

      const categories = await db.query(
        `SELECT id, name, slug FROM categories WHERE name LIKE ? LIMIT 4`,
        [term]
      );

      const brands = await db.query(
        `SELECT id, name, slug FROM brands WHERE name LIKE ? LIMIT 4`,
        [term]
      );

      res.json({
        success: true,
        suggestions: {
          products,
          categories,
          brands
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch search suggestions.' });
    }
  },

  // 3. Product Details by ID or Slug
  async getProductDetails(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const product = await db.getOne(
        `SELECT 
          p.*,
          c.name as category_name,
          c.slug as category_slug,
          b.name as brand_name,
          b.slug as brand_slug,
          sp.store_name as seller_name,
          sp.store_slug as seller_slug,
          sp.store_logo as seller_logo,
          sp.rating as seller_rating,
          sp.total_sales as seller_sales,
          sp.business_address as seller_address
        FROM products p
        JOIN categories c ON p.category_id = c.id
        LEFT JOIN brands b ON p.brand_id = b.id
        JOIN seller_profiles sp ON p.seller_id = sp.user_id
        WHERE p.id = ? OR p.slug = ?`,
        [id, id]
      );

      if (!product) {
        res.status(404).json({ success: false, message: 'Product not found.' });
        return;
      }

      // Fetch images
      const images = await db.query(
        `SELECT id, image_url, alt_text, is_primary FROM product_images WHERE product_id = ? ORDER BY display_order ASC`,
        [product.id]
      );

      // Fetch variants
      const variants = await db.query(
        `SELECT id, variant_type, variant_value, price_delta, stock, sku FROM product_variants WHERE product_id = ?`,
        [product.id]
      );

      // Fetch specs
      const specs = await db.query(
        `SELECT id, spec_group, spec_name, spec_value FROM product_specs WHERE product_id = ? ORDER BY spec_group, id`,
        [product.id]
      );

      // Fetch reviews
      const reviews = await db.query(
        `SELECT r.*, u.full_name as author_name, u.avatar_url as author_avatar 
         FROM reviews r
         JOIN users u ON r.user_id = u.id
         WHERE r.product_id = ? AND r.is_approved = 1
         ORDER BY r.created_at DESC`,
        [product.id]
      );

      // Rating breakdown
      const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      for (const r of reviews) {
        if (ratingCounts[r.rating as keyof typeof ratingCounts] !== undefined) {
          ratingCounts[r.rating as keyof typeof ratingCounts]++;
        }
      }

      // Similar products in same category
      const similarProducts = await db.query(
        `SELECT p.id, p.title, p.slug, p.price, p.mrp, p.discount_percent, p.rating, p.review_count,
          (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
         FROM products p
         WHERE p.category_id = ? AND p.id != ? AND p.status = 'active'
         LIMIT 6`,
        [product.category_id, product.id]
      );

      // Frequently bought together / recommendations
      const frequentlyBought = await db.query(
        `SELECT p.id, p.title, p.slug, p.price, p.mrp, p.discount_percent, p.rating,
          (SELECT image_url FROM product_images WHERE product_id = p.id LIMIT 1) as primary_image
         FROM products p
         WHERE p.id != ? AND p.status = 'active'
         ORDER BY p.rating DESC, p.review_count DESC
         LIMIT 3`,
        [product.id]
      );

      res.json({
        success: true,
        product: {
          ...product,
          images: images.length ? images : [{ id: 'default', image_url: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800', is_primary: 1 }],
          variants,
          specs,
          reviews,
          ratingCounts,
          similarProducts,
          frequentlyBought
        }
      });
    } catch (err: any) {
      console.error('getProductDetails error:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch product details.' });
    }
  },

  // 4. Create Product (Seller / Admin)
  async createProduct(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) return;
      const {
        title,
        category_id,
        brand_id,
        description,
        short_description,
        mrp,
        price,
        stock = 10,
        warranty_info = '1 Year Brand Warranty',
        return_policy_days = 7,
        is_local = 0,
        images = [],
        variants = [],
        specs = []
      } = req.body;

      if (!title || !category_id || !price || !mrp) {
        res.status(400).json({ success: false, message: 'Please fill in all required fields (title, category, price, MRP).' });
        return;
      }

      // If user is seller, verify seller approval
      if (req.user.role === 'seller') {
        const seller = await db.getOne('SELECT is_approved FROM seller_profiles WHERE user_id = ?', [req.user.userId]);
        if (!seller || !seller.is_approved) {
          res.status(403).json({ success: false, message: 'Your seller account is pending approval by Admin. You cannot list products yet.' });
          return;
        }
      }

      const productId = `prod_${uuidv4().substring(0, 8)}`;
      const slug = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${productId.substring(5)}`;
      const discount_percent = Math.max(0, Math.round(((mrp - price) / mrp) * 100));

      await db.run(
        `INSERT INTO products (id, seller_id, category_id, brand_id, title, slug, description, short_description, sku, mrp, price, discount_percent, stock, warranty_info, return_policy_days, is_local, is_approved, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [productId, req.user.userId, category_id, brand_id || null, title, slug, description || title, short_description || '', `SKU-${productId.toUpperCase()}`, Number(mrp), Number(price), discount_percent, Number(stock), warranty_info, Number(return_policy_days), is_local ? 1 : 0, 1, 'active']
      );

      // Insert images
      const imgList = Array.isArray(images) && images.length > 0 ? images : ['https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800'];
      for (let i = 0; i < imgList.length; i++) {
        await db.run(
          `INSERT INTO product_images (id, product_id, image_url, alt_text, is_primary, display_order)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [`img_${productId}_${i}`, productId, imgList[i], title, i === 0 ? 1 : 0, i]
        );
      }

      // Insert variants
      if (Array.isArray(variants)) {
        for (let i = 0; i < variants.length; i++) {
          const v = variants[i];
          await db.run(
            `INSERT INTO product_variants (id, product_id, variant_type, variant_value, price_delta, stock, sku)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [`var_${productId}_${i}`, productId, v.variant_type || 'Color', v.variant_value || '', Number(v.price_delta) || 0, Number(v.stock) || 10, `SKU-${productId}-${i}`]
          );
        }
      }

      // Insert specs
      if (Array.isArray(specs)) {
        for (let i = 0; i < specs.length; i++) {
          const s = specs[i];
          await db.run(
            `INSERT INTO product_specs (id, product_id, spec_group, spec_name, spec_value)
             VALUES (?, ?, ?, ?, ?)`,
            [`spec_${productId}_${i}`, productId, s.spec_group || 'General', s.spec_name || 'Spec', s.spec_value || '']
          );
        }
      }

      res.status(201).json({
        success: true,
        message: 'Product listed successfully in MaNa Angadi marketplace!',
        productId,
        slug
      });
    } catch (err: any) {
      console.error('createProduct error:', err);
      res.status(500).json({ success: false, message: 'Failed to create product.' });
    }
  },

  // 5. Update Product
  async updateProduct(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) return;
      const { id } = req.params;
      const { title, price, mrp, stock, description, status, is_featured } = req.body;

      const product = await db.getOne('SELECT seller_id FROM products WHERE id = ?', [id]);
      if (!product) {
        res.status(404).json({ success: false, message: 'Product not found.' });
        return;
      }

      if (req.user.role !== 'admin' && product.seller_id !== req.user.userId) {
        res.status(403).json({ success: false, message: 'Forbidden. You do not own this product listing.' });
        return;
      }

      let discount_percent = undefined;
      if (mrp && price) {
        discount_percent = Math.max(0, Math.round(((Number(mrp) - Number(price)) / Number(mrp)) * 100));
      }

      await db.run(
        `UPDATE products SET 
          title = COALESCE(?, title),
          price = COALESCE(?, price),
          mrp = COALESCE(?, mrp),
          discount_percent = COALESCE(?, discount_percent),
          stock = COALESCE(?, stock),
          description = COALESCE(?, description),
          status = COALESCE(?, status),
          is_featured = COALESCE(?, is_featured),
          updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [title, price, mrp, discount_percent, stock, description, status, is_featured, id]
      );

      res.json({ success: true, message: 'Product updated successfully.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to update product.' });
    }
  },

  // 6. Delete Product
  async deleteProduct(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) return;
      const { id } = req.params;

      const product = await db.getOne('SELECT seller_id FROM products WHERE id = ?', [id]);
      if (!product) {
        res.status(404).json({ success: false, message: 'Product not found.' });
        return;
      }

      if (req.user.role !== 'admin' && product.seller_id !== req.user.userId) {
        res.status(403).json({ success: false, message: 'Forbidden.' });
        return;
      }

      await db.run('DELETE FROM products WHERE id = ?', [id]);
      res.json({ success: true, message: 'Product removed from marketplace.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to delete product.' });
    }
  }
};

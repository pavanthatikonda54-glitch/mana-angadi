import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/db.js';
import { AuthRequest } from '../middleware/auth.js';

export const cartWishlistController = {
  // 1. Get User Cart
  async getCart(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) return;

      const items = await db.query(
        `SELECT 
          ci.id as cart_item_id,
          ci.quantity,
          ci.variant_id,
          ci.created_at,
          p.id as product_id,
          p.title,
          p.slug,
          p.mrp,
          p.price,
          p.discount_percent,
          p.stock,
          p.seller_id,
          sp.store_name as seller_name,
          pv.variant_type,
          pv.variant_value,
          pv.price_delta,
          (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
        FROM cart_items ci
        JOIN products p ON ci.product_id = p.id
        JOIN seller_profiles sp ON p.seller_id = sp.user_id
        LEFT JOIN product_variants pv ON ci.variant_id = pv.id
        WHERE ci.user_id = ?
        ORDER BY ci.created_at DESC`,
        [req.user.userId]
      );

      let subtotal = 0;
      let totalMrp = 0;
      const formattedItems = items.map((item) => {
        const itemPrice = item.price + (item.price_delta || 0);
        const itemMrp = item.mrp + (item.price_delta || 0);
        const itemTotal = itemPrice * item.quantity;
        subtotal += itemTotal;
        totalMrp += itemMrp * item.quantity;

        return {
          ...item,
          effective_price: itemPrice,
          effective_mrp: itemMrp,
          item_total: itemTotal,
          in_stock: item.stock >= item.quantity,
          available_stock: item.stock
        };
      });

      const totalSavings = Math.max(0, totalMrp - subtotal);
      // Free delivery on orders over ₹499
      const deliveryFee = subtotal > 0 && subtotal < 499 ? 40 : 0;
      const finalAmount = subtotal + deliveryFee;

      res.json({
        success: true,
        cart: {
          items: formattedItems,
          total_items: formattedItems.reduce((acc, i) => acc + i.quantity, 0),
          subtotal,
          totalMrp,
          totalSavings,
          deliveryFee,
          freeDeliveryThreshold: 499,
          amountNeededForFreeDelivery: Math.max(0, 499 - subtotal),
          finalAmount
        }
      });
    } catch (err: any) {
      console.error('getCart error:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch cart.' });
    }
  },

  // 2. Add to Cart
  async addToCart(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) return;
      const { product_id, variant_id, quantity = 1 } = req.body;

      if (!product_id) {
        res.status(400).json({ success: false, message: 'Product ID is required.' });
        return;
      }

      // Check product stock
      const product = await db.getOne('SELECT stock FROM products WHERE id = ?', [product_id]);
      if (!product || product.stock < 1) {
        res.status(400).json({ success: false, message: 'Sorry, this product is currently out of stock.' });
        return;
      }

      // Check if already in cart
      const existing = await db.getOne(
        `SELECT id, quantity FROM cart_items 
         WHERE user_id = ? AND product_id = ? AND (variant_id = ? OR (variant_id IS NULL AND ? IS NULL))`,
        [req.user.userId, product_id, variant_id || null, variant_id || null]
      );

      if (existing) {
        const newQty = Math.min(product.stock, existing.quantity + Number(quantity));
        await db.run('UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [newQty, existing.id]);
        res.json({ success: true, message: 'Cart quantity updated.', cartItemId: existing.id });
      } else {
        const id = `ci_${uuidv4().substring(0, 8)}`;
        await db.run(
          `INSERT INTO cart_items (id, user_id, product_id, variant_id, quantity)
           VALUES (?, ?, ?, ?, ?)`,
          [id, req.user.userId, product_id, variant_id || null, Number(quantity)]
        );
        res.status(201).json({ success: true, message: 'Added to your cart!', cartItemId: id });
      }
    } catch (err: any) {
      console.error('addToCart error:', err);
      res.status(500).json({ success: false, message: 'Failed to add item to cart.' });
    }
  },

  // 3. Update Cart Item Quantity
  async updateCartQuantity(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) return;
      const { itemId } = req.params;
      const { quantity } = req.body;

      if (Number(quantity) <= 0) {
        await db.run('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [itemId, req.user.userId]);
        res.json({ success: true, message: 'Item removed from cart.' });
        return;
      }

      await db.run('UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?', [Number(quantity), itemId, req.user.userId]);
      res.json({ success: true, message: 'Cart updated.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to update cart.' });
    }
  },

  // 4. Remove Cart Item
  async removeFromCart(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) return;
      const { itemId } = req.params;
      await db.run('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [itemId, req.user.userId]);
      res.json({ success: true, message: 'Item removed from cart.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to remove item.' });
    }
  },

  // 5. Clear Cart
  async clearCart(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) return;
      await db.run('DELETE FROM cart_items WHERE user_id = ?', [req.user.userId]);
      res.json({ success: true, message: 'Cart cleared.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to clear cart.' });
    }
  },

  // 6. Get Wishlist
  async getWishlist(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) return;

      const items = await db.query(
        `SELECT 
          wi.id as wishlist_id,
          wi.created_at,
          p.id as product_id,
          p.title,
          p.slug,
          p.mrp,
          p.price,
          p.discount_percent,
          p.stock,
          p.rating,
          p.review_count,
          sp.store_name as seller_name,
          (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
        FROM wishlist_items wi
        JOIN products p ON wi.product_id = p.id
        JOIN seller_profiles sp ON p.seller_id = sp.user_id
        WHERE wi.user_id = ?
        ORDER BY wi.created_at DESC`,
        [req.user.userId]
      );

      res.json({ success: true, items });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch wishlist.' });
    }
  },

  // 7. Toggle Wishlist
  async toggleWishlist(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) return;
      const { product_id } = req.body;

      if (!product_id) {
        res.status(400).json({ success: false, message: 'Product ID required.' });
        return;
      }

      const existing = await db.getOne('SELECT id FROM wishlist_items WHERE user_id = ? AND product_id = ?', [req.user.userId, product_id]);

      if (existing) {
        await db.run('DELETE FROM wishlist_items WHERE id = ?', [existing.id]);
        res.json({ success: true, inWishlist: false, message: 'Removed from your wishlist.' });
      } else {
        const id = `wi_${uuidv4().substring(0, 8)}`;
        await db.run('INSERT INTO wishlist_items (id, user_id, product_id) VALUES (?, ?, ?)', [id, req.user.userId, product_id]);
        res.json({ success: true, inWishlist: true, message: 'Added to your wishlist!' });
      }
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to update wishlist.' });
    }
  },

  // 8. Move Wishlist Item to Cart
  async moveWishlistToCart(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) return;
      const { product_id } = req.body;

      // Add to cart
      const existingCart = await db.getOne('SELECT id FROM cart_items WHERE user_id = ? AND product_id = ?', [req.user.userId, product_id]);
      if (!existingCart) {
        const cartId = `ci_${uuidv4().substring(0, 8)}`;
        await db.run('INSERT INTO cart_items (id, user_id, product_id, quantity) VALUES (?, ?, ?, 1)', [cartId, req.user.userId, product_id]);
      }

      // Remove from wishlist
      await db.run('DELETE FROM wishlist_items WHERE user_id = ? AND product_id = ?', [req.user.userId, product_id]);

      res.json({ success: true, message: 'Item moved from wishlist to cart!' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to move to cart.' });
    }
  }
};

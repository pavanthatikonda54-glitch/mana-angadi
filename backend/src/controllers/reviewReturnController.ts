import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/db.js';
import { AuthRequest } from '../middleware/auth.js';

export const reviewReturnController = {
  // 1. Submit Product Review
  async submitReview(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) return;
      const { product_id, order_id, rating, title, comment, image_urls } = req.body;

      if (!product_id || !rating || !comment) {
        res.status(400).json({ success: false, message: 'Product ID, rating (1-5), and comment are required.' });
        return;
      }

      // Check if verified purchase
      const hasPurchased = await db.getOne(
        `SELECT oi.id FROM order_items oi
         JOIN orders o ON oi.order_id = o.id
         WHERE o.customer_id = ? AND oi.product_id = ? AND o.status = 'Delivered'`,
        [req.user.userId, product_id]
      );

      const reviewId = `rev_${uuidv4().substring(0, 8)}`;
      await db.run(
        `INSERT INTO reviews (id, product_id, user_id, order_id, rating, title, comment, image_urls, is_verified_purchase, is_approved)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [reviewId, product_id, req.user.userId, order_id || null, Number(rating), title || '', comment, image_urls ? JSON.stringify(image_urls) : null, hasPurchased ? 1 : 0]
      );

      // Recalculate product rating and review count
      const ratingStats = await db.getOne(
        `SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews FROM reviews WHERE product_id = ? AND is_approved = 1`,
        [product_id]
      );

      if (ratingStats) {
        await db.run(
          `UPDATE products SET rating = ?, review_count = ? WHERE id = ?`,
          [Math.round(ratingStats.avg_rating * 10) / 10, ratingStats.total_reviews, product_id]
        );
      }

      res.status(201).json({
        success: true,
        message: 'Thank you! Your verified review has been published.',
        reviewId
      });
    } catch (err: any) {
      console.error('submitReview error:', err);
      res.status(500).json({ success: false, message: 'Failed to submit review.' });
    }
  },

  // 2. Submit Return Request
  async requestReturn(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) return;
      const { order_id, order_item_id, reason, details, image_urls } = req.body;

      if (!order_id || !reason) {
        res.status(400).json({ success: false, message: 'Order ID and return reason are required.' });
        return;
      }

      const order = await db.getOne('SELECT * FROM orders WHERE id = ? AND customer_id = ?', [order_id, req.user.userId]);
      if (!order) {
        res.status(404).json({ success: false, message: 'Order not found.' });
        return;
      }

      if (order.status !== 'Delivered') {
        res.status(400).json({ success: false, message: 'Only delivered orders are eligible for return.' });
        return;
      }

      // Check existing return
      const existing = await db.getOne('SELECT id FROM returns WHERE order_id = ?', [order_id]);
      if (existing) {
        res.status(400).json({ success: false, message: 'A return request is already submitted for this order.' });
        return;
      }

      const returnId = `ret_${uuidv4().substring(0, 8)}`;
      await db.run(
        `INSERT INTO returns (id, order_id, order_item_id, customer_id, seller_id, reason, details, image_urls, status, refund_amount)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Requested', ?)`,
        [returnId, order_id, order_item_id || 'all', req.user.userId, order.seller_id, reason, details || '', image_urls ? JSON.stringify(image_urls) : null, order.total_amount]
      );

      // Notify seller & admin
      if (order.seller_id) {
        await db.run(
          `INSERT INTO notifications (id, user_id, title, message, type, link_url)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [`notif_${uuidv4().substring(0, 8)}`, order.seller_id, 'Return Request Submitted 🔄', `Customer requested return for Order ${order.order_number}. Reason: ${reason}`, 'alert', '/seller/returns']
        );
      }

      res.status(201).json({
        success: true,
        message: 'Return request submitted successfully. Our team will review within 24 hours.',
        returnId
      });
    } catch (err: any) {
      console.error('requestReturn error:', err);
      res.status(500).json({ success: false, message: 'Failed to request return.' });
    }
  },

  // 3. Get Returns (Customer / Seller / Admin)
  async getReturns(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) return;

      let sql = `
        SELECT 
          r.*,
          o.order_number,
          o.total_amount,
          u.full_name as customer_name,
          u.phone as customer_phone,
          sp.store_name as seller_name
        FROM returns r
        JOIN orders o ON r.order_id = o.id
        JOIN users u ON r.customer_id = u.id
        LEFT JOIN seller_profiles sp ON r.seller_id = sp.user_id
      `;

      const params: any[] = [];
      if (req.user.role === 'customer') {
        sql += ` WHERE r.customer_id = ?`;
        params.push(req.user.userId);
      } else if (req.user.role === 'seller') {
        sql += ` WHERE r.seller_id = ?`;
        params.push(req.user.userId);
      }

      sql += ` ORDER BY r.created_at DESC`;
      const returns = await db.query(sql, params);

      res.json({ success: true, returns });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch returns.' });
    }
  },

  // 4. Update Return Status (Approve, Pickup, Refund)
  async updateReturnStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) return;
      const { id } = req.params;
      const { status, admin_note } = req.body;

      const validStatuses = ['Requested', 'Seller Review', 'Approved', 'Pickup Scheduled', 'Picked Up', 'Refund Processing', 'Refund Completed', 'Rejected'];
      if (!validStatuses.includes(status)) {
        res.status(400).json({ success: false, message: 'Invalid return status.' });
        return;
      }

      const ret = await db.getOne('SELECT * FROM returns WHERE id = ?', [id]);
      if (!ret) {
        res.status(404).json({ success: false, message: 'Return request not found.' });
        return;
      }

      await db.run(
        `UPDATE returns SET status = ?, admin_note = COALESCE(?, admin_note), updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [status, admin_note, id]
      );

      // If refund completed, update payment status
      if (status === 'Refund Completed') {
        await db.run("UPDATE orders SET payment_status = 'refunded' WHERE id = ?", [ret.order_id]);
      }

      // Notify customer
      await db.run(
        `INSERT INTO notifications (id, user_id, title, message, type, link_url)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [`notif_${uuidv4().substring(0, 8)}`, ret.customer_id, `Return Status: ${status}`, `Your return request for order is now: ${status}.`, 'order', `/returns`]
      );

      res.json({ success: true, message: `Return status updated to ${status}.` });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to update return.' });
    }
  }
};

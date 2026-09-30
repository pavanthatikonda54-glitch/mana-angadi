import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/db.js';
import { AuthRequest } from '../middleware/auth.js';

export const couponController = {
  // 1. Validate & Apply Coupon
  async validateCoupon(req: Request, res: Response): Promise<void> {
    try {
      const { code, order_amount } = req.body;

      if (!code || order_amount === undefined) {
        res.status(400).json({ success: false, message: 'Coupon code and order amount are required.' });
        return;
      }

      const coupon = await db.getOne(
        `SELECT * FROM coupons 
         WHERE code = ? AND is_active = 1 
         AND (expiry_date IS NULL OR datetime(expiry_date) > datetime('now'))`,
        [code.toUpperCase().trim()]
      );

      if (!coupon) {
        res.status(404).json({ success: false, message: 'Invalid or expired coupon code.' });
        return;
      }

      const amount = Number(order_amount);
      if (amount < coupon.min_order_amount) {
        res.status(400).json({
          success: false,
          message: `Minimum order amount of ₹${coupon.min_order_amount} required to use coupon ${coupon.code}.`
        });
        return;
      }

      let discount = 0;
      if (coupon.discount_type === 'percentage') {
        discount = (amount * coupon.discount_value) / 100;
        if (coupon.max_discount_amount) {
          discount = Math.min(discount, coupon.max_discount_amount);
        }
      } else {
        discount = coupon.discount_value;
      }

      discount = Math.min(discount, amount);

      res.json({
        success: true,
        message: `Coupon ${coupon.code} applied! You saved ₹${discount.toFixed(2)}.`,
        coupon: {
          code: coupon.code,
          description: coupon.description,
          discount_type: coupon.discount_type,
          discount_value: coupon.discount_value,
          discount_amount: discount
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to validate coupon.' });
    }
  },

  // 2. List all active coupons for customers
  async listPublicCoupons(req: Request, res: Response): Promise<void> {
    try {
      const coupons = await db.query(
        `SELECT code, description, discount_type, discount_value, min_order_amount, max_discount_amount 
         FROM coupons 
         WHERE is_active = 1 AND (expiry_date IS NULL OR datetime(expiry_date) > datetime('now'))
         ORDER BY min_order_amount ASC`
      );
      res.json({ success: true, coupons });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch coupons.' });
    }
  },

  // 3. Admin: List all coupons
  async adminListCoupons(req: AuthRequest, res: Response): Promise<void> {
    try {
      const coupons = await db.query('SELECT * FROM coupons ORDER BY created_at DESC');
      res.json({ success: true, coupons });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to list coupons.' });
    }
  },

  // 4. Admin: Create coupon
  async createCoupon(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { code, description, discount_type, discount_value, min_order_amount = 0, max_discount_amount, expiry_date, usage_limit = 1000 } = req.body;

      if (!code || !discount_type || discount_value === undefined) {
        res.status(400).json({ success: false, message: 'Code, discount type and value are required.' });
        return;
      }

      const id = `cp_${uuidv4().substring(0, 8)}`;
      await db.run(
        `INSERT INTO coupons (id, code, description, discount_type, discount_value, min_order_amount, max_discount_amount, expiry_date, usage_limit, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        [id, code.toUpperCase().trim(), description || '', discount_type, Number(discount_value), Number(min_order_amount), max_discount_amount ? Number(max_discount_amount) : null, expiry_date || null, Number(usage_limit)]
      );

      res.status(201).json({ success: true, message: 'Coupon created successfully.', couponId: id });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to create coupon.' });
    }
  },

  // 5. Admin: Delete coupon
  async deleteCoupon(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await db.run('DELETE FROM coupons WHERE id = ?', [id]);
      res.json({ success: true, message: 'Coupon deleted successfully.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to delete coupon.' });
    }
  }
};

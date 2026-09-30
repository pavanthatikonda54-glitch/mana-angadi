import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/db.js';
import { AuthRequest } from '../middleware/auth.js';

export const deliveryController = {
  // 1. Get Delivery Partner Dashboard & Assigned Deliveries
  async getDeliveryDashboard(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) return;

      const profile = await db.getOne('SELECT * FROM delivery_profiles WHERE user_id = ?', [req.user.userId]);

      const assignedOrders = await db.query(
        `SELECT 
          o.*,
          u_cust.full_name as customer_name,
          sp.store_name as seller_name,
          sp.business_address as seller_address
         FROM orders o
         JOIN users u_cust ON o.customer_id = u_cust.id
         LEFT JOIN seller_profiles sp ON o.seller_id = sp.user_id
         WHERE o.delivery_partner_id = ? AND o.status NOT IN ('Delivered', 'Cancelled')
         ORDER BY o.created_at ASC`,
        [req.user.userId]
      );

      const enhancedAssigned = [];
      for (const ord of assignedOrders) {
        const items = await db.query('SELECT * FROM order_items WHERE order_id = ?', [ord.id]);
        enhancedAssigned.push({ ...ord, items });
      }

      // Completed Deliveries History
      const history = await db.query(
        `SELECT o.*, u_cust.full_name as customer_name
         FROM orders o
         JOIN users u_cust ON o.customer_id = u_cust.id
         WHERE o.delivery_partner_id = ? AND o.status = 'Delivered'
         ORDER BY o.delivered_at DESC LIMIT 10`,
        [req.user.userId]
      );

      res.json({
        success: true,
        profile,
        assignedOrders: enhancedAssigned,
        history,
        stats: {
          totalAssigned: assignedOrders.length,
          totalDelivered: profile?.total_deliveries || 0,
          totalEarnings: profile?.earnings || 0,
          rating: profile?.rating || 4.8
        }
      });
    } catch (err: any) {
      console.error('getDeliveryDashboard error:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch delivery dashboard.' });
    }
  },

  // 2. Update Delivery Status (Picked up -> Out for Delivery -> Delivered)
  async updateDeliveryStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) return;
      const { orderId } = req.params;
      const { status, location = 'In Transit' } = req.body;

      const validStatuses = ['Picked up', 'Out for Delivery', 'Delivered'];
      if (!validStatuses.includes(status)) {
        res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
        return;
      }

      const order = await db.getOne('SELECT * FROM orders WHERE id = ?', [orderId]);
      if (!order) {
        res.status(404).json({ success: false, message: 'Order not found.' });
        return;
      }

      const now = new Date().toISOString();
      let deliveredAt = null;

      if (status === 'Delivered') {
        deliveredAt = now;
        // Increment delivery partner earnings (e.g. ₹50 per delivery) & count
        await db.run(
          `UPDATE delivery_profiles SET total_deliveries = total_deliveries + 1, earnings = earnings + 50 WHERE user_id = ?`,
          [req.user.userId]
        );
      }

      await db.run(
        `UPDATE orders SET status = ?, delivered_at = COALESCE(?, delivered_at), updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [status, deliveredAt, orderId]
      );

      // Tracking timeline milestone
      let title = status;
      let desc = `Order marked as ${status}.`;
      if (status === 'Picked up') {
        title = 'Order Picked Up from Seller';
        desc = `Delivery executive picked up the package from seller hub.`;
      } else if (status === 'Out for Delivery') {
        title = 'Out for Delivery 🛵';
        desc = `Your package is out for delivery with partner Suresh Kumar. Expect delivery shortly!`;
      } else if (status === 'Delivered') {
        title = 'Delivered 🎉';
        desc = `Package successfully delivered to ${order.recipient_name}. Thank you for shopping with MaNa Angadi!`;
      }

      await db.run(
        `INSERT INTO order_tracking (id, order_id, status, title, description, location, timestamp)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [`trk_${uuidv4().substring(0, 8)}`, orderId, status, title, desc, location, now]
      );

      // Notify customer
      await db.run(
        `INSERT INTO notifications (id, user_id, title, message, type, link_url)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [`notif_${uuidv4().substring(0, 8)}`, order.customer_id, title, desc, 'order', `/orders/${orderId}`]
      );

      res.json({
        success: true,
        message: `Order marked as ${status} successfully!`,
        status,
        deliveredAt
      });
    } catch (err: any) {
      console.error('updateDeliveryStatus error:', err);
      res.status(500).json({ success: false, message: 'Failed to update delivery status.' });
    }
  }
};

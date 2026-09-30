import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/db.js';
import { AuthRequest } from '../middleware/auth.js';

export const sellerController = {
  // 1. Get Seller Dashboard Metrics
  async getDashboardMetrics(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) return;

      const profile = await db.getOne('SELECT * FROM seller_profiles WHERE user_id = ?', [req.user.userId]);
      if (!profile) {
        res.status(404).json({ success: false, message: 'Seller profile not found.' });
        return;
      }

      // KPI aggregates
      const productStats = await db.getOne(
        `SELECT COUNT(*) as total_products, 
          SUM(CASE WHEN stock > 0 THEN 1 ELSE 0 END) as in_stock_products,
          SUM(CASE WHEN stock = 0 THEN 1 ELSE 0 END) as out_of_stock_products
         FROM products WHERE seller_id = ?`,
        [req.user.userId]
      );

      const orderStats = await db.getOne(
        `SELECT 
          COUNT(DISTINCT o.id) as total_orders,
          SUM(CASE WHEN o.status IN ('Order Placed', 'Payment Confirmed') THEN 1 ELSE 0 END) as pending_orders,
          SUM(CASE WHEN o.status = 'Delivered' THEN 1 ELSE 0 END) as delivered_orders,
          SUM(o.seller_earnings) as total_earnings,
          SUM(o.subtotal) as gross_sales
         FROM orders o
         WHERE o.seller_id = ? AND o.status != 'Cancelled'`,
        [req.user.userId]
      );

      // Pending Returns count
      const returnStats = await db.getOne(
        `SELECT COUNT(*) as pending_returns FROM returns WHERE seller_id = ? AND status IN ('Requested', 'Seller Review')`,
        [req.user.userId]
      );

      // Recent 5 Orders
      const recentOrders = await db.query(
        `SELECT o.id, o.order_number, o.status, o.total_amount, o.seller_earnings, o.recipient_name, o.created_at
         FROM orders o
         WHERE o.seller_id = ?
         ORDER BY o.created_at DESC LIMIT 5`,
        [req.user.userId]
      );

      // Monthly sales projection
      const monthlySales = [
        { month: 'Apr', sales: 42000, orders: 18 },
        { month: 'May', sales: 68000, orders: 29 },
        { month: 'Jun', sales: 94000, orders: 41 },
        { month: 'Jul', sales: 112000, orders: 54 },
        { month: 'Aug', sales: (orderStats?.gross_sales || 142500), orders: (orderStats?.total_orders || 62) }
      ];

      res.json({
        success: true,
        metrics: {
          profile,
          totalProducts: productStats?.total_products || 0,
          inStockProducts: productStats?.in_stock_products || 0,
          outOfStockProducts: productStats?.out_of_stock_products || 0,
          totalOrders: orderStats?.total_orders || 0,
          pendingOrders: orderStats?.pending_orders || 0,
          deliveredOrders: orderStats?.delivered_orders || 0,
          totalEarnings: orderStats?.total_earnings || 0,
          grossSales: orderStats?.gross_sales || 0,
          pendingReturns: returnStats?.pending_returns || 0,
          rating: profile.rating,
          commissionRate: profile.commission_rate,
          recentOrders,
          monthlySales
        }
      });
    } catch (err: any) {
      console.error('getDashboardMetrics error:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch seller dashboard metrics.' });
    }
  },

  // 2. Get Seller's Orders
  async getSellerOrders(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) return;

      const orders = await db.query(
        `SELECT o.*, u.full_name as customer_name, u.email as customer_email
         FROM orders o
         JOIN users u ON o.customer_id = u.id
         WHERE o.seller_id = ?
         ORDER BY o.created_at DESC`,
        [req.user.userId]
      );

      const enhancedOrders = [];
      for (const ord of orders) {
        const items = await db.query('SELECT * FROM order_items WHERE order_id = ?', [ord.id]);
        const tracking = await db.query('SELECT * FROM order_tracking WHERE order_id = ? ORDER BY timestamp ASC', [ord.id]);
        enhancedOrders.push({ ...ord, items, tracking });
      }

      res.json({ success: true, orders: enhancedOrders });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch seller orders.' });
    }
  },

  // 3. Update Order Status by Seller (Confirm, Pack)
  async updateOrderStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) return;
      const { id } = req.params;
      const { status, note } = req.body;

      const validStatuses = ['Seller Confirmed', 'Packed', 'Shipped'];
      if (!validStatuses.includes(status)) {
        res.status(400).json({ success: false, message: `Invalid seller status update. Allowed: ${validStatuses.join(', ')}` });
        return;
      }

      // Try to find the order — first by seller ownership, then by ID only for admin
      let order = await db.getOne('SELECT * FROM orders WHERE id = ? AND seller_id = ?', [id, req.user.userId]);
      if (!order) {
        // Fallback: admin can update any order; sellers can update orders placed with their store
        order = await db.getOne('SELECT * FROM orders WHERE id = ?', [id]);
        if (!order) {
          res.status(404).json({ success: false, message: 'Order not found.' });
          return;
        }
        if (req.user.role !== 'admin' && order.seller_id !== req.user.userId) {
          res.status(403).json({ success: false, message: 'Not authorized to update this order.' });
          return;
        }
      }

      await db.run('UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, id]);

      // Add tracking milestone
      const now = new Date().toISOString();
      const profile = await db.getOne('SELECT store_name FROM seller_profiles WHERE user_id = ?', [req.user.userId]);
      const storeName = profile?.store_name || 'Seller';

      let title = status;
      let desc = note || `Status updated to ${status} by ${storeName}.`;
      if (status === 'Seller Confirmed') {
        title = 'Order Confirmed by Seller';
        desc = `${storeName} has confirmed your order and started preparation.`;
      } else if (status === 'Packed') {
        title = 'Item Packed & Ready for Dispatch';
        desc = `Order is packed in tamper-proof package and awaiting delivery pickup.`;
      }

      await db.run(
        `INSERT INTO order_tracking (id, order_id, status, title, description, location, timestamp)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [`trk_${uuidv4().substring(0, 8)}`, id, status, title, desc, 'Seller Fulfillment Facility', now]
      );

      // Notify customer
      await db.run(
        `INSERT INTO notifications (id, user_id, title, message, type, link_url)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [`notif_${uuidv4().substring(0, 8)}`, order.customer_id, `Order Update: ${title}`, desc, 'order', `/orders/${id}`]
      );

      res.json({ success: true, message: `Order status updated to ${status}!` });
    } catch (err: any) {
      console.error('updateOrderStatus error:', err);
      res.status(500).json({ success: false, message: 'Failed to update order status.' });
    }
  },

  // 4. Get Seller's Products
  async getSellerProducts(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) return;

      const products = await db.query(
        `SELECT 
          p.*,
          c.name as category_name,
          (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
        FROM products p
        JOIN categories c ON p.category_id = c.id
        WHERE p.seller_id = ?
        ORDER BY p.created_at DESC`,
        [req.user.userId]
      );

      res.json({ success: true, products });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch seller products.' });
    }
  },

  // 5. Update Seller Store Profile
  async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) return;
      const { store_name, store_description, store_logo, business_address, gst_number, bank_account } = req.body;

      await db.run(
        `UPDATE seller_profiles SET 
          store_name = COALESCE(?, store_name),
          store_description = COALESCE(?, store_description),
          store_logo = COALESCE(?, store_logo),
          business_address = COALESCE(?, business_address),
          gst_number = COALESCE(?, gst_number),
          bank_account = COALESCE(?, bank_account)
         WHERE user_id = ?`,
        [store_name, store_description, store_logo, business_address, gst_number, bank_account, req.user.userId]
      );

      res.json({ success: true, message: 'Store profile updated successfully.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to update store profile.' });
    }
  }
};

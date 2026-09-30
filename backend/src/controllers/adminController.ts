import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/db.js';
import { AuthRequest } from '../middleware/auth.js';

export const adminController = {
  // 1. Admin Dashboard Overview & KPIs
  async getDashboardOverview(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userCount = await db.getOne("SELECT COUNT(*) as count FROM users WHERE role = 'customer'");
      const sellerCount = await db.getOne("SELECT COUNT(*) as count FROM users WHERE role = 'seller'");
      const pendingSellers = await db.getOne("SELECT COUNT(*) as count FROM seller_profiles WHERE is_approved = 0");
      const deliveryCount = await db.getOne("SELECT COUNT(*) as count FROM users WHERE role = 'delivery'");
      const productCount = await db.getOne("SELECT COUNT(*) as count FROM products");
      const orderStats = await db.getOne(
        `SELECT 
          COUNT(*) as total_orders,
          SUM(total_amount) as gross_merchandise_value,
          SUM(platform_fee) as platform_revenue,
          SUM(CASE WHEN status IN ('Order Placed', 'Payment Confirmed', 'Packed') THEN 1 ELSE 0 END) as pending_orders,
          SUM(CASE WHEN status = 'Out for Delivery' THEN 1 ELSE 0 END) as active_deliveries,
          SUM(CASE WHEN status = 'Delivered' THEN 1 ELSE 0 END) as completed_orders
         FROM orders WHERE status != 'Cancelled'`
      );

      const pendingReturns = await db.getOne(
        `SELECT COUNT(*) as count FROM returns WHERE status IN ('Requested', 'Seller Review')`
      );

      // Category breakdown
      const categorySales = await db.query(
        `SELECT c.name, COUNT(oi.id) as units_sold, SUM(oi.total_price) as total_sales
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         JOIN categories c ON p.category_id = c.id
         GROUP BY c.id
         ORDER BY total_sales DESC LIMIT 6`
      );

      // Top Selling Products
      const topProducts = await db.query(
        `SELECT p.id, p.title, p.price, p.rating, COUNT(oi.id) as orders_count, SUM(oi.total_price) as revenue,
          (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as image
         FROM order_items oi
         JOIN products p ON oi.product_id = p.id
         GROUP BY p.id
         ORDER BY revenue DESC LIMIT 5`
      );

      // Monthly revenue growth
      const monthlyRevenue = [
        { month: 'Apr', gmv: 340000, revenue: 28900 },
        { month: 'May', gmv: 520000, revenue: 44200 },
        { month: 'Jun', gmv: 780000, revenue: 66300 },
        { month: 'Jul', gmv: 990000, revenue: 84150 },
        { month: 'Aug', gmv: 1250000, revenue: (orderStats?.platform_revenue || 106250) }
      ];

      res.json({
        success: true,
        stats: {
          totalCustomers: userCount?.count || 0,
          totalSellers: sellerCount?.count || 0,
          pendingSellers: pendingSellers?.count || 0,
          totalDeliveryPartners: deliveryCount?.count || 0,
          totalProducts: productCount?.count || 0,
          totalOrders: orderStats?.total_orders || 0,
          gmv: orderStats?.gross_merchandise_value || 0,
          platformRevenue: orderStats?.platform_revenue || 0,
          pendingOrders: orderStats?.pending_orders || 0,
          activeDeliveries: orderStats?.active_deliveries || 0,
          completedOrders: orderStats?.completed_orders || 0,
          pendingReturns: pendingReturns?.count || 0,
          categorySales,
          topProducts,
          monthlyRevenue
        }
      });
    } catch (err: any) {
      console.error('admin getDashboardOverview error:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch admin overview.' });
    }
  },

  // 2. Manage Sellers (List all, approve, reject, commission update)
  async listSellers(req: AuthRequest, res: Response): Promise<void> {
    try {
      const sellers = await db.query(
        `SELECT 
          u.id as user_id, u.full_name, u.email, u.phone, u.status as user_status, u.created_at,
          sp.id as profile_id, sp.store_name, sp.store_slug, sp.store_logo, sp.store_description,
          sp.business_address, sp.gst_number, sp.is_approved, sp.commission_rate, sp.rating, sp.total_sales,
          (SELECT COUNT(*) FROM products WHERE seller_id = u.id) as product_count,
          (SELECT COUNT(*) FROM orders WHERE seller_id = u.id) as order_count
         FROM users u
         JOIN seller_profiles sp ON u.id = sp.user_id
         ORDER BY sp.is_approved ASC, u.created_at DESC`
      );

      res.json({ success: true, sellers });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to list sellers.' });
    }
  },

  // 3. Approve / Reject Seller
  async approveSeller(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { sellerId } = req.params;
      const { is_approved, commission_rate } = req.body;

      await db.run(
        `UPDATE seller_profiles SET 
          is_approved = ?,
          commission_rate = COALESCE(?, commission_rate)
         WHERE user_id = ?`,
        [is_approved ? 1 : 0, commission_rate ? Number(commission_rate) : null, sellerId]
      );

      await db.run(
        `UPDATE users SET status = ? WHERE id = ?`,
        [is_approved ? 'active' : 'suspended', sellerId]
      );

      res.json({
        success: true,
        message: is_approved ? 'Seller application approved successfully!' : 'Seller status updated.'
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to update seller approval status.' });
    }
  },

  // 4. Manage All Marketplace Orders
  async listAllOrders(req: AuthRequest, res: Response): Promise<void> {
    try {
      const orders = await db.query(
        `SELECT 
          o.*,
          u_cust.full_name as customer_name,
          u_cust.email as customer_email,
          sp.store_name as seller_name,
          u_deliv.full_name as delivery_partner_name,
          dp.vehicle_type as delivery_vehicle
         FROM orders o
         JOIN users u_cust ON o.customer_id = u_cust.id
         LEFT JOIN seller_profiles sp ON o.seller_id = sp.user_id
         LEFT JOIN users u_deliv ON o.delivery_partner_id = u_deliv.id
         LEFT JOIN delivery_profiles dp ON u_deliv.id = dp.user_id
         ORDER BY o.created_at DESC`
      );

      res.json({ success: true, orders });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch all orders.' });
    }
  },

  // 5. Admin Products Management (List, Add, Edit Price/Stock, Delete)
  async listAllProducts(req: AuthRequest, res: Response): Promise<void> {
    try {
      const products = await db.query(
        `SELECT 
          p.*,
          c.name as category_name,
          c.slug as category_slug,
          b.name as brand_name,
          sp.store_name as seller_name,
          (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
         FROM products p
         JOIN categories c ON p.category_id = c.id
         LEFT JOIN brands b ON p.brand_id = b.id
         LEFT JOIN seller_profiles sp ON p.seller_id = sp.user_id
         ORDER BY p.created_at DESC`
      );

      res.json({ success: true, products });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch products.' });
    }
  },

  async updateProductPriceStock(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { price, mrp, stock, is_featured, is_local, title, category_id, description } = req.body;

      let discountPercent = 0;
      if (mrp && price && mrp > price) {
        discountPercent = Math.round(((mrp - price) / mrp) * 100);
      }

      await db.run(
        `UPDATE products SET 
          price = COALESCE(?, price),
          mrp = COALESCE(?, mrp),
          discount_percent = CASE WHEN ? IS NOT NULL THEN ? ELSE discount_percent END,
          stock = COALESCE(?, stock),
          is_featured = COALESCE(?, is_featured),
          is_local = COALESCE(?, is_local),
          title = COALESCE(?, title),
          category_id = COALESCE(?, category_id),
          description = COALESCE(?, description),
          updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [price, mrp, mrp ? discountPercent : null, discountPercent, stock, is_featured, is_local, title, category_id, description, id]
      );

      res.json({ success: true, message: 'Product updated successfully by Admin.' });
    } catch (err: any) {
      console.error('updateProductPriceStock error:', err);
      res.status(500).json({ success: false, message: 'Failed to update product.' });
    }
  },

  async deleteProduct(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await db.run('DELETE FROM product_specs WHERE product_id = ?', [id]);
      await db.run('DELETE FROM product_variants WHERE product_id = ?', [id]);
      await db.run('DELETE FROM product_images WHERE product_id = ?', [id]);
      await db.run('DELETE FROM reviews WHERE product_id = ?', [id]);
      await db.run('DELETE FROM cart_items WHERE product_id = ?', [id]);
      await db.run('DELETE FROM wishlist_items WHERE product_id = ?', [id]);
      await db.run('DELETE FROM products WHERE id = ?', [id]);

      res.json({ success: true, message: 'Product deleted from marketplace successfully.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to delete product.' });
    }
  },

  // 6. Delivery Partners Management (List, Add, Update Status, Delete, Assign Order)
  async listDeliveryPartners(req: AuthRequest, res: Response): Promise<void> {
    try {
      const partners = await db.query(
        `SELECT 
          u.id as user_id, u.full_name, u.email, u.phone, u.status, u.created_at,
          dp.id as profile_id, dp.vehicle_type, dp.vehicle_number, dp.license_number,
          dp.is_available, dp.total_deliveries, dp.rating, dp.earnings,
          (SELECT COUNT(*) FROM orders WHERE delivery_partner_id = u.id AND status IN ('Packed', 'Shipped', 'Out for Delivery')) as active_deliveries_count
         FROM users u
         JOIN delivery_profiles dp ON u.id = dp.user_id
         WHERE u.role = 'delivery'
         ORDER BY u.created_at DESC`
      );

      res.json({ success: true, deliveryPartners: partners });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to list delivery partners.' });
    }
  },

  async createDeliveryPartner(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { full_name, email, phone, password = 'Delivery@123', vehicle_type = 'Hero Electric Splendor', vehicle_number = 'TS 09 EZ 1234' } = req.body;

      if (!full_name || !email || !phone) {
        res.status(400).json({ success: false, message: 'Please provide full name, email, and phone number.' });
        return;
      }

      const existing = await db.getOne('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
      if (existing) {
        res.status(400).json({ success: false, message: 'An account with this email already exists.' });
        return;
      }

      const userId = `usr_deliv_${uuidv4().substring(0, 6)}`;
      const passwordHash = await bcrypt.hash(password, 10);

      await db.run(
        `INSERT INTO users (id, email, password_hash, full_name, phone, role, status)
         VALUES (?, ?, ?, ?, ?, 'delivery', 'active')`,
        [userId, email.toLowerCase().trim(), passwordHash, full_name, phone]
      );

      await db.run(
        `INSERT INTO delivery_profiles (id, user_id, vehicle_type, vehicle_number, is_available, rating, earnings, total_deliveries)
         VALUES (?, ?, ?, ?, 1, 5.0, 0, 0)`,
        [`dp_${uuidv4().substring(0, 8)}`, userId, vehicle_type, vehicle_number]
      );

      res.status(201).json({ success: true, message: 'New Delivery Partner added successfully!' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to create delivery partner.' });
    }
  },

  async updateDeliveryPartner(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { full_name, phone, status, vehicle_type, vehicle_number, is_available } = req.body;

      await db.run(
        `UPDATE users SET 
          full_name = COALESCE(?, full_name),
          phone = COALESCE(?, phone),
          status = COALESCE(?, status)
         WHERE id = ?`,
        [full_name, phone, status, id]
      );

      await db.run(
        `UPDATE delivery_profiles SET 
          vehicle_type = COALESCE(?, vehicle_type),
          vehicle_number = COALESCE(?, vehicle_number),
          is_available = COALESCE(?, is_available)
         WHERE user_id = ?`,
        [vehicle_type, vehicle_number, is_available, id]
      );

      res.json({ success: true, message: 'Delivery Partner details updated successfully.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to update delivery partner.' });
    }
  },

  async deleteDeliveryPartner(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await db.run('DELETE FROM delivery_profiles WHERE user_id = ?', [id]);
      await db.run('DELETE FROM users WHERE id = ? AND role = "delivery"', [id]);
      res.json({ success: true, message: 'Delivery partner removed successfully.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to delete delivery partner.' });
    }
  },

  async assignDeliveryPartner(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;
      const { delivery_partner_id } = req.body;

      await db.run(
        `UPDATE orders SET delivery_partner_id = ? WHERE id = ?`,
        [delivery_partner_id, orderId]
      );

      res.json({ success: true, message: 'Order reassigned to delivery partner successfully.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to assign delivery partner.' });
    }
  },

  // 7. Manage Platform Settings
  async getSettings(req: AuthRequest, res: Response): Promise<void> {
    try {
      const settings = await db.query('SELECT * FROM platform_settings');
      res.json({ success: true, settings });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch settings.' });
    }
  },

  async updateSettings(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { settings } = req.body;

      if (Array.isArray(settings)) {
        for (const s of settings) {
          await db.run(
            `UPDATE platform_settings SET setting_value = ? WHERE setting_key = ?`,
            [s.setting_value, s.setting_key]
          );
        }
      }

      res.json({ success: true, message: 'Platform settings updated successfully.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to update settings.' });
    }
  }
};

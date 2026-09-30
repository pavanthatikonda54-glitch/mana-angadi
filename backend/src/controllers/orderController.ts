import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/db.js';
import { AuthRequest } from '../middleware/auth.js';

export const orderController = {
  // 1. Create New Order (Checkout)
  async createOrder(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) return;
      const {
        address_id,
        recipient_name,
        phone,
        shipping_address,
        city,
        state,
        pincode,
        payment_method = 'UPI',
        coupon_code,
        items = [] // If empty, checkout from active cart
      } = req.body;

      // Validate address
      let addressData = {
        recipient_name,
        phone,
        shipping_address,
        city,
        state,
        pincode
      };

      if (address_id) {
        const savedAddr = await db.getOne('SELECT * FROM addresses WHERE id = ? AND user_id = ?', [address_id, req.user.userId]);
        if (savedAddr) {
          addressData = {
            recipient_name: savedAddr.recipient_name,
            phone: savedAddr.phone,
            shipping_address: `${savedAddr.address_line1}, ${savedAddr.address_line2 || ''} ${savedAddr.landmark ? '(' + savedAddr.landmark + ')' : ''}`.trim(),
            city: savedAddr.city,
            state: savedAddr.state,
            pincode: savedAddr.pincode
          };
        }
      }

      if (!addressData.recipient_name || !addressData.shipping_address || !addressData.pincode) {
        res.status(400).json({ success: false, message: 'Please provide complete delivery address and pincode.' });
        return;
      }

      // Fetch checkout items
      let checkoutItems: any[] = [];
      if (items.length > 0) {
        for (const item of items) {
          const prod = await db.getOne(
            `SELECT p.*, pv.variant_type, pv.variant_value, pv.price_delta,
              (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
             FROM products p
             LEFT JOIN product_variants pv ON pv.id = ?
             WHERE p.id = ?`,
            [item.variant_id || null, item.product_id]
          );
          if (prod) {
            const price = prod.price + (prod.price_delta || 0);
            checkoutItems.push({
              product_id: prod.id,
              variant_id: item.variant_id || null,
              seller_id: prod.seller_id,
              product_title: prod.title + (prod.variant_value ? ` (${prod.variant_value})` : ''),
              price,
              quantity: item.quantity || 1,
              total_price: price * (item.quantity || 1),
              image_url: prod.primary_image || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400'
            });
          }
        }
      } else {
        // Fetch from cart
        const cartRows = await db.query(
          `SELECT 
            ci.*,
            p.title,
            p.price,
            p.seller_id,
            pv.variant_value,
            pv.price_delta,
            (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image
           FROM cart_items ci
           JOIN products p ON ci.product_id = p.id
           LEFT JOIN product_variants pv ON ci.variant_id = pv.id
           WHERE ci.user_id = ?`,
          [req.user.userId]
        );

        if (cartRows.length === 0) {
          res.status(400).json({ success: false, message: 'Your cart is empty. Add products to proceed.' });
          return;
        }

        checkoutItems = cartRows.map((r) => {
          const price = r.price + (r.price_delta || 0);
          return {
            product_id: r.product_id,
            variant_id: r.variant_id,
            seller_id: r.seller_id,
            product_title: r.title + (r.variant_value ? ` (${r.variant_value})` : ''),
            price,
            quantity: r.quantity,
            total_price: price * r.quantity,
            image_url: r.primary_image || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400'
          };
        });
      }

      if (checkoutItems.length === 0) {
        res.status(400).json({ success: false, message: 'No valid items found for checkout.' });
        return;
      }

      // Calculate totals
      const subtotal = checkoutItems.reduce((acc, i) => acc + i.total_price, 0);
      const deliveryFee = subtotal >= 499 ? 0 : 40;
      let discountAmount = 0;

      if (coupon_code) {
        const coupon = await db.getOne(
          `SELECT * FROM coupons WHERE code = ? AND is_active = 1 AND (expiry_date IS NULL OR datetime(expiry_date) > datetime('now'))`,
          [coupon_code.toUpperCase().trim()]
        );
        if (coupon && subtotal >= coupon.min_order_amount) {
          if (coupon.discount_type === 'percentage') {
            discountAmount = (subtotal * coupon.discount_value) / 100;
            if (coupon.max_discount_amount) discountAmount = Math.min(discountAmount, coupon.max_discount_amount);
          } else {
            discountAmount = coupon.discount_value;
          }
          discountAmount = Math.min(discountAmount, subtotal);
          // Increment coupon usage
          await db.run('UPDATE coupons SET times_used = times_used + 1 WHERE id = ?', [coupon.id]);
        }
      }

      const totalAmount = subtotal - discountAmount + deliveryFee;
      
      // Calculate platform commission (default ~8.5%)
      const setting = await db.getOne("SELECT setting_value FROM platform_settings WHERE setting_key = 'default_commission_rate'");
      const commRate = setting ? parseFloat(setting.setting_value) : 8.5;
      const platformFee = (totalAmount * commRate) / 100;
      const sellerEarnings = totalAmount - platformFee;

      // Assign Delivery Partner
      const deliveryPartner = await db.getOne("SELECT id FROM users WHERE role = 'delivery' AND status = 'active' LIMIT 1");
      const deliveryPartnerId = deliveryPartner ? deliveryPartner.id : null;
      const primarySellerId = checkoutItems[0].seller_id;

      // Generate unique Order ID
      const countRow = await db.getOne('SELECT COUNT(*) as cnt FROM orders');
      const orderSeq = (countRow ? countRow.cnt + 1 : 1).toString().padStart(6, '0');
      const orderNumber = `MN-2026-${orderSeq}`;
      const orderId = `ord_${uuidv4().substring(0, 8)}`;

      // Estimated delivery date (3 days from now)
      const estDelivery = new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString();

      await db.run(
        `INSERT INTO orders (
          id, order_number, customer_id, seller_id, delivery_partner_id, address_id,
          recipient_name, phone, shipping_address, city, state, pincode,
          status, subtotal, discount_amount, coupon_code, delivery_fee, total_amount,
          platform_fee, seller_earnings, payment_method, payment_status, estimated_delivery
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          orderId, orderNumber, req.user.userId, primarySellerId, deliveryPartnerId, address_id || null,
          addressData.recipient_name, addressData.phone, addressData.shipping_address, addressData.city, addressData.state, addressData.pincode,
          'Order Placed', subtotal, discountAmount, coupon_code || null, deliveryFee, totalAmount,
          platformFee, sellerEarnings, payment_method, 'completed', estDelivery
        ]
      );

      // Insert Order Items and decrement stock
      for (const item of checkoutItems) {
        await db.run(
          `INSERT INTO order_items (id, order_id, product_id, variant_id, seller_id, product_title, price, quantity, total_price, image_url)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [`oi_${uuidv4().substring(0, 8)}`, orderId, item.product_id, item.variant_id, item.seller_id, item.product_title, item.price, item.quantity, item.total_price, item.image_url]
        );

        // Update product stock
        await db.run('UPDATE products SET stock = MAX(0, stock - ?) WHERE id = ?', [item.quantity, item.product_id]);
      }

      // Create Payment record
      // Create Payment record
      const txnId = `TXN_${payment_method.toUpperCase()}_${Date.now().toString().substring(5)}`;
      await db.run(
        `INSERT INTO payments (id, order_id, payment_method, transaction_id, amount, status, payment_details)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [`pay_${uuidv4().substring(0, 8)}`, orderId, payment_method, txnId, totalAmount, 'completed', JSON.stringify({ method: payment_method, reference: txnId })]
      );

      // Initial Order Tracking Milestones
      const now = new Date().toISOString();
      await db.run(
        `INSERT INTO order_tracking (id, order_id, status, title, description, location, timestamp)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [`trk_${uuidv4().substring(0, 8)}`, orderId, 'Order Placed', 'Order Placed Successfully', 'Your order was received and verified by MaNa Angadi.', 'MaNa Angadi Central Hub', now]
      );

      await db.run(
        `INSERT INTO order_tracking (id, order_id, status, title, description, location, timestamp)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [`trk_${uuidv4().substring(0, 8)}`, orderId, 'Payment Confirmed', `Payment Verified (${payment_method})`, `Transaction ${txnId} verified successfully.`, 'Secure Payment Gateway', now]
      );

      // Clear User Cart only if checkout was from the active cart
      if (items.length === 0) {
        await db.run('DELETE FROM cart_items WHERE user_id = ?', [req.user.userId]);
      }

      // Create in-app Notifications
      await db.run(
        `INSERT INTO notifications (id, user_id, title, message, type, link_url)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [`notif_${uuidv4().substring(0, 8)}`, req.user.userId, 'Order Placed! 🛍️', `Your order ${orderNumber} for ₹${totalAmount.toFixed(2)} is placed successfully.`, 'order', `/orders/${orderId}`]
      );

      if (primarySellerId) {
        await db.run(
          `INSERT INTO notifications (id, user_id, title, message, type, link_url)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [`notif_${uuidv4().substring(0, 8)}`, primarySellerId, 'New Order Received! 📦', `New order ${orderNumber} received. Please confirm & pack.`, 'order', '/seller/orders']
        );
      }

      if (deliveryPartnerId) {
        await db.run(
          `INSERT INTO notifications (id, user_id, title, message, type, link_url)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [`notif_${uuidv4().substring(0, 8)}`, deliveryPartnerId, 'New Delivery Assigned 🛵', `Order ${orderNumber} in ${addressData.city} is assigned to you.`, 'order', '/delivery']
        );
      }

      res.status(201).json({
        success: true,
        message: 'Order placed successfully! Mana Ooru Shopping, Mana Angadi.',
        order: {
          id: orderId,
          order_number: orderNumber,
          total_amount: totalAmount,
          subtotal,
          discount_amount: discountAmount,
          delivery_fee: deliveryFee,
          payment_method,
          estimated_delivery: estDelivery
        }
      });
    } catch (err: any) {
      console.error('createOrder error:', err);
      res.status(500).json({ success: false, message: 'Failed to place order.' });
    }
  },

  // 2. Get Customer Order History
  async getCustomerOrders(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) return;

      const orders = await db.query(
        `SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC`,
        [req.user.userId]
      );

      const enhancedOrders = [];
      for (const order of orders) {
        const items = await db.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
        enhancedOrders.push({
          ...order,
          items,
          is_cancellable: ['Order Placed', 'Payment Confirmed', 'Seller Confirmed'].includes(order.status)
        });
      }

      res.json({ success: true, orders: enhancedOrders });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch customer orders.' });
    }
  },

  // 3. Get Order Details & Live Tracking Timeline
  async getOrderById(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) return;
      const { id } = req.params;

      const order = await db.getOne(
        `SELECT 
          o.*,
          sp.store_name as seller_name,
          sp.business_address as seller_address,
          u_deliv.full_name as delivery_partner_name,
          u_deliv.phone as delivery_partner_phone,
          dp.vehicle_type as delivery_vehicle,
          dp.vehicle_number as delivery_vehicle_number,
          dp.rating as delivery_rating
        FROM orders o
        LEFT JOIN seller_profiles sp ON o.seller_id = sp.user_id
        LEFT JOIN users u_deliv ON o.delivery_partner_id = u_deliv.id
        LEFT JOIN delivery_profiles dp ON u_deliv.id = dp.user_id
        WHERE o.id = ? OR o.order_number = ?`,
        [id, id]
      );

      if (!order) {
        res.status(404).json({ success: false, message: 'Order not found.' });
        return;
      }

      // Authorization check (customer, seller, delivery, admin)
      if (req.user.role === 'customer' && order.customer_id !== req.user.userId) {
        res.status(403).json({ success: false, message: 'Unauthorized to view this order.' });
        return;
      }

      const items = await db.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
      const tracking = await db.query('SELECT * FROM order_tracking WHERE order_id = ? ORDER BY timestamp ASC', [order.id]);
      const payment = await db.getOne('SELECT * FROM payments WHERE order_id = ?', [order.id]);
      const returnRequest = await db.getOne('SELECT * FROM returns WHERE order_id = ?', [order.id]);

      res.json({
        success: true,
        order: {
          ...order,
          items,
          tracking,
          payment,
          returnRequest,
          is_cancellable: ['Order Placed', 'Payment Confirmed', 'Seller Confirmed'].includes(order.status),
          is_returnable: order.status === 'Delivered' && !returnRequest
        }
      });
    } catch (err: any) {
      console.error('getOrderById error:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch order details.' });
    }
  },

  // 4. Cancel Order
  async cancelOrder(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) return;
      const { id } = req.params;
      const { reason = 'Cancelled by Customer' } = req.body;

      const order = await db.getOne('SELECT * FROM orders WHERE id = ?', [id]);
      if (!order) {
        res.status(404).json({ success: false, message: 'Order not found.' });
        return;
      }

      if (req.user.role === 'customer' && order.customer_id !== req.user.userId) {
        res.status(403).json({ success: false, message: 'Unauthorized.' });
        return;
      }

      if (!['Order Placed', 'Payment Confirmed', 'Seller Confirmed'].includes(order.status)) {
        res.status(400).json({
          success: false,
          message: `Order cannot be cancelled because it is already ${order.status}. You may initiate a return after delivery.`
        });
        return;
      }

      await db.run(
        `UPDATE orders SET status = 'Cancelled', cancel_reason = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [reason, id]
      );

      // Restore inventory
      const items = await db.query('SELECT product_id, quantity FROM order_items WHERE order_id = ?', [id]);
      for (const item of items) {
        await db.run('UPDATE products SET stock = stock + ? WHERE id = ?', [item.quantity, item.product_id]);
      }

      // Tracking milestone
      await db.run(
        `INSERT INTO order_tracking (id, order_id, status, title, description, location)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [`trk_${uuidv4().substring(0, 8)}`, id, 'Cancelled', 'Order Cancelled', `Order was cancelled. Reason: ${reason}`, 'MaNa Angadi System']
      );

      // Notify customer
      await db.run(
        `INSERT INTO notifications (id, user_id, title, message, type, link_url)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [`notif_${uuidv4().substring(0, 8)}`, order.customer_id, 'Order Cancelled', `Order ${order.order_number} has been cancelled. Refund will be processed if applicable.`, 'alert', `/orders/${id}`]
      );

      res.json({ success: true, message: 'Order has been cancelled successfully.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to cancel order.' });
    }
  }
};

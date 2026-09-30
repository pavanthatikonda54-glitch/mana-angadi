import { db } from '../config/db.js';

export async function initializeSchema() {
  console.log('Initializing database schema for MaNa Angadi...');

  await db.exec(`
    -- 1. Users Table
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      phone TEXT,
      role TEXT NOT NULL CHECK(role IN ('customer', 'seller', 'delivery', 'admin')),
      avatar_url TEXT,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'suspended', 'pending')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 2. Seller Profiles
    CREATE TABLE IF NOT EXISTS seller_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      store_name TEXT NOT NULL,
      store_slug TEXT UNIQUE NOT NULL,
      store_logo TEXT,
      store_description TEXT,
      business_address TEXT,
      gst_number TEXT,
      bank_account TEXT,
      is_approved INTEGER DEFAULT 0,
      commission_rate REAL DEFAULT 10.0,
      rating REAL DEFAULT 4.5,
      total_sales REAL DEFAULT 0.0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- 3. Delivery Profiles
    CREATE TABLE IF NOT EXISTS delivery_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE NOT NULL,
      vehicle_type TEXT DEFAULT 'Bike',
      vehicle_number TEXT,
      license_number TEXT,
      is_available INTEGER DEFAULT 1,
      current_lat REAL DEFAULT 17.3850,
      current_lng REAL DEFAULT 78.4867,
      total_deliveries INTEGER DEFAULT 0,
      rating REAL DEFAULT 4.8,
      earnings REAL DEFAULT 0.0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- 4. Customer Addresses
    CREATE TABLE IF NOT EXISTS addresses (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      recipient_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      address_line1 TEXT NOT NULL,
      address_line2 TEXT,
      landmark TEXT,
      city TEXT NOT NULL,
      district TEXT,
      state TEXT NOT NULL,
      pincode TEXT NOT NULL,
      address_type TEXT DEFAULT 'Home' CHECK(address_type IN ('Home', 'Work', 'Other')),
      is_default INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- 5. Categories
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      icon TEXT,
      image_url TEXT,
      description TEXT,
      parent_id TEXT,
      is_active INTEGER DEFAULT 1,
      display_order INTEGER DEFAULT 0,
      FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
    );

    -- 6. Brands
    CREATE TABLE IF NOT EXISTS brands (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      logo_url TEXT,
      is_featured INTEGER DEFAULT 0
    );

    -- 7. Products
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      seller_id TEXT NOT NULL,
      category_id TEXT NOT NULL,
      brand_id TEXT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT NOT NULL,
      short_description TEXT,
      sku TEXT UNIQUE,
      mrp REAL NOT NULL,
      price REAL NOT NULL,
      discount_percent INTEGER DEFAULT 0,
      stock INTEGER DEFAULT 10,
      is_featured INTEGER DEFAULT 0,
      is_approved INTEGER DEFAULT 1,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
      rating REAL DEFAULT 4.5,
      review_count INTEGER DEFAULT 0,
      warranty_info TEXT DEFAULT '1 Year Brand Warranty',
      return_policy_days INTEGER DEFAULT 7,
      free_delivery INTEGER DEFAULT 1,
      is_local INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
      FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL
    );

    -- 8. Product Images
    CREATE TABLE IF NOT EXISTS product_images (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      image_url TEXT NOT NULL,
      alt_text TEXT,
      is_primary INTEGER DEFAULT 0,
      display_order INTEGER DEFAULT 0,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    -- 9. Product Variants (Color, Size, Spec, Storage, etc.)
    CREATE TABLE IF NOT EXISTS product_variants (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      variant_type TEXT NOT NULL,
      variant_value TEXT NOT NULL,
      price_delta REAL DEFAULT 0.0,
      stock INTEGER DEFAULT 10,
      sku TEXT,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    -- 10. Product Specifications
    CREATE TABLE IF NOT EXISTS product_specs (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      spec_group TEXT DEFAULT 'General',
      spec_name TEXT NOT NULL,
      spec_value TEXT NOT NULL,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    -- 11. Cart Items
    CREATE TABLE IF NOT EXISTS cart_items (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      variant_id TEXT,
      quantity INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE SET NULL
    );

    -- 12. Wishlist Items
    CREATE TABLE IF NOT EXISTS wishlist_items (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      UNIQUE(user_id, product_id)
    );

    -- 13. Coupons
    CREATE TABLE IF NOT EXISTS coupons (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      description TEXT,
      discount_type TEXT NOT NULL CHECK(discount_type IN ('percentage', 'fixed')),
      discount_value REAL NOT NULL,
      min_order_amount REAL DEFAULT 0,
      max_discount_amount REAL,
      start_date DATETIME,
      expiry_date DATETIME,
      usage_limit INTEGER DEFAULT 1000,
      times_used INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 14. Orders
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT UNIQUE NOT NULL,
      customer_id TEXT NOT NULL,
      seller_id TEXT,
      delivery_partner_id TEXT,
      address_id TEXT,
      recipient_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      shipping_address TEXT NOT NULL,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      pincode TEXT NOT NULL,
      status TEXT DEFAULT 'Order Placed' CHECK(status IN ('Order Placed', 'Payment Confirmed', 'Seller Confirmed', 'Packed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled')),
      subtotal REAL NOT NULL,
      discount_amount REAL DEFAULT 0.0,
      coupon_code TEXT,
      delivery_fee REAL DEFAULT 0.0,
      tax_amount REAL DEFAULT 0.0,
      total_amount REAL NOT NULL,
      platform_fee REAL DEFAULT 0.0,
      seller_earnings REAL DEFAULT 0.0,
      payment_method TEXT DEFAULT 'UPI' CHECK(payment_method IN ('UPI', 'Card', 'NetBanking', 'Wallet', 'COD')),
      payment_status TEXT DEFAULT 'completed' CHECK(payment_status IN ('pending', 'completed', 'failed', 'refunded')),
      estimated_delivery DATETIME,
      delivered_at DATETIME,
      cancel_reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE RESTRICT,
      FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (delivery_partner_id) REFERENCES users(id) ON DELETE SET NULL
    );

    -- 15. Order Items
    CREATE TABLE IF NOT EXISTS order_items (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      variant_id TEXT,
      seller_id TEXT,
      product_title TEXT NOT NULL,
      price REAL NOT NULL,
      quantity INTEGER NOT NULL,
      total_price REAL NOT NULL,
      image_url TEXT,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
    );

    -- 16. Order Tracking Timeline
    CREATE TABLE IF NOT EXISTS order_tracking (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      status TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      location TEXT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );

    -- 17. Payments
    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      transaction_id TEXT UNIQUE NOT NULL,
      amount REAL NOT NULL,
      status TEXT DEFAULT 'completed',
      payment_details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
    );

    -- 18. Product Reviews
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      order_id TEXT,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      title TEXT,
      comment TEXT NOT NULL,
      image_urls TEXT,
      is_verified_purchase INTEGER DEFAULT 1,
      is_approved INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- 19. Returns & Refunds
    CREATE TABLE IF NOT EXISTS returns (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      order_item_id TEXT NOT NULL,
      customer_id TEXT NOT NULL,
      seller_id TEXT,
      reason TEXT NOT NULL,
      details TEXT,
      image_urls TEXT,
      status TEXT DEFAULT 'Requested' CHECK(status IN ('Requested', 'Seller Review', 'Approved', 'Pickup Scheduled', 'Picked Up', 'Refund Processing', 'Refund Completed', 'Rejected')),
      refund_amount REAL NOT NULL,
      refund_method TEXT DEFAULT 'Original Source',
      admin_note TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- 20. Flash Sales
    CREATE TABLE IF NOT EXISTS flash_sales (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      tagline TEXT,
      banner_url TEXT,
      start_time DATETIME NOT NULL,
      end_time DATETIME NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 21. Flash Sale Products
    CREATE TABLE IF NOT EXISTS flash_sale_products (
      id TEXT PRIMARY KEY,
      flash_sale_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      special_price REAL NOT NULL,
      stock_limit INTEGER DEFAULT 50,
      sold_count INTEGER DEFAULT 0,
      FOREIGN KEY (flash_sale_id) REFERENCES flash_sales(id) ON DELETE CASCADE,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    );

    -- 22. Hero Banners
    CREATE TABLE IF NOT EXISTS banners (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      subtitle TEXT,
      tagline TEXT,
      image_url TEXT NOT NULL,
      link_url TEXT NOT NULL,
      badge_text TEXT,
      display_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1
    );

    -- 23. Notifications
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT DEFAULT 'info' CHECK(type IN ('order', 'offer', 'alert', 'system')),
      link_url TEXT,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- 24. Support Tickets
    CREATE TABLE IF NOT EXISTS support_tickets (
      id TEXT PRIMARY KEY,
      ticket_number TEXT UNIQUE NOT NULL,
      user_id TEXT NOT NULL,
      order_id TEXT,
      subject TEXT NOT NULL,
      category TEXT DEFAULT 'Order Issue',
      priority TEXT DEFAULT 'Medium' CHECK(priority IN ('Low', 'Medium', 'High', 'Urgent')),
      status TEXT DEFAULT 'open' CHECK(status IN ('open', 'in_progress', 'resolved', 'closed')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- 25. Support Messages
    CREATE TABLE IF NOT EXISTS support_messages (
      id TEXT PRIMARY KEY,
      ticket_id TEXT NOT NULL,
      sender_id TEXT NOT NULL,
      sender_name TEXT NOT NULL,
      message TEXT NOT NULL,
      is_staff INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE
    );

    -- 26. Platform Settings
    CREATE TABLE IF NOT EXISTS platform_settings (
      setting_key TEXT PRIMARY KEY,
      setting_value TEXT NOT NULL,
      description TEXT
    );

    -- Indexes for high-performance searches and joins
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
    CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id);
    CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
    CREATE INDEX IF NOT EXISTS idx_products_rating ON products(rating);
    CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
    CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
    CREATE INDEX IF NOT EXISTS idx_orders_seller ON orders(seller_id);
    CREATE INDEX IF NOT EXISTS idx_orders_delivery ON orders(delivery_partner_id);
    CREATE INDEX IF NOT EXISTS idx_cart_user ON cart_items(user_id);
    CREATE INDEX IF NOT EXISTS idx_wishlist_user ON wishlist_items(user_id);
    CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
  `);

  console.log('Database schema created successfully.');
}

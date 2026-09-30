import bcrypt from 'bcryptjs';
import { db } from '../config/db.js';
import { initializeSchema } from '../models/schema.js';

export async function runSeed() {
  await initializeSchema();
  console.log('Seeding MaNa Angadi database with rich realistic Indian marketplace data...');

  const passwordHash = await bcrypt.hash('Admin@123', 10);
  const sellerHash = await bcrypt.hash('Seller@123', 10);
  const customerHash = await bcrypt.hash('Customer@123', 10);
  const deliveryHash = await bcrypt.hash('Delivery@123', 10);

  // Clear existing data in correct order
  await db.exec(`
    DELETE FROM support_messages;
    DELETE FROM support_tickets;
    DELETE FROM notifications;
    DELETE FROM flash_sale_products;
    DELETE FROM flash_sales;
    DELETE FROM banners;
    DELETE FROM returns;
    DELETE FROM reviews;
    DELETE FROM payments;
    DELETE FROM order_tracking;
    DELETE FROM order_items;
    DELETE FROM orders;
    DELETE FROM coupons;
    DELETE FROM wishlist_items;
    DELETE FROM cart_items;
    DELETE FROM product_specs;
    DELETE FROM product_variants;
    DELETE FROM product_images;
    DELETE FROM products;
    DELETE FROM brands;
    DELETE FROM categories;
    DELETE FROM addresses;
    DELETE FROM delivery_profiles;
    DELETE FROM seller_profiles;
    DELETE FROM platform_settings;
    DELETE FROM users;
  `);

  // 1. Platform Settings
  await db.run(
    `INSERT INTO platform_settings (setting_key, setting_value, description) VALUES 
     ('platform_name', 'MaNa Angadi', 'Marketplace Brand Name'),
     ('tagline', 'Mana Ooru Shopping, Mana Angadi.', 'Platform Tagline'),
     ('default_commission_rate', '8.5', 'Default platform commission percentage'),
     ('free_shipping_threshold', '499', 'Order amount in INR for free delivery'),
     ('support_email', 'support@manaangadi.demo', 'Customer support email address'),
     ('support_phone', '+91 1800 555 6262', 'Toll-free customer care number'),
     ('maintenance_mode', 'false', 'Enable/disable platform maintenance')`
  );

  // 2. Users & Profiles
  // Admin
  await db.run(
    `INSERT INTO users (id, email, password_hash, full_name, phone, role, avatar_url, status)
     VALUES ('usr_admin_1', 'admin@manaangadi.demo', ?, 'MaNa Angadi Administrator', '+91 9876543210', 'admin', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', 'active')`,
    [passwordHash]
  );

  // Sellers
  await db.run(
    `INSERT INTO users (id, email, password_hash, full_name, phone, role, avatar_url, status)
     VALUES ('usr_seller_1', 'seller@manaangadi.demo', ?, 'Venkat Rao', '+91 9848022338', 'seller', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', 'active')`,
    [sellerHash]
  );
  await db.run(
    `INSERT INTO seller_profiles (id, user_id, store_name, store_slug, store_logo, store_description, business_address, gst_number, bank_account, is_approved, commission_rate, rating, total_sales)
     VALUES ('sp_1', 'usr_seller_1', 'Sri Lakshmi Handlooms & Crafts', 'sri-lakshmi-handlooms', 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=150', 'Authentic Pochampally, Gadwal, Kalamkari handcrafted textiles & local heritage artisanal items.', 'Plot 42, Weavers Colony, Pochampally, Telangana - 508284', '36AAAAA0000A1Z5', 'HDFC000123456789', 1, 7.5, 4.9, 142500)`
  );

  await db.run(
    `INSERT INTO users (id, email, password_hash, full_name, phone, role, avatar_url, status)
     VALUES ('usr_seller_2', 'seller2@manaangadi.demo', ?, 'Rajesh Sharma', '+91 9123456789', 'seller', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', 'active')`,
    [sellerHash]
  );
  await db.run(
    `INSERT INTO seller_profiles (id, user_id, store_name, store_slug, store_logo, store_description, business_address, gst_number, bank_account, is_approved, commission_rate, rating, total_sales)
     VALUES ('sp_2', 'usr_seller_2', 'Deccan Tech Electronics & Mobiles', 'deccan-tech', 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=150', 'Premier authorized retailer for latest 5G smartphones, wireless audio, smart TVs & gaming peripherals.', 'Shop 104, Chenoy Trade Centre, Parklane, Secunderabad - 500003', '36BBBBB1111B2Z6', 'ICIC000987654321', 1, 9.0, 4.8, 389000)`
  );

  await db.run(
    `INSERT INTO users (id, email, password_hash, full_name, phone, role, avatar_url, status)
     VALUES ('usr_seller_3', 'seller3@manaangadi.demo', ?, 'Ananya Kulkarni', '+91 9988776655', 'seller', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', 'active')`,
    [sellerHash]
  );
  await db.run(
    `INSERT INTO seller_profiles (id, user_id, store_name, store_slug, store_logo, store_description, business_address, gst_number, bank_account, is_approved, commission_rate, rating, total_sales)
     VALUES ('sp_3', 'usr_seller_3', 'Godavari Organics & Spices', 'godavari-organics', 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=150', 'Farm-fresh organic cold-pressed oils, single-origin Guntur chillies, organic honey & spices directly sourced from farmers.', '12-4-88, Main Bazaar, Rajahmundry, Andhra Pradesh - 533101', '37CCCCC2222C3Z7', 'SBIN00055443322', 1, 6.0, 4.9, 98400)`
  );

  await db.run(
    `INSERT INTO users (id, email, password_hash, full_name, phone, role, avatar_url, status)
     VALUES ('usr_seller_4', 'fruitseller@manaangadi.demo', ?, 'Kishore Reddy', '+91 9876501234', 'seller', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', 'active')`,
    [sellerHash]
  );
  await db.run(
    `INSERT INTO seller_profiles (id, user_id, store_name, store_slug, store_logo, store_description, business_address, gst_number, bank_account, is_approved, commission_rate, rating, total_sales)
     VALUES ('sp_4', 'usr_seller_4', 'Rayalaseema Fresh Orchards & Organic Farms', 'rayalaseema-orchards', 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=150', 'Direct from organic farmers: Sweet Banganapalli Mangoes, Kashmiri Apples, Nagpur Oranges & freshly harvested daily fruits.', 'Orchard Block 7, Tadipatri Road, Anantapur, Andhra Pradesh - 515001', '37DDDDD3333D4Z8', 'HDFC00044556677', 1, 5.0, 4.9, 178900)`
  );

  // Delivery Partner
  await db.run(
    `INSERT INTO users (id, email, password_hash, full_name, phone, role, avatar_url, status)
     VALUES ('usr_deliv_1', 'delivery@manaangadi.demo', ?, 'Suresh Kumar', '+91 9700112233', 'delivery', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150', 'active')`,
    [deliveryHash]
  );
  await db.run(
    `INSERT INTO delivery_profiles (id, user_id, vehicle_type, vehicle_number, license_number, is_available, current_lat, current_lng, total_deliveries, rating, earnings)
     VALUES ('dp_1', 'usr_deliv_1', 'Hero Electric Splendor', 'TS 09 EZ 4590', 'DL-TS-2022-88741', 1, 17.3850, 78.4867, 142, 4.9, 18500)`
  );

  // Customers
  await db.run(
    `INSERT INTO users (id, email, password_hash, full_name, phone, role, avatar_url, status)
     VALUES ('usr_cust_1', 'customer@manaangadi.demo', ?, 'Priya Thatikonda', '+91 9849012345', 'customer', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', 'active')`,
    [customerHash]
  );

  await db.run(
    `INSERT INTO users (id, email, password_hash, full_name, phone, role, avatar_url, status)
     VALUES ('usr_cust_2', 'customer2@manaangadi.demo', ?, 'Ramesh Reddy', '+91 9849098765', 'customer', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150', 'active')`,
    [customerHash]
  );

  // Customer Addresses
  await db.run(
    `INSERT INTO addresses (id, user_id, recipient_name, phone, address_line1, address_line2, landmark, city, district, state, pincode, address_type, is_default)
     VALUES 
     ('addr_1', 'usr_cust_1', 'Priya Thatikonda', '+91 9849012345', 'Flat 402, Sai Vihar Apartments', 'Road No. 12, Banjara Hills', 'Near City Centre Mall', 'Hyderabad', 'Hyderabad', 'Telangana', '500034', 'Home', 1),
     ('addr_2', 'usr_cust_1', 'Priya Thatikonda', '+91 9849012345', 'Unit 601, Cyber Towers', 'HITEC City, Madhapur', 'Opposite Cyber Gateway', 'Hyderabad', 'Rangareddy', 'Telangana', '500081', 'Work', 0)`
  );

  // 3. Categories (14 distinct categories)
  const categories = [
    { id: 'cat_electronics', name: 'Electronics', slug: 'electronics', icon: 'Tv', image: 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400', desc: 'Audio, Smart TVs, Wearables & Gadgets' },
    { id: 'cat_mobiles', name: 'Mobiles', slug: 'mobiles', icon: 'Smartphone', image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400', desc: 'Latest 5G Smartphones & Accessories' },
    { id: 'cat_computers', name: 'Computers & Laptops', slug: 'computers', icon: 'Laptop', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400', desc: 'Laptops, Monitors, Keyboards & Gaming' },
    { id: 'cat_fashion', name: 'Fashion & Ethnic Wear', slug: 'fashion', icon: 'Shirt', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400', desc: 'Traditional Sarees, Kurtas, Menswear & Casuals' },
    { id: 'cat_grocery', name: 'Grocery & Spices', slug: 'grocery', icon: 'ShoppingBag', image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400', desc: 'Fresh Organics, Dal, Rice, Ghee & Spices' },
    { id: 'cat_fruits', name: 'Fresh Fruits & Farm Harvest', slug: 'fruits', icon: 'Apple', image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=400', desc: 'Farm-fresh Banganapalli Mangoes, Kashmiri Apples, Nagpur Oranges & Seasonal Fruits' },
    { id: 'cat_home_kitchen', name: 'Home & Kitchen', slug: 'home-kitchen', icon: 'Utensils', image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=400', desc: 'Cookware, Mixer Grinders, Storage & Decor' },
    { id: 'cat_beauty', name: 'Beauty & Personal Care', slug: 'beauty', icon: 'Sparkles', image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400', desc: 'Ayurvedic Skincare, Hair Oils & Cosmetics' },
    { id: 'cat_sports', name: 'Sports & Fitness', slug: 'sports', icon: 'Activity', image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400', desc: 'Cricket Gear, Yoga Mats, Dumbbells & Wear' },
    { id: 'cat_books', name: 'Books & Stationery', slug: 'books', icon: 'BookOpen', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400', desc: 'Bestsellers, Academic, Indian Literature & Art' },
    { id: 'cat_toys', name: 'Toys & Baby Care', slug: 'toys', icon: 'Gamepad2', image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=400', desc: 'Educational Wooden Toys, Games & Diapers' },
    { id: 'cat_appliances', name: 'Appliances', slug: 'appliances', icon: 'Refrigerator', image: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=400', desc: 'Air Coolers, Water Purifiers & Washing Machines' },
    { id: 'cat_automotive', name: 'Automotive & Helmets', slug: 'automotive', icon: 'Car', image: 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?w=400', desc: 'ISI Helmets, Car Accessories & Bike Care' },
    { id: 'cat_local', name: 'Local & Artisan Handlooms', slug: 'local-products', icon: 'Layers', image: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=400', desc: 'Handcrafted directly by local Telangana & AP weavers' },
    { id: 'cat_offers', name: 'Special Angadi Deals', slug: 'offers', icon: 'Flame', image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400', desc: 'Curated discounts up to 70% off' }
  ];

  for (let i = 0; i < categories.length; i++) {
    const c = categories[i];
    await db.run(
      `INSERT INTO categories (id, name, slug, icon, image_url, description, display_order)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [c.id, c.name, c.slug, c.icon, c.image, c.desc, i + 1]
    );
  }

  // 4. Brands
  const brands = [
    { id: 'br_apple', name: 'Apple', slug: 'apple', logo: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=100', featured: 1 },
    { id: 'br_samsung', name: 'Samsung', slug: 'samsung', logo: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=100', featured: 1 },
    { id: 'br_boat', name: 'boAt Lifestyle', slug: 'boat', logo: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=100', featured: 1 },
    { id: 'br_pochampally', name: 'Pochampally Ikkat', slug: 'pochampally-ikkat', logo: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=100', featured: 1 },
    { id: 'br_sony', name: 'Sony', slug: 'sony', logo: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100', featured: 1 },
    { id: 'br_oneplus', name: 'OnePlus', slug: 'oneplus', logo: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=100', featured: 1 },
    { id: 'br_prestige', name: 'Prestige Cookware', slug: 'prestige', logo: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=100', featured: 1 },
    { id: 'br_godavari', name: 'Godavari Pure Naturals', slug: 'godavari-naturals', logo: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=100', featured: 1 },
    { id: 'br_kalamkari', name: 'Machilipatnam Kalamkari', slug: 'kalamkari', logo: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=100', featured: 1 },
    { id: 'br_rayalaseema', name: 'Rayalaseema Orchards', slug: 'rayalaseema-orchards', logo: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=100', featured: 1 },
    { id: 'br_lenovo', name: 'Lenovo', slug: 'lenovo', logo: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=100', featured: 1 }
  ];

  for (const b of brands) {
    await db.run(
      `INSERT INTO brands (id, name, slug, logo_url, is_featured) VALUES (?, ?, ?, ?, ?)`,
      [b.id, b.name, b.slug, b.logo, b.featured]
    );
  }

  // 5. Hero Banners
  const banners = [
    {
      id: 'ban_1',
      title: 'Mana Ooru Shopping, Mana Angadi Mega Mela!',
      subtitle: 'Festive discounts on authentic handlooms, electronics & daily essentials.',
      tagline: 'Up to 60% OFF + Instant ₹500 Cashback on UPI',
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200',
      link: '/category/local-products',
      badge: 'SPECIAL FESTIVAL OFFER',
      order: 1
    },
    {
      id: 'ban_2',
      title: 'Flagship 5G Smartphones & Noise Cancelling Audio',
      subtitle: 'Experience lightning fast speeds with zero-cost EMI options.',
      tagline: 'Starts at just ₹11,999 with 1-Year Brand Warranty',
      image: 'https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1200',
      link: '/category/mobiles',
      badge: 'SUPER SAVINGS',
      order: 2
    },
    {
      id: 'ban_3',
      title: 'Direct From Godavari Farmers: Pure Organic Oils & Spices',
      subtitle: 'Cold-pressed groundnut oils, single-estate turmeric and pure hill honey.',
      tagline: '100% Purity Certified • Next-Day Delivery in Hyderabad',
      image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=1200',
      link: '/category/grocery',
      badge: 'FARM DIRECT',
      order: 3
    }
  ];

  for (const ban of banners) {
    await db.run(
      `INSERT INTO banners (id, title, subtitle, tagline, image_url, link_url, badge_text, display_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [ban.id, ban.title, ban.subtitle, ban.tagline, ban.image, ban.link, ban.badge, ban.order]
    );
  }

  // 6. Products (35+ realistic Indian marketplace products)
  const products = [
    // --- Mobiles & Tech ---
    {
      id: 'prod_1',
      seller_id: 'usr_seller_2',
      category_id: 'cat_mobiles',
      brand_id: 'br_oneplus',
      title: 'OnePlus Nord CE4 5G (Celadon Marble, 8GB RAM, 128GB Storage)',
      slug: 'oneplus-nord-ce4-5g-celadon-marble',
      mrp: 24999,
      price: 21999,
      discount_percent: 12,
      stock: 35,
      is_featured: 1,
      rating: 4.6,
      review_count: 320,
      is_local: 0,
      description: 'The OnePlus Nord CE4 5G features Qualcomm Snapdragon 7 Gen 3 architecture, 100W SUPERVOOC hyper-fast charging, 5500mAh massive battery, and 50MP Sony LYT-600 OIS camera.',
      short_description: 'Snapdragon 7 Gen 3, 100W Fast Charge, 50MP Sony Camera',
      warranty_info: '1 Year Manufacturer Warranty for Device and 6 Months for In-box Accessories',
      return_policy_days: 7,
      images: [
        'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800',
        'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800',
        'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800'
      ],
      variants: [
        { type: 'Color', value: 'Celadon Marble', delta: 0 },
        { type: 'Color', value: 'Dark Chrome', delta: 0 },
        { type: 'Storage', value: '128GB', delta: 0 },
        { type: 'Storage', value: '256GB', delta: 2000 }
      ],
      specs: [
        { group: 'Performance', name: 'Processor', value: 'Qualcomm Snapdragon 7 Gen 3' },
        { group: 'Display', name: 'Screen Size', value: '6.7 inches 120Hz AMOLED' },
        { group: 'Camera', name: 'Rear Camera', value: '50MP Sony LYT-600 OIS + 8MP Ultra-wide' },
        { group: 'Battery', name: 'Capacity', value: '5500 mAh with 100W SuperVOOC' }
      ]
    },
    {
      id: 'prod_2',
      seller_id: 'usr_seller_2',
      category_id: 'cat_mobiles',
      brand_id: 'br_samsung',
      title: 'Samsung Galaxy S24 5G (Amber Yellow, 8GB RAM, 256GB Storage)',
      slug: 'samsung-galaxy-s24-5g-amber-yellow',
      mrp: 79999,
      price: 64999,
      discount_percent: 19,
      stock: 18,
      is_featured: 1,
      rating: 4.8,
      review_count: 512,
      is_local: 0,
      description: 'Galaxy AI is here. Search like never before with Circle to Search, get real-time voice translation on calls, and capture vivid low-light photos with Nightography zoom.',
      short_description: 'Galaxy AI, Dynamic AMOLED 2X 120Hz, Pro-grade 50MP Camera',
      warranty_info: '1 Year Brand Warranty with Doorstep Service Support',
      return_policy_days: 7,
      images: [
        'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800',
        'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800'
      ],
      variants: [
        { type: 'Color', value: 'Amber Yellow', delta: 0 },
        { type: 'Color', value: 'Onyx Black', delta: 0 },
        { type: 'Color', value: 'Cobalt Violet', delta: 0 }
      ],
      specs: [
        { group: 'Performance', name: 'Chipset', value: 'Exynos 2400 Deca-Core 4nm' },
        { group: 'AI Features', name: 'Galaxy AI', value: 'Live Translate, Photo Assist, Note Assist' },
        { group: 'Display', name: 'Brightness', value: '2600 nits Peak Outdoor Brightness' }
      ]
    },
    {
      id: 'prod_3',
      seller_id: 'usr_seller_2',
      category_id: 'cat_electronics',
      brand_id: 'br_sony',
      title: 'Sony WH-1000XM5 Wireless Industry Leading Noise Canceling Headphones',
      slug: 'sony-wh-1000xm5-wireless-anc-headphones',
      mrp: 34990,
      price: 26990,
      discount_percent: 23,
      stock: 24,
      is_featured: 1,
      rating: 4.9,
      review_count: 890,
      is_local: 0,
      description: 'Two processors control 8 microphones for unprecedented noise cancellation. Auto NC Optimizer automatically optimizes noise canceling based on your wearing conditions and environment.',
      short_description: 'Industry Leading ANC, 30-Hour Battery, Hi-Res LDAC Audio',
      warranty_info: '1 Year Sony India Official Domestic Warranty',
      return_policy_days: 7,
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800'
      ],
      variants: [
        { type: 'Color', value: 'Midnight Black', delta: 0 },
        { type: 'Color', value: 'Silver Platinum', delta: 0 }
      ],
      specs: [
        { group: 'Audio', name: 'Driver Unit', value: '30mm Carbon Fiber Composite' },
        { group: 'Battery', name: 'Playback Time', value: '30 Hours with ANC On (3min charge = 3hrs)' },
        { group: 'Microphone', name: 'Beamforming', value: '4 Precise Voice Pickup Microphones' }
      ]
    },
    {
      id: 'prod_4',
      seller_id: 'usr_seller_2',
      category_id: 'cat_electronics',
      brand_id: 'br_boat',
      title: 'boAt Airdopes 141 ANC TWS Earbuds with 42H Playtime & Beast Mode',
      slug: 'boat-airdopes-141-anc-tws-earbuds',
      mrp: 3990,
      price: 1399,
      discount_percent: 65,
      stock: 90,
      is_featured: 1,
      rating: 4.4,
      review_count: 1420,
      is_local: 0,
      description: 'Cancel the unwanted chaos with Active Noise Cancellation up to 32dB. Enjoy non-stop grooving with 42 hours of total playback and super low 50ms latency Beast mode.',
      short_description: '32dB ANC, 42 Hours Playtime, ENx Quad Mics for Clear Calls',
      warranty_info: '1 Year boAt Replacement Warranty',
      return_policy_days: 7,
      images: [
        'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800',
        'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=800'
      ],
      variants: [
        { type: 'Color', value: 'Gunmetal Black', delta: 0 },
        { type: 'Color', value: 'Bold Blue', delta: 0 },
        { type: 'Color', value: 'Pure White', delta: 0 }
      ],
      specs: [
        { group: 'Audio', name: 'ANC Depth', value: 'Up to 32dB Active Noise Cancellation' },
        { group: 'Gaming', name: 'Beast Mode', value: '50ms Ultra Low Latency' },
        { group: 'Charging', name: 'ASAP Charge', value: '10 min charge gives 150 min playtime' }
      ]
    },
    {
      id: 'prod_5',
      seller_id: 'usr_seller_2',
      category_id: 'cat_computers',
      brand_id: 'br_lenovo',
      title: 'Lenovo IdeaPad Slim 3 12th Gen Intel Core i5 15.6" FHD Laptop (16GB/512GB SSD)',
      slug: 'lenovo-ideapad-slim-3-intel-i5-15inch',
      mrp: 64990,
      price: 49990,
      discount_percent: 23,
      stock: 14,
      is_featured: 1,
      rating: 4.5,
      review_count: 215,
      is_local: 0,
      description: 'Power through work and coding tasks with 12th Gen Intel Core i5-12450H, 16GB DDR4 RAM, 512GB NVMe SSD, backlit keyboard and Dolby Audio stereo speakers.',
      short_description: 'Intel i5 12th Gen, 16GB RAM, 512GB SSD, Windows 11 + MS Office',
      warranty_info: '2 Years Lenovo Onsite Warranty + 1 Year Accidental Damage Protection',
      return_policy_days: 7,
      images: [
        'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800',
        'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800'
      ],
      variants: [
        { type: 'Color', value: 'Arctic Grey', delta: 0 },
        { type: 'Storage', value: '512GB SSD', delta: 0 },
        { type: 'Storage', value: '1TB SSD', delta: 4500 }
      ],
      specs: [
        { group: 'Processor', name: 'CPU', value: 'Intel Core i5-12450H (8 Cores, 12 Threads)' },
        { group: 'Memory', name: 'RAM', value: '16GB DDR4-3200 (Upgradable)' },
        { group: 'Display', name: 'Screen', value: '15.6 inch FHD IPS Anti-Glare 300 nits' }
      ]
    },

    // --- Local & Artisan Handlooms (Hyderabad/Telangana/AP specialties) ---
    {
      id: 'prod_6',
      seller_id: 'usr_seller_1',
      category_id: 'cat_local',
      brand_id: 'br_pochampally',
      title: 'Authentic Pochampally Ikkat Pure Silk Saree with Geometric Weave & Zari Border',
      slug: 'pochampally-ikkat-pure-silk-saree-red-gold',
      mrp: 14999,
      price: 9499,
      discount_percent: 36,
      stock: 12,
      is_featured: 1,
      rating: 4.9,
      review_count: 184,
      is_local: 1,
      description: 'Handwoven with pride by master weavers in Bhoodan Pochampally, Telangana. Features traditional double-ikkat tie-and-dye geometric patterns on 100% pure Mulberry silk with certified Silk Mark authenticity.',
      short_description: 'GI Tagged Handloom, Pure Mulberry Silk, Certified Silk Mark',
      warranty_info: '100% Authenticity Guarantee with Certified Silk Mark Tag',
      return_policy_days: 10,
      images: [
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800',
        'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800',
        'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800'
      ],
      variants: [
        { type: 'Color', value: 'Crimson Red & Mustard Gold', delta: 0 },
        { type: 'Color', value: 'Royal Peacock Blue', delta: 500 },
        { type: 'Color', value: 'Emerald Green & Maroon', delta: 500 }
      ],
      specs: [
        { group: 'Fabric', name: 'Material', value: '100% Pure Mulberry Silk' },
        { group: 'Craft', name: 'Weave Technique', value: 'Traditional Double Ikkat Handloom' },
        { group: 'Dimensions', name: 'Length', value: '6.3 Meters (Including 80cm Blouse Piece)' },
        { group: 'Certification', name: 'GI Tag', value: 'Geographical Indication (GI-18) Certified' }
      ]
    },
    {
      id: 'prod_7',
      seller_id: 'usr_seller_1',
      category_id: 'cat_local',
      brand_id: 'br_kalamkari',
      title: 'Handcrafted Machilipatnam Kalamkari Pure Cotton Double Bedspread with 2 Pillow Covers',
      slug: 'machilipatnam-kalamkari-cotton-bedspread-set',
      mrp: 2999,
      price: 1599,
      discount_percent: 46,
      stock: 25,
      is_featured: 1,
      rating: 4.8,
      review_count: 142,
      is_local: 1,
      description: 'Block-printed by generational artisans using vegetable dyes, natural minerals and hand-carved teak wood blocks. Breathable 100% organic cotton that softens with every wash.',
      short_description: 'Natural Vegetable Dyes, 100% Organic Cotton, Hand Block Printed',
      warranty_info: 'Guaranteed Color Fastness under Gentle Cold Wash',
      return_policy_days: 7,
      images: [
        'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=800',
        'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800'
      ],
      variants: [
        { type: 'Color', value: 'Indigo Tree of Life', delta: 0 },
        { type: 'Color', value: 'Madder Red Floral Paisley', delta: 0 },
        { type: 'Size', value: 'King Size (108x108 in)', delta: 300 }
      ],
      specs: [
        { group: 'Material', name: 'Fabric Count', value: '300 TC 100% Organic Cotton' },
        { group: 'Craft', name: 'Printing', value: 'Hand Carved Wooden Block Print' },
        { group: 'Includes', name: 'Package', value: '1 Bedspread + 2 Matching Pillow Covers' }
      ]
    },
    {
      id: 'prod_8',
      seller_id: 'usr_seller_1',
      category_id: 'cat_fashion',
      brand_id: 'br_pochampally',
      title: 'Men’s Handwoven Pure Cotton Ikkat Short Kurta for Casual & Festive Wear',
      slug: 'mens-handwoven-cotton-ikkat-kurta-navy',
      mrp: 1899,
      price: 999,
      discount_percent: 47,
      stock: 40,
      is_featured: 0,
      rating: 4.7,
      review_count: 98,
      is_local: 1,
      description: 'Crafted from hand-spun breathable cotton with subtle geometric Ikkat motifs, mandarin collar, and wooden buttons. Ideal for festive gatherings and everyday summer wear.',
      short_description: 'Breathable Handloom Cotton, Mandarin Collar, Wooden Buttons',
      warranty_info: 'Quality Assured Handloom Weave',
      return_policy_days: 7,
      images: [
        'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800',
        'https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=800'
      ],
      variants: [
        { type: 'Size', value: 'M (38 in)', delta: 0 },
        { type: 'Size', value: 'L (40 in)', delta: 0 },
        { type: 'Size', value: 'XL (42 in)', delta: 0 },
        { type: 'Size', value: 'XXL (44 in)', delta: 50 },
        { type: 'Color', value: 'Deep Indigo Navy', delta: 0 },
        { type: 'Color', value: 'Earth Maroon', delta: 0 }
      ],
      specs: [
        { group: 'Fit', name: 'Style', value: 'Regular Comfort Fit Short Kurta' },
        { group: 'Fabric', name: 'Yarn', value: '60s Count Handloom Cotton' },
        { group: 'Care', name: 'Wash', value: 'Machine Wash Cold / Gentle Handwash' }
      ]
    },

    // --- Organic Groceries & Farm Fresh (Godavari Naturals) ---
    {
      id: 'prod_9',
      seller_id: 'usr_seller_3',
      category_id: 'cat_grocery',
      brand_id: 'br_godavari',
      title: 'Wood Pressed Cold Pressed Virgin Groundnut Oil (5 Litre Tin)',
      slug: 'wood-pressed-virgin-groundnut-oil-5l',
      mrp: 1850,
      price: 1399,
      discount_percent: 24,
      stock: 50,
      is_featured: 1,
      rating: 4.9,
      review_count: 430,
      is_local: 1,
      description: 'Extracted using traditional Vaagai wooden cold-press (Gaana/Chekku) without heat or chemical refining. Retains natural nutty aroma, heart-healthy antioxidants, and authentic taste.',
      short_description: '100% Pure Wooden Chekku Pressed, Zero Chemicals or Preservatives',
      warranty_info: 'FSSAI Certified 100% Pure Virgin Oil Guarantee',
      return_policy_days: 7,
      images: [
        'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800',
        'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800'
      ],
      variants: [
        { type: 'Size', value: '1 Litre Bottle', delta: -1050 },
        { type: 'Size', value: '5 Litre Tin', delta: 0 }
      ],
      specs: [
        { group: 'Purity', name: 'Extraction', value: 'Traditional Wooden Kolhu / Chekku' },
        { group: 'Nutritional', name: 'Trans Fat', value: '0g Trans Fat, Rich in Vitamin E & MUFA' },
        { group: 'Shelf Life', name: 'Best Before', value: '9 Months from Packing' }
      ]
    },
    {
      id: 'prod_10',
      seller_id: 'usr_seller_3',
      category_id: 'cat_grocery',
      brand_id: 'br_godavari',
      title: 'Guntur Teja Sun-Dried Red Chilli Powder (1kg Organic Pack)',
      slug: 'guntur-teja-organic-red-chilli-powder-1kg',
      mrp: 450,
      price: 320,
      discount_percent: 28,
      stock: 80,
      is_featured: 0,
      rating: 4.8,
      review_count: 275,
      is_local: 1,
      description: 'Grown on fertile black soils of Guntur, sun-dried naturally and ground with stems removed. Vibrant natural red color with authentic pungent kick and zero added food colors.',
      short_description: 'Authentic Guntur Teja Origin, Zero Adulteration or Added Colors',
      warranty_info: 'FSSAI Certified Agmark Grade 1',
      return_policy_days: 7,
      images: [
        'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800',
        'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?w=800'
      ],
      variants: [
        { type: 'Size', value: '500g', delta: -150 },
        { type: 'Size', value: '1kg', delta: 0 }
      ],
      specs: [
        { group: 'Origin', name: 'Region', value: 'Guntur, Andhra Pradesh' },
        { group: 'Scoville Heat', name: 'SHU Rating', value: '75,000 - 100,000 SHU (Fiery Hot)' },
        { group: 'Processing', name: 'Method', value: 'Cold Stone Ground' }
      ]
    },
    {
      id: 'prod_11',
      seller_id: 'usr_seller_3',
      category_id: 'cat_grocery',
      brand_id: 'br_godavari',
      title: 'Pure Desi Gir Cow A2 Bilona Cultured Ghee (500ml Glass Jar)',
      slug: 'pure-desi-gir-cow-a2-bilona-ghee-500ml',
      mrp: 1450,
      price: 1099,
      discount_percent: 24,
      stock: 30,
      is_featured: 1,
      rating: 4.9,
      review_count: 360,
      is_local: 1,
      description: 'Made using the ancient Vedic Bilona method from curd of grass-fed Gir cows. Rich golden granular texture with distinct aroma that aids digestion and immunity.',
      short_description: 'Vedic Bilona Method, Pure A2 Gir Cow Milk, Granular Danedar Texture',
      warranty_info: 'Lab-tested 100% Pure A2 Beta-Casein Certified',
      return_policy_days: 7,
      images: [
        'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=800',
        'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800'
      ],
      variants: [
        { type: 'Size', value: '500ml', delta: 0 },
        { type: 'Size', value: '1000ml', delta: 1000 }
      ],
      specs: [
        { group: 'Source', name: 'Cattle Breed', value: 'Free-Grazing Indian Gir Cow' },
        { group: 'Method', name: 'Process', value: 'Curd Churned Wooden Bilona' }
      ]
    },

    // --- Home & Kitchen ---
    {
      id: 'prod_12',
      seller_id: 'usr_seller_2',
      category_id: 'cat_home_kitchen',
      brand_id: 'br_prestige',
      title: 'Prestige Iris Plus 750 Watt Mixer Grinder with 4 Stainless Steel Jars',
      slug: 'prestige-iris-plus-750w-mixer-grinder',
      mrp: 6295,
      price: 3499,
      discount_percent: 44,
      stock: 45,
      is_featured: 1,
      rating: 4.5,
      review_count: 670,
      is_local: 0,
      description: 'Equipped with a robust 750W high-speed copper motor and 4 versatile stainless steel jars including a 1.5L wet grinding jar, 1.0L dry grinding jar, 300ml chutney jar, and transparent juicer jar.',
      short_description: '750W Heavy Duty Copper Motor, 4 Multi-utility Jars, Overload Protection',
      warranty_info: '2 Years Manufacturer Warranty on Product and Motor',
      return_policy_days: 7,
      images: [
        'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=800',
        'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800'
      ],
      variants: [
        { type: 'Color', value: 'Black & Red', delta: 0 },
        { type: 'Color', value: 'Pure White & Blue', delta: 0 }
      ],
      specs: [
        { group: 'Power', name: 'Wattage', value: '750 Watts 20,000 RPM' },
        { group: 'Jars', name: 'Material', value: 'Superior Grade Stainless Steel' },
        { group: 'Safety', name: 'Protection', value: 'Overload Thermal Cut-off' }
      ]
    },
    {
      id: 'prod_13',
      seller_id: 'usr_seller_1',
      category_id: 'cat_home_kitchen',
      brand_id: 'br_pochampally',
      title: 'Pre-Seasoned Heavy Cast Iron Dosa Tawa & Roti Pan (10.5 Inch)',
      slug: 'pre-seasoned-cast-iron-dosa-tawa-10inch',
      mrp: 1999,
      price: 1099,
      discount_percent: 45,
      stock: 60,
      is_featured: 0,
      rating: 4.8,
      review_count: 310,
      is_local: 1,
      description: 'Naturally non-stick pre-seasoned with 100% gingelly oil. Naturally enriches food with dietary iron, provides even heat retention for crispy golden restaurant-style dosas.',
      short_description: 'Naturally Non-Stick, Pre-Seasoned with Gingelly Oil, Enriches with Iron',
      warranty_info: 'Lifetime Durability Guarantee',
      return_policy_days: 7,
      images: [
        'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800',
        'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800'
      ],
      variants: [
        { type: 'Size', value: '10.5 Inch', delta: 0 },
        { type: 'Size', value: '12 Inch Large', delta: 300 }
      ],
      specs: [
        { group: 'Material', name: 'Base', value: '100% Pure Virgin Cast Iron' },
        { group: 'Weight', name: 'Mass', value: '2.4 kg' },
        { group: 'Compatibility', name: 'Stove Type', value: 'Gas, Induction, Fireplace' }
      ]
    },

    // --- Beauty & Personal Care ---
    {
      id: 'prod_14',
      seller_id: 'usr_seller_3',
      category_id: 'cat_beauty',
      brand_id: 'br_godavari',
      title: 'Ayurvedic Bhringraj & Brahmi Intensive Hair Fall Treatment Oil (200ml)',
      slug: 'ayurvedic-bhringraj-brahmi-hair-fall-oil-200ml',
      mrp: 699,
      price: 449,
      discount_percent: 35,
      stock: 45,
      is_featured: 1,
      rating: 4.7,
      review_count: 512,
      is_local: 1,
      description: 'Slow-cooked in copper vessels with 18 rare Ayurvedic herbs including Bhringraj, Brahmi, Amla, and Shikakai in pure coconut milk base. Strengthens roots and reduces hair thinning.',
      short_description: '18 Herbs Slow Cooked Formula, 100% Ayurvedic, Mineral Oil Free',
      warranty_info: 'Ayush Certified Ayurvedic Formulation',
      return_policy_days: 7,
      images: [
        'https://images.unsplash.com/photo-1608248597359-5481d6f461e4?w=800',
        'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800'
      ],
      variants: [
        { type: 'Size', value: '100ml', delta: -180 },
        { type: 'Size', value: '200ml', delta: 0 }
      ],
      specs: [
        { group: 'Herbs', name: 'Active Ingredients', value: 'Bhringraj, Brahmi, Amla, Methi, Curry Leaves' },
        { group: 'Type', name: 'Free From', value: 'Zero Mineral Oils, Parabens, Silicones' }
      ]
    },

    // --- Sports, Books, Toys & More ---
    {
      id: 'prod_15',
      seller_id: 'usr_seller_2',
      category_id: 'cat_sports',
      brand_id: 'br_pochampally',
      title: 'Kashmir Willow Full Size Cricket Bat with Padded Cover & Grip',
      slug: 'kashmir-willow-full-size-cricket-bat',
      mrp: 3499,
      price: 1899,
      discount_percent: 45,
      stock: 22,
      is_featured: 0,
      rating: 4.6,
      review_count: 165,
      is_local: 0,
      description: 'Handcrafted from selected Grade 1 Kashmir Willow. Thick edges and curved blade for optimal stroke play with leather and heavy tennis balls.',
      short_description: 'Grade 1 Kashmir Willow, Thick 40mm Edges, Includes Padded Bag',
      warranty_info: '6 Months Handle Replacement Warranty',
      return_policy_days: 7,
      images: [
        'https://images.unsplash.com/photo-1531415074868-036b1c5d53ec?w=800',
        'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800'
      ],
      variants: [
        { type: 'Size', value: 'Short Handle (Men Size)', delta: 0 },
        { type: 'Weight', value: 'Medium Light (1180g)', delta: 0 }
      ],
      specs: [
        { group: 'Willow', name: 'Grade', value: 'Hand Selected Grade 1 Kashmir Willow' },
        { group: 'Handle', name: 'Cane', value: '3-Piece Singapore Cane Handle' }
      ]
    },
    {
      id: 'prod_16',
      seller_id: 'usr_seller_1',
      category_id: 'cat_books',
      brand_id: 'br_pochampally',
      title: 'The Palace of Illusions by Chitra Banerjee Divakaruni (Paperback)',
      slug: 'the-palace-of-illusions-paperback-novel',
      mrp: 499,
      price: 349,
      discount_percent: 30,
      stock: 55,
      is_featured: 0,
      rating: 4.8,
      review_count: 890,
      is_local: 0,
      description: 'A reimagining of the world-famous Indian epic, the Mahabharata, told from the perspective of Panchaali, the wife of the five Pandava brothers.',
      short_description: 'National Bestseller, Mahabharata Retold From Draupadi’s Perspective',
      warranty_info: 'Original Publisher Copy Guarantee',
      return_policy_days: 7,
      images: [
        'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800'
      ],
      variants: [
        { type: 'Format', value: 'Paperback', delta: 0 },
        { type: 'Format', value: 'Hardcover Collector Edition', delta: 250 }
      ],
      specs: [
        { group: 'Book Details', name: 'Language', value: 'English' },
        { group: 'Pages', name: 'Count', value: '384 Pages' },
        { group: 'Publisher', name: 'House', value: 'Pan Macmillan India' }
      ]
    },
    {
      id: 'prod_17',
      seller_id: 'usr_seller_1',
      category_id: 'cat_toys',
      brand_id: 'br_pochampally',
      title: 'Channapatna Handcrafted Natural Lacquer Wooden Stacking Ring Toy (Non-Toxic)',
      slug: 'channapatna-wooden-stacking-ring-toy',
      mrp: 899,
      price: 499,
      discount_percent: 44,
      stock: 40,
      is_featured: 1,
      rating: 4.9,
      review_count: 220,
      is_local: 1,
      description: 'Authentic Channapatna wooden toy colored with natural plant extracts and vegetable dyes. Develops hand-eye coordination and motor skills in toddlers with 100% child safety.',
      short_description: 'GI Tagged Heritage Craft, 100% Non-Toxic Vegetable Dyes, Safe for Babies',
      warranty_info: 'Certified Lead-Free and Child-Safe',
      return_policy_days: 10,
      images: [
        'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?w=800',
        'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800'
      ],
      variants: [
        { type: 'Size', value: '7 Rings Standard', delta: 0 },
        { type: 'Size', value: '9 Rings Jumbo', delta: 150 }
      ],
      specs: [
        { group: 'Material', name: 'Wood', value: 'Wrightia Tinctoria (Ivory Wood)' },
        { group: 'Coloring', name: 'Dyes', value: 'Natural Turmeric, Kumkum & Indigo Lacquer' }
      ]
    },
    // --- Fresh Fruits & Farm Harvest ---
    {
      id: 'prod_fruit_1',
      seller_id: 'usr_seller_4',
      category_id: 'cat_fruits',
      brand_id: 'br_rayalaseema',
      title: 'Farm-Fresh Banganapalli Sweet Mangoes (Naturally Tree-Ripened, Carbide-Free)',
      slug: 'farm-fresh-banganapalli-sweet-mangoes',
      mrp: 599,
      price: 399,
      discount_percent: 33,
      stock: 85,
      is_featured: 1,
      rating: 4.9,
      review_count: 310,
      is_local: 1,
      description: 'Authentic GI-Tagged Banganapalli Mangoes from Rayalaseema orchards. Naturally tree-ripened without calcium carbide or artificial chemicals. Renowned for their thin golden skin, fiberless sweet aromatic pulp, and heavenly fragrance. Freshly handpicked and packed in cushioned cartons.',
      short_description: '100% Naturally Ripened, Thin Skin, Sweet & Fiberless Pulp, GI Tagged',
      warranty_info: '100% Freshness Guarantee or Instant Replacement',
      return_policy_days: 2,
      images: [
        'https://images.unsplash.com/photo-1553279768-865429fa0078?w=800',
        'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=800',
        'https://images.unsplash.com/photo-1605027990121-cbae9e0642df?w=800'
      ],
      variants: [
        { type: 'Quantity/Weight', value: 'Box of 3 kg (6-8 pieces)', delta: 0 },
        { type: 'Quantity/Weight', value: 'Family Pack 5 kg (12-14 pieces)', delta: 240 },
        { type: 'Quantity/Weight', value: 'Trial Pack 1.5 kg (3-4 pieces)', delta: -180 }
      ],
      specs: [
        { group: 'Origin', name: 'Region', value: 'Banganapalle, Nandyal / Kurnool, AP' },
        { group: 'Ripening', name: 'Method', value: '100% Naturally Tree-Ripened (Zero Carbide)' },
        { group: 'Shelf Life', name: 'Storage', value: '4-6 days in room temperature' }
      ]
    },
    {
      id: 'prod_fruit_2',
      seller_id: 'usr_seller_4',
      category_id: 'cat_fruits',
      brand_id: 'br_rayalaseema',
      title: 'Kashmiri Royal Delicious Red Apples (Crisp, Sweet & Farm-Direct)',
      slug: 'kashmiri-royal-delicious-red-apples',
      mrp: 320,
      price: 229,
      discount_percent: 28,
      stock: 60,
      is_featured: 1,
      rating: 4.8,
      review_count: 195,
      is_local: 0,
      description: 'Single-estate crisp Kashmir Royal Delicious red apples harvested from the Himalayan valley of Shopian. Naturally sweet, firm, and juicy with zero wax coating. Rich in dietary fiber, flavonoids, and natural antioxidants.',
      short_description: 'Crisp & Juicy, No Wax Coating, Farm Harvested from Shopian Valley',
      warranty_info: 'Freshness Guaranteed on Delivery',
      return_policy_days: 2,
      images: [
        'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800',
        'https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?w=800'
      ],
      variants: [
        { type: 'Weight', value: '1 kg Pack (~5-6 apples)', delta: 0 },
        { type: 'Weight', value: '2 kg Value Pack (~10-12 apples)', delta: 200 },
        { type: 'Weight', value: '4 kg Family Carton', delta: 550 }
      ],
      specs: [
        { group: 'Origin', name: 'Orchard', value: 'Shopian Valley, Kashmir' },
        { group: 'Grade', name: 'Quality', value: 'Grade A Premium Crisp' },
        { group: 'Coating', name: 'Wax', value: '100% Natural, Unwaxed' }
      ]
    },
    {
      id: 'prod_fruit_3',
      seller_id: 'usr_seller_4',
      category_id: 'cat_fruits',
      brand_id: 'br_rayalaseema',
      title: 'Nagpur Sweet Juicy Oranges / Santra (Rich Vitamin C, Thin Skin)',
      slug: 'nagpur-sweet-juicy-oranges',
      mrp: 180,
      price: 119,
      discount_percent: 34,
      stock: 90,
      is_featured: 1,
      rating: 4.7,
      review_count: 140,
      is_local: 0,
      description: 'Famous GI-Tagged Nagpur sweet oranges packed with luscious citrus juice and immune-boosting Vitamin C. Easy to peel with distinct tangy-sweet flavor.',
      short_description: 'High Juice Content, Easy Peel, Immune Boosting Vitamin C',
      warranty_info: 'Freshness Guaranteed',
      return_policy_days: 2,
      images: [
        'https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=800',
        'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=800'
      ],
      variants: [
        { type: 'Weight', value: '1 kg (~6-8 oranges)', delta: 0 },
        { type: 'Weight', value: '2 kg (~12-16 oranges)', delta: 100 },
        { type: 'Weight', value: '5 kg Crate', delta: 350 }
      ],
      specs: [
        { group: 'Origin', name: 'Region', value: 'Nagpur, Maharashtra' },
        { group: 'Taste', name: 'Flavor', value: 'Sweet Tangy Citrus' }
      ]
    },
    {
      id: 'prod_fruit_4',
      seller_id: 'usr_seller_4',
      category_id: 'cat_fruits',
      brand_id: 'br_rayalaseema',
      title: 'Organic Robusta Fresh Yellow Bananas (Chemical-Free, High Energy)',
      slug: 'organic-robusta-fresh-yellow-bananas',
      mrp: 90,
      price: 59,
      discount_percent: 34,
      stock: 120,
      is_featured: 0,
      rating: 4.8,
      review_count: 280,
      is_local: 1,
      description: 'Locally grown Robusta Bananas sourced directly from Godavari river delta farms. Rich in potassium, dietary fiber, and instant natural energy.',
      short_description: 'Naturally Ripened, Rich in Potassium, Chemical-Free',
      warranty_info: 'Freshness Guaranteed',
      return_policy_days: 2,
      images: [
        'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800',
        'https://images.unsplash.com/photo-1603833665858-e61d17a86224?w=800'
      ],
      variants: [
        { type: 'Quantity', value: '1 Dozen (~1.2 kg)', delta: 0 },
        { type: 'Quantity', value: '2 Dozen (~2.4 kg)', delta: 50 },
        { type: 'Quantity', value: 'Half Dozen (~600g)', delta: -25 }
      ],
      specs: [
        { group: 'Variety', name: 'Cultivar', value: 'Robusta Grand Naine' },
        { group: 'Origin', name: 'Farm', value: 'Konaseema Delta, Andhra Pradesh' }
      ]
    },
    {
      id: 'prod_fruit_5',
      seller_id: 'usr_seller_4',
      category_id: 'cat_fruits',
      brand_id: 'br_rayalaseema',
      title: 'Anantapur Ruby Red Sweet Pomegranates / Anar (Plump & Seeded)',
      slug: 'anantapur-ruby-red-sweet-pomegranates',
      mrp: 299,
      price: 199,
      discount_percent: 33,
      stock: 75,
      is_featured: 1,
      rating: 4.9,
      review_count: 165,
      is_local: 1,
      description: 'Premium Bhagwa variety pomegranates from arid Anantapur orchards. Thin ruby red rind loaded with deep red, juicy, sweet arils with soft seeds.',
      short_description: 'Bhagwa Variety, Deep Red Sweet Arils, Rich Antioxidants',
      warranty_info: 'Freshness Guaranteed',
      return_policy_days: 2,
      images: [
        'https://images.unsplash.com/photo-1541344999736-83eca872f241?w=800',
        'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800'
      ],
      variants: [
        { type: 'Weight', value: '1 kg Pack (3-4 fruits)', delta: 0 },
        { type: 'Weight', value: '2 kg Pack (6-8 fruits)', delta: 180 },
        { type: 'Weight', value: 'Fresh Peeled Arils Box (250g)', delta: -60 }
      ],
      specs: [
        { group: 'Variety', name: 'Cultivar', value: 'Bhagwa Red' },
        { group: 'Origin', name: 'Region', value: 'Anantapur, Andhra Pradesh' }
      ]
    },
    {
      id: 'prod_fruit_6',
      seller_id: 'usr_seller_4',
      category_id: 'cat_fruits',
      brand_id: 'br_rayalaseema',
      title: 'Fresh Sonaka Green Seedless Grapes (Sweet, Crisp Table Grapes)',
      slug: 'fresh-sonaka-green-seedless-grapes',
      mrp: 160,
      price: 99,
      discount_percent: 38,
      stock: 65,
      is_featured: 0,
      rating: 4.6,
      review_count: 110,
      is_local: 0,
      description: 'Elongated Sonaka green seedless table grapes with high brix sweetness and satisfying crunch. Perfectly washed and ready to enjoy.',
      short_description: '100% Seedless, Sweet & Crunchy, Export Quality',
      warranty_info: 'Freshness Guaranteed',
      return_policy_days: 2,
      images: [
        'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=800',
        'https://images.unsplash.com/photo-1596363505729-4190a9506133?w=800'
      ],
      variants: [
        { type: 'Weight', value: '500g Punnet', delta: 0 },
        { type: 'Weight', value: '1 kg Box', delta: 90 },
        { type: 'Weight', value: '2 kg Family Crate', delta: 250 }
      ],
      specs: [
        { group: 'Type', name: 'Variety', value: 'Sonaka Seedless Green' },
        { group: 'Storage', name: 'Temperature', value: 'Refrigerate at 4°C' }
      ]
    },
    {
      id: 'prod_fruit_7',
      seller_id: 'usr_seller_4',
      category_id: 'cat_fruits',
      brand_id: 'br_rayalaseema',
      title: 'Red Lady Sweet Farm Papaya (Naturally Tree-Ripened, Digestive Enriched)',
      slug: 'red-lady-sweet-farm-papaya',
      mrp: 120,
      price: 69,
      discount_percent: 42,
      stock: 45,
      is_featured: 0,
      rating: 4.7,
      review_count: 95,
      is_local: 1,
      description: 'Taiwan Red Lady variety papaya grown organically in Telangana farms. Vibrant orange-red sweet flesh packed with papain enzyme for healthy digestion.',
      short_description: 'Red Lady Variety, Vibrant Sweet Flesh, High Papain Enzyme',
      warranty_info: 'Freshness Guaranteed',
      return_policy_days: 2,
      images: [
        'https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?w=800',
        'https://images.unsplash.com/photo-1617112848923-cc2234396a8d?w=800'
      ],
      variants: [
        { type: 'Size', value: '1 Whole Fruit (~1.2 - 1.5 kg)', delta: 0 },
        { type: 'Size', value: '2 Whole Fruits (~2.8 kg)', delta: 60 }
      ],
      specs: [
        { group: 'Variety', name: 'Type', value: 'Red Lady 786' },
        { group: 'Nutrition', name: 'Rich in', value: 'Vitamin A, Vitamin C, Papain' }
      ]
    },
    {
      id: 'prod_fruit_8',
      seller_id: 'usr_seller_4',
      category_id: 'cat_fruits',
      brand_id: 'br_rayalaseema',
      title: 'Tender Green Coconuts / Kobbari Bondam (Sweet Water & Soft Malai)',
      slug: 'tender-green-coconuts-kobbari-bondam',
      mrp: 210,
      price: 149,
      discount_percent: 29,
      stock: 150,
      is_featured: 1,
      rating: 4.9,
      review_count: 420,
      is_local: 1,
      description: 'Directly harvested from Godavari & East Coast plantations. Each coconut contains 300-450ml of naturally sweet, electrolyte-rich water and soft tender pulp (malai).',
      short_description: '300-450ml Sweet Water Each, Pure Electrolytes, Soft Malai',
      warranty_info: 'Freshness Guaranteed on Delivery',
      return_policy_days: 2,
      images: [
        'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800',
        'https://images.unsplash.com/photo-1544816155-12df9643f363?w=800'
      ],
      variants: [
        { type: 'Pack', value: 'Pack of 3 Coconuts', delta: 0 },
        { type: 'Pack', value: 'Pack of 6 Coconuts (Family Saver)', delta: 135 },
        { type: 'Pack', value: 'Single Tender Coconut', delta: -95 }
      ],
      specs: [
        { group: 'Origin', name: 'Plantation', value: 'Amalapuram / Godavari, AP' },
        { group: 'Water Content', name: 'Volume', value: '300ml to 450ml per nut' }
      ]
    },
    {
      id: 'prod_fruit_9',
      seller_id: 'usr_seller_4',
      category_id: 'cat_fruits',
      brand_id: 'br_rayalaseema',
      title: 'Fresh Allahabad Sweet Guavas / Jama Kaya (Crisp Pink & White Pulp)',
      slug: 'fresh-allahabad-sweet-guavas-jama-kaya',
      mrp: 140,
      price: 89,
      discount_percent: 36,
      stock: 55,
      is_featured: 0,
      rating: 4.8,
      review_count: 85,
      is_local: 1,
      description: 'Crisp aromatic Allahabad Safeda guavas loaded with 4x more Vitamin C than oranges. High in natural pectin and gut-friendly fiber.',
      short_description: 'High Dietary Fiber, 4x Vitamin C of Oranges, Crisp & Sweet',
      warranty_info: 'Freshness Guaranteed',
      return_policy_days: 2,
      images: [
        'https://images.unsplash.com/photo-1536511135899-73899f8d167f?w=800',
        'https://images.unsplash.com/photo-1536511135899-73899f8d167f?w=800'
      ],
      variants: [
        { type: 'Weight', value: '1 kg Pack (~5-7 fruits)', delta: 0 },
        { type: 'Weight', value: '2 kg Pack (~10-14 fruits)', delta: 80 }
      ],
      specs: [
        { group: 'Variety', name: 'Type', value: 'Safeda Crisp' },
        { group: 'Origin', name: 'Region', value: 'Ranga Reddy District, Telangana' }
      ]
    },
    {
      id: 'prod_fruit_10',
      seller_id: 'usr_seller_4',
      category_id: 'cat_fruits',
      brand_id: 'br_rayalaseema',
      title: 'Farm-Fresh Sweet Striped Watermelon (Crisp Red Heart, High Hydration)',
      slug: 'farm-fresh-sweet-striped-watermelon',
      mrp: 199,
      price: 119,
      discount_percent: 40,
      stock: 70,
      is_featured: 1,
      rating: 4.8,
      review_count: 175,
      is_local: 1,
      description: 'Freshly harvested from riverbed farms in Telangana. Dense deep red sweet flesh with high water content and natural lycopene.',
      short_description: 'Deep Red Sweet Flesh, 92% Natural Hydration, Rich Lycopene',
      warranty_info: 'Freshness Guaranteed',
      return_policy_days: 2,
      images: [
        'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800',
        'https://images.unsplash.com/photo-1589533610925-1cffc309ebaa?w=800'
      ],
      variants: [
        { type: 'Size', value: '1 Whole Fruit (~3.0 - 4.0 kg)', delta: 0 },
        { type: 'Size', value: 'Jumbo Fruit (~5.0 - 6.0 kg)', delta: 50 }
      ],
      specs: [
        { group: 'Variety', name: 'Type', value: 'Sugar Baby Striped' },
        { group: 'Origin', name: 'Farm', value: 'Mahabubnagar, Telangana' }
      ]
    }
  ];

  // Insert products, images, variants, and specs
  for (const p of products) {
    await db.run(
      `INSERT INTO products (id, seller_id, category_id, brand_id, title, slug, description, short_description, sku, mrp, price, discount_percent, stock, is_featured, is_approved, status, rating, review_count, warranty_info, return_policy_days, free_delivery, is_local)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 'active', ?, ?, ?, ?, 1, ?)`,
      [p.id, p.seller_id, p.category_id, p.brand_id, p.title, p.slug, p.description, p.short_description, `SKU-${p.id.toUpperCase()}`, p.mrp, p.price, p.discount_percent, p.stock, p.is_featured, p.rating, p.review_count, p.warranty_info, p.return_policy_days, p.is_local]
    );

    // Images
    for (let idx = 0; idx < p.images.length; idx++) {
      await db.run(
        `INSERT INTO product_images (id, product_id, image_url, alt_text, is_primary, display_order)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [`img_${p.id}_${idx}`, p.id, p.images[idx], p.title, idx === 0 ? 1 : 0, idx]
      );
    }

    // Variants
    if (p.variants) {
      for (let vIdx = 0; vIdx < p.variants.length; vIdx++) {
        const v = p.variants[vIdx];
        await db.run(
          `INSERT INTO product_variants (id, product_id, variant_type, variant_value, price_delta, stock, sku)
           VALUES (?, ?, ?, ?, ?, 20, ?)`,
          [`var_${p.id}_${vIdx}`, p.id, v.type, v.value, v.delta, `SKU-${p.id}-${v.value.substring(0, 3)}`]
        );
      }
    }

    // Specs
    if (p.specs) {
      for (let sIdx = 0; sIdx < p.specs.length; sIdx++) {
        const s = p.specs[sIdx];
        await db.run(
          `INSERT INTO product_specs (id, product_id, spec_group, spec_name, spec_value)
           VALUES (?, ?, ?, ?, ?)`,
          [`spec_${p.id}_${sIdx}`, p.id, s.group, s.name, s.value]
        );
      }
    }
  }

  // 7. Coupons
  const coupons = [
    { id: 'cp_1', code: 'MANA10', desc: 'Flat 10% discount on all orders above ₹999', type: 'percentage', val: 10, min: 999, max: 500 },
    { id: 'cp_2', code: 'FIRSTBUY', desc: 'Flat ₹200 off for first-time shoppers on MaNa Angadi', type: 'fixed', val: 200, min: 499, max: 200 },
    { id: 'cp_3', code: 'FESTIVAL500', desc: 'Special Festival ₹500 off on handlooms & electronics over ₹2,999', type: 'fixed', val: 500, min: 2999, max: 500 },
    { id: 'cp_4', code: 'SUPERDEAL', desc: '15% instant savings up to ₹1,000 on organic groceries', type: 'percentage', val: 15, min: 1499, max: 1000 }
  ];

  for (const c of coupons) {
    await db.run(
      `INSERT INTO coupons (id, code, description, discount_type, discount_value, min_order_amount, max_discount_amount, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [c.id, c.code, c.desc, c.type, c.val, c.min, c.max]
    );
  }

  // 8. Flash Sale
  const now = new Date();
  const startTime = new Date(now.getTime() - 2 * 3600 * 1000).toISOString();
  const endTime = new Date(now.getTime() + 46 * 3600 * 1000).toISOString(); // 46 hours remaining

  await db.run(
    `INSERT INTO flash_sales (id, title, tagline, banner_url, start_time, end_time, is_active)
     VALUES ('fs_1', 'Great Indian Angadi Flash Sale', 'Lightning Deals with Countdown Timers', 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200', ?, ?, 1)`,
    [startTime, endTime]
  );

  // Flash Sale Products
  await db.run(
    `INSERT INTO flash_sale_products (id, flash_sale_id, product_id, special_price, stock_limit, sold_count)
     VALUES 
     ('fsp_1', 'fs_1', 'prod_4', 1199, 100, 72),
     ('fsp_2', 'fs_1', 'prod_6', 8499, 20, 14),
     ('fsp_3', 'fs_1', 'prod_9', 1199, 60, 48),
     ('fsp_4', 'fs_1', 'prod_12', 2999, 30, 21)`
  );

  // 9. Realistic Verified Reviews
  const reviews = [
    {
      id: 'rev_1',
      prod_id: 'prod_6',
      user_id: 'usr_cust_1',
      rating: 5,
      title: 'Stunning Ikkat weave, pure authentic silk!',
      comment: 'The saree is absolutely breathtaking! The geometric Ikkat borders are crisp, the texture is soft and rich, and it came with the Silk Mark tag. Shipped within 2 days in Hyderabad.',
      is_verified: 1
    },
    {
      id: 'rev_2',
      prod_id: 'prod_1',
      user_id: 'usr_cust_2',
      rating: 5,
      title: 'Ultra-smooth performance and incredible battery!',
      comment: 'Snapdragon 7 Gen 3 runs Genshin Impact and BGMI like a dream with zero heating. The 100W charger juices it from 10% to 100% in just 28 minutes. Great deal on MaNa Angadi!',
      is_verified: 1
    },
    {
      id: 'rev_3',
      prod_id: 'prod_9',
      user_id: 'usr_cust_1',
      rating: 5,
      title: 'Authentic cold-pressed peanut oil aroma!',
      comment: 'Reminds me of our grandmother’s village oil mill. The aroma when frying dosas or tadka is simply unmatched. Will keep reordering from Godavari Organics regularly.',
      is_verified: 1
    },
    {
      id: 'rev_4',
      prod_id: 'prod_3',
      user_id: 'usr_cust_2',
      rating: 5,
      title: 'Top tier noise cancellation for office & travel',
      comment: 'Blocks all background traffic and AC hum instantly. Soundstage is punchy and vocal clarity on zoom calls is top notch.',
      is_verified: 1
    }
  ];

  for (const r of reviews) {
    await db.run(
      `INSERT INTO reviews (id, product_id, user_id, rating, title, comment, is_verified_purchase, is_approved)
       VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
      [r.id, r.prod_id, r.user_id, r.rating, r.title, r.comment, r.is_verified]
    );
  }

  // 10. Sample Customer Order with Live Tracking Timeline
  const orderDate = new Date(now.getTime() - 24 * 3600 * 1000).toISOString();
  await db.run(
    `INSERT INTO orders (id, order_number, customer_id, seller_id, delivery_partner_id, address_id, recipient_name, phone, shipping_address, city, state, pincode, status, subtotal, discount_amount, coupon_code, delivery_fee, tax_amount, total_amount, platform_fee, seller_earnings, payment_method, payment_status, created_at)
     VALUES ('ord_demo_1', 'MN-2026-000108', 'usr_cust_1', 'usr_seller_1', 'usr_deliv_1', 'addr_1', 'Priya Thatikonda', '+91 9849012345', 'Flat 402, Sai Vihar Apartments, Road No. 12, Banjara Hills', 'Hyderabad', 'Telangana', '500034', 'Shipped', 9499, 500, 'FESTIVAL500', 0, 0, 8999, 674.92, 8324.08, 'UPI', 'completed', ?)`,
    [orderDate]
  );

  await db.run(
    `INSERT INTO order_items (id, order_id, product_id, variant_id, seller_id, product_title, price, quantity, total_price, image_url)
     VALUES ('oi_demo_1', 'ord_demo_1', 'prod_6', 'var_prod_6_0', 'usr_seller_1', 'Authentic Pochampally Ikkat Pure Silk Saree with Geometric Weave', 9499, 1, 9499, 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800')`
  );

  await db.run(
    `INSERT INTO payments (id, order_id, payment_method, transaction_id, amount, status, payment_details)
     VALUES ('pay_demo_1', 'ord_demo_1', 'UPI', 'TXN_UPI_8899221144', 8999, 'completed', '{"vpa":"priya@okaxis","bank":"HDFC Bank","rrn":"428819283741"}')`
  );

  // Tracking Timeline milestones
  const t1 = new Date(now.getTime() - 24 * 3600 * 1000).toISOString();
  const t2 = new Date(now.getTime() - 20 * 3600 * 1000).toISOString();
  const t3 = new Date(now.getTime() - 14 * 3600 * 1000).toISOString();
  const t4 = new Date(now.getTime() - 6 * 3600 * 1000).toISOString();

  await db.run(
    `INSERT INTO order_tracking (id, order_id, status, title, description, location, timestamp)
     VALUES 
     ('trk_1', 'ord_demo_1', 'Order Placed', 'Order Placed & Confirmed', 'Your order was successfully received by MaNa Angadi.', 'Hyderabad Central Gateway', ?),
     ('trk_2', 'ord_demo_1', 'Payment Confirmed', 'Payment Verified via UPI', 'Transaction ID TXN_UPI_8899221144 verified.', 'MaNa Angadi Secure Pay', ?),
     ('trk_3', 'ord_demo_1', 'Packed', 'Packed by Sri Lakshmi Handlooms', 'Item verified, Silk Mark authenticated and secured with tamper-proof seal.', 'Pochampally Hub', ?),
     ('trk_4', 'ord_demo_1', 'Shipped', 'In Transit to Delivery Hub', 'Dispatched with Delivery Partner Suresh Kumar (TS 09 EZ 4590).', 'Banjara Hills Logistics Center', ?)`,
    [t1, t2, t3, t4]
  );

  // Sample Delivered Order for Return/Review testing
  const delivDate = new Date(now.getTime() - 72 * 3600 * 1000).toISOString();
  await db.run(
    `INSERT INTO orders (id, order_number, customer_id, seller_id, delivery_partner_id, address_id, recipient_name, phone, shipping_address, city, state, pincode, status, subtotal, discount_amount, coupon_code, delivery_fee, tax_amount, total_amount, platform_fee, seller_earnings, payment_method, payment_status, created_at, delivered_at)
     VALUES ('ord_demo_2', 'MN-2026-000084', 'usr_cust_1', 'usr_seller_3', 'usr_deliv_1', 'addr_1', 'Priya Thatikonda', '+91 9849012345', 'Flat 402, Sai Vihar Apartments, Road No. 12, Banjara Hills', 'Hyderabad', 'Telangana', '500034', 'Delivered', 1399, 0, NULL, 0, 0, 1399, 83.94, 1315.06, 'UPI', 'completed', ?, ?)`,
    [delivDate, delivDate]
  );

  await db.run(
    `INSERT INTO order_items (id, order_id, product_id, variant_id, seller_id, product_title, price, quantity, total_price, image_url)
     VALUES ('oi_demo_2', 'ord_demo_2', 'prod_9', 'var_prod_9_1', 'usr_seller_3', 'Wood Pressed Cold Pressed Virgin Groundnut Oil (5 Litre Tin)', 1399, 1, 1399, 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800')`
  );

  // Seed Coupons
  await db.run(
    `INSERT OR IGNORE INTO coupons (id, code, description, discount_type, discount_value, min_order_amount, max_discount_amount, is_active)
     VALUES 
     ('cpn_1', 'MANA10', 'Flat 10% discount on all regional marketplace orders', 'percentage', 10, 499, 500, 1),
     ('cpn_2', 'FESTIVAL20', 'Special 20% discount on festive handlooms and crafts', 'percentage', 20, 1999, 1000, 1),
     ('cpn_3', 'VILLAGE50', 'Flat ₹50 OFF on cold-pressed groceries and direct farm harvest', 'fixed', 50, 499, 50, 1)`
  );

  console.log('✅ MaNa Angadi database seed completed successfully!');
}

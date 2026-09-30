export type UserRole = 'customer' | 'seller' | 'delivery' | 'admin';

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  avatar_url?: string;
  status: 'active' | 'suspended' | 'pending';
  sellerProfile?: SellerProfile;
  deliveryProfile?: DeliveryProfile;
  addresses?: Address[];
}

export interface SellerProfile {
  id: string;
  user_id: string;
  store_name: string;
  store_slug: string;
  store_logo?: string;
  store_description?: string;
  business_address?: string;
  gst_number?: string;
  bank_account?: string;
  is_approved: number;
  commission_rate: number;
  rating: number;
  total_sales: number;
}

export interface DeliveryProfile {
  id: string;
  user_id: string;
  vehicle_type: string;
  vehicle_number: string;
  license_number?: string;
  is_available: number;
  total_deliveries: number;
  rating: number;
  earnings: number;
}

export interface Address {
  id: string;
  user_id: string;
  recipient_name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  landmark?: string;
  city: string;
  district?: string;
  state: string;
  pincode: string;
  address_type: 'Home' | 'Work' | 'Other';
  is_default: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  image_url?: string;
  description?: string;
  product_count?: number;
  display_order: number;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  is_featured: number;
  product_count?: number;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  variant_type: string;
  variant_value: string;
  price_delta: number;
  stock: number;
  sku?: string;
}

export interface ProductSpec {
  id: string;
  spec_group: string;
  spec_name: string;
  spec_value: string;
}

export interface ProductImage {
  id: string;
  image_url: string;
  alt_text?: string;
  is_primary: number;
}

export interface Product {
  id: string;
  seller_id: string;
  category_id: string;
  brand_id?: string;
  title: string;
  slug: string;
  description: string;
  short_description?: string;
  sku?: string;
  mrp: number;
  price: number;
  discount_percent: number;
  stock: number;
  is_featured: number;
  is_approved: number;
  status: 'active' | 'inactive';
  rating: number;
  review_count: number;
  warranty_info?: string;
  return_policy_days: number;
  free_delivery: number;
  is_local: number;
  category_name?: string;
  category_slug?: string;
  brand_name?: string;
  brand_slug?: string;
  seller_name?: string;
  seller_slug?: string;
  seller_rating?: number;
  seller_logo?: string;
  seller_sales?: number;
  seller_address?: string;
  primary_image?: string;
  images?: ProductImage[];
  variants?: ProductVariant[];
  specs?: ProductSpec[];
  reviews?: Review[];
  ratingCounts?: { [key: number]: number };
  similarProducts?: Product[];
  frequentlyBought?: Product[];
}

export interface CartItem {
  cart_item_id: string;
  product_id: string;
  variant_id?: string;
  title: string;
  slug: string;
  mrp: number;
  price: number;
  effective_price: number;
  effective_mrp: number;
  discount_percent: number;
  stock: number;
  available_stock: number;
  in_stock: boolean;
  quantity: number;
  item_total: number;
  seller_id: string;
  seller_name: string;
  variant_type?: string;
  variant_value?: string;
  price_delta?: number;
  primary_image?: string;
}

export interface CartSummary {
  items: CartItem[];
  total_items: number;
  subtotal: number;
  totalMrp: number;
  totalSavings: number;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  amountNeededForFreeDelivery: number;
  finalAmount: number;
}

export interface WishlistItem {
  wishlist_id: string;
  product_id: string;
  title: string;
  slug: string;
  mrp: number;
  price: number;
  discount_percent: number;
  stock: number;
  rating: number;
  review_count: number;
  seller_name: string;
  primary_image: string;
  created_at: string;
}

export interface Coupon {
  id: string;
  code: string;
  description: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_amount: number;
  max_discount_amount?: number;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  variant_id?: string;
  product_title: string;
  price: number;
  quantity: number;
  total_price: number;
  image_url?: string;
}

export interface OrderTrackingMilestone {
  id: string;
  order_id: string;
  status: string;
  title: string;
  description: string;
  location?: string;
  timestamp: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  seller_id?: string;
  delivery_partner_id?: string;
  recipient_name: string;
  phone: string;
  shipping_address: string;
  city: string;
  state: string;
  pincode: string;
  status: 'Order Placed' | 'Payment Confirmed' | 'Seller Confirmed' | 'Packed' | 'Shipped' | 'Out for Delivery' | 'Delivered' | 'Cancelled';
  subtotal: number;
  discount_amount: number;
  coupon_code?: string;
  delivery_fee: number;
  total_amount: number;
  platform_fee: number;
  seller_earnings: number;
  payment_method: 'UPI' | 'Card' | 'NetBanking' | 'Wallet' | 'COD';
  payment_status: 'pending' | 'completed' | 'failed' | 'refunded';
  estimated_delivery?: string;
  delivered_at?: string;
  cancel_reason?: string;
  created_at: string;
  seller_name?: string;
  delivery_partner_name?: string;
  delivery_partner_phone?: string;
  delivery_vehicle?: string;
  delivery_vehicle_number?: string;
  items?: OrderItem[];
  tracking?: OrderTrackingMilestone[];
  is_cancellable?: boolean;
  is_returnable?: boolean;
  returnRequest?: any;
}

export interface Review {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title?: string;
  comment: string;
  image_urls?: string;
  is_verified_purchase: number;
  author_name?: string;
  author_avatar?: string;
  created_at: string;
}

export interface FlashSale {
  id: string;
  title: string;
  tagline?: string;
  banner_url?: string;
  start_time: string;
  end_time: string;
  products?: {
    id: string;
    title: string;
    slug: string;
    mrp: number;
    regular_price: number;
    special_price: number;
    discount_percent: number;
    rating: number;
    stock_limit: number;
    sold_count: number;
    primary_image: string;
  }[];
}

export interface HeroBanner {
  id: string;
  title: string;
  subtitle?: string;
  tagline?: string;
  image_url: string;
  link_url: string;
  badge_text?: string;
  display_order: number;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'order' | 'offer' | 'alert' | 'system';
  link_url?: string;
  is_read: number;
  created_at: string;
}

export interface SupportTicket {
  id: string;
  ticket_number: string;
  user_id: string;
  order_id?: string;
  order_number?: string;
  subject: string;
  category: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
  messages?: {
    id: string;
    sender_id: string;
    sender_name: string;
    message: string;
    is_staff: number;
    created_at: string;
  }[];
}

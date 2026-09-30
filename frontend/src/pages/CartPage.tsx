import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  Tag, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  Check, 
  X,
  Sparkles
} from 'lucide-react';
import { useCart } from '../context/CartContext.js';
import { useWishlist } from '../context/WishlistContext.js';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, loading, updateQuantity, removeFromCart, clearCart, appliedCoupon, applyCoupon, removeCoupon } = useCart();
  const { toggleWishlist } = useWishlist();

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ text: string; isError: boolean } | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  const handleApplyCoupon = async (codeToApply?: string) => {
    const code = codeToApply || couponCodeInput.trim();
    if (!code) return;
    setIsApplying(true);
    const res = await applyCoupon(code);
    setIsApplying(false);
    setCouponMsg({ text: res.message, isError: !res.success });
    if (res.success) setCouponCodeInput('');
  };

  if (loading && !cart) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-xs text-slate-500 font-semibold">Loading your cart...</p>
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mx-auto text-brand-500 shadow-inner">
          <ShoppingCart className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 font-display">Your Shopping Cart is Empty</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Explore our wide range of authentic handlooms, 5G smartphones, groceries, and electronics.
        </p>
        <div className="pt-2">
          <Link
            to="/products"
            className="inline-flex items-center space-x-2 bg-brand-500 hover:bg-brand-600 text-white font-bold px-6 py-3 rounded-xl text-sm shadow-md transition"
          >
            <span>Start Shopping Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const freeShippingProgress = Math.min(100, Math.round((cart.subtotal / cart.freeDeliveryThreshold) * 100));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
            Shopping Cart ({cart.total_items} Items)
          </h1>
          <p className="text-xs text-slate-500">Review your chosen items, apply discount coupons & proceed to checkout</p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-rose-600 hover:underline font-bold"
        >
          Clear Cart
        </button>
      </div>

      {/* Free Shipping Progress Indicator */}
      <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 rounded-2xl space-y-2">
        <div className="flex items-center justify-between text-xs font-bold">
          <div className="flex items-center space-x-1.5 text-emerald-800">
            <Truck className="w-4 h-4 text-emerald-600" />
            <span>
              {cart.amountNeededForFreeDelivery === 0
                ? '🎉 You have qualified for FREE Delivery across India!'
                : `Add ₹${cart.amountNeededForFreeDelivery.toLocaleString('en-IN')} more to unlock FREE Delivery!`}
            </span>
          </div>
          <span className="text-emerald-700 font-mono">{freeShippingProgress}%</span>
        </div>
        <div className="w-full bg-emerald-100 h-2 rounded-full overflow-hidden">
          <div
            className="bg-emerald-600 h-full rounded-full transition-all duration-500"
            style={{ width: `${freeShippingProgress}%` }}
          ></div>
        </div>
      </div>

      {/* Cart Items Grid & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Items List (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {cart.items.map((item) => (
            <div
              key={item.cart_item_id}
              className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              {/* Product Info & Thumb */}
              <div className="flex items-center space-x-4 flex-1 min-w-0">
                <Link to={`/products/${item.slug || item.product_id}`} className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0 border border-slate-100">
                  <img
                    src={item.primary_image || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=200'}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </Link>

                <div className="space-y-1 min-w-0 flex-1">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.seller_name}</div>
                  <Link
                    to={`/products/${item.slug || item.product_id}`}
                    className="text-sm font-bold text-slate-900 hover:text-brand-600 line-clamp-1 transition"
                  >
                    {item.title}
                  </Link>
                  {item.variant_value && (
                    <div className="text-xs text-brand-600 font-semibold">
                      Option: {item.variant_value}
                    </div>
                  )}
                  <div className="flex items-baseline space-x-2 text-xs">
                    <span className="font-extrabold text-slate-900 font-display">₹{item.effective_price.toLocaleString('en-IN')}</span>
                    {item.effective_mrp > item.effective_price && (
                      <span className="text-slate-400 line-through">₹{item.effective_mrp.toLocaleString('en-IN')}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quantity Controls & Delete */}
              <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto space-x-4">
                <div className="flex items-center space-x-1 border border-slate-300 rounded-xl bg-slate-50 p-1">
                  <button
                    onClick={() => updateQuantity(item.cart_item_id, item.quantity - 1)}
                    className="p-1 rounded-lg hover:bg-slate-200 text-slate-600"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-7 text-center text-xs font-bold font-mono">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.cart_item_id, item.quantity + 1)}
                    disabled={item.quantity >= item.available_stock}
                    className="p-1 rounded-lg hover:bg-slate-200 text-slate-600 disabled:opacity-40"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <div className="text-right min-w-[80px]">
                  <div className="text-sm font-black text-slate-900 font-display">
                    ₹{item.item_total.toLocaleString('en-IN')}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      const directItem = {
                        product_id: item.product_id,
                        variant_id: item.variant_id || null,
                        quantity: item.quantity,
                        title: item.title,
                        effective_price: item.effective_price,
                        price: item.effective_price,
                        mrp: item.effective_mrp,
                        item_total: item.item_total,
                        primary_image: item.primary_image,
                        seller_id: item.seller_id,
                        seller_name: item.seller_name
                      };
                      navigate('/checkout', { state: { directItem } });
                    }}
                    className="text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-brand-500 hover:text-white px-2.5 py-1.5 rounded-xl border border-slate-200 transition"
                    title="Order this single item separately"
                  >
                    Order Separately
                  </button>

                  <button
                    onClick={() => removeFromCart(item.cart_item_id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                    title="Remove from Cart"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Price Breakdown & Checkout (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Coupon Box */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-900">
              <Tag className="w-4 h-4 text-brand-600" />
              <span>Apply Discount Coupon</span>
            </div>

            {appliedCoupon ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-emerald-800">Coupon {appliedCoupon.code} Applied!</div>
                  <div className="text-emerald-700 text-[11px]">Saved ₹{appliedCoupon.discount_amount.toFixed(2)} on this order</div>
                </div>
                <button
                  onClick={removeCoupon}
                  className="text-slate-400 hover:text-rose-600 p-1"
                  title="Remove coupon"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                    placeholder="Enter Coupon Code (e.g. MANA10)"
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold uppercase focus:outline-none focus:border-brand-500"
                  />
                  <button
                    onClick={() => handleApplyCoupon()}
                    disabled={isApplying || !couponCodeInput.trim()}
                    className="bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-bold transition"
                  >
                    Apply
                  </button>
                </div>

                {couponMsg && (
                  <div className={`text-[11px] font-semibold ${couponMsg.isError ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {couponMsg.text}
                  </div>
                )}

                {/* Quick available coupons */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Available Coupons:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {['MANA10', 'FIRSTBUY', 'FESTIVAL500'].map((c) => (
                      <button
                        key={c}
                        onClick={() => handleApplyCoupon(c)}
                        className="text-[10px] font-mono font-bold text-brand-600 bg-brand-50 border border-brand-200 px-2 py-0.5 rounded hover:bg-brand-100 transition"
                      >
                        +{c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Price Breakdown Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-3">
              Price Details
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Price ({cart.total_items} items)</span>
                <span>₹{cart.subtotal.toLocaleString('en-IN')}</span>
              </div>

              {cart.totalSavings > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Product Discounts</span>
                  <span>-₹{cart.totalSavings.toLocaleString('en-IN')}</span>
                </div>
              )}

              {appliedCoupon && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Savings ({appliedCoupon.code})</span>
                  <span>-₹{appliedCoupon.discount_amount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-600">
                <span>Delivery Charges</span>
                <span>
                  {cart.deliveryFee === 0 ? (
                    <span className="text-emerald-600 font-bold">FREE</span>
                  ) : (
                    `₹${cart.deliveryFee}`
                  )}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline text-slate-900">
                <span className="text-sm font-black">Total Payable Amount</span>
                <span className="text-xl font-black text-slate-900 font-display">
                  ₹{Math.max(0, cart.finalAmount - (appliedCoupon?.discount_amount || 0)).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3.5 px-4 rounded-xl text-sm shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 active:scale-95 transition flex items-center justify-center space-x-2"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center space-x-2 text-[10px] text-slate-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% Safe & Secure Payments</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, ArrowRight, Star } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext.js';

export const WishlistPage: React.FC = () => {
  const { items, moveToCart, toggleWishlist } = useWishlist();

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto text-rose-500 shadow-inner">
          <Heart className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 font-display">Your Wishlist is Empty</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Save your favorite products, silk sarees, and electronics to view price drops and purchase anytime.
        </p>
        <div className="pt-2">
          <Link
            to="/products"
            className="inline-flex items-center space-x-2 bg-brand-500 hover:bg-brand-600 text-white font-bold px-6 py-3 rounded-xl text-sm shadow-md transition"
          >
            <span>Explore Marketplace</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
          My Wishlist ({items.length} Items)
        </h1>
        <p className="text-xs text-slate-500">Your curated items saved for quick checkout</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {items.map((item) => (
          <div
            key={item.wishlist_id}
            className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm hover:shadow-lg transition flex flex-col justify-between group relative"
          >
            <button
              onClick={() => toggleWishlist(item.product_id)}
              className="absolute top-2 right-2 p-2 rounded-full bg-white/80 text-rose-500 hover:bg-rose-50 transition shadow"
              title="Remove from Wishlist"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <div>
              <Link to={`/products/${item.slug || item.product_id}`} className="block relative pt-[85%] rounded-xl overflow-hidden bg-slate-50 mb-3">
                <img
                  src={item.primary_image || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=300'}
                  alt={item.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </Link>

              <div className="text-[10px] font-bold text-brand-600 uppercase truncate mb-1">
                {item.seller_name}
              </div>

              <Link
                to={`/products/${item.slug || item.product_id}`}
                className="font-bold text-xs sm:text-sm text-slate-800 hover:text-brand-600 line-clamp-2 leading-snug transition"
              >
                {item.title}
              </Link>

              <div className="flex items-center space-x-1.5 mt-2">
                <div className="flex items-center space-x-0.5 bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded text-[10px] font-bold border border-emerald-200">
                  <span>{item.rating ? item.rating.toFixed(1) : '4.5'}</span>
                  <Star className="w-2.5 h-2.5 fill-emerald-600 text-emerald-600" />
                </div>
                <span className="text-[10px] text-slate-400">({item.review_count})</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-base font-black text-slate-900 font-display">
                  ₹{item.price.toLocaleString('en-IN')}
                </span>
                {item.mrp > item.price && (
                  <span className="text-xs text-slate-400 line-through block">
                    ₹{item.mrp.toLocaleString('en-IN')}
                  </span>
                )}
              </div>

              <button
                onClick={() => moveToCart(item.product_id)}
                className="bg-brand-500 hover:bg-brand-600 text-white p-2.5 rounded-xl shadow transition flex items-center justify-center"
                title="Move to Cart"
              >
                <ShoppingCart className="w-4 h-4" />
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

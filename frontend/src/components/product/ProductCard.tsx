import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, ShoppingCart, Check, ShieldCheck, Zap } from 'lucide-react';
import { Product } from '../../types/index.js';
import { useCart } from '../../context/CartContext.js';
import { useWishlist } from '../../context/WishlistContext.js';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const inWishlist = isInWishlist(product.id);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsAdding(true);
    const res = await addToCart(product.id);
    setIsAdding(false);
    if (res.success) {
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1500);
    }
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleWishlist(product.id);
  };

  const primaryImage = product.primary_image || (product.images && product.images[0]?.image_url) || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400';

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-brand-300 transition-all duration-300 flex flex-col overflow-hidden relative">
      
      {/* Badges Container */}
      <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1">
        {product.discount_percent > 0 && (
          <span className="bg-emerald-600 text-white text-[11px] font-black px-2 py-0.5 rounded-md shadow-sm uppercase tracking-wider">
            {product.discount_percent}% OFF
          </span>
        )}
        {product.is_local === 1 && (
          <span className="bg-brand-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-sm uppercase tracking-tight flex items-center space-x-1">
            <ShieldCheck className="w-3 h-3" />
            <span>Artisan GI</span>
          </span>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        onClick={handleWishlistToggle}
        className={`absolute top-2.5 right-2.5 z-10 p-2 rounded-full backdrop-blur-md transition shadow-sm ${
          inWishlist
            ? 'bg-rose-50 text-rose-500 hover:bg-rose-100'
            : 'bg-white/80 text-slate-400 hover:text-rose-500 hover:bg-white'
        }`}
        title={inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
      >
        <Heart className={`w-4 h-4 ${inWishlist ? 'fill-rose-500 text-rose-500' : ''}`} />
      </button>

      {/* Product Image */}
      <Link to={`/products/${product.slug || product.id}`} className="block relative pt-[90%] bg-slate-50 overflow-hidden">
        <img
          src={primaryImage}
          alt={product.title}
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
      </Link>

      {/* Product Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Category */}
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-1">
            <span className="text-brand-600 font-bold uppercase tracking-wider truncate max-w-[120px]">
              {product.brand_name || 'MaNa Angadi'}
            </span>
            <span className="truncate max-w-[100px]">{product.category_name || ''}</span>
          </div>

          {/* Title */}
          <Link
            to={`/products/${product.slug || product.id}`}
            className="block text-sm font-semibold text-slate-800 hover:text-brand-600 line-clamp-2 transition-colors leading-snug"
          >
            {product.title}
          </Link>

          {/* Rating */}
          <div className="flex items-center space-x-1.5 mt-2">
            <div className="flex items-center space-x-1 bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded text-xs font-bold border border-emerald-200">
              <span>{product.rating ? product.rating.toFixed(1) : '4.5'}</span>
              <Star className="w-3 h-3 fill-emerald-600 text-emerald-600" />
            </div>
            <span className="text-xs text-slate-400">
              ({product.review_count || 42} reviews)
            </span>
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-baseline space-x-2">
              <span className="text-lg font-extrabold text-slate-900 font-display">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.mrp > product.price && (
                <span className="text-xs text-slate-400 line-through">
                  ₹{product.mrp.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            <div className="text-[10px] text-emerald-600 font-semibold flex items-center space-x-0.5">
              <Zap className="w-2.5 h-2.5" />
              <span>Free Delivery</span>
            </div>
          </div>

          {/* Add to Cart CTA */}
          <button
            onClick={handleAddToCart}
            disabled={isAdding || product.stock < 1}
            className={`p-2.5 rounded-xl transition shadow-sm flex items-center justify-center ${
              product.stock < 1
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : justAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-brand-500 hover:bg-brand-600 text-white active:scale-95'
            }`}
            title={product.stock < 1 ? 'Out of Stock' : 'Add to Cart'}
          >
            {justAdded ? (
              <Check className="w-4 h-4" />
            ) : (
              <ShoppingCart className="w-4 h-4" />
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

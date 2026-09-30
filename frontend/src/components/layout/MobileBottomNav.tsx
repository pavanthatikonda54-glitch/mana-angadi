import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Layers, Sparkles, Heart, ShoppingCart, User } from 'lucide-react';
import { useCart } from '../../context/CartContext.js';
import { useWishlist } from '../../context/WishlistContext.js';
import { useAuth } from '../../context/AuthContext.js';

interface MobileBottomNavProps {
  onOpenAiChat: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenAiChat }) => {
  const location = useLocation();
  const { itemCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { user } = useAuth();

  const isCurrent = (path: string) => location.pathname === path;

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-navy-950/95 backdrop-blur-lg border-t border-navy-800 px-2 py-2 flex items-center justify-around text-slate-400">
      {/* Home */}
      <Link
        to="/"
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-semibold transition ${
          isCurrent('/') ? 'text-brand-500' : 'hover:text-slate-200'
        }`}
      >
        <Home className="w-5 h-5 mb-0.5" />
        <span>Home</span>
      </Link>

      {/* Explore / Categories */}
      <Link
        to="/products"
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-semibold transition ${
          isCurrent('/products') ? 'text-brand-500' : 'hover:text-slate-200'
        }`}
      >
        <Layers className="w-5 h-5 mb-0.5" />
        <span>Categories</span>
      </Link>

      {/* Ask MaNa AI Button */}
      <button
        onClick={onOpenAiChat}
        className="flex flex-col items-center justify-center -mt-4 bg-gradient-to-tr from-brand-600 to-amber-400 text-white w-12 h-12 rounded-full shadow-lg shadow-brand-500/40 transform hover:scale-105 active:scale-95 transition"
      >
        <Sparkles className="w-6 h-6 animate-pulse" />
      </button>

      {/* Wishlist */}
      <Link
        to="/wishlist"
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-semibold relative transition ${
          isCurrent('/wishlist') ? 'text-brand-500' : 'hover:text-slate-200'
        }`}
      >
        <div className="relative">
          <Heart className="w-5 h-5 mb-0.5" />
          {wishlistCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-rose-500 text-white rounded-full w-4 h-4 text-[9px] font-black flex items-center justify-center">
              {wishlistCount}
            </span>
          )}
        </div>
        <span>Wishlist</span>
      </Link>

      {/* Cart */}
      <Link
        to="/cart"
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-semibold relative transition ${
          isCurrent('/cart') ? 'text-brand-500' : 'hover:text-slate-200'
        }`}
      >
        <div className="relative">
          <ShoppingCart className="w-5 h-5 mb-0.5" />
          {itemCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-brand-500 text-white rounded-full w-4 h-4 text-[9px] font-black flex items-center justify-center">
              {itemCount}
            </span>
          )}
        </div>
        <span>Cart</span>
      </Link>

      {/* Profile */}
      <Link
        to="/profile"
        className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-semibold transition ${
          isCurrent('/profile') ? 'text-brand-500' : 'hover:text-slate-200'
        }`}
      >
        <User className="w-5 h-5 mb-0.5" />
        <span>Account</span>
      </Link>
    </div>
  );
};

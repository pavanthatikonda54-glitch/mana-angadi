import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  ShoppingCart, 
  Heart, 
  User, 
  MapPin, 
  Mic, 
  MicOff, 
  Sparkles, 
  Bell, 
  ChevronDown, 
  Store, 
  ShieldCheck, 
  Truck, 
  LogOut, 
  Package, 
  RotateCcw, 
  LifeBuoy,
  X,
  CheckCircle,
  Menu
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';
import { useCart } from '../../context/CartContext.js';
import { useWishlist } from '../../context/WishlistContext.js';
import api from '../../services/api.js';
import { NotificationItem } from '../../types/index.js';

interface HeaderProps {
  onOpenAiChat: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAiChat }) => {
  const navigate = useNavigate();
  const { user, logout, demoLogin } = useAuth();
  const { itemCount, cart, selectedPincode, checkPincode } = useCart();
  const { wishlistCount } = useWishlist();

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Modals & Dropdowns
  const [showPincodeModal, setShowPincodeModal] = useState(false);
  const [pincodeInput, setPincodeInput] = useState(selectedPincode.pincode);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Fetch notifications
  useEffect(() => {
    if (user) {
      api.get('/notifications').then((res) => {
        if (res.data.success) {
          setNotifications(res.data.notifications || []);
          setUnreadCount(res.data.unreadCount || 0);
        }
      }).catch(() => {});
    }
  }, [user]);

  // Handle Autocomplete
  useEffect(() => {
    if (searchQuery.trim().length >= 2) {
      const timer = setTimeout(() => {
        api.get(`/products/suggestions?q=${encodeURIComponent(searchQuery)}`)
          .then((res) => {
            if (res.data.success) {
              setSuggestions(res.data.suggestions);
              setShowSuggestions(true);
            }
          })
          .catch(() => {});
      }, 200);
      return () => clearTimeout(timer);
    } else {
      setSuggestions(null);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Voice Search Simulation
  const handleVoiceSearch = () => {
    if (!isListening) {
      setIsListening(true);
      // Simulate speech recognition
      const sampleQueries = ['OnePlus 5G phones', 'Pochampally silk saree', 'Cold pressed groundnut oil', 'Noise canceling headphones', 'Prestige mixer grinder'];
      const randomQuery = sampleQueries[Math.floor(Math.random() * sampleQueries.length)];
      
      setTimeout(() => {
        setSearchQuery(randomQuery);
        setIsListening(false);
        navigate(`/products?q=${encodeURIComponent(randomQuery)}`);
      }, 2000);
    } else {
      setIsListening(false);
    }
  };

  const handlePincodeSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (pincodeInput.trim()) {
      checkPincode(pincodeInput.trim());
      setShowPincodeModal(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-navy-950 text-white shadow-lg border-b border-navy-800">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-brand-600 via-brand-500 to-amber-500 text-white text-xs font-semibold py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-bold">Mana Angadi</span>
            <span className="hidden sm:inline">“Mana Ooru Shopping, Mana Angadi.” • Authentic Handlooms, Electronics & Groceries</span>
            <span className="sm:hidden">Mana Ooru Shopping, Mana Angadi!</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="hidden md:inline">⚡ Free Delivery on orders ₹499+</span>
            <button 
              onClick={onOpenAiChat} 
              className="flex items-center space-x-1 bg-navy-900/40 hover:bg-navy-900/60 px-2.5 py-0.5 rounded-full text-amber-200 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>Ask MaNa AI</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="flex items-center justify-between gap-3 md:gap-6">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2.5 flex-shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-amber-400 p-0.5 shadow-md group-hover:scale-105 transition-transform flex items-center justify-center">
              <div className="w-full h-full bg-navy-950 rounded-[10px] flex items-center justify-center">
                <span className="text-xl font-black font-display tracking-tighter text-brand-400">M<span className="text-amber-400">A</span></span>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-extrabold tracking-tight font-display leading-none text-white group-hover:text-brand-400 transition-colors">
                MaNa <span className="text-brand-500">Angadi</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide">
                Mana Ooru Shopping
              </span>
            </div>
          </Link>

          {/* Indian Location / Pincode Selector */}
          <button
            onClick={() => setShowPincodeModal(true)}
            className="hidden lg:flex items-center space-x-1.5 text-xs text-slate-300 hover:text-white bg-navy-900 hover:bg-navy-800 px-3 py-2 rounded-lg border border-navy-800 transition flex-shrink-0"
          >
            <MapPin className="w-4 h-4 text-brand-500 flex-shrink-0" />
            <div className="text-left leading-tight">
              <div className="text-[10px] text-slate-400">Deliver to</div>
              <div className="font-semibold text-slate-100 flex items-center space-x-1">
                <span>{selectedPincode.city.split('/')[0].trim()} {selectedPincode.pincode}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </div>
            </div>
          </button>

          {/* Main Search Bar */}
          <div ref={searchRef} className="relative flex-1 max-w-2xl">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => suggestions && setShowSuggestions(true)}
                placeholder={isListening ? "Listening... Speak your query now 🎙️" : "Search mobiles, Pochampally silk, groceries, audio..."}
                className={`w-full bg-slate-900/90 text-white placeholder-slate-400 text-sm pl-4 pr-24 py-2.5 rounded-xl border ${
                  isListening ? 'border-brand-500 ring-2 ring-brand-500/50 animate-pulse' : 'border-slate-700 hover:border-slate-600 focus:border-brand-500'
                } focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition shadow-inner`}
              />

              <div className="absolute right-1.5 flex items-center space-x-1">
                {/* Voice Search Simulator */}
                <button
                  type="button"
                  onClick={handleVoiceSearch}
                  title="Voice Search"
                  className={`p-1.5 rounded-lg text-slate-400 hover:text-brand-400 hover:bg-slate-800 transition ${
                    isListening ? 'text-brand-500 bg-brand-500/20' : ''
                  }`}
                >
                  {isListening ? <Mic className="w-4 h-4 text-brand-500 animate-bounce" /> : <Mic className="w-4 h-4" />}
                </button>

                {/* Submit Search Button */}
                <button
                  type="submit"
                  className="bg-brand-500 hover:bg-brand-600 text-white p-2 rounded-lg transition shadow-sm"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </form>

            {/* Live Autocomplete Dropdown */}
            {showSuggestions && suggestions && (
              <div className="absolute left-0 right-0 top-full mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 divide-y divide-slate-800">
                {suggestions.products && suggestions.products.length > 0 && (
                  <div className="p-2">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">Products</div>
                    {suggestions.products.map((p: any) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setShowSuggestions(false);
                          navigate(`/products/${p.slug || p.id}`);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-slate-800 flex items-center space-x-3 transition group"
                      >
                        <img src={p.image} alt={p.title} className="w-8 h-8 rounded object-cover flex-shrink-0" />
                        <div className="flex-1 truncate">
                          <div className="text-sm font-medium text-slate-200 group-hover:text-brand-400 truncate">{p.title}</div>
                          <div className="text-xs font-semibold text-brand-400">₹{p.price.toLocaleString('en-IN')}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {suggestions.categories && suggestions.categories.length > 0 && (
                  <div className="p-2 bg-slate-950/50">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">In Categories</div>
                    <div className="flex flex-wrap gap-1 px-2 py-1">
                      {suggestions.categories.map((c: any) => (
                        <button
                          key={c.id}
                          onClick={() => {
                            setShowSuggestions(false);
                            navigate(`/products?category=${c.slug}`);
                          }}
                          className="text-xs bg-slate-800 hover:bg-brand-500 hover:text-white px-2.5 py-1 rounded-md text-slate-300 transition"
                        >
                          {c.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-2 md:space-x-4">
            
            {/* Quick Demo Role Switcher Badge */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center space-x-1.5 text-xs bg-brand-500/10 hover:bg-brand-500/20 text-brand-400 border border-brand-500/30 px-2.5 py-1.5 rounded-lg transition"
                title="Switch Demo Role"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="font-semibold uppercase tracking-wider">{user?.role || 'Guest'}</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 divide-y divide-slate-800 text-xs">
                  <div className="px-3 py-2 font-bold text-slate-300 uppercase tracking-wider">Switch Test Role</div>
                  <div className="py-1 space-y-1">
                    <button
                      onClick={() => { demoLogin('customer'); setShowRoleMenu(false); }}
                      className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between hover:bg-slate-800 ${user?.role === 'customer' ? 'text-brand-400 font-bold' : 'text-slate-300'}`}
                    >
                      <span>Customer (Priya)</span>
                      {user?.role === 'customer' && <CheckCircle className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => { demoLogin('seller'); setShowRoleMenu(false); }}
                      className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between hover:bg-slate-800 ${user?.role === 'seller' ? 'text-brand-400 font-bold' : 'text-slate-300'}`}
                    >
                      <span>Seller (Sri Lakshmi Handlooms)</span>
                      {user?.role === 'seller' && <CheckCircle className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => { demoLogin('delivery'); setShowRoleMenu(false); }}
                      className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between hover:bg-slate-800 ${user?.role === 'delivery' ? 'text-brand-400 font-bold' : 'text-slate-300'}`}
                    >
                      <span>Delivery Partner (Suresh)</span>
                      {user?.role === 'delivery' && <CheckCircle className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => { demoLogin('admin'); setShowRoleMenu(false); }}
                      className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between hover:bg-slate-800 ${user?.role === 'admin' ? 'text-brand-400 font-bold' : 'text-slate-300'}`}
                    >
                      <span>Admin Desk</span>
                      {user?.role === 'admin' && <CheckCircle className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Notifications */}
            <div ref={notifRef} className="relative">
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="p-2 text-slate-300 hover:text-white hover:bg-navy-900 rounded-lg relative transition"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-brand-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifMenu && (
                <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-3 z-50 divide-y divide-slate-800">
                  <div className="flex items-center justify-between pb-2">
                    <span className="font-bold text-sm text-slate-200">Notifications</span>
                    <button 
                      onClick={() => {
                        api.put('/notifications/all/read');
                        setUnreadCount(0);
                      }}
                      className="text-xs text-brand-400 hover:underline"
                    >
                      Mark all as read
                    </button>
                  </div>
                  <div className="py-2 max-h-72 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <div className="text-center text-xs text-slate-500 py-4">No notifications yet</div>
                    ) : (
                      notifications.map((n) => (
                        <Link
                          key={n.id}
                          to={n.link_url || '#'}
                          onClick={() => setShowNotifMenu(false)}
                          className={`block p-2.5 rounded-lg text-xs transition ${
                            n.is_read ? 'bg-slate-950/40 text-slate-400' : 'bg-slate-800 text-slate-200 border-l-2 border-brand-500'
                          }`}
                        >
                          <div className="font-semibold text-slate-100">{n.title}</div>
                          <div className="mt-0.5 line-clamp-2">{n.message}</div>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Wishlist */}
            <Link
              to="/wishlist"
              className="p-2 text-slate-300 hover:text-brand-400 hover:bg-navy-900 rounded-lg relative transition hidden sm:flex items-center"
              title="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="flex items-center space-x-2 bg-brand-500 hover:bg-brand-600 text-white px-3.5 py-2 rounded-xl font-semibold text-sm transition shadow-md group"
              title="Shopping Cart"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-white text-brand-600 w-4 h-4 rounded-full text-[10px] font-black flex items-center justify-center shadow">
                    {itemCount}
                  </span>
                )}
              </div>
              <span className="hidden md:inline font-bold">
                {cart && cart.subtotal > 0 ? `₹${cart.subtotal.toLocaleString('en-IN')}` : 'Cart'}
              </span>
            </Link>

            {/* User Account Menu */}
            <div ref={userMenuRef} className="relative">
              {user ? (
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-navy-900 border border-transparent hover:border-slate-800 transition"
                >
                  <img
                    src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={user.full_name}
                    className="w-8 h-8 rounded-lg object-cover border border-slate-700"
                  />
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
                </button>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center space-x-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-2 rounded-lg font-semibold transition"
                >
                  <User className="w-4 h-4" />
                  <span>Login</span>
                </Link>
              )}

              {showUserMenu && user && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 z-50 divide-y divide-slate-800 text-sm">
                  <div className="px-3 py-2.5">
                    <div className="font-bold text-slate-100">{user.full_name}</div>
                    <div className="text-xs text-slate-400 truncate">{user.email}</div>
                    <div className="mt-1 inline-block px-2 py-0.5 bg-brand-500/20 text-brand-400 text-[10px] font-bold rounded uppercase">
                      {user.role} Account
                    </div>
                  </div>

                  <div className="py-1">
                    <Link
                      to="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      <span>My Profile & Addresses</span>
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition"
                    >
                      <Package className="w-4 h-4 text-slate-400" />
                      <span>My Orders & Live Tracking</span>
                    </Link>
                    <Link
                      to="/returns"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition"
                    >
                      <RotateCcw className="w-4 h-4 text-slate-400" />
                      <span>Returns & Refunds</span>
                    </Link>
                    <Link
                      to="/support"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition"
                    >
                      <LifeBuoy className="w-4 h-4 text-slate-400" />
                      <span>24/7 Customer Support</span>
                    </Link>
                  </div>

                  {/* Role Portals */}
                  <div className="py-1">
                    {(user.role === 'seller' || user.role === 'admin') && (
                      <Link
                        to="/seller"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-amber-300 hover:bg-slate-800 transition font-medium"
                      >
                        <Store className="w-4 h-4" />
                        <span>Seller Dashboard</span>
                      </Link>
                    )}
                    {(user.role === 'delivery' || user.role === 'admin') && (
                      <Link
                        to="/delivery"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-emerald-400 hover:bg-slate-800 transition font-medium"
                      >
                        <Truck className="w-4 h-4" />
                        <span>Delivery Partner Hub</span>
                      </Link>
                    )}
                    {user.role === 'admin' && (
                      <Link
                        to="/admin"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center space-x-2.5 px-3 py-2 rounded-lg text-rose-400 hover:bg-slate-800 transition font-medium"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Admin Control Desk</span>
                      </Link>
                    )}
                  </div>

                  <div className="pt-1">
                    <button
                      onClick={() => { logout(); setShowUserMenu(false); }}
                      className="w-full text-left flex items-center space-x-2.5 px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Indian Pincode Delivery Checker Modal */}
      {showPincodeModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl relative">
            <button
              onClick={() => setShowPincodeModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 flex items-center justify-center">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Select Delivery Location</h3>
                <p className="text-xs text-slate-400">Check product availability & delivery speed across India</p>
              </div>
            </div>

            <form onSubmit={handlePincodeSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Enter 6-digit Indian Pincode</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={pincodeInput}
                    onChange={(e) => setPincodeInput(e.target.value)}
                    placeholder="e.g. 500034, 560001, 110001"
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white font-mono text-sm focus:outline-none focus:border-brand-500"
                  />
                  <button
                    type="submit"
                    className="bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition"
                  >
                    Apply
                  </button>
                </div>
              </div>

              {/* Quick Popular Cities */}
              <div>
                <div className="text-xs text-slate-400 mb-2">Popular Cities:</div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { name: 'Hyderabad', pin: '500034' },
                    { name: 'Bengaluru', pin: '560001' },
                    { name: 'Vijayawada', pin: '520001' },
                    { name: 'Mumbai', pin: '400001' },
                    { name: 'Delhi NCR', pin: '110001' },
                    { name: 'Chennai', pin: '600001' },
                  ].map((city) => (
                    <button
                      key={city.pin}
                      type="button"
                      onClick={() => {
                        setPincodeInput(city.pin);
                        checkPincode(city.pin);
                        setShowPincodeModal(false);
                      }}
                      className="text-left p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition"
                    >
                      <div className="text-xs font-semibold text-slate-200">{city.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{city.pin}</div>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};

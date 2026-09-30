import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  RotateCcw, 
  Truck, 
  CreditCard, 
  Store, 
  Mail, 
  Phone, 
  MapPin, 
  HeartHandshake,
  Sparkles
} from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-navy-950 text-slate-300 pt-12 pb-24 md:pb-12 border-t border-navy-800">
      {/* Value Proposition Badges */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 border-b border-navy-800">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center sm:text-left">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-400 flex items-center justify-center flex-shrink-0 border border-brand-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-slate-100 text-sm">100% Original Products</div>
              <div className="text-xs text-slate-400">Authentic GI Handlooms & Brand Warranties</div>
            </div>
          </div>

          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0 border border-emerald-500/20">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-slate-100 text-sm">7-Day Easy Returns</div>
              <div className="text-xs text-slate-400">Hassle-free doorstep pickup & quick refunds</div>
            </div>
          </div>

          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center flex-shrink-0 border border-amber-500/20">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-slate-100 text-sm">Fast & Free Delivery</div>
              <div className="text-xs text-slate-400">On all orders above ₹499 across India</div>
            </div>
          </div>

          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center flex-shrink-0 border border-indigo-500/20">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-slate-100 text-sm">Secure UPI & Payments</div>
              <div className="text-xs text-slate-400">UPI, RuPay, Cards, NetBanking & COD</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          
          {/* Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-amber-400 p-0.5 shadow flex items-center justify-center">
                <div className="w-full h-full bg-navy-950 rounded-[9px] flex items-center justify-center">
                  <span className="text-lg font-black font-display text-brand-400">M<span className="text-amber-400">A</span></span>
                </div>
              </div>
              <span className="text-xl font-extrabold tracking-tight font-display text-white">
                MaNa <span className="text-brand-500">Angadi</span>
              </span>
            </Link>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              <strong className="text-slate-200">“Mana Ooru Shopping, Mana Angadi.”</strong> — A modern multi-vendor marketplace connecting customers, local weaver communities, organic farmers, and top national brands with reliable doorstep delivery.
            </p>

            <div className="pt-2 text-xs text-slate-400 space-y-1.5">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-brand-400" />
                <span>Toll-Free Customer Care: +91 1800 555 6262</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-brand-400" />
                <span>support@manaangadi.demo</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-brand-400" />
                <span>Hyderabad, Telangana, India - 500034</span>
              </div>
            </div>
          </div>

          {/* Shop Categories */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Popular Aisles</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/products?category=mobiles" className="hover:text-brand-400 transition">5G Mobiles & Gadgets</Link></li>
              <li><Link to="/products?category=local-products" className="hover:text-brand-400 transition">Pochampally Handlooms</Link></li>
              <li><Link to="/products?category=grocery" className="hover:text-brand-400 transition">Organic Cold Pressed Oils</Link></li>
              <li><Link to="/products?category=electronics" className="hover:text-brand-400 transition">Noise Canceling Audio</Link></li>
              <li><Link to="/products?category=home-kitchen" className="hover:text-brand-400 transition">Cast Iron & Cookware</Link></li>
              <li><Link to="/products?category=offers" className="hover:text-brand-400 transition font-semibold text-amber-400">Mega Festival Offers</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Help & Support</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/orders" className="hover:text-brand-400 transition">Track Your Order</Link></li>
              <li><Link to="/returns" className="hover:text-brand-400 transition">Returns & Refunds</Link></li>
              <li><Link to="/support" className="hover:text-brand-400 transition">Raise a Support Ticket</Link></li>
              <li><Link to="/profile" className="hover:text-brand-400 transition">Manage Addresses</Link></li>
              <li><Link to="/wishlist" className="hover:text-brand-400 transition">My Wishlist</Link></li>
            </ul>
          </div>

          {/* Partner with us */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Sell & Deliver</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/seller" className="flex items-center space-x-1.5 text-amber-300 hover:text-amber-200 font-semibold transition">
                  <Store className="w-3.5 h-3.5" />
                  <span>Seller Portal</span>
                </Link>
              </li>
              <li>
                <Link to="/delivery" className="flex items-center space-x-1.5 text-emerald-400 hover:text-emerald-300 font-semibold transition">
                  <Truck className="w-3.5 h-3.5" />
                  <span>Delivery Partner Hub</span>
                </Link>
              </li>
              <li>
                <Link to="/admin" className="flex items-center space-x-1.5 text-rose-400 hover:text-rose-300 font-semibold transition">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Admin Control Desk</span>
                </Link>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 border-t border-navy-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 space-y-2 sm:space-y-0">
        <div>
          © {new Date().getFullYear()} MaNa Angadi Marketplace Pvt Ltd. All rights reserved.
        </div>
        <div className="flex items-center space-x-4">
          <span>🇮🇳 Made for India with Pride</span>
          <span>•</span>
          <span>Privacy Policy</span>
          <span>•</span>
          <span>Terms of Use</span>
        </div>
      </div>
    </footer>
  );
};

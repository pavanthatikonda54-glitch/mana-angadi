import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Smartphone, 
  Tv, 
  Laptop, 
  Shirt, 
  ShoppingBag, 
  Utensils, 
  Sparkles, 
  Activity, 
  BookOpen, 
  Gamepad2, 
  Flame,
  Layers,
  Tag
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const location = useLocation();

  const navCategories = [
    { name: 'All Categories', slug: '', icon: Layers, isSpecial: false },
    { name: 'Local Handlooms', slug: 'local-products', icon: Tag, isSpecial: true, badge: 'GI Tag' },
    { name: 'Mobiles', slug: 'mobiles', icon: Smartphone, isSpecial: false },
    { name: 'Electronics', slug: 'electronics', icon: Tv, isSpecial: false },
    { name: 'Computers', slug: 'computers', icon: Laptop, isSpecial: false },
    { name: 'Fashion & Ethnic', slug: 'fashion', icon: Shirt, isSpecial: false },
    { name: 'Fresh Fruits', slug: 'fruits', icon: Sparkles, isSpecial: true, badge: 'Farm Fresh' },
    { name: 'Grocery & Spices', slug: 'grocery', icon: ShoppingBag, isSpecial: false },
    { name: 'Home & Kitchen', slug: 'home-kitchen', icon: Utensils, isSpecial: false },
    { name: 'Beauty', slug: 'beauty', icon: Sparkles, isSpecial: false },
    { name: 'Sports', slug: 'sports', icon: Activity, isSpecial: false },
    { name: 'Books', slug: 'books', icon: BookOpen, isSpecial: false },
    { name: 'Toys', slug: 'toys', icon: Gamepad2, isSpecial: false },
    { name: 'Flash Deals', slug: 'offers', icon: Flame, isSpecial: true, badge: 'Up to 70% Off' },
  ];

  return (
    <nav className="bg-white border-b border-slate-200 shadow-sm overflow-x-auto scrollbar-none sticky top-[68px] z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center space-x-1 sm:space-x-2 py-2 min-w-max">
          {navCategories.map((item) => {
            const Icon = item.icon;
            const isActive = item.slug === '' 
              ? location.pathname === '/products' && !location.search
              : location.search.includes(`category=${item.slug}`);

            return (
              <Link
                key={item.name}
                to={item.slug === '' ? '/products' : `/products?category=${item.slug}`}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition whitespace-nowrap ${
                  isActive
                    ? 'bg-brand-50 text-brand-600 border border-brand-200'
                    : item.isSpecial
                    ? 'text-brand-600 hover:bg-brand-50/60 font-bold'
                    : 'text-slate-600 hover:text-brand-600 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${item.isSpecial ? 'text-brand-500 animate-bounce' : 'text-slate-400'}`} />
                <span>{item.name}</span>
                {item.badge && (
                  <span className="bg-brand-500 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full uppercase tracking-tighter shadow-sm">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

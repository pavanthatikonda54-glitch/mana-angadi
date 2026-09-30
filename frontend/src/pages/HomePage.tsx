import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Flame, 
  ArrowRight, 
  Sparkles, 
  Clock, 
  Zap, 
  ShieldCheck, 
  ChevronRight, 
  Star, 
  Store, 
  Layers, 
  Tag, 
  CheckCircle,
  Truck,
  RotateCcw,
  Headphones
} from 'lucide-react';
import api from '../services/api.js';
import { ProductCard } from '../components/product/ProductCard.js';
import { HeroBanner, Category, FlashSale, Product, Brand } from '../types/index.js';

interface HomePageProps {
  onOpenAiChat: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onOpenAiChat }) => {
  const navigate = useNavigate();
  const [banners, setBanners] = useState<HeroBanner[]>([]);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [flashSale, setFlashSale] = useState<FlashSale | null>(null);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [localProducts, setLocalProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  // Flash Sale Countdown Timer State
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 23,
    minutes: 45,
    seconds: 18
  });

  useEffect(() => {
    // Live ticking countdown timer
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 24, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Banner autoplay
    if (banners.length > 1) {
      const bannerTimer = setInterval(() => {
        setActiveBannerIndex((prev) => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(bannerTimer);
    }
  }, [banners]);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [banRes, catRes, fsRes, featRes, localRes, brRes] = await Promise.all([
          api.get('/banners'),
          api.get('/categories'),
          api.get('/flash-sales'),
          api.get('/products?is_featured=1&limit=8'),
          api.get('/products?is_local=1&limit=8'),
          api.get('/brands')
        ]);

        if (banRes.data.success) setBanners(banRes.data.banners || []);
        if (catRes.data.success) setCategories(catRes.data.categories || []);
        if (fsRes.data.success && fsRes.data.flashSales?.length > 0) {
          setFlashSale(fsRes.data.flashSales[0]);
        }
        if (featRes.data.success) setFeaturedProducts(featRes.data.data || []);
        if (localRes.data.success) setLocalProducts(localRes.data.data || []);
        if (brRes.data.success) setBrands(brRes.data.brands || []);
      } catch (err) {
        console.error('Failed to load homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  return (
    <div className="space-y-10 pb-16">
      
      {/* 1. Hero Banner Carousel */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        {banners.length > 0 ? (
          <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-slate-900 border border-slate-800 min-h-[360px] md:min-h-[440px] flex items-center">
            {banners.map((b, idx) => (
              <div
                key={b.id}
                className={`absolute inset-0 transition-opacity duration-1000 flex items-center ${
                  idx === activeBannerIndex ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                }`}
              >
                {/* Background Image with Dark Vignette */}
                <img
                  src={b.image_url}
                  alt={b.title}
                  className="absolute inset-0 w-full h-full object-cover object-center"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-navy-950/95 via-navy-950/80 to-transparent"></div>

                {/* Banner Content */}
                <div className="relative z-10 max-w-xl p-6 sm:p-12 text-white space-y-4">
                  {b.badge_text && (
                    <span className="inline-flex items-center space-x-1.5 bg-gradient-to-r from-brand-600 to-amber-500 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>{b.badge_text}</span>
                    </span>
                  )}
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight leading-tight text-white">
                    {b.title}
                  </h1>
                  <p className="text-sm sm:text-base text-slate-200 font-medium leading-relaxed">
                    {b.subtitle}
                  </p>
                  {b.tagline && (
                    <div className="text-amber-400 font-bold text-sm tracking-wide">
                      ⚡ {b.tagline}
                    </div>
                  )}
                  <div className="pt-2 flex items-center space-x-3">
                    <Link
                      to={b.link_url}
                      className="inline-flex items-center space-x-2 bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-xl shadow-brand-500/30 hover:shadow-brand-500/50 hover:scale-105 active:scale-95 transition"
                    >
                      <span>Explore Collection</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={onOpenAiChat}
                      className="inline-flex items-center space-x-1.5 bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-xl font-semibold text-sm backdrop-blur-md transition border border-white/20"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Ask AI</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex space-x-2">
              {banners.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveBannerIndex(idx)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    idx === activeBannerIndex ? 'w-8 bg-brand-500' : 'w-2 bg-white/50 hover:bg-white'
                  }`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="h-72 bg-slate-200 animate-pulse rounded-3xl"></div>
        )}
      </section>

      {/* 2. Category Bubbles */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display">
              Popular Categories
            </h2>
            <p className="text-xs text-slate-500">Explore authentic local products, gadgets & essentials</p>
          </div>
          <Link
            to="/products"
            className="text-xs sm:text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center space-x-1"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3 sm:gap-4">
          {categories.slice(0, 14).map((c) => (
            <Link
              key={c.id}
              to={`/products?category=${c.slug}`}
              className="group flex flex-col items-center p-3 rounded-2xl bg-white border border-slate-200/80 hover:border-brand-400 hover:shadow-lg transition-all text-center"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-50 overflow-hidden mb-2 p-1 group-hover:scale-105 transition-transform">
                <img
                  src={c.image_url || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=200'}
                  alt={c.name}
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
              <span className="text-xs font-bold text-slate-800 group-hover:text-brand-600 transition line-clamp-1">
                {c.name}
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                {c.product_count ? `${c.product_count} items` : 'Explore'}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Flash Sale with Live Countdown */}
      {flashSale && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-red-600 via-brand-600 to-amber-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* Flash Sale Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 relative z-10">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-amber-300">
                  <Flame className="w-7 h-7 animate-bounce" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h2 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-white">
                      {flashSale.title}
                    </h2>
                    <span className="bg-amber-400 text-slate-900 text-xs font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                      LIVE NOW
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-amber-100 font-medium mt-0.5">
                    {flashSale.tagline || 'Massive discounts with limited stocks. Grab before it ends!'}
                  </p>
                </div>
              </div>

              {/* Countdown Tickers */}
              <div className="flex items-center space-x-2 bg-slate-950/40 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20">
                <Clock className="w-5 h-5 text-amber-300 animate-pulse" />
                <span className="text-xs font-bold text-amber-200 mr-2 uppercase tracking-wider">Ends In:</span>
                <div className="flex items-center space-x-1.5 font-mono font-bold text-sm">
                  <div className="bg-slate-900 text-amber-300 px-2.5 py-1 rounded-lg border border-slate-700">
                    {timeLeft.hours.toString().padStart(2, '0')}
                    <span className="text-[9px] block text-slate-400 font-sans font-normal">HRS</span>
                  </div>
                  <span className="text-amber-300 font-bold">:</span>
                  <div className="bg-slate-900 text-amber-300 px-2.5 py-1 rounded-lg border border-slate-700">
                    {timeLeft.minutes.toString().padStart(2, '0')}
                    <span className="text-[9px] block text-slate-400 font-sans font-normal">MIN</span>
                  </div>
                  <span className="text-amber-300 font-bold">:</span>
                  <div className="bg-slate-900 text-amber-300 px-2.5 py-1 rounded-lg border border-slate-700">
                    {timeLeft.seconds.toString().padStart(2, '0')}
                    <span className="text-[9px] block text-slate-400 font-sans font-normal">SEC</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Flash Sale Product Cards */}
            {flashSale.products && flashSale.products.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
                {flashSale.products.map((p) => {
                  const percentClaimed = Math.min(100, Math.round((p.sold_count / p.stock_limit) * 100));
                  return (
                    <div
                      key={p.id}
                      onClick={() => navigate(`/products/${p.slug || p.id}`)}
                      className="bg-white rounded-2xl p-3.5 text-slate-900 shadow-md hover:shadow-2xl transition cursor-pointer flex flex-col justify-between group"
                    >
                      <div>
                        <div className="relative pt-[80%] rounded-xl overflow-hidden bg-slate-100 mb-3">
                          <img
                            src={p.primary_image}
                            alt={p.title}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded shadow">
                            SAVE {p.discount_percent}%
                          </span>
                        </div>

                        <h4 className="font-bold text-xs sm:text-sm text-slate-800 line-clamp-2 leading-snug group-hover:text-brand-600 transition">
                          {p.title}
                        </h4>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-100">
                        <div className="flex items-baseline space-x-2">
                          <span className="text-base font-extrabold text-red-600 font-display">
                            ₹{p.special_price.toLocaleString('en-IN')}
                          </span>
                          <span className="text-xs text-slate-400 line-through">
                            ₹{p.mrp.toLocaleString('en-IN')}
                          </span>
                        </div>

                        {/* Stock Progress Bar */}
                        <div className="mt-2 space-y-1">
                          <div className="flex justify-between text-[10px] text-slate-500 font-semibold">
                            <span>Claimed: {percentClaimed}%</span>
                            <span className="text-red-600 font-bold">{p.stock_limit - p.sold_count} left</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div
                              className="bg-gradient-to-r from-amber-500 to-red-600 h-full rounded-full transition-all duration-500"
                              style={{ width: `${percentClaimed}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* 4. Local Artisan & GI-Tagged Handloom Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 border border-amber-200/70 rounded-3xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-md">
                <Store className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-xl sm:text-2xl font-black font-display text-slate-900">
                    Local & Artisan Handlooms
                  </h2>
                  <span className="bg-amber-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase">
                    Telangana & AP Pride
                  </span>
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  Direct from verified master weavers in Pochampally, Gadwal & Machilipatnam
                </p>
              </div>
            </div>

            <Link
              to="/products?is_local=1"
              className="text-xs sm:text-sm font-bold text-amber-800 hover:text-amber-900 bg-amber-200/60 px-4 py-2 rounded-xl flex items-center space-x-1.5 self-start sm:self-auto transition"
            >
              <span>Explore All Artisans</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {localProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* 5. Trending Marketplace Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 font-display">
              Trending & Top Recommended
            </h2>
            <p className="text-xs text-slate-500">Highest rated mobiles, laptops, audio & organic groceries</p>
          </div>
          <Link
            to="/products"
            className="text-xs sm:text-sm font-bold text-brand-600 hover:text-brand-700 flex items-center space-x-1"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {featuredProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* 6. Top Brands Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg sm:text-xl font-bold font-display">Authorized National & Local Brands</h3>
              <p className="text-xs text-slate-400">100% Genuine brand warranties and certified authenticity</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {brands.slice(0, 6).map((b) => (
              <Link
                key={b.id}
                to={`/products?brand=${b.slug}`}
                className="bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-2xl p-4 flex flex-col items-center justify-center text-center transition group"
              >
                <div className="w-12 h-12 rounded-xl overflow-hidden mb-2 bg-slate-900 p-1">
                  <img
                    src={b.logo_url || 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=100'}
                    alt={b.name}
                    className="w-full h-full object-cover rounded-lg group-hover:scale-110 transition-transform"
                  />
                </div>
                <span className="text-xs font-bold text-slate-200 group-hover:text-brand-400 transition truncate w-full">
                  {b.name}
                </span>
                <span className="text-[10px] text-slate-500">Verified Brand</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 7. AI Assistant Floating CTA Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-navy-950 border border-slate-800 rounded-3xl p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <span className="inline-flex items-center space-x-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>Smart Indian Shopping Engine</span>
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
              Can’t decide what to buy? Ask MaNa AI!
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Tell our AI what you need and your budget (e.g. “Best laptop under ₹50,000 for programming” or “Pure silk sarees for wedding”). We recommend actual in-stock products instantly.
            </p>
          </div>

          <button
            onClick={onOpenAiChat}
            className="flex-shrink-0 bg-gradient-to-r from-brand-500 to-amber-500 hover:from-brand-600 hover:to-amber-600 text-white font-bold px-8 py-4 rounded-2xl shadow-xl shadow-brand-500/30 hover:scale-105 active:scale-95 transition flex items-center space-x-2 text-sm"
          >
            <Sparkles className="w-5 h-5" />
            <span>Launch MaNa AI Assistant</span>
          </button>
        </div>
      </section>

    </div>
  );
};

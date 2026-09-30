import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Filter, 
  SlidersHorizontal, 
  ChevronDown, 
  Star, 
  X, 
  Sparkles, 
  Check, 
  RotateCcw, 
  Layers, 
  Grid, 
  List,
  Store
} from 'lucide-react';
import api from '../services/api.js';
import { ProductCard } from '../components/product/ProductCard.js';
import { Product, Category, Brand } from '../types/index.js';

export const ProductListingPage: React.FC<{ onOpenAiChat?: () => void }> = ({ onOpenAiChat }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Filter States
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number>(80000);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [minDiscount, setMinDiscount] = useState<number | null>(null);
  const [isLocalOnly, setIsLocalOnly] = useState<boolean>(false);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('relevance');
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Sync state with URL Search Params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get('category') || '';
    const q = params.get('q') || '';
    const brand = params.get('brand') || '';
    const isLocal = params.get('is_local') === '1';

    setSelectedCategory(cat);
    if (brand) setSelectedBrands(brand.split(','));
    else setSelectedBrands([]);
    setIsLocalOnly(isLocal);
  }, [location.search]);

  // Fetch Categories & Brands once
  useEffect(() => {
    Promise.all([api.get('/categories'), api.get('/brands')]).then(([catRes, brRes]) => {
      if (catRes.data.success) setCategories(catRes.data.categories || []);
      if (brRes.data.success) setBrands(brRes.data.brands || []);
    }).catch(() => {});
  }, []);

  // Fetch Products whenever filters or query change
  useEffect(() => {
    const fetchFilteredProducts = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams(location.search);
        
        let url = `/products?sort=${sortBy}&max_price=${priceRange}`;
        
        const q = params.get('q');
        if (q) url += `&q=${encodeURIComponent(q)}`;

        if (selectedCategory) url += `&category=${selectedCategory}`;
        if (selectedBrands.length > 0) url += `&brand=${selectedBrands.join(',')}`;
        if (minRating) url += `&min_rating=${minRating}`;
        if (minDiscount) url += `&min_discount=${minDiscount}`;
        if (isLocalOnly) url += `&is_local=1`;
        if (inStockOnly) url += `&in_stock=1`;

        const res = await api.get(url);
        if (res.data.success) {
          setProducts(res.data.data || []);
          setTotalCount(res.data.pagination?.total || 0);
        }
      } catch (err) {
        console.error('Failed to fetch filtered products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredProducts();
  }, [location.search, selectedCategory, selectedBrands, priceRange, minRating, minDiscount, isLocalOnly, inStockOnly, sortBy]);

  const toggleBrand = (brandSlug: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brandSlug) ? prev.filter((b) => b !== brandSlug) : [...prev, brandSlug]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategory('');
    setSelectedBrands([]);
    setPriceRange(80000);
    setMinRating(null);
    setMinDiscount(null);
    setIsLocalOnly(false);
    setInStockOnly(false);
    setSortBy('relevance');
    navigate('/products');
  };

  const searchParams = new URLSearchParams(location.search);
  const currentQuery = searchParams.get('q');

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      
      {/* Search Header Banner & AI Filter Extractor notice */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-display">
              {currentQuery ? `Search Results for "${currentQuery}"` : selectedCategory ? `${selectedCategory.toUpperCase()} Products` : 'All Products Catalog'}
            </h1>
            <span className="text-xs bg-slate-100 text-slate-600 font-bold px-2.5 py-0.5 rounded-full border border-slate-200">
              {totalCount} Items
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Browse verified Indian marketplace listings with authentic brand warranties & GI handloom certifications.
          </p>
        </div>

        {/* Sort & Mobile Filter Toggle */}
        <div className="flex items-center space-x-3 self-end md:self-auto">
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="md:hidden flex items-center space-x-1.5 bg-slate-900 text-white px-3.5 py-2 rounded-xl text-xs font-semibold"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-500 font-semibold hidden sm:inline">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-slate-50 border border-slate-300 text-slate-800 font-semibold px-3 py-2 rounded-xl focus:outline-none focus:border-brand-500 text-xs"
            >
              <option value="relevance">Relevance / Featured</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Customer Rating</option>
              <option value="discount">Biggest Discount %</option>
              <option value="newest">Newest Arrivals</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
        
        {/* Filter Sidebar (Desktop & Mobile Drawer) */}
        <aside
          className={`bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-6 ${
            showMobileFilters ? 'fixed inset-4 z-50 overflow-y-auto bg-white shadow-2xl block' : 'hidden md:block'
          }`}
        >
          {showMobileFilters && (
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <span className="font-bold text-slate-900">Filters</span>
              <button onClick={() => setShowMobileFilters(false)} className="p-1 rounded-lg hover:bg-slate-100">
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          )}

          {/* Header with Clear Button */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-1.5 text-slate-900 font-bold text-sm">
              <Filter className="w-4 h-4 text-brand-500" />
              <span>Filters</span>
            </div>
            <button
              onClick={clearAllFilters}
              className="text-xs text-brand-600 hover:text-brand-700 font-bold flex items-center space-x-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">Category</h4>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              <button
                onClick={() => setSelectedCategory('')}
                className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg font-medium transition ${
                  selectedCategory === '' ? 'bg-brand-50 text-brand-600 font-bold' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                All Categories
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.slug)}
                  className={`w-full text-left text-xs px-2.5 py-1.5 rounded-lg flex items-center justify-between transition ${
                    selectedCategory === c.slug ? 'bg-brand-50 text-brand-600 font-bold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">{c.name}</span>
                  {c.product_count !== undefined && (
                    <span className="text-[10px] text-slate-400 font-normal">({c.product_count})</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Max Price</h4>
              <span className="text-xs font-extrabold text-brand-600 font-mono">
                ₹{priceRange.toLocaleString('en-IN')}
              </span>
            </div>
            <input
              type="range"
              min={500}
              max={80000}
              step={500}
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
              className="w-full accent-brand-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono mt-1">
              <span>₹500</span>
              <span>₹80,000+</span>
            </div>
          </div>

          {/* Local Artisan & Handloom Filter */}
          <div className="pt-2 border-t border-slate-100">
            <label className="flex items-center space-x-2.5 cursor-pointer bg-amber-50/70 p-2 rounded-xl border border-amber-200">
              <input
                type="checkbox"
                checked={isLocalOnly}
                onChange={(e) => setIsLocalOnly(e.target.checked)}
                className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500"
              />
              <div className="text-xs">
                <span className="font-bold text-amber-900 block">Local GI Handlooms</span>
                <span className="text-[10px] text-amber-700">Direct artisan weaves</span>
              </div>
            </label>
          </div>

          {/* Customer Rating */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Customer Rating</h4>
            <div className="space-y-1 text-xs">
              {[4, 3, 2].map((r) => (
                <button
                  key={r}
                  onClick={() => setMinRating(minRating === r ? null : r)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition ${
                    minRating === r ? 'bg-emerald-50 text-emerald-700 font-bold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center space-x-1">
                    <span>{r}★ & above</span>
                  </div>
                  {minRating === r && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* Minimum Discount */}
          <div className="pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Discount</h4>
            <div className="space-y-1 text-xs">
              {[50, 30, 20, 10].map((d) => (
                <button
                  key={d}
                  onClick={() => setMinDiscount(minDiscount === d ? null : d)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between transition ${
                    minDiscount === d ? 'bg-brand-50 text-brand-600 font-bold' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{d}% off or more</span>
                  {minDiscount === d && <Check className="w-3.5 h-3.5 text-brand-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* Brands */}
          {brands.length > 0 && (
            <div className="pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Brands</h4>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {brands.map((b) => (
                  <label key={b.id} className="flex items-center space-x-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedBrands.includes(b.slug)}
                      onChange={() => toggleBrand(b.slug)}
                      className="w-3.5 h-3.5 rounded text-brand-500 focus:ring-brand-500"
                    />
                    <span className="truncate">{b.name}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {showMobileFilters && (
            <button
              onClick={() => setShowMobileFilters(false)}
              className="w-full bg-brand-500 text-white font-bold py-2.5 rounded-xl text-xs mt-4"
            >
              Apply Filters
            </button>
          )}
        </aside>

        {/* Product Grid */}
        <main className="md:col-span-3">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="bg-white rounded-2xl p-4 border border-slate-200 animate-pulse space-y-3">
                  <div className="bg-slate-200 pt-[80%] rounded-xl"></div>
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center mx-auto">
                <Layers className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">No matching products found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                We couldn’t find any items matching your active filter criteria. Try clearing some filters or ask our AI assistant.
              </p>
              <div className="flex justify-center space-x-3 pt-2">
                <button
                  onClick={clearAllFilters}
                  className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-semibold hover:bg-slate-800 transition"
                >
                  Clear All Filters
                </button>
                {onOpenAiChat && (
                  <button
                    onClick={onOpenAiChat}
                    className="bg-brand-500 text-white px-5 py-2.5 rounded-xl text-xs font-semibold hover:bg-brand-600 transition flex items-center space-x-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Ask MaNa AI</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </main>

      </div>
    </div>
  );
};

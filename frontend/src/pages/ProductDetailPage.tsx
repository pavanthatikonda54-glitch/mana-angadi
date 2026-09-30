import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Star, 
  Heart, 
  ShoppingCart, 
  Zap, 
  Truck, 
  RotateCcw, 
  ShieldCheck, 
  MapPin, 
  Check, 
  Plus, 
  Minus, 
  Share2, 
  Tag, 
  Store, 
  ThumbsUp, 
  MessageSquare,
  Sparkles,
  Award
} from 'lucide-react';
import api from '../services/api.js';
import { Product, ProductVariant } from '../types/index.js';
import { useCart } from '../context/CartContext.js';
import { useWishlist } from '../context/WishlistContext.js';
import { useAuth } from '../context/AuthContext.js';
import { ProductCard } from '../components/product/ProductCard.js';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, checkPincode, selectedPincode } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [pincodeInput, setPincodeInput] = useState(selectedPincode.pincode);
  const [pincodeResult, setPincodeResult] = useState<any>(selectedPincode);
  const [isAdding, setIsAdding] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);

  // Review submission state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/products/${id}`);
      if (res.data.success && res.data.product) {
        setProduct(res.data.product);
        if (res.data.product.variants && res.data.product.variants.length > 0) {
          setSelectedVariant(res.data.product.variants[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load product details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const res = checkPincode(pincodeInput);
    setPincodeResult(res);
  };

  const handleAddToCart = async () => {
    if (!product) return;
    setIsAdding(true);
    const res = await addToCart(product.id, selectedVariant?.id, quantity);
    setIsAdding(false);
    if (res.success) {
      setAddSuccess(true);
      setTimeout(() => setAddSuccess(false), 2000);
    }
  };

  const handleBuyNow = () => {
    if (!product) return;
    const effectivePrice = product.price + (selectedVariant?.price_delta || 0);
    const effectiveMrp = product.mrp + (selectedVariant?.price_delta || 0);
    const directItem = {
      product_id: product.id,
      variant_id: selectedVariant?.id || null,
      quantity,
      title: product.title + (selectedVariant ? ` (${selectedVariant.variant_value})` : ''),
      effective_price: effectivePrice,
      price: effectivePrice,
      mrp: effectiveMrp,
      item_total: effectivePrice * quantity,
      primary_image: images[0]?.image_url || product.primary_image || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=400',
      seller_id: product.seller_id,
      seller_name: product.seller_name
    };
    navigate('/checkout', { state: { directItem } });
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !reviewComment.trim()) return;
    setReviewSubmitting(true);
    try {
      const res = await api.post('/reviews', {
        product_id: product.id,
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment
      });
      if (res.data.success) {
        setReviewSuccess(true);
        setTimeout(() => {
          setShowReviewModal(false);
          setReviewSuccess(false);
          fetchProduct();
        }, 1500);
      }
    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="bg-slate-200 aspect-square rounded-3xl animate-pulse"></div>
          <div className="space-y-4">
            <div className="h-8 bg-slate-200 rounded w-3/4 animate-pulse"></div>
            <div className="h-6 bg-slate-200 rounded w-1/4 animate-pulse"></div>
            <div className="h-24 bg-slate-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold">Product Not Found</h2>
        <Link to="/products" className="text-brand-600 font-bold hover:underline">Return to Marketplace</Link>
      </div>
    );
  }

  const effectivePrice = product.price + (selectedVariant?.price_delta || 0);
  const effectiveMrp = product.mrp + (selectedVariant?.price_delta || 0);
  const savings = Math.max(0, effectiveMrp - effectivePrice);
  const inWishlist = isInWishlist(product.id);

  const images = product.images && product.images.length > 0 
    ? product.images 
    : [{ id: '1', image_url: product.primary_image || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800', is_primary: 1 }];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-12">
      
      {/* Breadcrumb */}
      <nav className="text-xs text-slate-500 flex items-center space-x-2">
        <Link to="/" className="hover:text-brand-600">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-brand-600">Products</Link>
        <span>/</span>
        <Link to={`/products?category=${product.category_slug}`} className="hover:text-brand-600 font-semibold">{product.category_name}</Link>
        <span>/</span>
        <span className="text-slate-800 font-medium truncate max-w-[200px]">{product.title}</span>
      </nav>

      {/* Main Product Details Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left: Gallery (5 cols) */}
        <div className="lg:col-span-5 space-y-4 sticky top-28">
          <div className="relative bg-white rounded-3xl border border-slate-200/80 overflow-hidden pt-[100%] shadow-sm group">
            <img
              src={images[selectedImageIndex]?.image_url}
              alt={product.title}
              className="absolute inset-0 w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500 cursor-zoom-in"
            />
            {product.discount_percent > 0 && (
              <span className="absolute top-4 left-4 bg-emerald-600 text-white text-xs font-black px-2.5 py-1 rounded-lg uppercase tracking-wider shadow">
                {product.discount_percent}% OFF
              </span>
            )}
            <button
              onClick={() => toggleWishlist(product.id)}
              className="absolute top-4 right-4 p-2.5 rounded-full bg-white/90 backdrop-blur-md shadow hover:bg-white text-slate-400 hover:text-rose-500 transition"
            >
              <Heart className={`w-5 h-5 ${inWishlist ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-none">
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-16 h-16 rounded-xl border-2 overflow-hidden flex-shrink-0 bg-white p-1 transition ${
                    selectedImageIndex === idx ? 'border-brand-500 ring-2 ring-brand-500/20' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img src={img.image_url} alt="" className="w-full h-full object-cover rounded-lg" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info & Actions (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Brand & Header */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-1 rounded-md border border-brand-200">
                {product.brand_name || 'MaNa Angadi Verified'}
              </span>
              {product.is_local === 1 && (
                <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-md flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                  <span>GI Certified Handloom</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-display leading-snug">
              {product.title}
            </h1>

            {/* Rating Stars & Reviews */}
            <div className="flex items-center space-x-3 pt-1">
              <div className="flex items-center space-x-1 bg-emerald-700 text-white px-2 py-0.5 rounded-lg text-xs font-bold">
                <span>{product.rating ? product.rating.toFixed(1) : '4.8'}</span>
                <Star className="w-3 h-3 fill-white" />
              </div>
              <span className="text-xs font-semibold text-slate-500">
                {product.review_count || 142} Verified Buyer Ratings & Reviews
              </span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
            <div className="flex items-baseline space-x-3">
              <span className="text-3xl font-black text-slate-900 font-display">
                ₹{effectivePrice.toLocaleString('en-IN')}
              </span>
              {effectiveMrp > effectivePrice && (
                <>
                  <span className="text-base text-slate-400 line-through">
                    ₹{effectiveMrp.toLocaleString('en-IN')}
                  </span>
                  <span className="text-sm font-bold text-emerald-600">
                    Save ₹{savings.toLocaleString('en-IN')} ({product.discount_percent}% off)
                  </span>
                </>
              )}
            </div>
            <div className="text-[11px] text-slate-500 font-medium">Inclusive of all taxes • Free Delivery on orders above ₹499</div>
          </div>

          {/* Bank & Coupon Offers */}
          <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200/80 space-y-2">
            <div className="flex items-center space-x-1.5 text-xs font-bold text-amber-900">
              <Tag className="w-4 h-4 text-brand-600" />
              <span>Available Marketplace Offers</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200/60">
                <span className="font-bold text-brand-600">MANA10</span>: Flat 10% instant discount on orders over ₹999.
              </div>
              <div className="bg-white/80 p-2.5 rounded-xl border border-amber-200/60">
                <span className="font-bold text-brand-600">FESTIVAL500</span>: Special ₹500 off on handlooms & electronics over ₹2,999.
              </div>
            </div>
          </div>

          {/* Variants Selector (Color/Size/Storage) */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                Select Option: <span className="text-brand-600">{selectedVariant?.variant_value}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition ${
                      selectedVariant?.id === v.id
                        ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm ring-1 ring-brand-500'
                        : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                    }`}
                  >
                    <span>{v.variant_value}</span>
                    {v.price_delta !== 0 && (
                      <span className="ml-1.5 text-[10px] text-slate-500">
                        ({v.price_delta > 0 ? `+₹${v.price_delta}` : `-₹${Math.abs(v.price_delta)}`})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & CTA Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1 border border-slate-300 rounded-xl bg-white p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center text-xs font-bold font-mono">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="text-xs font-semibold text-emerald-600 flex items-center space-x-1">
                <Check className="w-4 h-4" />
                <span>In Stock ({product.stock} units available)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={handleAddToCart}
                disabled={isAdding}
                className={`py-3.5 px-6 rounded-2xl font-bold text-sm shadow-md transition flex items-center justify-center space-x-2 ${
                  addSuccess
                    ? 'bg-emerald-600 text-white'
                    : 'bg-brand-500 hover:bg-brand-600 text-white active:scale-95'
                }`}
              >
                {addSuccess ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                <span>{addSuccess ? 'Added to Cart!' : 'Add to Cart'}</span>
              </button>

              <button
                onClick={handleBuyNow}
                className="py-3.5 px-6 rounded-2xl font-bold text-sm bg-navy-950 hover:bg-slate-800 text-white shadow-md active:scale-95 transition flex items-center justify-center space-x-2"
              >
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Buy Now with 1-Click</span>
              </button>
            </div>
          </div>

          {/* Indian Pincode Delivery Availability Checker */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 space-y-3">
            <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
              <MapPin className="w-4 h-4 text-brand-600" />
              <span>Delivery & Pincode Checker</span>
            </div>

            <form onSubmit={handlePincodeCheck} className="flex space-x-2">
              <input
                type="text"
                maxLength={6}
                value={pincodeInput}
                onChange={(e) => setPincodeInput(e.target.value)}
                placeholder="Enter 6-digit Pincode"
                className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-brand-500"
              />
              <button
                type="submit"
                className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition"
              >
                Check
              </button>
            </form>

            {pincodeResult && (
              <div className="text-xs space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <div className="font-bold text-emerald-700 flex items-center space-x-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Delivery available to {pincodeResult.city} ({pincodeResult.pincode})</span>
                </div>
                <div className="text-slate-600 text-[11px]">
                  Estimated delivery in {pincodeResult.estimatedDays} {pincodeResult.estimatedDays === 1 ? 'day' : 'days'} ({pincodeResult.deliveryType}) • Cash on Delivery supported.
                </div>
              </div>
            )}
          </div>

          {/* Seller Information Card */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 flex items-center justify-center">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-semibold">Sold & Fulfilled by</div>
                <div className="text-sm font-bold text-slate-900">{product.seller_name || 'Authorized Seller'}</div>
                <div className="text-[11px] text-slate-500">{product.seller_address || 'Pochampally Hub, Telangana'}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center space-x-1 bg-emerald-600 text-white px-2 py-0.5 rounded text-xs font-bold">
                <span>{product.seller_rating ? product.seller_rating.toFixed(1) : '4.8'}</span>
                <Star className="w-3 h-3 fill-white" />
              </div>
              <div className="text-[10px] text-slate-400 font-semibold mt-0.5">Seller Rating</div>
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center space-x-2 p-3 bg-white rounded-xl border border-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{product.warranty_info || '1 Year Brand Warranty'}</span>
            </div>
            <div className="flex items-center space-x-2 p-3 bg-white rounded-xl border border-slate-200">
              <RotateCcw className="w-4 h-4 text-brand-600 flex-shrink-0" />
              <span>{product.return_policy_days}-Day Replacement & Return</span>
            </div>
          </div>

        </div>

      </div>

      {/* Specifications & Description Tabs */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-8 shadow-sm">
        <div>
          <h3 className="text-lg font-bold text-slate-900 mb-3 font-display">Product Description</h3>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
            {product.description}
          </p>
        </div>

        {/* Specifications Table */}
        {product.specs && product.specs.length > 0 && (
          <div>
            <h3 className="text-lg font-bold text-slate-900 mb-4 font-display">Technical Specifications</h3>
            <div className="border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-200">
              {product.specs.map((s, idx) => (
                <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 p-3.5 text-xs">
                  <span className="font-bold text-slate-500">{s.spec_name}</span>
                  <span className="sm:col-span-2 text-slate-900 font-medium">{s.spec_value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Verified Customer Reviews */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-display">Customer Ratings & Verified Reviews</h3>
            <p className="text-xs text-slate-500">Real feedback from verified purchasers across India</p>
          </div>
          <button
            onClick={() => setShowReviewModal(true)}
            className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition self-start sm:self-auto"
          >
            Write a Review
          </button>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {product.reviews && product.reviews.length > 0 ? (
            product.reviews.map((r) => (
              <div key={r.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-0.5 bg-emerald-700 text-white px-1.5 py-0.5 rounded text-[11px] font-bold">
                      <span>{r.rating}</span>
                      <Star className="w-2.5 h-2.5 fill-white" />
                    </div>
                    <span className="font-bold text-xs text-slate-900">{r.title || 'Verified Purchase'}</span>
                  </div>
                  {r.is_verified_purchase === 1 && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center space-x-1">
                      <Check className="w-3 h-3" />
                      <span>Verified Buyer</span>
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">{r.comment}</p>
                <div className="text-[10px] text-slate-400 font-medium">
                  By {r.author_name || 'Verified Customer'} on {new Date(r.created_at).toLocaleDateString('en-IN')}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-xs text-slate-400">
              No reviews yet. Be the first verified customer to write a review!
            </div>
          )}
        </div>
      </div>

      {/* Similar Products */}
      {product.similarProducts && product.similarProducts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-slate-900 font-display">Similar Products in {product.category_name}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {product.similarProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-base font-display">Rate & Review Product</h3>
              <button onClick={() => setShowReviewModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            {reviewSuccess ? (
              <div className="p-6 text-center space-y-2 bg-emerald-50 rounded-2xl text-emerald-800">
                <Check className="w-8 h-8 mx-auto text-emerald-600" />
                <div className="font-bold">Review Submitted!</div>
                <div className="text-xs">Thank you for sharing your feedback with the MaNa Angadi community.</div>
              </div>
            ) : (
              <form onSubmit={handleReviewSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold block mb-1">Your Rating</label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className={`p-2 rounded-lg border flex items-center space-x-1 ${
                          reviewRating >= star ? 'bg-amber-500 text-white border-amber-500' : 'bg-slate-50 text-slate-400'
                        }`}
                      >
                        <span>{star}</span>
                        <Star className="w-3.5 h-3.5 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-bold block mb-1">Review Headline</label>
                  <input
                    type="text"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    placeholder="e.g. Excellent build quality and fast delivery!"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Detailed Review</label>
                  <textarea
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Describe what you liked, product performance, material, or fit..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                    required
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowReviewModal(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-5 py-2 rounded-xl shadow"
                  >
                    {reviewSubmitting ? 'Publishing...' : 'Submit Review'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

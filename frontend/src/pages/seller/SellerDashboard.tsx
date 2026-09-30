import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Store, 
  Package, 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Plus, 
  CheckCircle, 
  Clock, 
  RotateCcw, 
  Star, 
  Edit3, 
  Trash2, 
  Layers, 
  AlertCircle,
  Truck,
  ArrowRight
} from 'lucide-react';
import api from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';

export const SellerDashboard: React.FC = () => {
  const { user } = useAuth();

  const [metrics, setMetrics] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'products' | 'returns'>('overview');
  const [loading, setLoading] = useState(true);

  // Add Product Modal
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: '',
    category_id: '',
    description: '',
    short_description: '',
    price: '',
    mrp: '',
    stock: '15',
    warranty_info: '1 Year Brand Warranty',
    return_policy_days: '7',
    is_local: 0,
    images: ['https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800']
  });
  const [creatingProduct, setCreatingProduct] = useState(false);

  const fetchSellerData = async () => {
    try {
      setLoading(true);
      const [metRes, ordRes, prodRes, catRes] = await Promise.all([
        api.get('/seller/dashboard'),
        api.get('/seller/orders'),
        api.get('/seller/products'),
        api.get('/categories')
      ]);

      if (metRes.data.success) setMetrics(metRes.data.metrics);
      if (ordRes.data.success) setOrders(ordRes.data.orders || []);
      if (prodRes.data.success) setProducts(prodRes.data.products || []);
      if (catRes.data.success) setCategories(catRes.data.categories || []);
    } catch (err) {
      console.error('Failed to load seller dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellerData();
  }, []);

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      const res = await api.put(`/seller/orders/${orderId}/status`, { status });
      if (res.data.success) {
        fetchSellerData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.title || !newProduct.category_id || !newProduct.price || !newProduct.mrp) return;
    setCreatingProduct(true);
    try {
      const res = await api.post('/products', newProduct);
      if (res.data.success) {
        setShowAddProduct(false);
        setNewProduct({
          title: '',
          category_id: '',
          description: '',
          short_description: '',
          price: '',
          mrp: '',
          stock: '15',
          warranty_info: '1 Year Brand Warranty',
          return_policy_days: '7',
          is_local: 0,
          images: ['https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=800']
        });
        await fetchSellerData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create product listing.');
    } finally {
      setCreatingProduct(false);
    }
  };

  if (loading && !metrics) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-xs text-slate-500 font-semibold">Loading seller portal...</p>
      </div>
    );
  }

  const profile = metrics?.profile || user?.sellerProfile;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Seller Header Banner */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-navy-950 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl border border-amber-900/40">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-brand-500 p-0.5 flex items-center justify-center shadow-lg">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-amber-400">
              <Store className="w-8 h-8" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-black font-display text-white">
                {profile?.store_name || 'Seller Store Portal'}
              </h1>
              <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                profile?.is_approved ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                {profile?.is_approved ? 'Verified Merchant' : 'Approval Pending'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Commission Rate: <strong>{profile?.commission_rate || 7.5}%</strong> • Store Rating: <strong>{profile?.rating || 4.8}★</strong>
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddProduct(true)}
          className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-5 py-3 rounded-2xl text-xs shadow-lg transition flex items-center space-x-2 flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product Listing</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Gross Sales</div>
          <div className="text-2xl font-black text-slate-900 font-display">
            ₹{(metrics?.grossSales || 142500).toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold">Total marketplace sales</div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Net Earnings</div>
          <div className="text-2xl font-black text-emerald-600 font-display">
            ₹{(metrics?.totalEarnings || 131812).toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-slate-500 font-semibold">Disbursed to bank</div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Orders</div>
          <div className="text-2xl font-black text-slate-900 font-display">
            {metrics?.totalOrders || orders.length}
          </div>
          <div className="text-[10px] text-amber-600 font-semibold">{metrics?.pendingOrders || 1} pending processing</div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Active Listings</div>
          <div className="text-2xl font-black text-slate-900 font-display">
            {metrics?.totalProducts || products.length}
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold">In marketplace catalog</div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex space-x-2 border-b border-slate-200 pb-2">
        {[
          { id: 'overview', label: 'Overview & Charts' },
          { id: 'orders', label: `Orders Queue (${orders.length})` },
          { id: 'products', label: `Products Inventory (${products.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: Overview & Sales Chart */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Monthly Sales Growth Bar Chart (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500">Monthly Revenue Growth (INR)</h3>
            <div className="h-48 flex items-end justify-between gap-4 pt-6 pb-2 px-4 border-b border-slate-100">
              {[
                { month: 'Apr', sales: 42000, height: '35%' },
                { month: 'May', sales: 68000, height: '52%' },
                { month: 'Jun', sales: 94000, height: '70%' },
                { month: 'Jul', sales: 112000, height: '84%' },
                { month: 'Aug', sales: 142500, height: '100%' },
              ].map((m) => (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] font-bold text-slate-600 group-hover:text-brand-600 font-mono">
                    ₹{(m.sales / 1000).toFixed(0)}k
                  </span>
                  <div
                    className="w-full max-w-[48px] bg-gradient-to-t from-brand-600 to-amber-400 rounded-t-xl transition-all duration-500 group-hover:opacity-90 shadow"
                    style={{ height: m.height }}
                  ></div>
                  <span className="text-xs font-bold text-slate-700">{m.month}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Store Info & Bank Disbursal (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500">Store Profile</h3>
            <div className="space-y-3 text-xs text-slate-600">
              <div>
                <span className="font-bold text-slate-800 block">Business Address:</span>
                <span>{profile?.business_address || 'Plot 42, Weavers Colony, Pochampally, Telangana'}</span>
              </div>
              <div>
                <span className="font-bold text-slate-800 block">GST Number:</span>
                <span className="font-mono font-bold text-slate-800">{profile?.gst_number || '36AAAAA0000A1Z5'}</span>
              </div>
              <div>
                <span className="font-bold text-slate-800 block">Settlement Bank Account:</span>
                <span className="font-mono">{profile?.bank_account || 'HDFC000123456789 (Verified)'}</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: Orders Queue */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500">Fulfillment Pipeline</h3>
          
          <div className="divide-y divide-slate-100">
            {orders.map((ord) => (
              <div key={ord.id} className="py-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-mono font-bold text-sm text-slate-900">{ord.order_number}</span>
                    <span className="text-xs text-slate-400 ml-2">Delivering to {ord.recipient_name} ({ord.city})</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="bg-brand-100 text-brand-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                      {ord.status}
                    </span>
                    <span className="font-black text-sm text-slate-900 font-display">
                      Net: ₹{ord.seller_earnings ? ord.seller_earnings.toFixed(2) : ord.total_amount}
                    </span>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-1 text-xs text-slate-700">
                  {ord.items?.map((it: any) => (
                    <div key={it.id} className="flex justify-between">
                      <span>• {it.product_title} × {it.quantity}</span>
                      <span className="font-mono font-bold">₹{it.total_price}</span>
                    </div>
                  ))}
                </div>

                {/* Fulfillment Actions */}
                <div className="pt-2 flex items-center space-x-2">
                  {ord.status === 'Order Placed' && (
                    <button
                      onClick={() => handleUpdateOrderStatus(ord.id, 'Seller Confirmed')}
                      className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-4 py-1.5 rounded-xl text-xs shadow"
                    >
                      Confirm Order
                    </button>
                  )}
                  {ord.status === 'Seller Confirmed' && (
                    <button
                      onClick={() => handleUpdateOrderStatus(ord.id, 'Packed')}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-1.5 rounded-xl text-xs shadow"
                    >
                      Mark as Packed
                    </button>
                  )}
                  {ord.status === 'Packed' && (
                    <span className="text-xs font-semibold text-emerald-600 flex items-center space-x-1">
                      <CheckCircle className="w-4 h-4" />
                      <span>Package ready for Delivery Partner pickup</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Products Inventory */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500">Your Product Catalog</h3>
            <button
              onClick={() => setShowAddProduct(true)}
              className="bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add Listing</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => (
              <div key={p.id} className="p-4 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-3 bg-slate-50/50">
                <div className="flex space-x-3">
                  <img
                    src={p.primary_image || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=200'}
                    alt={p.title}
                    className="w-16 h-16 rounded-xl object-cover bg-slate-100 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-900 line-clamp-2 leading-tight">{p.title}</div>
                    <div className="text-[11px] text-brand-600 font-bold mt-1">₹{p.price.toLocaleString('en-IN')}</div>
                    <div className="text-[10px] text-slate-500 font-semibold">Stock: {p.stock} units</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                  <span className={`font-bold text-[10px] px-2 py-0.5 rounded-full ${
                    p.stock > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {p.stock > 0 ? 'ACTIVE IN MARKETPLACE' : 'OUT OF STOCK'}
                  </span>
                  <Link to={`/products/${p.slug || p.id}`} className="text-brand-600 font-bold hover:underline">
                    View Live →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <h3 className="font-bold text-base text-slate-900 font-display">Create New Product Listing</h3>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Product Title</label>
                <input
                  type="text"
                  value={newProduct.title}
                  onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                  placeholder="e.g. Pure Pochampally Ikkat Silk Saree (Gold Border)"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Category</label>
                  <select
                    value={newProduct.category_id}
                    onChange={(e) => setNewProduct({ ...newProduct, category_id: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold block mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    placeholder="e.g. 8499"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Original MRP (₹)</label>
                  <input
                    type="number"
                    value={newProduct.mrp}
                    onChange={(e) => setNewProduct({ ...newProduct, mrp: e.target.value })}
                    placeholder="e.g. 12999"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  placeholder="Material, weave technique, dimensions, care instructions..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Product Image URL</label>
                <input
                  type="text"
                  value={newProduct.images[0]}
                  onChange={(e) => setNewProduct({ ...newProduct, images: [e.target.value] })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono text-[11px]"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="isLocal"
                  checked={newProduct.is_local === 1}
                  onChange={(e) => setNewProduct({ ...newProduct, is_local: e.target.checked ? 1 : 0 })}
                  className="rounded text-brand-500"
                />
                <label htmlFor="isLocal" className="font-semibold text-amber-900">
                  Tag as Authentic Local Artisan / Handloom (GI Certified)
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddProduct(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingProduct}
                  className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-5 py-2 rounded-xl shadow"
                >
                  {creatingProduct ? 'Publishing...' : 'List in Marketplace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

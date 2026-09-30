import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Store, 
  Package, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  Settings, 
  Tag, 
  Layers, 
  TrendingUp, 
  Truck,
  Plus,
  Edit2,
  Trash2,
  Search,
  Check,
  UserCheck,
  UserX,
  Phone,
  Mail,
  RefreshCw
} from 'lucide-react';
import api from '../../services/api.js';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [sellers, setSellers] = useState<any[]>([]);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [deliveryPartners, setDeliveryPartners] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [settings, setSettings] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'delivery' | 'sellers' | 'orders' | 'settings'>('products');
  const [loading, setLoading] = useState(true);

  // Settings form state
  const [commissionRate, setCommissionRate] = useState('8.5');
  const [freeShippingLimit, setFreeShippingLimit] = useState('499');

  // Product Search & Filter
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');

  // Edit Product Modal State
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [editPrice, setEditPrice] = useState('');
  const [editMrp, setEditMrp] = useState('');
  const [editStock, setEditStock] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  // Add Product Modal State
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('cat_fruits');
  const [newPrice, setNewPrice] = useState('');
  const [newMrp, setNewMrp] = useState('');
  const [newStock, setNewStock] = useState('50');
  const [newDescription, setNewDescription] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  // Add Delivery Partner Modal State
  const [showAddDeliveryModal, setShowAddDeliveryModal] = useState(false);
  const [newPartnerName, setNewPartnerName] = useState('');
  const [newPartnerEmail, setNewPartnerEmail] = useState('');
  const [newPartnerPhone, setNewPartnerPhone] = useState('');
  const [newPartnerVehicle, setNewPartnerVehicle] = useState('Hero Electric Splendor');
  const [newPartnerPlate, setNewPartnerPlate] = useState('TS 09 EZ 4567');
  const [isAddingPartner, setIsAddingPartner] = useState(false);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [ovRes, selRes, ordRes, setRes, prodRes, delivRes, catRes] = await Promise.all([
        api.get('/admin/overview'),
        api.get('/admin/sellers'),
        api.get('/admin/orders'),
        api.get('/admin/settings'),
        api.get('/admin/products'),
        api.get('/admin/delivery-partners'),
        api.get('/categories')
      ]);

      if (ovRes.data.success) setStats(ovRes.data.stats);
      if (selRes.data.success) setSellers(selRes.data.sellers || []);
      if (ordRes.data.success) setAllOrders(ordRes.data.orders || []);
      if (prodRes.data.success) setProducts(prodRes.data.products || []);
      if (delivRes.data.success) setDeliveryPartners(delivRes.data.deliveryPartners || []);
      if (catRes.data.success) setCategories(catRes.data.categories || []);
      if (setRes.data.success) {
        setSettings(setRes.data.settings || []);
        const comm = setRes.data.settings.find((s: any) => s.setting_key === 'default_commission_rate');
        const ship = setRes.data.settings.find((s: any) => s.setting_key === 'free_shipping_threshold');
        if (comm) setCommissionRate(comm.setting_value);
        if (ship) setFreeShippingLimit(ship.setting_value);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // PRODUCT ACTIONS
  const handleOpenEditProduct = (prod: any) => {
    setEditingProduct(prod);
    setEditPrice(String(prod.price));
    setEditMrp(String(prod.mrp || prod.price));
    setEditStock(String(prod.stock));
    setEditTitle(prod.title);
    setEditDescription(prod.description || '');
  };

  const handleSaveProductChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setIsSavingProduct(true);
    try {
      const res = await api.put(`/admin/products/${editingProduct.id}`, {
        price: Number(editPrice),
        mrp: Number(editMrp),
        stock: Number(editStock),
        title: editTitle,
        description: editDescription
      });
      if (res.data.success) {
        setEditingProduct(null);
        fetchAdminData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update product.');
    } finally {
      setIsSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (productId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}" from the marketplace?`)) return;
    try {
      const res = await api.delete(`/admin/products/${productId}`);
      if (res.data.success) {
        fetchAdminData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete product.');
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingProduct(true);
    try {
      const res = await api.post('/products', {
        title: newTitle,
        category_id: newCategory,
        price: Number(newPrice),
        mrp: Number(newMrp || newPrice),
        stock: Number(newStock),
        description: newDescription,
        short_description: newDescription.slice(0, 100),
        images: newImageUrl ? [{ image_url: newImageUrl, is_primary: 1 }] : []
      });
      if (res.data.success) {
        setShowAddProductModal(false);
        setNewTitle('');
        setNewPrice('');
        setNewMrp('');
        setNewDescription('');
        setNewImageUrl('');
        fetchAdminData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add product.');
    } finally {
      setIsAddingProduct(false);
    }
  };

  // DELIVERY PARTNER ACTIONS
  const handleAddDeliveryPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingPartner(true);
    try {
      const res = await api.post('/admin/delivery-partners', {
        full_name: newPartnerName,
        email: newPartnerEmail,
        phone: newPartnerPhone,
        vehicle_type: newPartnerVehicle,
        vehicle_number: newPartnerPlate
      });
      if (res.data.success) {
        setShowAddDeliveryModal(false);
        setNewPartnerName('');
        setNewPartnerEmail('');
        setNewPartnerPhone('');
        fetchAdminData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create delivery partner.');
    } finally {
      setIsAddingPartner(false);
    }
  };

  const handleTogglePartnerStatus = async (partner: any) => {
    const newStatus = partner.status === 'active' ? 'suspended' : 'active';
    try {
      const res = await api.put(`/admin/delivery-partners/${partner.user_id}`, {
        status: newStatus
      });
      if (res.data.success) {
        fetchAdminData();
      }
    } catch (err: any) {
      alert('Failed to update partner status.');
    }
  };

  const handleDeleteDeliveryPartner = async (partnerId: string, name: string) => {
    if (!window.confirm(`Are you sure you want to remove delivery partner "${name}"?`)) return;
    try {
      const res = await api.delete(`/admin/delivery-partners/${partnerId}`);
      if (res.data.success) {
        fetchAdminData();
      }
    } catch (err: any) {
      alert('Failed to delete delivery partner.');
    }
  };

  const handleReassignDelivery = async (orderId: string, partnerId: string) => {
    try {
      const res = await api.put(`/admin/orders/${orderId}/assign-delivery`, {
        delivery_partner_id: partnerId
      });
      if (res.data.success) {
        fetchAdminData();
      }
    } catch (err: any) {
      alert('Failed to reassign delivery partner.');
    }
  };

  // SELLER APPROVAL
  const handleApproveSeller = async (sellerId: string, isApproved: boolean) => {
    try {
      const res = await api.put(`/admin/sellers/${sellerId}/approve`, {
        is_approved: isApproved ? 1 : 0
      });
      if (res.data.success) {
        fetchAdminData();
      }
    } catch (err) {
      console.error('Failed to update seller:', err);
    }
  };

  // SETTINGS
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put('/admin/settings', {
        settings: [
          { setting_key: 'default_commission_rate', setting_value: commissionRate },
          { setting_key: 'free_shipping_threshold', setting_value: freeShippingLimit }
        ]
      });
      alert('Platform settings saved successfully!');
      fetchAdminData();
    } catch (err) {
      console.error('Failed to save settings:', err);
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
                          p.category_name?.toLowerCase().includes(productSearch.toLowerCase()) ||
                          p.seller_name?.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCat = productCategoryFilter === 'all' || p.category_id === productCategoryFilter || p.category_slug === productCategoryFilter;
    return matchesSearch && matchesCat;
  });

  if (loading && !stats) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-xs text-slate-500 font-semibold">Loading admin control desk...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-navy-950 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl border border-slate-800">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shadow-lg flex-shrink-0">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-black font-display text-white">MaNa Angadi Super Admin</h1>
              <span className="bg-rose-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                FULL CONTROL
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">Manage catalog items, edit prices, delete products, control delivery partners & settings</p>
          </div>
        </div>

        <button
          onClick={fetchAdminData}
          className="self-start sm:self-auto bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center space-x-1.5 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Products</div>
          <div className="text-2xl font-black text-slate-900 font-display">
            {products.length}
          </div>
          <div className="text-[10px] text-brand-600 font-semibold">Live across 10+ categories</div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Delivery Fleet</div>
          <div className="text-2xl font-black text-emerald-600 font-display">
            {deliveryPartners.length}
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold">
            {deliveryPartners.filter(p => p.status === 'active').length} active delivery agents
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Orders</div>
          <div className="text-2xl font-black text-slate-900 font-display">
            {allOrders.length}
          </div>
          <div className="text-[10px] text-amber-600 font-semibold">₹{(stats?.gmv || 1425000).toLocaleString('en-IN')} GMV</div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Platform Revenue</div>
          <div className="text-2xl font-black text-purple-600 font-display">
            ₹{(stats?.platformRevenue || 106250).toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-purple-600 font-semibold">{commissionRate}% commission earnings</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'products', label: `📦 Manage Products & Prices (${products.length})` },
          { id: 'delivery', label: `🛵 Delivery Partners (${deliveryPartners.length})` },
          { id: 'orders', label: `🛒 Marketplace Orders (${allOrders.length})` },
          { id: 'sellers', label: `🏪 Sellers & Approvals (${sellers.length})` },
          { id: 'overview', label: '📊 Platform Analytics' },
          { id: 'settings', label: '⚙️ Platform Economics' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-md'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: MANAGE PRODUCTS, PRICES & ITEMS */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 font-display">Manage Marketplace Catalog & Pricing</h3>
              <p className="text-xs text-slate-500">Edit prices, change stock, delete items, or add new farm fruits & artisan handlooms</p>
            </div>

            <button
              onClick={() => setShowAddProductModal(true)}
              className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition flex items-center space-x-1.5 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add New Product</span>
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search products by title, category, or seller..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:border-brand-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>

            <select
              value={productCategoryFilter}
              onChange={(e) => setProductCategoryFilter(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-700 font-medium"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Products Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-2">Item</th>
                  <th className="py-3 px-2">Category</th>
                  <th className="py-3 px-2">Live Price</th>
                  <th className="py-3 px-2">MRP</th>
                  <th className="py-3 px-2">Stock</th>
                  <th className="py-3 px-2">Discount</th>
                  <th className="py-3 px-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-2">
                      <div className="flex items-center space-x-3">
                        <img
                          src={prod.primary_image || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=100'}
                          alt={prod.title}
                          className="w-12 h-12 rounded-xl object-cover bg-slate-100 border border-slate-200 flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 line-clamp-1">{prod.title}</div>
                          <div className="text-[11px] text-slate-500">Seller: {prod.seller_name || 'MaNa Direct'}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-2">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold text-[10px]">
                        {prod.category_name}
                      </span>
                    </td>

                    <td className="py-3 px-2">
                      <span className="font-black text-slate-900 font-display text-sm">
                        ₹{prod.price.toLocaleString('en-IN')}
                      </span>
                    </td>

                    <td className="py-3 px-2 text-slate-400 line-through">
                      ₹{(prod.mrp || prod.price).toLocaleString('en-IN')}
                    </td>

                    <td className="py-3 px-2">
                      <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                        prod.stock > 10 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                      }`}>
                        {prod.stock} units
                      </span>
                    </td>

                    <td className="py-3 px-2 font-bold text-emerald-600">
                      {prod.discount_percent}% OFF
                    </td>

                    <td className="py-3 px-2 text-right space-x-1">
                      <button
                        onClick={() => handleOpenEditProduct(prod)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-brand-50 text-slate-700 hover:text-brand-600 transition"
                        title="Edit Price & Stock"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(prod.id, prod.title)}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
                        title="Delete Product"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: MANAGE DELIVERY PARTNERS */}
      {activeTab === 'delivery' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-bold text-base text-slate-900 font-display">Manage Delivery Fleet & Persons</h3>
              <p className="text-xs text-slate-500">Add delivery personnel, manage vehicle details, monitor active deliveries, or activate/suspend accounts</p>
            </div>

            <button
              onClick={() => setShowAddDeliveryModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-md transition flex items-center space-x-1.5 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Delivery Partner</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deliveryPartners.map((partner) => (
              <div key={partner.user_id} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3 relative">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{partner.full_name}</div>
                      <div className="text-[11px] text-slate-500">{partner.vehicle_type} • {partner.vehicle_number}</div>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    partner.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {partner.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-200/80 text-center text-xs">
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold">DELIVERIES</div>
                    <div className="font-black text-slate-900">{partner.total_deliveries || 0}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold">ACTIVE</div>
                    <div className="font-black text-brand-600">{partner.active_deliveries_count || 0}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold">EARNINGS</div>
                    <div className="font-black text-emerald-600 font-display">₹{partner.earnings || 0}</div>
                  </div>
                </div>

                <div className="space-y-1 text-[11px] text-slate-600">
                  <div className="flex items-center space-x-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{partner.phone}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{partner.email}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <button
                    onClick={() => handleTogglePartnerStatus(partner)}
                    className={`font-semibold px-3 py-1 rounded-lg border text-[11px] transition ${
                      partner.status === 'active'
                        ? 'border-amber-300 text-amber-700 hover:bg-amber-50'
                        : 'border-emerald-300 text-emerald-700 hover:bg-emerald-50'
                    }`}
                  >
                    {partner.status === 'active' ? 'Suspend Account' : 'Activate Account'}
                  </button>

                  <button
                    onClick={() => handleDeleteDeliveryPartner(partner.user_id, partner.full_name)}
                    className="text-rose-600 hover:text-rose-800 text-[11px] font-bold"
                  >
                    Remove Partner
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: MARKETPLACE ORDERS & REASSIGNMENT */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-base text-slate-900 font-display">Marketplace Orders & Delivery Assignment</h3>
            <span className="text-xs text-slate-500">{allOrders.length} total orders placed</span>
          </div>
          
          <div className="divide-y divide-slate-100">
            {allOrders.map((ord) => (
              <div key={ord.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-black text-slate-900 text-sm">{ord.order_number}</span>
                    <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                      ord.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                      ord.status === 'Cancelled' ? 'bg-rose-100 text-rose-800' : 'bg-brand-100 text-brand-800'
                    }`}>
                      {ord.status}
                    </span>
                  </div>
                  <div className="text-slate-600">
                    Customer: <strong>{ord.customer_name}</strong> • Phone: <span className="font-mono">{ord.shipping_phone}</span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Address: {ord.shipping_address}, {ord.shipping_city} ({ord.shipping_pincode})
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  {/* Delivery Partner Reassignment Dropdown */}
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold block mb-0.5">ASSIGNED DELIVERY PERSON</label>
                    <select
                      value={ord.delivery_partner_id || ''}
                      onChange={(e) => handleReassignDelivery(ord.id, e.target.value)}
                      className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-medium"
                    >
                      <option value="">Unassigned</option>
                      {deliveryPartners.map((dp) => (
                        <option key={dp.user_id} value={dp.user_id}>
                          {dp.full_name} ({dp.vehicle_type})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="text-right sm:min-w-[120px]">
                    <div className="font-black text-slate-900 font-display text-base">
                      ₹{ord.total_amount.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[10px] text-emerald-600 font-semibold">
                      Commission: ₹{ord.platform_fee ? ord.platform_fee.toFixed(2) : (ord.total_amount * 0.085).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SELLERS & APPROVALS */}
      {activeTab === 'sellers' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500">All Registered Merchants</h3>
          
          <div className="divide-y divide-slate-100">
            {sellers.map((sel) => (
              <div key={sel.user_id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 text-sm">{sel.store_name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      sel.is_approved ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {sel.is_approved ? 'Verified Merchant' : 'Pending Approval'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">Owner: {sel.full_name} • {sel.email} • {sel.phone}</div>
                  <div className="text-[11px] text-slate-400">GST: {sel.gst_number || 'N/A'} • Address: {sel.business_address}</div>
                </div>

                <div className="flex items-center space-x-3 text-xs">
                  <div className="text-right">
                    <div className="font-bold text-slate-900">{sel.commission_rate || 7.5}% Commission</div>
                    <div className="text-slate-400">{sel.product_count} active listings</div>
                  </div>

                  {sel.is_approved ? (
                    <button
                      onClick={() => handleApproveSeller(sel.user_id, false)}
                      className="px-3.5 py-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 font-semibold transition"
                    >
                      Suspend
                    </button>
                  ) : (
                    <button
                      onClick={() => handleApproveSeller(sel.user_id, true)}
                      className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow"
                    >
                      Approve Seller
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: PLATFORM ANALYTICS */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-6">
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500">Monthly GMV Growth (2026)</h3>
            <div className="h-64 flex items-end justify-between gap-4 pt-8 px-4 border-b border-slate-100">
              {stats?.monthlyRevenue?.map((m: any) => {
                const maxGmv = 1500000;
                const heightPercent = Math.round((m.gmv / maxGmv) * 100);
                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                    <div className="text-[10px] font-bold text-slate-500">₹{(m.gmv / 100000).toFixed(1)}L</div>
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className="w-full max-w-[48px] bg-gradient-to-t from-brand-600 to-amber-400 rounded-t-xl transition-all"
                    ></div>
                    <div className="text-xs font-bold text-slate-700">{m.month}</div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500">Category Sales Share</h3>
            <div className="space-y-3">
              {stats?.categorySales?.map((cat: any) => (
                <div key={cat.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-800">
                    <span>{cat.name}</span>
                    <span>₹{(cat.total_sales || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-500 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: PLATFORM SETTINGS */}
      {activeTab === 'settings' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm max-w-2xl space-y-6">
          <div>
            <h3 className="font-bold text-base text-slate-900 font-display">Configure Platform Economics</h3>
            <p className="text-xs text-slate-500">Modify global commission percentages and delivery thresholds</p>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div>
              <label className="font-bold block text-slate-800 mb-1">
                Default Platform Commission Rate (%)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  step="0.1"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(e.target.value)}
                  className="w-40 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono font-bold text-sm"
                  required
                />
                <span className="text-slate-500">e.g. 8.5% platform fee deducted from merchant sales</span>
              </div>
            </div>

            <div>
              <label className="font-bold block text-slate-800 mb-1">
                Free Delivery Threshold (INR)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  value={freeShippingLimit}
                  onChange={(e) => setFreeShippingLimit(e.target.value)}
                  className="w-40 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono font-bold text-sm"
                  required
                />
                <span className="text-slate-500">Orders above this value get automatic free shipping</span>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-6 py-2.5 rounded-xl shadow transition"
              >
                Save Platform Settings
              </button>
            </div>
          </form>
        </div>
      )}

      {/* EDIT PRODUCT PRICE & STOCK MODAL */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 font-display">Edit Product & Pricing</h3>
              <button onClick={() => setEditingProduct(null)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleSaveProductChanges} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block text-slate-700 mb-1">Product Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold block text-slate-700 mb-1">Live Price (₹)</label>
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono font-bold text-emerald-600"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold block text-slate-700 mb-1">MRP (₹)</label>
                  <input
                    type="number"
                    value={editMrp}
                    onChange={(e) => setEditMrp(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono font-bold text-slate-500"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold block text-slate-700 mb-1">Stock (Units)</label>
                  <input
                    type="number"
                    value={editStock}
                    onChange={(e) => setEditStock(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono font-bold text-brand-600"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold block text-slate-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingProduct}
                  className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-5 py-2 rounded-xl shadow transition"
                >
                  {isSavingProduct ? 'Saving...' : 'Save Product Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD NEW PRODUCT MODAL */}
      {showAddProductModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 font-display">+ Add New Item to Marketplace</h3>
              <button onClick={() => setShowAddProductModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block text-slate-700 mb-1">Product Title</label>
                <input
                  type="text"
                  placeholder="e.g. Farm Fresh Shimla Green Apples"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 font-bold"
                  required
                />
              </div>

              <div>
                <label className="font-bold block text-slate-700 mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold block text-slate-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    placeholder="199"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono font-bold text-emerald-600"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold block text-slate-700 mb-1">MRP (₹)</label>
                  <input
                    type="number"
                    placeholder="250"
                    value={newMrp}
                    onChange={(e) => setNewMrp(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono font-bold text-slate-500"
                  />
                </div>
                <div>
                  <label className="font-bold block text-slate-700 mb-1">Stock</label>
                  <input
                    type="number"
                    placeholder="50"
                    value={newStock}
                    onChange={(e) => setNewStock(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono font-bold text-brand-600"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold block text-slate-700 mb-1">Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="font-bold block text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Product highlights, quality specs, weight..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingProduct}
                  className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-5 py-2 rounded-xl shadow transition"
                >
                  {isAddingProduct ? 'Creating...' : 'Publish Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD NEW DELIVERY PARTNER MODAL */}
      {showAddDeliveryModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 font-display">+ Register New Delivery Partner</h3>
              <button onClick={() => setShowAddDeliveryModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <form onSubmit={handleAddDeliveryPartner} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Varma"
                  value={newPartnerName}
                  onChange={(e) => setNewPartnerName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="ramesh@manaangadi.demo"
                    value={newPartnerEmail}
                    onChange={(e) => setNewPartnerEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold block text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    placeholder="+91 9849098765"
                    value={newPartnerPhone}
                    onChange={(e) => setNewPartnerPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block text-slate-700 mb-1">Vehicle Type</label>
                  <input
                    type="text"
                    placeholder="e.g. Honda Activa 6G / Hero Electric"
                    value={newPartnerVehicle}
                    onChange={(e) => setNewPartnerVehicle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold block text-slate-700 mb-1">Vehicle Plate Number</label>
                  <input
                    type="text"
                    placeholder="TS 09 EZ 7890"
                    value={newPartnerPlate}
                    onChange={(e) => setNewPartnerPlate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddDeliveryModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingPartner}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2 rounded-xl shadow transition"
                >
                  {isAddingPartner ? 'Creating...' : 'Register Partner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

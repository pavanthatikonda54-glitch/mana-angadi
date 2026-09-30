import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  MapPin, 
  Phone, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  Navigation, 
  Package, 
  ArrowRight, 
  Check, 
  ShieldCheck,
  Store
} from 'lucide-react';
import api from '../../services/api.js';

export const DeliveryDashboard: React.FC = () => {
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchDeliveryData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/delivery/dashboard');
      if (res.data.success) {
        setDashboard(res.data);
      }
    } catch (err) {
      console.error('Failed to load delivery dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveryData();
  }, []);

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      setUpdatingId(orderId);
      const res = await api.put(`/delivery/orders/${orderId}/status`, { status });
      if (res.data.success) {
        await fetchDeliveryData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update delivery status.');
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading && !dashboard) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-xs text-slate-500 font-semibold">Loading delivery partner hub...</p>
      </div>
    );
  }

  const profile = dashboard?.profile;
  const assigned = dashboard?.assignedOrders || [];
  const history = dashboard?.history || [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Delivery Partner Header */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-navy-950 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl border border-emerald-900/40">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 flex items-center justify-center shadow-lg">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-emerald-400">
              <Truck className="w-8 h-8" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-black font-display text-white">Delivery Partner Portal</h1>
              <span className="bg-emerald-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
                ON DUTY
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Vehicle: <strong>{profile?.vehicle_type || 'Hero Electric Splendor'}</strong> ({profile?.vehicle_number || 'TS 09 EZ 4590'})
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Assigned Deliveries</div>
          <div className="text-2xl font-black text-brand-600 font-display">
            {assigned.length}
          </div>
          <div className="text-[10px] text-slate-500 font-semibold">Active in queue</div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Delivered</div>
          <div className="text-2xl font-black text-slate-900 font-display">
            {dashboard?.stats?.totalDelivered || 142}
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold">Successful drop-offs</div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Delivery Earnings</div>
          <div className="text-2xl font-black text-emerald-600 font-display">
            ₹{(dashboard?.stats?.totalEarnings || 18500).toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-slate-500 font-semibold">₹50 earned per completed delivery</div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-1">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Customer Rating</div>
          <div className="text-2xl font-black text-slate-900 font-display">
            {profile?.rating || 4.9}★
          </div>
          <div className="text-[10px] text-amber-600 font-semibold">Top Rated Executive</div>
        </div>
      </div>

      {/* Active Assigned Deliveries Queue */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <h3 className="font-bold text-base text-slate-900 font-display flex items-center space-x-2">
          <Navigation className="w-5 h-5 text-emerald-600" />
          <span>Active Assigned Orders Queue ({assigned.length})</span>
        </h3>

        {assigned.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-400">
            No active deliveries assigned currently. Great job!
          </div>
        ) : (
          <div className="space-y-4">
            {assigned.map((ord: any) => (
              <div
                key={ord.id}
                className="p-5 rounded-2xl border-2 border-slate-200 bg-slate-50/50 space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 pb-3">
                  <div>
                    <span className="font-mono font-bold text-sm text-slate-900">{ord.order_number}</span>
                    <span className="text-xs text-slate-500 ml-2">Amount: ₹{ord.total_amount} ({ord.payment_method})</span>
                  </div>
                  <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full uppercase">
                    Status: {ord.status}
                  </span>
                </div>

                {/* Pickup & Drop Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
                    <div className="font-bold text-brand-700 flex items-center space-x-1">
                      <Store className="w-3.5 h-3.5" />
                      <span>Pickup: {ord.seller_name}</span>
                    </div>
                    <div className="text-slate-600">{ord.seller_address}</div>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1">
                    <div className="font-bold text-emerald-700 flex items-center space-x-1">
                      <MapPin className="w-3.5 h-3.5" />
                      <span>Deliver to: {ord.recipient_name}</span>
                    </div>
                    <div className="text-slate-600">{ord.shipping_address}, {ord.city} - {ord.pincode}</div>
                    <div className="font-semibold text-brand-600 flex items-center space-x-1 pt-1">
                      <Phone className="w-3 h-3" />
                      <span>{ord.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Status Advancement Actions */}
                <div className="pt-2 flex flex-wrap items-center gap-2">
                  {ord.status !== 'Picked up' && ord.status !== 'Out for Delivery' && (
                    <button
                      onClick={() => handleUpdateStatus(ord.id, 'Picked up')}
                      disabled={updatingId === ord.id}
                      className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-4 py-2 rounded-xl text-xs shadow transition flex items-center space-x-1.5"
                    >
                      <Package className="w-4 h-4" />
                      <span>Mark Picked Up from Seller</span>
                    </button>
                  )}

                  {ord.status === 'Picked up' && (
                    <button
                      onClick={() => handleUpdateStatus(ord.id, 'Out for Delivery')}
                      disabled={updatingId === ord.id}
                      className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-xl text-xs shadow transition flex items-center space-x-1.5"
                    >
                      <Truck className="w-4 h-4" />
                      <span>Mark Out for Delivery 🛵</span>
                    </button>
                  )}

                  {ord.status === 'Out for Delivery' && (
                    <button
                      onClick={() => handleUpdateStatus(ord.id, 'Delivered')}
                      disabled={updatingId === ord.id}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-lg transition flex items-center space-x-1.5"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Confirm Delivered to Customer 🎉 (+₹50)</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Completed Deliveries History */}
      {history.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500">Recent Completed Deliveries</h3>
          <div className="divide-y divide-slate-100">
            {history.map((h: any) => (
              <div key={h.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-slate-900">{h.order_number}</div>
                  <div className="text-slate-500">Delivered to {h.recipient_name} ({h.city})</div>
                </div>
                <div className="text-right font-bold text-emerald-600">
                  +₹50.00 (Credited)
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};

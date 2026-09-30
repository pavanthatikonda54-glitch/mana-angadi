import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  ChevronRight, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Truck, 
  RotateCcw,
  ShoppingBag
} from 'lucide-react';
import api from '../services/api.js';
import { Order } from '../types/index.js';

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Cancellation Modal State
  const [cancelModalOrder, setCancelModalOrder] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState('Ordered by mistake');
  const [cancelCustomNote, setCancelCustomNote] = useState('');
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelSuccessMsg, setCancelSuccessMsg] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/orders');
      if (res.data.success) {
        setOrders(res.data.orders || []);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleConfirmCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelModalOrder) return;
    setIsCancelling(true);
    try {
      const fullReason = cancelReason === 'Other' && cancelCustomNote.trim() 
        ? `Other: ${cancelCustomNote.trim()}` 
        : cancelReason;
      const res = await api.post(`/orders/${cancelModalOrder.id}/cancel`, { reason: fullReason });
      if (res.data.success) {
        setCancelSuccessMsg('Your order has been cancelled successfully. Any payment will be refunded to your original method.');
        setTimeout(() => {
          setCancelModalOrder(null);
          setCancelSuccessMsg('');
          fetchOrders();
        }, 1500);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel order.');
    } finally {
      setIsCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-xs text-slate-500 font-semibold">Loading your order history...</p>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
          <Package className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 font-display">No Orders Placed Yet</h2>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          You haven't placed any orders yet. Discover trending deals and authentic handlooms on MaNa Angadi!
        </p>
        <div className="pt-2">
          <Link
            to="/products"
            className="inline-flex items-center space-x-2 bg-brand-500 hover:bg-brand-600 text-white font-bold px-6 py-3 rounded-xl text-sm shadow-md transition"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Start Shopping</span>
          </Link>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Delivered':
        return <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center space-x-1"><CheckCircle className="w-3.5 h-3.5" /><span>Delivered</span></span>;
      case 'Cancelled':
        return <span className="bg-rose-100 text-rose-800 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center space-x-1"><XCircle className="w-3.5 h-3.5" /><span>Cancelled</span></span>;
      case 'Out for Delivery':
        return <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center space-x-1"><Truck className="w-3.5 h-3.5" /><span>Out for Delivery</span></span>;
      default:
        return <span className="bg-brand-100 text-brand-800 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center space-x-1"><Clock className="w-3.5 h-3.5" /><span>{status}</span></span>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
          My Orders & History
        </h1>
        <p className="text-xs text-slate-500">Track shipments in real-time, view invoices and manage returns</p>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4 hover:border-slate-300 transition"
          >
            {/* Header: Order ID, Date, Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-sm text-slate-900">{order.order_number}</span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-500">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Delivering to: <strong className="text-slate-700">{order.recipient_name}</strong> ({order.city})
                </div>
              </div>

              <div className="flex items-center space-x-3">
                {getStatusBadge(order.status)}
                <span className="text-base font-black text-slate-900 font-display">
                  ₹{order.total_amount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-3">
              {order.items?.map((item) => (
                <div key={item.id} className="flex items-center space-x-3">
                  <img
                    src={item.image_url || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=100'}
                    alt={item.product_title}
                    className="w-14 h-14 rounded-xl object-cover bg-slate-100 border border-slate-100 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-slate-800 line-clamp-1">{item.product_title}</h4>
                    <div className="text-xs text-slate-500">Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions: Track Order & Cancel */}
            <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="text-slate-500">
                Payment: <strong className="text-slate-800 font-mono">{order.payment_method}</strong> ({order.payment_status})
              </div>

              <div className="flex items-center space-x-2">
                {order.is_cancellable && (
                  <button
                    onClick={() => {
                      setCancelModalOrder(order);
                      setCancelReason('Ordered by mistake');
                      setCancelCustomNote('');
                      setCancelSuccessMsg('');
                    }}
                    className="px-3.5 py-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 font-semibold transition"
                  >
                    Cancel Order
                  </button>
                )}

                <Link
                  to={`/orders/${order.id}`}
                  className="bg-slate-900 hover:bg-brand-500 text-white font-bold px-4 py-2 rounded-xl transition flex items-center space-x-1.5 shadow-sm"
                >
                  <span>Live Tracking & Details</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* Cancellation Confirmation Modal */}
      {cancelModalOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 font-display">Cancel Order</h3>
              <button
                onClick={() => setCancelModalOrder(null)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {cancelSuccessMsg ? (
              <div className="p-6 text-center space-y-2 bg-rose-50 rounded-2xl text-rose-800">
                <CheckCircle className="w-10 h-10 mx-auto text-rose-600" />
                <div className="font-bold">Order Cancelled</div>
                <div className="text-xs">{cancelSuccessMsg}</div>
              </div>
            ) : (
              <form onSubmit={handleConfirmCancel} className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-slate-500">Order Number:</div>
                  <div className="font-mono font-bold text-slate-800">{cancelModalOrder.order_number}</div>
                  <div className="text-slate-500 mt-1">Refund Amount:</div>
                  <div className="font-bold text-slate-900 text-sm">₹{cancelModalOrder.total_amount.toLocaleString('en-IN')}</div>
                </div>

                <div>
                  <label className="font-bold block mb-1 text-slate-700">Reason for Cancellation</label>
                  <select
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-brand-500"
                  >
                    <option value="Ordered by mistake">Ordered by mistake</option>
                    <option value="Found better price / alternative">Found better price / alternative</option>
                    <option value="Delivery time is too long">Delivery time is too long</option>
                    <option value="Need to change shipping address or phone">Need to change shipping address or phone</option>
                    <option value="Item not required anymore">Item not required anymore</option>
                    <option value="Other">Other reason</option>
                  </select>
                </div>

                {cancelReason === 'Other' && (
                  <div>
                    <label className="font-bold block mb-1 text-slate-700">Please specify reason</label>
                    <textarea
                      rows={2}
                      value={cancelCustomNote}
                      onChange={(e) => setCancelCustomNote(e.target.value)}
                      placeholder="Briefly state your reason..."
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                      required
                    />
                  </div>
                )}

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setCancelModalOrder(null)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                  >
                    Keep Order
                  </button>
                  <button
                    type="submit"
                    disabled={isCancelling}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-5 py-2 rounded-xl shadow transition"
                  >
                    {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
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

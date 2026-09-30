import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Package, 
  Truck, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Phone, 
  RotateCcw, 
  ArrowLeft,
  FileText,
  AlertCircle,
  XCircle,
  X
} from 'lucide-react';
import api from '../services/api.js';
import { Order } from '../types/index.js';

export const OrderTrackingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  // Return modal state
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState('Damaged or Defective Item');
  const [returnDetails, setReturnDetails] = useState('');
  const [returnSubmitting, setReturnSubmitting] = useState(false);
  const [returnSuccess, setReturnSuccess] = useState(false);

  // Cancel modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('Ordered by mistake');
  const [cancelCustomNote, setCancelCustomNote] = useState('');
  const [cancelSubmitting, setCancelSubmitting] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/orders/${id}`);
      if (res.data.success && res.data.order) {
        setOrder(res.data.order);
      }
    } catch (err) {
      console.error('Failed to fetch order tracking:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    setCancelSubmitting(true);
    try {
      const fullReason = cancelReason === 'Other' && cancelCustomNote.trim()
        ? `Other: ${cancelCustomNote.trim()}`
        : cancelReason;
      const res = await api.post(`/orders/${order.id}/cancel`, { reason: fullReason });
      if (res.data.success) {
        setCancelSuccess(true);
        setTimeout(() => {
          setShowCancelModal(false);
          setCancelSuccess(false);
          fetchOrder();
        }, 1500);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to cancel order.');
    } finally {
      setCancelSubmitting(false);
    }
  };

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!order) return;
    setReturnSubmitting(true);
    try {
      const res = await api.post('/returns', {
        order_id: order.id,
        reason: returnReason,
        details: returnDetails
      });
      if (res.data.success) {
        setReturnSuccess(true);
        setTimeout(() => {
          setShowReturnModal(false);
          setReturnSuccess(false);
          fetchOrder();
        }, 1500);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit return request.');
    } finally {
      setReturnSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-xs text-slate-500 font-semibold">Loading live tracking details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold">Order not found</h2>
        <Link to="/orders" className="text-brand-600 font-bold hover:underline">Back to Orders</Link>
      </div>
    );
  }

  // All milestone stages
  const trackingStages = [
    { key: 'Order Placed', label: 'Order Placed' },
    { key: 'Payment Confirmed', label: 'Payment Confirmed' },
    { key: 'Seller Confirmed', label: 'Seller Confirmed' },
    { key: 'Packed', label: 'Packed' },
    { key: 'Shipped', label: 'Shipped' },
    { key: 'Out for Delivery', label: 'Out for Delivery' },
    { key: 'Delivered', label: 'Delivered' }
  ];

  const currentStageIndex = trackingStages.findIndex((s) => s.key === order.status);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Back button & Header */}
      <div className="flex items-center justify-between">
        <Link to="/orders" className="text-xs font-bold text-slate-600 hover:text-brand-600 flex items-center space-x-1">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Orders</span>
        </Link>
        <div className="flex items-center space-x-2">
          {order.is_cancellable && (
            <button
              onClick={() => {
                setShowCancelModal(true);
                setCancelReason('Ordered by mistake');
                setCancelCustomNote('');
                setCancelSuccess(false);
              }}
              className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 px-3.5 py-1.5 rounded-xl hover:bg-rose-100 flex items-center space-x-1.5 shadow-sm transition"
            >
              <XCircle className="w-4 h-4 text-rose-600" />
              <span>Cancel Order</span>
            </button>
          )}

          <button
            onClick={() => alert(`Downloading official tax invoice for ${order.order_number}...`)}
            className="text-xs font-bold text-slate-700 bg-white border border-slate-300 px-3.5 py-1.5 rounded-xl hover:bg-slate-50 flex items-center space-x-1.5 shadow-sm"
          >
            <FileText className="w-4 h-4 text-brand-500" />
            <span>Download Invoice</span>
          </button>
        </div>
      </div>

      {/* Cancelled Banner if status is Cancelled */}
      {order.status === 'Cancelled' && (
        <div className="p-5 bg-rose-50 border border-rose-200 rounded-3xl flex items-start space-x-3 text-xs text-rose-800 shadow-sm">
          <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-sm text-rose-900">This Order Has Been Cancelled</div>
            <p>Reason: {order.cancel_reason || 'Cancelled by customer upon request'}</p>
            <div className="text-rose-700 text-[11px]">
              Full refund of <strong>₹{order.total_amount.toLocaleString('en-IN')}</strong> will be credited to your original payment method ({order.payment_method}) within 2-4 business days.
            </div>
          </div>
        </div>
      )}

      {/* Order Info Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-mono font-black text-lg text-slate-900">{order.order_number}</span>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
              order.status === 'Cancelled' ? 'bg-rose-100 text-rose-800' : 'bg-brand-100 text-brand-800'
            }`}>
              {order.status}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Placed on {new Date(order.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
          </p>
        </div>

        <div className="text-left sm:text-right">
          <div className="text-xs text-slate-500">Total Order Amount</div>
          <div className="text-2xl font-black text-slate-900 font-display">
            ₹{order.total_amount.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Live Visual Tracking Pipeline */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <h3 className="font-bold text-base text-slate-900 font-display flex items-center space-x-2">
          <Truck className="w-5 h-5 text-brand-500" />
          <span>Live Tracking Timeline</span>
        </h3>

        {/* Linear Stepper */}
        <div className="hidden sm:grid grid-cols-7 gap-2 text-center relative py-4">
          {trackingStages.map((stage, idx) => {
            const isCompleted = currentStageIndex >= idx && order.status !== 'Cancelled';
            const isCurrent = currentStageIndex === idx && order.status !== 'Cancelled';

            return (
              <div key={stage.key} className="flex flex-col items-center space-y-2 relative">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow transition-all ${
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-brand-500 text-white ring-4 ring-brand-100 animate-pulse'
                      : 'bg-slate-100 text-slate-400 border border-slate-200'
                  }`}
                >
                  {isCompleted ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                </div>
                <span className={`text-[10px] font-bold leading-tight ${isCompleted ? 'text-slate-800' : 'text-slate-400'}`}>
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Milestone Details Feed */}
        <div className="border-t border-slate-100 pt-6 space-y-4">
          {order.tracking && order.tracking.map((t, idx) => (
            <div key={t.id || idx} className="flex items-start space-x-3 text-xs">
              <div className="w-2.5 h-2.5 rounded-full bg-brand-500 mt-1 flex-shrink-0 ring-4 ring-brand-100"></div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{t.title}</span>
                  <span className="text-slate-400 text-[10px]">
                    {new Date(t.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-slate-600 mt-0.5">{t.description}</p>
                {t.location && (
                  <span className="text-[10px] text-slate-400 flex items-center space-x-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>Location: {t.location}</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Delivery Partner Details & Address */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        
        {/* Delivery Partner Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-3">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">Delivery Executive</h4>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-900">{order.delivery_partner_name || 'Suresh Kumar'}</div>
              <div className="text-xs text-slate-500">{order.delivery_vehicle || 'Hero Electric Splendor'} • {order.delivery_vehicle_number || 'TS 09 EZ 4590'}</div>
              <div className="text-xs text-brand-600 font-semibold flex items-center space-x-1 mt-0.5">
                <Phone className="w-3 h-3" />
                <span>{order.delivery_partner_phone || '+91 9700112233'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-2 text-xs">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">Shipping Address</h4>
          <div className="font-bold text-slate-900">{order.recipient_name}</div>
          <p className="text-slate-600">{order.shipping_address}</p>
          <div className="font-semibold text-slate-800">{order.city}, {order.state} - {order.pincode}</div>
          <div className="text-slate-500">Phone: {order.phone}</div>
        </div>

      </div>

      {/* Order Items List */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500">Ordered Products</h3>
        <div className="divide-y divide-slate-100">
          {order.items?.map((item) => (
            <div key={item.id} className="py-3 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-3">
                <img
                  src={item.image_url || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=100'}
                  alt=""
                  className="w-14 h-14 rounded-xl object-cover bg-slate-100 border border-slate-100 flex-shrink-0"
                />
                <div>
                  <div className="font-bold text-slate-900 text-sm line-clamp-1">{item.product_title}</div>
                  <div className="text-slate-500">Quantity: {item.quantity}</div>
                </div>
              </div>
              <div className="font-black text-sm text-slate-900 font-display">
                ₹{item.total_price.toLocaleString('en-IN')}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Return Request CTA (If delivered) */}
      {order.status === 'Delivered' && (
        <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-amber-900">Need to return or exchange an item?</h4>
            <p className="text-xs text-amber-800">
              Eligible for 7-day doorstep replacement and instant refund.
            </p>
          </div>
          {order.returnRequest ? (
            <span className="bg-amber-200 text-amber-900 px-4 py-2 rounded-xl text-xs font-bold">
              Return Status: {order.returnRequest.status}
            </span>
          ) : (
            <button
              onClick={() => setShowReturnModal(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow transition flex items-center space-x-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Request Return / Refund</span>
            </button>
          )}
        </div>
      )}

      {/* Return Request Modal */}
      {showReturnModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-base text-slate-900 font-display">Request Return & Refund</h3>

            {returnSuccess ? (
              <div className="p-6 text-center space-y-2 bg-emerald-50 rounded-2xl text-emerald-800">
                <CheckCircle className="w-10 h-10 mx-auto text-emerald-600" />
                <div className="font-bold">Return Request Submitted!</div>
                <div className="text-xs">Our executive will review and schedule pickup within 24 hours.</div>
              </div>
            ) : (
              <form onSubmit={handleReturnSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold block mb-1">Select Reason for Return</label>
                  <select
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                  >
                    <option value="Damaged or Defective Item">Damaged or Defective Item</option>
                    <option value="Item not matching description">Item not matching description</option>
                    <option value="Size / Color mismatch">Size / Color mismatch</option>
                    <option value="Quality not as expected">Quality not as expected</option>
                    <option value="Missing parts or accessories">Missing parts or accessories</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold block mb-1">Additional Details</label>
                  <textarea
                    rows={3}
                    value={returnDetails}
                    onChange={(e) => setReturnDetails(e.target.value)}
                    placeholder="Provide additional details regarding the issue..."
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReturnModal(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={returnSubmitting}
                    className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-5 py-2 rounded-xl shadow"
                  >
                    {returnSubmitting ? 'Submitting...' : 'Confirm Return'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-bold text-base text-slate-900 font-display">Cancel Order</h3>
              <button onClick={() => setShowCancelModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            {cancelSuccess ? (
              <div className="p-6 text-center space-y-2 bg-rose-50 rounded-2xl text-rose-800">
                <CheckCircle className="w-10 h-10 mx-auto text-rose-600" />
                <div className="font-bold">Order Cancelled Successfully!</div>
                <div className="text-xs">Your refund of ₹{order.total_amount.toLocaleString('en-IN')} has been initiated.</div>
              </div>
            ) : (
              <form onSubmit={handleCancelSubmit} className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-slate-500">Order: <strong className="text-slate-800">{order.order_number}</strong></div>
                  <div className="text-slate-500 mt-0.5">Refund: <strong className="text-slate-900">₹{order.total_amount.toLocaleString('en-IN')}</strong> ({order.payment_method})</div>
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
                    <label className="font-bold block mb-1 text-slate-700">Please describe reason</label>
                    <textarea
                      rows={2}
                      value={cancelCustomNote}
                      onChange={(e) => setCancelCustomNote(e.target.value)}
                      placeholder="Enter details..."
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs"
                      required
                    />
                  </div>
                )}

                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCancelModal(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                  >
                    Keep Order
                  </button>
                  <button
                    type="submit"
                    disabled={cancelSubmitting}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-5 py-2 rounded-xl shadow"
                  >
                    {cancelSubmitting ? 'Cancelling...' : 'Confirm Cancellation'}
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

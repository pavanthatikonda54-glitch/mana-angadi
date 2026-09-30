import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { 
  MapPin, 
  Truck, 
  CreditCard, 
  CheckCircle, 
  Plus, 
  QrCode, 
  Smartphone, 
  Building2, 
  Banknote, 
  ShieldCheck, 
  ArrowRight,
  PackageCheck,
  Clock,
  Sparkles,
  Zap,
  ShoppingBag
} from 'lucide-react';
import { useCart } from '../context/CartContext.js';
import { useAuth } from '../context/AuthContext.js';
import api from '../services/api.js';
import { Address } from '../types/index.js';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const directItem = (location.state as any)?.directItem;

  const { cart, appliedCoupon, clearCart } = useCart();
  const { user, addresses, addAddress } = useAuth();

  // Multi-step: 1 = Address, 2 = Delivery, 3 = Payment, 4 = Confirmation
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [deliverySpeed, setDeliverySpeed] = useState<'express' | 'standard'>('express');
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'Card' | 'NetBanking' | 'COD'>('UPI');
  const [upiVpa, setUpiVpa] = useState('priya@okhdfcbank');
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [isProcessing, setIsProcessing] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);

  // Add new address modal
  const [showAddAddr, setShowAddAddr] = useState(false);
  const [newAddr, setNewAddr] = useState({
    recipient_name: user?.full_name || '',
    phone: user?.phone || '+91 9849012345',
    address_line1: '',
    address_line2: '',
    landmark: '',
    city: 'Hyderabad',
    state: 'Telangana',
    pincode: '500034',
    address_type: 'Home' as const
  });

  useEffect(() => {
    if (addresses && addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find((a) => a.is_default) || addresses[0];
      setSelectedAddressId(defaultAddr.id);
    }
  }, [addresses]);

  const handleCreateNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddr.recipient_name || !newAddr.address_line1 || !newAddr.pincode) return;
    const ok = await addAddress(newAddr);
    if (ok) {
      setShowAddAddr(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!directItem && (!cart || cart.items.length === 0)) return;
    setIsProcessing(true);

    try {
      const payload: any = {
        address_id: selectedAddressId,
        payment_method: paymentMethod,
        coupon_code: appliedCoupon?.code,
        delivery_speed: deliverySpeed
      };

      if (directItem) {
        payload.items = [{
          product_id: directItem.product_id,
          variant_id: directItem.variant_id || null,
          quantity: directItem.quantity || 1
        }];
      }

      const res = await api.post('/orders', payload);

      if (res.data.success && res.data.order) {
        setConfirmedOrder(res.data.order);
        setCurrentStep(4);
        if (!directItem) {
          clearCart();
        }

        // Celebration Confetti
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      console.error('Failed to place order:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!directItem && (!cart || cart.items.length === 0) && currentStep !== 4) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold">Your cart is empty.</h2>
        <p className="text-xs text-slate-500">Add products to your cart or select an individual item to order separately.</p>
        <Link to="/products" className="inline-block bg-brand-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow hover:bg-brand-600 transition">Continue Shopping</Link>
      </div>
    );
  }

  // Calculate Subtotal & Payable amount
  const directSubtotal = directItem ? directItem.price * directItem.quantity : 0;
  const subtotal = directItem ? directSubtotal : (cart?.subtotal || 0);
  const deliveryFee = subtotal >= 499 ? 0 : 0; // Free express promotion
  const discountAmount = appliedCoupon ? appliedCoupon.discount_amount : 0;
  const payableAmount = Math.max(0, subtotal - discountAmount + deliveryFee);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Checkout Progress Stepper */}
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 -z-0">
            <div
              className="h-full bg-brand-500 transition-all duration-500"
              style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
            ></div>
          </div>

          {[
            { step: 1, label: 'Address', icon: MapPin },
            { step: 2, label: 'Delivery', icon: Truck },
            { step: 3, label: 'Payment', icon: CreditCard },
            { step: 4, label: 'Confirmation', icon: CheckCircle },
          ].map((s) => {
            const Icon = s.icon;
            const isCompleted = currentStep > s.step;
            const isCurrent = currentStep === s.step;

            return (
              <div key={s.step} className="relative z-10 flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs shadow-md transition-all ${
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-brand-500 text-white ring-4 ring-brand-100'
                      : 'bg-white border-2 border-slate-300 text-slate-400'
                  }`}
                >
                  {isCompleted ? <CheckCircle className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                </div>
                <span className={`text-xs mt-1.5 font-bold ${isCurrent ? 'text-brand-600' : 'text-slate-500'}`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Step Active Content (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* STEP 1: Address Selection */}
          {currentStep === 1 && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 font-display">Select Delivery Address</h2>
                  <p className="text-xs text-slate-500">Choose where you want your order delivered</p>
                </div>
                <button
                  onClick={() => setShowAddAddr(true)}
                  className="bg-brand-50 hover:bg-brand-100 text-brand-600 text-xs font-bold px-3.5 py-2 rounded-xl border border-brand-200 flex items-center space-x-1.5 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Address</span>
                </button>
              </div>

              {/* Saved Addresses List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    onClick={() => setSelectedAddressId(addr.id)}
                    className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between space-y-2 relative ${
                      selectedAddressId === addr.id
                        ? 'border-brand-500 bg-brand-50/40 ring-2 ring-brand-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm text-slate-900">{addr.recipient_name}</span>
                        <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full uppercase">
                          {addr.address_type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {addr.address_line1}, {addr.address_line2}
                        {addr.landmark && <span className="block text-slate-400">Landmark: {addr.landmark}</span>}
                      </p>
                      <div className="text-xs font-semibold text-slate-800 mt-1">
                        {addr.city}, {addr.state} - <span className="font-mono font-bold text-brand-600">{addr.pincode}</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">Phone: {addr.phone}</div>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      {selectedAddressId === addr.id ? (
                        <span className="text-brand-600 font-bold flex items-center space-x-1">
                          <CheckCircle className="w-4 h-4" />
                          <span>Selected</span>
                        </span>
                      ) : (
                        <span className="text-slate-400">Click to select</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Address Modal / Form */}
              {showAddAddr && (
                <form onSubmit={handleCreateNewAddress} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                  <h4 className="font-bold text-sm text-slate-900">Add New Indian Delivery Address</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="font-semibold block mb-1">Full Name</label>
                      <input
                        type="text"
                        value={newAddr.recipient_name}
                        onChange={(e) => setNewAddr({ ...newAddr, recipient_name: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="font-semibold block mb-1">Phone Number</label>
                      <input
                        type="text"
                        value={newAddr.phone}
                        onChange={(e) => setNewAddr({ ...newAddr, phone: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2"
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="font-semibold block mb-1">Flat / House No. / Building / Street</label>
                      <input
                        type="text"
                        value={newAddr.address_line1}
                        onChange={(e) => setNewAddr({ ...newAddr, address_line1: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="font-semibold block mb-1">City</label>
                      <input
                        type="text"
                        value={newAddr.city}
                        onChange={(e) => setNewAddr({ ...newAddr, city: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="font-semibold block mb-1">State</label>
                      <input
                        type="text"
                        value={newAddr.state}
                        onChange={(e) => setNewAddr({ ...newAddr, state: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2"
                        required
                      />
                    </div>
                    <div>
                      <label className="font-semibold block mb-1">Pincode</label>
                      <input
                        type="text"
                        maxLength={6}
                        value={newAddr.pincode}
                        onChange={(e) => setNewAddr({ ...newAddr, pincode: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="font-semibold block mb-1">Address Type</label>
                      <select
                        value={newAddr.address_type}
                        onChange={(e) => setNewAddr({ ...newAddr, address_type: e.target.value as any })}
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2"
                      >
                        <option value="Home">Home (All day delivery)</option>
                        <option value="Work">Work (10 AM - 6 PM)</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowAddAddr(false)}
                      className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold px-5 py-2 rounded-xl shadow"
                    >
                      Save Address
                    </button>
                  </div>
                </form>
              )}

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => setCurrentStep(2)}
                  disabled={!selectedAddressId}
                  className="bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold px-6 py-3 rounded-xl text-sm shadow flex items-center space-x-2 transition"
                >
                  <span>Continue to Delivery Method</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Delivery Speed & Preferences */}
          {currentStep === 2 && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-bold text-slate-900 font-display">Choose Delivery Speed</h2>
                <p className="text-xs text-slate-500">Select your preferred dispatch schedule</p>
              </div>

              <div className="space-y-3">
                <div
                  onClick={() => setDeliverySpeed('express')}
                  className={`p-4 rounded-2xl border-2 transition cursor-pointer flex items-center justify-between ${
                    deliverySpeed === 'express'
                      ? 'border-brand-500 bg-brand-50/40 ring-2 ring-brand-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-500 text-white flex items-center justify-center shadow">
                      <Zap className="w-5 h-5 text-amber-300" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900 flex items-center space-x-2">
                        <span>Express 1 to 2-Day Delivery</span>
                        <span className="bg-brand-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">RECOMMENDED</span>
                      </div>
                      <p className="text-xs text-slate-500">Fastest dispatch via local MaNa Angadi courier network</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-600">FREE</span>
                </div>

                <div
                  onClick={() => setDeliverySpeed('standard')}
                  className={`p-4 rounded-2xl border-2 transition cursor-pointer flex items-center justify-between ${
                    deliverySpeed === 'standard'
                      ? 'border-brand-500 bg-brand-50/40 ring-2 ring-brand-500/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900">Standard Delivery (3-4 Days)</div>
                      <p className="text-xs text-slate-500">Regular parcel transit to your doorstep</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-600">FREE</span>
                </div>
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Back to Address
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-6 py-3 rounded-xl text-sm shadow flex items-center space-x-2 transition"
                >
                  <span>Proceed to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Payment Options (Mock Indian Gateway) */}
          {currentStep === 3 && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-xl font-bold text-slate-900 font-display">Select Payment Method</h2>
                <p className="text-xs text-slate-500">100% Secure Transaction • Mock Development Gateway Active</p>
              </div>

              {/* Payment Methods Tabs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'UPI', label: 'UPI (GPay / PhonePe)', icon: Smartphone },
                  { id: 'Card', label: 'Credit / Debit Card', icon: CreditCard },
                  { id: 'NetBanking', label: 'Net Banking', icon: Building2 },
                  { id: 'COD', label: 'Cash on Delivery', icon: Banknote },
                ].map((m) => {
                  const Icon = m.icon;
                  const isSelected = paymentMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id as any)}
                      className={`p-3 rounded-xl border-2 text-center flex flex-col items-center justify-center space-y-1.5 transition ${
                        isSelected
                          ? 'border-brand-500 bg-brand-50 text-brand-700 font-bold shadow-sm'
                          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs">{m.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Method Specific UI */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
                {paymentMethod === 'UPI' && (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                      {/* Realistic Mock UPI QR Code */}
                      <div className="w-36 h-36 bg-white p-2 rounded-2xl border border-slate-300 shadow-sm flex flex-col items-center justify-center">
                        <div className="w-full h-full bg-slate-900 rounded-xl flex items-center justify-center text-white p-2">
                          <QrCode className="w-24 h-24 text-amber-400" />
                        </div>
                      </div>

                      <div className="space-y-2 flex-1 text-xs">
                        <div className="font-bold text-sm text-slate-900">Scan & Pay with any UPI App</div>
                        <p className="text-slate-500">Google Pay, PhonePe, Paytm, BHIM, CRED UPI</p>
                        <div className="pt-1">
                          <label className="font-bold block mb-1">Or Enter UPI ID / VPA</label>
                          <input
                            type="text"
                            value={upiVpa}
                            onChange={(e) => setUpiVpa(e.target.value)}
                            placeholder="e.g. mobile@upi"
                            className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-mono text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'Card' && (
                  <div className="space-y-3 text-xs max-w-md">
                    <div>
                      <label className="font-bold block mb-1">Card Number</label>
                      <input
                        type="text"
                        defaultValue="4111 2222 3333 4444"
                        className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold block mb-1">Expiry Date</label>
                        <input
                          type="text"
                          defaultValue="12/28"
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-mono"
                        />
                      </div>
                      <div>
                        <label className="font-bold block mb-1">CVV</label>
                        <input
                          type="password"
                          defaultValue="789"
                          maxLength={3}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'NetBanking' && (
                  <div className="space-y-3 text-xs">
                    <label className="font-bold block">Select Bank</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {['HDFC Bank', 'State Bank of India', 'ICICI Bank', 'Axis Bank', 'Kotak Mahindra', 'Punjab National'].map((bank) => (
                        <button
                          key={bank}
                          type="button"
                          onClick={() => setSelectedBank(bank)}
                          className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition ${
                            selectedBank === bank ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 bg-white text-slate-700'
                          }`}
                        >
                          {bank}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {paymentMethod === 'COD' && (
                  <div className="text-xs space-y-1 text-slate-600">
                    <div className="font-bold text-slate-900">Cash on Delivery Available</div>
                    <p>Pay cash or via UPI QR to the delivery partner when package arrives at your doorstep.</p>
                  </div>
                )}
              </div>

              <div className="pt-4 flex justify-between">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={isProcessing}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-8 py-3.5 rounded-2xl text-sm shadow-xl shadow-emerald-600/30 active:scale-95 transition flex items-center space-x-2"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>{isProcessing ? 'Processing Mock Payment...' : `Pay ₹${payableAmount.toLocaleString('en-IN')} & Place Order`}</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Order Confirmation & Celebration */}
          {currentStep === 4 && confirmedOrder && (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 shadow-xl text-center space-y-6">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle className="w-12 h-12" />
              </div>

              <div className="space-y-2">
                <span className="bg-brand-500 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                  Mana Ooru Shopping, Mana Angadi
                </span>
                <h2 className="text-3xl font-black text-slate-900 font-display">
                  Order Placed Successfully! 🎉
                </h2>
                <p className="text-sm text-slate-600">
                  Thank you for shopping with MaNa Angadi! Your order has been confirmed.
                </p>
              </div>

              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 max-w-md mx-auto space-y-2 text-xs text-left">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-500">Order Number:</span>
                  <span className="font-mono font-bold text-brand-600 text-sm">{confirmedOrder.order_number}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-500">Amount Paid:</span>
                  <span className="font-bold text-slate-900">₹{confirmedOrder.total_amount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-500">Payment Method:</span>
                  <span className="font-bold text-slate-900">{confirmedOrder.payment_method}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-500">Estimated Delivery:</span>
                  <span className="font-bold text-emerald-600">Within 2 Days</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                <Link
                  to={`/orders/${confirmedOrder.id}`}
                  className="w-full sm:w-auto bg-brand-500 hover:bg-brand-600 text-white font-bold px-6 py-3 rounded-xl text-sm shadow-md transition flex items-center justify-center space-x-2"
                >
                  <PackageCheck className="w-4 h-4" />
                  <span>Live Track Order Timeline</span>
                </Link>
                <Link
                  to="/products"
                  className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold px-6 py-3 rounded-xl text-sm transition"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          )}

        </div>

        {/* Right: Order Summary Sidebar (4 cols) */}
        {currentStep !== 4 && (directItem || (cart && cart.items.length > 0)) && (
          <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4 sticky top-28">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
                Order Summary {directItem ? '(1 Item • Direct)' : `(${cart?.total_items} items)`}
              </h3>
              {directItem && (
                <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Separate Order
                </span>
              )}
            </div>

            {/* Mini Items Preview */}
            <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
              {directItem ? (
                <div className="flex items-center space-x-3 text-xs p-2 bg-amber-50/40 rounded-xl border border-amber-200/60">
                  <img
                    src={directItem.primary_image || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=100'}
                    alt={directItem.title}
                    className="w-12 h-12 rounded-lg object-cover bg-white border border-slate-200 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-800 truncate">{directItem.title}</div>
                    <div className="text-[11px] text-slate-500">Qty: {directItem.quantity} × ₹{directItem.price.toLocaleString('en-IN')}</div>
                  </div>
                  <div className="font-bold text-slate-900 font-display">₹{(directItem.price * directItem.quantity).toLocaleString('en-IN')}</div>
                </div>
              ) : (
                cart?.items.map((item) => (
                  <div key={item.cart_item_id} className="flex items-center space-x-3 text-xs">
                    <img
                      src={item.primary_image || 'https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=100'}
                      alt={item.title}
                      className="w-12 h-12 rounded-lg object-cover bg-slate-100 border border-slate-100 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-800 truncate">{item.title}</div>
                      <div className="text-[11px] text-slate-500">Qty: {item.quantity} × ₹{item.effective_price}</div>
                    </div>
                    <div className="font-bold text-slate-900 font-display">₹{item.item_total}</div>
                  </div>
                ))
              )}
            </div>

            {/* Total Math */}
            <div className="pt-3 border-t border-slate-200 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon ({appliedCoupon.code})</span>
                  <span>-₹{discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Delivery Charges</span>
                <span className="text-emerald-600 font-bold">FREE</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline font-black text-slate-900">
                <span className="text-sm">Final Amount</span>
                <span className="text-xl font-display text-brand-600">
                  ₹{payableAmount.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-medium pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Razorpay / Stripe Test Mode Architecture</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

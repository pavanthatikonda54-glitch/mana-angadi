import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Phone, Store, UserCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [role, setRole] = useState<'customer' | 'seller'>('customer');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [storeName, setStoreName] = useState('');
  const [storeDescription, setStoreDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) return;

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const res = await register({
      full_name: fullName,
      email,
      phone,
      password,
      role,
      store_name: role === 'seller' ? storeName : undefined,
      store_description: role === 'seller' ? storeDescription : undefined
    });

    setLoading(false);
    if (res.success) {
      setSuccessMsg(res.message);
      setTimeout(() => {
        if (role === 'seller') navigate('/seller');
        else navigate('/');
      }, 1500);
    } else {
      setErrorMsg(res.message);
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-12 space-y-6">
      
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <Link to="/" className="inline-flex items-center space-x-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-amber-400 p-0.5 shadow flex items-center justify-center">
            <div className="w-full h-full bg-navy-950 rounded-[10px] flex items-center justify-center">
              <span className="text-xl font-black font-display text-brand-400">M<span className="text-amber-400">A</span></span>
            </div>
          </div>
          <span className="text-2xl font-extrabold tracking-tight font-display text-slate-900">
            MaNa <span className="text-brand-500">Angadi</span>
          </span>
        </Link>
        <p className="text-xs text-slate-500">Create your customer or seller account</p>
      </div>

      {/* Register Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        
        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setRole('customer')}
            className={`py-2.5 rounded-xl transition ${
              role === 'customer' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            👤 Customer Account
          </button>
          <button
            type="button"
            onClick={() => setRole('seller')}
            className={`py-2.5 rounded-xl transition ${
              role === 'seller' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            🏪 Sell on MaNa Angadi
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-semibold">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl font-semibold">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="font-bold block text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Priya Thatikonda"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5"
              required
            />
          </div>

          <div>
            <label className="font-bold block text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="priya@example.com"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5"
              required
            />
          </div>

          <div>
            <label className="font-bold block text-slate-700 mb-1">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 9849012345"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5"
            />
          </div>

          <div>
            <label className="font-bold block text-slate-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5"
              required
            />
          </div>

          {role === 'seller' && (
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 space-y-3">
              <div className="font-bold text-amber-900 flex items-center space-x-1.5">
                <Store className="w-4 h-4 text-amber-700" />
                <span>Seller Store Information</span>
              </div>
              <div>
                <label className="font-bold block text-slate-700 mb-1">Store / Business Name</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="e.g. Sri Krishna Handloom & Sarees"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs"
                  required={role === 'seller'}
                />
              </div>
              <div>
                <label className="font-bold block text-slate-700 mb-1">Store Description</label>
                <textarea
                  rows={2}
                  value={storeDescription}
                  onChange={(e) => setStoreDescription(e.target.value)}
                  placeholder="Describe your products (handlooms, electronics, organics)..."
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs"
                />
              </div>
              <p className="text-[10px] text-amber-800 font-medium">
                * Note: Seller registrations are submitted for Admin approval before product listings go live.
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-brand-500/30 transition flex items-center justify-center space-x-2 text-xs active:scale-95"
          >
            <UserCheck className="w-4 h-4" />
            <span>{loading ? 'Creating Account...' : role === 'seller' ? 'Register as Seller' : 'Register Customer Account'}</span>
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-600 font-bold hover:underline">
            Sign in
          </Link>
        </div>

      </div>
    </div>
  );
};

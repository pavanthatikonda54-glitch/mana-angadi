import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Sparkles, CheckCircle, ShieldCheck, Phone, KeyRound, ArrowRight, RotateCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, sendOtp, verifyOtp, demoLogin } = useAuth();

  // Login Mode: 'phone' or 'email'
  const [loginMode, setLoginMode] = useState<'phone' | 'email'>('phone');

  // Email form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Phone + OTP form state
  const [phone, setPhone] = useState('9849012345');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpInfo, setOtpInfo] = useState('');
  const [demoOtpHint, setDemoOtpHint] = useState('');

  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setErrorMsg('');
    const res = await login(email, password);
    setLoading(false);
    if (res.success) {
      navigate('/');
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone || phone.length < 10) {
      setErrorMsg('Please enter a valid 10-digit Indian phone number.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    const res = await sendOtp(phone);
    setLoading(false);
    if (res.success) {
      setOtpSent(true);
      setOtpInfo(res.message);
      setDemoOtpHint(res.otp || '123456');
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      setErrorMsg('Please enter the 6-digit OTP.');
      return;
    }
    setLoading(true);
    setErrorMsg('');
    const res = await verifyOtp(phone, otp);
    setLoading(false);
    if (res.success) {
      navigate('/');
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleQuickDemo = async (role: any) => {
    await demoLogin(role);
    if (role === 'seller') navigate('/seller');
    else if (role === 'admin') navigate('/admin');
    else if (role === 'delivery') navigate('/delivery');
    else navigate('/');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-10 space-y-6">
      
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
        <p className="text-xs text-slate-500">“Mana Ooru Shopping, Mana Angadi.” • Quick & Secure Sign In</p>
      </div>

      {/* Login Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        
        {/* Toggle Mode: Phone OTP vs Email */}
        <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl text-xs font-bold">
          <button
            type="button"
            onClick={() => { setLoginMode('phone'); setErrorMsg(''); }}
            className={`py-2.5 rounded-xl transition flex items-center justify-center space-x-1.5 ${
              loginMode === 'phone'
                ? 'bg-white text-brand-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Phone & OTP</span>
          </button>

          <button
            type="button"
            onClick={() => { setLoginMode('email'); setErrorMsg(''); }}
            className={`py-2.5 rounded-xl transition flex items-center justify-center space-x-1.5 ${
              loginMode === 'email'
                ? 'bg-white text-brand-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Email & Password</span>
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-semibold">
            {errorMsg}
          </div>
        )}

        {/* 1. Phone Number + OTP Verification Flow */}
        {loginMode === 'phone' && (
          <div className="space-y-4">
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold block text-slate-700 mb-1">Mobile Phone Number</label>
                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-2.5 bg-slate-100 border border-slate-300 rounded-xl font-bold font-mono text-slate-700">
                      +91
                    </span>
                    <div className="relative flex-1">
                      <input
                        type="tel"
                        maxLength={10}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="98490 12345"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-brand-500"
                        required
                      />
                      <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">We'll send a 6-digit verification code (OTP) via SMS.</p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-brand-500/30 transition flex items-center justify-center space-x-2 text-xs active:scale-95"
                >
                  <span>{loading ? 'Sending OTP...' : 'Get OTP Verification Code'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs">
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl space-y-1">
                  <div className="font-bold flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>OTP Sent to +91 {phone}</span>
                  </div>
                  <div className="text-[11px] text-emerald-700 flex items-center justify-between">
                    <span>Demo OTP Code: <strong className="font-mono text-xs bg-white px-2 py-0.5 rounded border border-emerald-300">{demoOtpHint}</strong></span>
                    <button
                      type="button"
                      onClick={() => setOtp(demoOtpHint)}
                      className="underline font-bold text-brand-600"
                    >
                      Auto-fill
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-bold block text-slate-700 mb-1">Enter 6-Digit OTP</label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="123456"
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-center font-mono font-black text-lg tracking-widest text-slate-900 focus:outline-none focus:border-brand-500"
                      required
                    />
                    <KeyRound className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>Didn't receive code?</span>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    className="font-bold text-brand-600 hover:underline flex items-center space-x-1"
                  >
                    <RotateCw className="w-3 h-3" />
                    <span>Resend OTP</span>
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-600/30 transition flex items-center justify-center space-x-2 text-xs active:scale-95"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{loading ? 'Verifying...' : 'Verify OTP & Sign In'}</span>
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => { setOtpSent(false); setOtp(''); }}
                    className="text-slate-400 hover:text-slate-600 font-semibold text-[11px] underline"
                  >
                    Change Phone Number
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* 2. Traditional Email & Password Form */}
        {loginMode === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-4 text-xs">
            <div>
              <label className="font-bold block text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="customer@manaangadi.demo"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-brand-500"
                  required
                />
                <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              </div>
            </div>

            <div>
              <label className="font-bold block text-slate-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-brand-500"
                  required
                />
                <Lock className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-500 hover:bg-brand-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-brand-500/30 transition flex items-center justify-center space-x-2 text-xs active:scale-95"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Authenticating...' : 'Sign In with Email'}</span>
            </button>
          </form>
        )}

        {/* 1-Click Demo Accounts Quick Login */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center">
            Or Instant 1-Click Demo Logins:
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickDemo('customer')}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-brand-50 hover:border-brand-300 border border-slate-200 text-slate-800 font-semibold transition text-left"
            >
              <div className="font-bold text-brand-600">👤 Customer</div>
              <div className="text-[10px] text-slate-500">Priya (+91 9849012345)</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('seller')}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50 hover:border-amber-300 border border-slate-200 text-slate-800 font-semibold transition text-left"
            >
              <div className="font-bold text-amber-600">🏪 Seller</div>
              <div className="text-[10px] text-slate-500">Fruits & Handlooms</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('delivery')}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 text-slate-800 font-semibold transition text-left"
            >
              <div className="font-bold text-emerald-600">🛵 Delivery</div>
              <div className="text-[10px] text-slate-500">Suresh (Active Partner)</div>
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemo('admin')}
              className="p-2.5 rounded-xl bg-slate-50 hover:bg-rose-50 hover:border-rose-300 border border-slate-200 text-slate-800 font-semibold transition text-left"
            >
              <div className="font-bold text-rose-600">🛡️ Super Admin</div>
              <div className="text-[10px] text-slate-500">Full Website Control</div>
            </button>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="text-brand-600 font-bold hover:underline">
            Register on MaNa Angadi
          </Link>
        </div>

      </div>
    </div>
  );
};

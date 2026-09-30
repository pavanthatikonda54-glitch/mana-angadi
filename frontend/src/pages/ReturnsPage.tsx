import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { RotateCcw, Clock, CheckCircle, XCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import api from '../services/api.js';

export const ReturnsPage: React.FC = () => {
  const [returns, setReturns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/returns')
      .then((res) => {
        if (res.data.success) {
          setReturns(res.data.returns || []);
        }
      })
      .catch((err) => console.error('Failed to fetch returns:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-10 h-10 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-xs text-slate-500 font-semibold">Loading return requests...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">
          Returns & Refunds Center
        </h1>
        <p className="text-xs text-slate-500">Track return approval status, pickup schedules & refund disbursements</p>
      </div>

      {returns.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <RotateCcw className="w-8 h-8" />
          </div>
          <h3 className="font-bold text-base text-slate-800">No Return Requests Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You currently have no open or past return requests. Delivered orders are eligible for returns within 7 days.
          </p>
          <div className="pt-2">
            <Link to="/orders" className="text-brand-600 font-bold text-xs hover:underline">
              View Your Delivered Orders →
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {returns.map((ret) => (
            <div
              key={ret.id}
              className="bg-white rounded-3xl border border-slate-200/80 p-5 sm:p-6 shadow-sm space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <span className="font-mono font-bold text-sm text-slate-900">Order: {ret.order_number}</span>
                  <span className="text-xs text-slate-400 block sm:inline sm:ml-2">
                    Requested on {new Date(ret.created_at).toLocaleDateString('en-IN')}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 rounded-full uppercase">
                    Status: {ret.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block font-semibold">Return Reason:</span>
                  <span className="font-bold text-slate-800">{ret.reason}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Refund Amount:</span>
                  <span className="font-bold text-emerald-700 text-sm">₹{ret.refund_amount.toLocaleString('en-IN')}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Refund Method:</span>
                  <span className="font-bold text-slate-800">{ret.refund_method || 'Original Payment Source'}</span>
                </div>
              </div>

              {ret.details && (
                <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600">
                  <strong className="text-slate-800">Customer Note:</strong> {ret.details}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

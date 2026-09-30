import React, { useState } from 'react';
import { 
  User, 
  MapPin, 
  Plus, 
  Trash2, 
  CheckCircle, 
  ShieldCheck, 
  Mail, 
  Phone, 
  Home, 
  Briefcase 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

export const ProfilePage: React.FC = () => {
  const { user, addresses, addAddress, deleteAddress } = useAuth();

  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    recipient_name: user?.full_name || '',
    phone: user?.phone || '',
    address_line1: '',
    address_line2: '',
    landmark: '',
    city: 'Hyderabad',
    district: 'Hyderabad',
    state: 'Telangana',
    pincode: '500034',
    address_type: 'Home',
    is_default: 0
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.recipient_name || !formData.address_line1 || !formData.pincode) return;
    await addAddress(formData);
    setShowAddModal(false);
    setFormData({
      recipient_name: user?.full_name || '',
      phone: user?.phone || '',
      address_line1: '',
      address_line2: '',
      landmark: '',
      city: 'Hyderabad',
      district: 'Hyderabad',
      state: 'Telangana',
      pincode: '500034',
      address_type: 'Home',
      is_default: 0
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Profile Overview Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <img
            src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
            alt=""
            className="w-16 h-16 rounded-2xl object-cover border-2 border-brand-500 shadow-md"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-slate-900 font-display">{user?.full_name}</h2>
              <span className="bg-brand-100 text-brand-700 text-[10px] font-black px-2 py-0.5 rounded uppercase">
                {user?.role}
              </span>
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center space-x-4">
              <span className="flex items-center space-x-1"><Mail className="w-3.5 h-3.5 text-slate-400" /><span>{user?.email}</span></span>
              {user?.phone && <span className="flex items-center space-x-1"><Phone className="w-3.5 h-3.5 text-slate-400" /><span>{user?.phone}</span></span>}
            </div>
          </div>
        </div>
      </div>

      {/* Address Book */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900 font-display flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-brand-500" />
              <span>Saved Indian Addresses</span>
            </h3>
            <p className="text-xs text-slate-500">Manage multiple delivery addresses across cities and pincodes</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs px-4 py-2 rounded-xl shadow transition flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Address</span>
          </button>
        </div>

        {/* Address Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`p-4 rounded-2xl border-2 space-y-2 relative flex flex-col justify-between ${
                addr.is_default ? 'border-brand-500 bg-brand-50/20' : 'border-slate-200 bg-slate-50/50'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-slate-900">{addr.recipient_name}</span>
                  <div className="flex items-center space-x-1">
                    {addr.is_default === 1 && (
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        DEFAULT
                      </span>
                    )}
                    <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full uppercase">
                      {addr.address_type}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {addr.address_line1}, {addr.address_line2}
                  {addr.landmark && <span className="block text-slate-400">Landmark: {addr.landmark}</span>}
                </p>

                <div className="text-xs font-semibold text-slate-800 mt-1">
                  {addr.city}, {addr.state} - <span className="font-mono font-bold text-brand-600">{addr.pincode}</span>
                </div>
                <div className="text-xs text-slate-500">Phone: {addr.phone}</div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => deleteAddress(addr.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Delete address"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Address Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-base text-slate-900 font-display">Add Delivery Address</h3>
            
            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Recipient Name</label>
                  <input
                    type="text"
                    value={formData.recipient_name}
                    onChange={(e) => setFormData({ ...formData, recipient_name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Address Line 1 (Flat, House No, Building)</label>
                <input
                  type="text"
                  value={formData.address_line1}
                  onChange={(e) => setFormData({ ...formData, address_line1: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Landmark (Optional)</label>
                <input
                  type="text"
                  value={formData.landmark}
                  onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold block mb-1">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">State</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Pincode</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-mono"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-5 py-2 rounded-xl shadow"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

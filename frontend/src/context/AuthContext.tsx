import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api.js';
import { User, Address, UserRole } from '../types/index.js';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  addresses: Address[];
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  register: (data: any) => Promise<{ success: boolean; message: string }>;
  sendOtp: (phone: string) => Promise<{ success: boolean; message: string; otp?: string }>;
  verifyOtp: (phone: string, otp: string, fullName?: string) => Promise<{ success: boolean; message: string }>;
  demoLogin: (role: UserRole) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  addAddress: (data: any) => Promise<boolean>;
  deleteAddress: (id: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('mana_token'));
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchCurrentUser = async () => {
    try {
      if (!localStorage.getItem('mana_token')) {
        setUser(null);
        setLoading(false);
        return;
      }
      const res = await api.get('/auth/me');
      if (res.data.success && res.data.user) {
        setUser(res.data.user);
        setAddresses(res.data.user.addresses || []);
      }
    } catch (err) {
      console.error('Failed to load current session:', err);
      // Auto-fallback to customer demo if initial load fails
      if (!token) {
        await demoLogin('customer');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If no token exists on first visit, automatically demo-login as customer for instant exploration!
    if (!token) {
      demoLogin('customer');
    } else {
      fetchCurrentUser();
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      if (res.data.success) {
        localStorage.setItem('mana_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        await fetchCurrentUser();
        return { success: true, message: res.data.message };
      }
      return { success: false, message: res.data.message || 'Login failed.' };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || 'Login failed.' };
    }
  };

  const sendOtp = async (phone: string) => {
    try {
      const res = await api.post('/auth/send-otp', { phone });
      return { success: res.data.success, message: res.data.message, otp: res.data.otp };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || 'Failed to send OTP.' };
    }
  };

  const verifyOtp = async (phone: string, otp: string, fullName?: string) => {
    try {
      const res = await api.post('/auth/verify-otp', { phone, otp, full_name: fullName });
      if (res.data.success) {
        localStorage.setItem('mana_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        await fetchCurrentUser();
        return { success: true, message: res.data.message };
      }
      return { success: false, message: res.data.message || 'Verification failed.' };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || 'Verification failed.' };
    }
  };

  const register = async (data: any) => {
    try {
      const res = await api.post('/auth/register', data);
      if (res.data.success) {
        localStorage.setItem('mana_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        await fetchCurrentUser();
        return { success: true, message: res.data.message };
      }
      return { success: false, message: res.data.message || 'Registration failed.' };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || 'Registration failed.' };
    }
  };

  const demoLogin = async (role: UserRole) => {
    try {
      setLoading(true);
      const res = await api.post('/auth/demo-login', { role });
      if (res.data.success) {
        localStorage.setItem('mana_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        const meRes = await api.get('/auth/me');
        if (meRes.data.success && meRes.data.user) {
          setUser(meRes.data.user);
          setAddresses(meRes.data.user.addresses || []);
        }
      }
    } catch (err) {
      console.error('Demo login failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('mana_token');
    setToken(null);
    setUser(null);
    setAddresses([]);
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  const addAddress = async (data: any): Promise<boolean> => {
    try {
      const res = await api.post('/auth/addresses', data);
      if (res.data.success) {
        await fetchCurrentUser();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const deleteAddress = async (id: string): Promise<boolean> => {
    try {
      const res = await api.delete(`/auth/addresses/${id}`);
      if (res.data.success) {
        await fetchCurrentUser();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        addresses,
        login,
        sendOtp,
        verifyOtp,
        register,
        demoLogin,
        logout,
        refreshUser,
        addAddress,
        deleteAddress
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

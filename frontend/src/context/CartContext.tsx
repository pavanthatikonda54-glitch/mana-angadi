import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api.js';
import { CartItem, CartSummary, Coupon } from '../types/index.js';
import { useAuth } from './AuthContext.js';

interface PincodeInfo {
  pincode: string;
  city: string;
  state: string;
  isServiceable: boolean;
  estimatedDays: number;
  deliveryType: string;
}

interface CartContextType {
  cart: CartSummary | null;
  loading: boolean;
  itemCount: number;
  appliedCoupon: { code: string; discount_amount: number; discount_type: string; discount_value: number } | null;
  selectedPincode: PincodeInfo;
  addToCart: (productId: string, variantId?: string, quantity?: number) => Promise<{ success: boolean; message: string }>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  checkPincode: (pin: string) => PincodeInfo;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount_amount: number; discount_type: string; discount_value: number } | null>(null);
  
  // Default delivery pincode: Hyderabad 500034
  const [selectedPincode, setSelectedPincode] = useState<PincodeInfo>({
    pincode: '500034',
    city: 'Hyderabad',
    state: 'Telangana',
    isServiceable: true,
    estimatedDays: 2,
    deliveryType: 'Express 2-Day Delivery'
  });

  const fetchCart = async () => {
    if (!user) {
      setCart(null);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/cart');
      if (res.data.success) {
        setCart(res.data.cart);
      }
    } catch (err) {
      console.error('Failed to load cart:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCart();
    }
  }, [user]);

  const addToCart = async (productId: string, variantId?: string, quantity: number = 1) => {
    try {
      const res = await api.post('/cart', {
        product_id: productId,
        variant_id: variantId,
        quantity
      });
      if (res.data.success) {
        await fetchCart();
        return { success: true, message: res.data.message };
      }
      return { success: false, message: res.data.message || 'Failed to add item.' };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || 'Failed to add item to cart.' };
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    try {
      await api.put(`/cart/${cartItemId}`, { quantity });
      await fetchCart();
    } catch (err) {
      console.error('Failed to update quantity:', err);
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    try {
      await api.delete(`/cart/${cartItemId}`);
      await fetchCart();
    } catch (err) {
      console.error('Failed to remove cart item:', err);
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/cart');
      await fetchCart();
      setAppliedCoupon(null);
    } catch (err) {
      console.error('Failed to clear cart:', err);
    }
  };

  const applyCoupon = async (code: string) => {
    if (!cart || cart.subtotal === 0) {
      return { success: false, message: 'Cart is empty.' };
    }
    try {
      const res = await api.post('/coupons/validate', {
        code,
        order_amount: cart.subtotal
      });
      if (res.data.success) {
        setAppliedCoupon({
          code: res.data.coupon.code,
          discount_amount: res.data.coupon.discount_amount,
          discount_type: res.data.coupon.discount_type,
          discount_value: res.data.coupon.discount_value
        });
        return { success: true, message: res.data.message };
      }
      return { success: false, message: res.data.message || 'Invalid coupon.' };
    } catch (err: any) {
      return { success: false, message: err.response?.data?.message || 'Failed to apply coupon.' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  // Indian Pincode verification logic
  const checkPincode = (pin: string): PincodeInfo => {
    const trimmed = pin.trim();
    if (!trimmed || trimmed.length !== 6 || isNaN(Number(trimmed))) {
      return {
        pincode: pin,
        city: 'Unknown',
        state: 'India',
        isServiceable: false,
        estimatedDays: 0,
        deliveryType: 'Invalid Pincode Format'
      };
    }

    let city = 'Hyderabad';
    let state = 'Telangana';
    let estimatedDays = 2;
    let deliveryType = 'Express 2-Day Delivery';

    if (trimmed.startsWith('50')) {
      city = 'Hyderabad / Secunderabad';
      state = 'Telangana';
      estimatedDays = 1;
      deliveryType = 'Same-Day / Next-Day Delivery';
    } else if (trimmed.startsWith('51') || trimmed.startsWith('52') || trimmed.startsWith('53')) {
      city = 'Vijayawada / Vizag / Guntur';
      state = 'Andhra Pradesh';
      estimatedDays = 2;
      deliveryType = 'Standard 2-Day Delivery';
    } else if (trimmed.startsWith('56')) {
      city = 'Bengaluru';
      state = 'Karnataka';
      estimatedDays = 2;
      deliveryType = 'Express 2-Day Delivery';
    } else if (trimmed.startsWith('60')) {
      city = 'Chennai';
      state = 'Tamil Nadu';
      estimatedDays = 3;
      deliveryType = 'Standard 3-Day Delivery';
    } else if (trimmed.startsWith('40')) {
      city = 'Mumbai';
      state = 'Maharashtra';
      estimatedDays = 3;
      deliveryType = 'Standard 3-Day Delivery';
    } else if (trimmed.startsWith('11')) {
      city = 'New Delhi';
      state = 'Delhi NCR';
      estimatedDays = 3;
      deliveryType = 'Standard 3-Day Delivery';
    } else if (trimmed.startsWith('70')) {
      city = 'Kolkata';
      state = 'West Bengal';
      estimatedDays = 4;
      deliveryType = 'Standard 4-Day Delivery';
    } else {
      city = 'India Delivery Hub';
      state = 'India';
      estimatedDays = 4;
      deliveryType = 'Standard 4-Day Delivery';
    }

    const info: PincodeInfo = {
      pincode: trimmed,
      city,
      state,
      isServiceable: true,
      estimatedDays,
      deliveryType
    };

    setSelectedPincode(info);
    return info;
  };

  const itemCount = cart?.items ? cart.items.reduce((acc, i) => acc + i.quantity, 0) : 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        itemCount,
        appliedCoupon,
        selectedPincode,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        applyCoupon,
        removeCoupon,
        checkPincode,
        refreshCart: fetchCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../services/api.js';
import { WishlistItem } from '../types/index.js';
import { useAuth } from './AuthContext.js';
import { useCart } from './CartContext.js';

interface WishlistContextType {
  items: WishlistItem[];
  loading: boolean;
  wishlistCount: number;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (productId: string) => Promise<{ success: boolean; inWishlist: boolean }>;
  moveToCart: (productId: string) => Promise<void>;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { refreshCart } = useCart();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchWishlist = async () => {
    if (!user) {
      setItems([]);
      return;
    }
    try {
      setLoading(true);
      const res = await api.get('/wishlist');
      if (res.data.success) {
        setItems(res.data.items || []);
      }
    } catch (err) {
      console.error('Failed to load wishlist:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchWishlist();
    }
  }, [user]);

  const isInWishlist = (productId: string) => {
    return items.some((i) => i.product_id === productId);
  };

  const toggleWishlist = async (productId: string) => {
    try {
      const res = await api.post('/wishlist/toggle', { product_id: productId });
      if (res.data.success) {
        await fetchWishlist();
        return { success: true, inWishlist: res.data.inWishlist };
      }
      return { success: false, inWishlist: false };
    } catch (err) {
      return { success: false, inWishlist: false };
    }
  };

  const moveToCart = async (productId: string) => {
    try {
      const res = await api.post('/wishlist/move-to-cart', { product_id: productId });
      if (res.data.success) {
        await fetchWishlist();
        await refreshCart();
      }
    } catch (err) {
      console.error('Failed to move item to cart:', err);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        loading,
        wishlistCount: items.length,
        isInWishlist,
        toggleWishlist,
        moveToCart,
        refreshWishlist: fetchWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};

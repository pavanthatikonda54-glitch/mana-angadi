import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.js';
import { CartProvider } from './context/CartContext.js';
import { WishlistProvider } from './context/WishlistContext.js';

// Layout Components
import { Header } from './components/layout/Header.js';
import { Navbar } from './components/layout/Navbar.js';
import { Footer } from './components/layout/Footer.js';
import { MobileBottomNav } from './components/layout/MobileBottomNav.js';
import { AskManaAIModal } from './components/ai/AskManaAIModal.js';

// Customer Pages
import { HomePage } from './pages/HomePage.js';
import { ProductListingPage } from './pages/ProductListingPage.js';
import { ProductDetailPage } from './pages/ProductDetailPage.js';
import { CartPage } from './pages/CartPage.js';
import { CheckoutPage } from './pages/CheckoutPage.js';
import { OrdersPage } from './pages/OrdersPage.js';
import { OrderTrackingPage } from './pages/OrderTrackingPage.js';
import { ReturnsPage } from './pages/ReturnsPage.js';
import { WishlistPage } from './pages/WishlistPage.js';
import { ProfilePage } from './pages/ProfilePage.js';
import { SupportPage } from './pages/SupportPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';

// Role Dashboards
import { SellerDashboard } from './pages/seller/SellerDashboard.js';
import { AdminDashboard } from './pages/admin/AdminDashboard.js';
import { DeliveryDashboard } from './pages/delivery/DeliveryDashboard.js';

// 404 Error Page
const NotFoundPage = () => (
  <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
    <div className="text-7xl font-black text-brand-500 font-display">404</div>
    <h2 className="text-2xl font-black text-slate-900 font-display">Page Not Found</h2>
    <p className="text-xs text-slate-500">The page or product you are looking for might have been moved or does not exist.</p>
    <Link to="/" className="inline-block bg-brand-500 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow hover:bg-brand-600 transition">
      Return to MaNa Angadi Home
    </Link>
  </div>
);

export const App: React.FC = () => {
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800">
              
              {/* Global Header & Category Bar */}
              <Header onOpenAiChat={() => setIsAiModalOpen(true)} />
              <Navbar />

              {/* Main App Routes */}
              <main className="flex-1">
                <Routes>
                  {/* Public Storefront */}
                  <Route path="/" element={<HomePage onOpenAiChat={() => setIsAiModalOpen(true)} />} />
                  <Route path="/products" element={<ProductListingPage onOpenAiChat={() => setIsAiModalOpen(true)} />} />
                  <Route path="/products/:id" element={<ProductDetailPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/orders" element={<OrdersPage />} />
                  <Route path="/orders/:id" element={<OrderTrackingPage />} />
                  <Route path="/returns" element={<ReturnsPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/support" element={<SupportPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />

                  {/* Role Dashboards */}
                  <Route path="/seller/*" element={<SellerDashboard />} />
                  <Route path="/admin/*" element={<AdminDashboard />} />
                  <Route path="/delivery/*" element={<DeliveryDashboard />} />

                  {/* 404 */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </main>

              {/* Global Ask MaNa AI Modal */}
              <AskManaAIModal
                isOpen={isAiModalOpen}
                onClose={() => setIsAiModalOpen(false)}
              />

              {/* Global Footer & Mobile Navigation */}
              <Footer />
              <MobileBottomNav onOpenAiChat={() => setIsAiModalOpen(true)} />

            </div>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;

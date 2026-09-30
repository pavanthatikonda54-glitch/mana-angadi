import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { productController } from '../controllers/productController.js';
import { categoryController } from '../controllers/categoryController.js';
import { cartWishlistController } from '../controllers/cartWishlistController.js';
import { couponController } from '../controllers/couponController.js';
import { orderController } from '../controllers/orderController.js';
import { paymentController } from '../controllers/paymentController.js';
import { sellerController } from '../controllers/sellerController.js';
import { adminController } from '../controllers/adminController.js';
import { deliveryController } from '../controllers/deliveryController.js';
import { reviewReturnController } from '../controllers/reviewReturnController.js';
import { aiController } from '../controllers/aiController.js';
import { supportController } from '../controllers/supportController.js';
import { notificationController } from '../controllers/notificationController.js';
import { authenticate, optionalAuthenticate, requireRole } from '../middleware/auth.js';

const router = Router();

// ================= AUTHENTICATION =================
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/send-otp', authController.sendOtp);
router.post('/auth/verify-otp', authController.verifyOtp);
router.post('/auth/demo-login', authController.demoLogin);
router.get('/auth/me', authenticate, authController.getMe);
router.put('/auth/profile', authenticate, authController.updateProfile);
router.get('/auth/addresses', authenticate, authController.getAddresses);
router.post('/auth/addresses', authenticate, authController.addAddress);
router.put('/auth/addresses/:id', authenticate, authController.updateAddress);
router.delete('/auth/addresses/:id', authenticate, authController.deleteAddress);

// ================= PRODUCTS & SEARCH =================
router.get('/products', productController.listProducts);
router.get('/products/suggestions', productController.searchSuggestions);
router.get('/products/:id', productController.getProductDetails);
router.post('/products', authenticate, requireRole(['seller', 'admin']), productController.createProduct);
router.put('/products/:id', authenticate, requireRole(['seller', 'admin']), productController.updateProduct);
router.delete('/products/:id', authenticate, requireRole(['seller', 'admin']), productController.deleteProduct);

// ================= CATEGORIES & HOME DISCOVERY =================
router.get('/categories', categoryController.listCategories);
router.get('/brands', categoryController.listBrands);
router.get('/banners', categoryController.listBanners);
router.get('/flash-sales', categoryController.getFlashSales);
router.post('/categories', authenticate, requireRole(['admin']), categoryController.createCategory);

// ================= CART =================
router.get('/cart', authenticate, cartWishlistController.getCart);
router.post('/cart', authenticate, cartWishlistController.addToCart);
router.put('/cart/:itemId', authenticate, cartWishlistController.updateCartQuantity);
router.delete('/cart/:itemId', authenticate, cartWishlistController.removeFromCart);
router.delete('/cart', authenticate, cartWishlistController.clearCart);

// ================= WISHLIST =================
router.get('/wishlist', authenticate, cartWishlistController.getWishlist);
router.post('/wishlist/toggle', authenticate, cartWishlistController.toggleWishlist);
router.post('/wishlist/move-to-cart', authenticate, cartWishlistController.moveWishlistToCart);

// ================= COUPONS =================
router.post('/coupons/validate', couponController.validateCoupon);
router.get('/coupons/public', couponController.listPublicCoupons);
router.get('/coupons', authenticate, requireRole(['admin']), couponController.adminListCoupons);
router.post('/coupons', authenticate, requireRole(['admin']), couponController.createCoupon);
router.delete('/coupons/:id', authenticate, requireRole(['admin']), couponController.deleteCoupon);

// ================= ORDERS =================
router.post('/orders', authenticate, orderController.createOrder);
router.get('/orders', authenticate, orderController.getCustomerOrders);
router.get('/orders/:id', authenticate, orderController.getOrderById);
router.post('/orders/:id/cancel', authenticate, orderController.cancelOrder);

// ================= PAYMENTS (Mock Gateway) =================
router.post('/payments/create-intent', authenticate, paymentController.createPaymentIntent);
router.post('/payments/verify', authenticate, paymentController.verifyPayment);

// ================= SELLER PORTAL =================
router.get('/seller/dashboard', authenticate, requireRole(['seller', 'admin']), sellerController.getDashboardMetrics);
router.get('/seller/orders', authenticate, requireRole(['seller', 'admin']), sellerController.getSellerOrders);
router.put('/seller/orders/:id/status', authenticate, requireRole(['seller', 'admin']), sellerController.updateOrderStatus);
router.get('/seller/products', authenticate, requireRole(['seller', 'admin']), sellerController.getSellerProducts);
router.put('/seller/profile', authenticate, requireRole(['seller', 'admin']), sellerController.updateProfile);

// ================= ADMIN DESK =================
router.get('/admin/overview', authenticate, requireRole(['admin']), adminController.getDashboardOverview);
router.get('/admin/sellers', authenticate, requireRole(['admin']), adminController.listSellers);
router.put('/admin/sellers/:sellerId/approve', authenticate, requireRole(['admin']), adminController.approveSeller);
router.get('/admin/orders', authenticate, requireRole(['admin']), adminController.listAllOrders);
router.get('/admin/products', authenticate, requireRole(['admin']), adminController.listAllProducts);
router.put('/admin/products/:id', authenticate, requireRole(['admin']), adminController.updateProductPriceStock);
router.delete('/admin/products/:id', authenticate, requireRole(['admin']), adminController.deleteProduct);
router.get('/admin/delivery-partners', authenticate, requireRole(['admin']), adminController.listDeliveryPartners);
router.post('/admin/delivery-partners', authenticate, requireRole(['admin']), adminController.createDeliveryPartner);
router.put('/admin/delivery-partners/:id', authenticate, requireRole(['admin']), adminController.updateDeliveryPartner);
router.delete('/admin/delivery-partners/:id', authenticate, requireRole(['admin']), adminController.deleteDeliveryPartner);
router.put('/admin/orders/:orderId/assign-delivery', authenticate, requireRole(['admin']), adminController.assignDeliveryPartner);
router.get('/admin/settings', authenticate, requireRole(['admin']), adminController.getSettings);
router.put('/admin/settings', authenticate, requireRole(['admin']), adminController.updateSettings);

// ================= DELIVERY PARTNER PORTAL =================
router.get('/delivery/dashboard', authenticate, requireRole(['delivery', 'admin']), deliveryController.getDeliveryDashboard);
router.put('/delivery/orders/:orderId/status', authenticate, requireRole(['delivery', 'admin']), deliveryController.updateDeliveryStatus);

// ================= REVIEWS & RATINGS =================
router.post('/reviews', authenticate, reviewReturnController.submitReview);

// ================= RETURNS & REFUNDS =================
router.post('/returns', authenticate, reviewReturnController.requestReturn);
router.get('/returns', authenticate, reviewReturnController.getReturns);
router.put('/returns/:id/status', authenticate, requireRole(['seller', 'admin']), reviewReturnController.updateReturnStatus);

// ================= AI & HINDSIGHT MEMORY FEATURES =================
router.post('/ai/agent-chat', optionalAuthenticate, aiController.agentChat);
router.post('/ai/chat', optionalAuthenticate, aiController.chatAssistant);
router.post('/ai/memory/retain', optionalAuthenticate, aiController.retainMemory);
router.post('/ai/memory/recall', optionalAuthenticate, aiController.recallMemories);
router.get('/ai/memory/list', optionalAuthenticate, aiController.listBankMemories);
router.delete('/ai/memory/clear', optionalAuthenticate, aiController.clearBankMemories);
router.delete('/ai/memory/:memoryId', optionalAuthenticate, aiController.deleteMemory);
router.post('/ai/demo-seed', optionalAuthenticate, aiController.seedDemoScenario);
router.get('/ai/health', aiController.health);
router.get('/ai/parse-search', aiController.parseSearchQuery);
router.get('/ai/recommendations', aiController.getRecommendations);

// ================= SUPPORT TICKETS =================
router.post('/support/tickets', authenticate, supportController.createTicket);
router.get('/support/tickets', authenticate, supportController.getTickets);
router.get('/support/tickets/:id', authenticate, supportController.getTicketDetails);
router.post('/support/tickets/:id/reply', authenticate, supportController.replyTicket);

// ================= NOTIFICATIONS =================
router.get('/notifications', authenticate, notificationController.getUserNotifications);
router.put('/notifications/:id/read', authenticate, notificationController.markAsRead);

export default router;

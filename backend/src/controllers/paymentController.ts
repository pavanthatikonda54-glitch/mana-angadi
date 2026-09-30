import { Response } from 'express';
import { db } from '../config/db.js';
import { AuthRequest } from '../middleware/auth.js';

export const paymentController = {
  // 1. Create Payment Order / Session Intent (Mock Razorpay/Stripe architecture)
  async createPaymentIntent(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { amount, currency = 'INR', method = 'UPI' } = req.body;

      if (!amount) {
        res.status(400).json({ success: false, message: 'Amount is required.' });
        return;
      }

      const gatewayOrderId = `order_mock_${Date.now()}`;
      const upiQrString = `upi://pay?pa=manaangadi@icici&pn=MaNa+Angadi+Marketplace&am=${amount}&cu=INR&tn=MaNa-Order-${Date.now()}`;

      res.json({
        success: true,
        gateway: 'MaNa Angadi Secure Payment Engine (Mock Mode)',
        gatewayOrderId,
        amount: Number(amount),
        currency,
        supportedMethods: ['UPI', 'Card', 'NetBanking', 'Wallet', 'COD'],
        upiQrString,
        merchantDetails: {
          name: 'MaNa Angadi Marketplace Pvt Ltd',
          vpa: 'manaangadi@icici',
          supportEmail: 'payments@manaangadi.demo'
        }
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to initiate payment.' });
    }
  },

  // 2. Verify Payment
  async verifyPayment(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { paymentId, orderId, method = 'UPI', signature } = req.body;

      // In development/demo test mode, accept simulated transactions
      res.json({
        success: true,
        verified: true,
        message: 'Payment verified successfully.',
        transactionId: paymentId || `TXN_${Date.now()}`
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Payment verification failed.' });
    }
  }
};

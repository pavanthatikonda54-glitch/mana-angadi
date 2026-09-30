import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/db.js';
import { generateToken } from '../utils/jwt.js';
import { AuthRequest } from '../middleware/auth.js';

export const authController = {
  // Register new account
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, full_name, phone, role = 'customer', store_name, store_description, vehicle_type, vehicle_number } = req.body;

      if (!email || !password || !full_name) {
        res.status(400).json({ success: false, message: 'Please provide full name, email, and password.' });
        return;
      }

      // Check existing email
      const existing = await db.getOne('SELECT id FROM users WHERE email = ?', [email.toLowerCase().trim()]);
      if (existing) {
        res.status(400).json({ success: false, message: 'An account with this email already exists.' });
        return;
      }

      const userId = `usr_${uuidv4().substring(0, 8)}`;
      const password_hash = await bcrypt.hash(password, 10);

      // Sellers need admin approval by default
      const userStatus = role === 'seller' ? 'pending' : 'active';

      await db.run(
        `INSERT INTO users (id, email, password_hash, full_name, phone, role, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, email.toLowerCase().trim(), password_hash, full_name, phone || null, role, userStatus]
      );

      // If seller, create seller_profile
      if (role === 'seller') {
        const storeSlug = (store_name || full_name).toLowerCase().replace(/[^a-z0-9]+/g, '-');
        await db.run(
          `INSERT INTO seller_profiles (id, user_id, store_name, store_slug, store_description, is_approved)
           VALUES (?, ?, ?, ?, ?, 0)`,
          [`sp_${uuidv4().substring(0, 8)}`, userId, store_name || `${full_name}'s Store`, storeSlug, store_description || '']
        );
      }

      // If delivery partner, create delivery_profile
      if (role === 'delivery') {
        await db.run(
          `INSERT INTO delivery_profiles (id, user_id, vehicle_type, vehicle_number)
           VALUES (?, ?, ?, ?)`,
          [`dp_${uuidv4().substring(0, 8)}`, userId, vehicle_type || 'Bike', vehicle_number || '']
        );
      }

      const token = generateToken({ userId, email: email.toLowerCase().trim(), role });

      res.status(201).json({
        success: true,
        message: role === 'seller' 
          ? 'Seller registered successfully! Account is pending admin approval.'
          : 'Registration successful! Welcome to MaNa Angadi.',
        token,
        user: {
          id: userId,
          email: email.toLowerCase().trim(),
          full_name,
          phone,
          role,
          status: userStatus
        }
      });
    } catch (err: any) {
      console.error('Registration error:', err);
      res.status(500).json({ success: false, message: 'Internal server error during registration.' });
    }
  },

  // Login
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({ success: false, message: 'Please provide both email and password.' });
        return;
      }

      const user = await db.getOne(
        `SELECT id, email, password_hash, full_name, phone, role, avatar_url, status 
         FROM users WHERE email = ?`,
        [email.toLowerCase().trim()]
      );

      if (!user) {
        res.status(401).json({ success: false, message: 'Invalid email or password.' });
        return;
      }

      if (user.status === 'suspended') {
        res.status(403).json({ success: false, message: 'This account has been suspended by administration. Contact support.' });
        return;
      }

      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        res.status(401).json({ success: false, message: 'Invalid email or password.' });
        return;
      }

      // If seller, check profile approval
      let sellerProfile = null;
      if (user.role === 'seller') {
        sellerProfile = await db.getOne('SELECT * FROM seller_profiles WHERE user_id = ?', [user.id]);
      }

      const token = generateToken({ userId: user.id, email: user.email, role: user.role });

      res.json({
        success: true,
        message: `Welcome back, ${user.full_name}!`,
        token,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          phone: user.phone,
          role: user.role,
          avatar_url: user.avatar_url,
          status: user.status,
          sellerProfile
        }
      });
    } catch (err: any) {
      console.error('Login error:', err);
      res.status(500).json({ success: false, message: 'Internal server error during login.' });
    }
  },

  // Quick Demo Login Switcher
  async demoLogin(req: Request, res: Response): Promise<void> {
    try {
      const { role } = req.body; // 'admin' | 'seller' | 'customer' | 'delivery'
      
      let email = 'customer@manaangadi.demo';
      if (role === 'admin') email = 'admin@manaangadi.demo';
      else if (role === 'seller') email = 'seller@manaangadi.demo';
      else if (role === 'delivery') email = 'delivery@manaangadi.demo';

      const user = await db.getOne(
        `SELECT id, email, full_name, phone, role, avatar_url, status 
         FROM users WHERE email = ?`,
        [email]
      );

      if (!user) {
        res.status(404).json({ success: false, message: 'Demo account not found in database.' });
        return;
      }

      let sellerProfile = null;
      if (user.role === 'seller') {
        sellerProfile = await db.getOne('SELECT * FROM seller_profiles WHERE user_id = ?', [user.id]);
      }

      const token = generateToken({ userId: user.id, email: user.email, role: user.role });

      res.json({
        success: true,
        message: `Switched to ${user.full_name} (${user.role.toUpperCase()}) demo account.`,
        token,
        user: {
          ...user,
          sellerProfile
        }
      });
    } catch (err: any) {
      console.error('Demo login error:', err);
      res.status(500).json({ success: false, message: 'Failed to authenticate demo account.' });
    }
  },

  // Get current user details
  async getMe(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated.' });
        return;
      }

      const user = await db.getOne(
        `SELECT id, email, full_name, phone, role, avatar_url, status, created_at 
         FROM users WHERE id = ?`,
        [req.user.userId]
      );

      if (!user) {
        res.status(404).json({ success: false, message: 'User not found.' });
        return;
      }

      let sellerProfile = null;
      let deliveryProfile = null;

      if (user.role === 'seller') {
        sellerProfile = await db.getOne('SELECT * FROM seller_profiles WHERE user_id = ?', [user.id]);
      } else if (user.role === 'delivery') {
        deliveryProfile = await db.getOne('SELECT * FROM delivery_profiles WHERE user_id = ?', [user.id]);
      }

      const addresses = await db.query('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC', [user.id]);

      res.json({
        success: true,
        user: {
          ...user,
          sellerProfile,
          deliveryProfile,
          addresses
        }
      });
    } catch (err: any) {
      console.error('getMe error:', err);
      res.status(500).json({ success: false, message: 'Failed to fetch user profile.' });
    }
  },

  // Update profile
  async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Not authenticated.' });
        return;
      }

      const { full_name, phone, avatar_url } = req.body;

      await db.run(
        `UPDATE users SET full_name = COALESCE(?, full_name), phone = COALESCE(?, phone), avatar_url = COALESCE(?, avatar_url), updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [full_name, phone, avatar_url, req.user.userId]
      );

      res.json({ success: true, message: 'Profile updated successfully.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to update profile.' });
    }
  },

  // Customer Address Management
  async getAddresses(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) return;
      const addresses = await db.query('SELECT * FROM addresses WHERE user_id = ? ORDER BY is_default DESC, created_at DESC', [req.user.userId]);
      res.json({ success: true, addresses });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch addresses.' });
    }
  },

  async addAddress(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) return;
      const { recipient_name, phone, address_line1, address_line2, landmark, city, district, state, pincode, address_type = 'Home', is_default = 0 } = req.body;

      if (!recipient_name || !phone || !address_line1 || !city || !state || !pincode) {
        res.status(400).json({ success: false, message: 'Please provide full address details and valid pincode.' });
        return;
      }

      const addressId = `addr_${uuidv4().substring(0, 8)}`;

      if (is_default) {
        await db.run('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [req.user.userId]);
      }

      await db.run(
        `INSERT INTO addresses (id, user_id, recipient_name, phone, address_line1, address_line2, landmark, city, district, state, pincode, address_type, is_default)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [addressId, req.user.userId, recipient_name, phone, address_line1, address_line2 || '', landmark || '', city, district || city, state, pincode, address_type, is_default ? 1 : 0]
      );

      res.status(201).json({ success: true, message: 'Address added successfully.', addressId });
    } catch (err: any) {
      console.error('addAddress error:', err);
      res.status(500).json({ success: false, message: 'Failed to add address.' });
    }
  },

  async updateAddress(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) return;
      const { id } = req.params;
      const { recipient_name, phone, address_line1, address_line2, landmark, city, district, state, pincode, address_type, is_default } = req.body;

      if (is_default) {
        await db.run('UPDATE addresses SET is_default = 0 WHERE user_id = ?', [req.user.userId]);
      }

      await db.run(
        `UPDATE addresses SET 
          recipient_name = COALESCE(?, recipient_name),
          phone = COALESCE(?, phone),
          address_line1 = COALESCE(?, address_line1),
          address_line2 = COALESCE(?, address_line2),
          landmark = COALESCE(?, landmark),
          city = COALESCE(?, city),
          district = COALESCE(?, district),
          state = COALESCE(?, state),
          pincode = COALESCE(?, pincode),
          address_type = COALESCE(?, address_type),
          is_default = COALESCE(?, is_default)
         WHERE id = ? AND user_id = ?`,
        [recipient_name, phone, address_line1, address_line2, landmark, city, district, state, pincode, address_type, is_default, id, req.user.userId]
      );

      res.json({ success: true, message: 'Address updated successfully.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to update address.' });
    }
  },

  async deleteAddress(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) return;
      const { id } = req.params;
      await db.run('DELETE FROM addresses WHERE id = ? AND user_id = ?', [id, req.user.userId]);
      res.json({ success: true, message: 'Address deleted successfully.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to delete address.' });
    }
  },

  // 7. Phone OTP Login & Verification
  async sendOtp(req: Request, res: Response): Promise<void> {
    try {
      const { phone } = req.body;
      if (!phone) {
        res.status(400).json({ success: false, message: 'Please provide a valid 10-digit mobile number.' });
        return;
      }
      const cleanPhone = phone.replace(/[^0-9+]/g, '');
      const otp = '123456';
      res.json({
        success: true,
        message: `OTP sent successfully to ${cleanPhone}. (Demo OTP: ${otp})`,
        otp,
        phone: cleanPhone
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to send OTP.' });
    }
  },

  async verifyOtp(req: Request, res: Response): Promise<void> {
    try {
      const { phone, otp, full_name } = req.body;
      if (!phone || !otp) {
        res.status(400).json({ success: false, message: 'Please provide mobile number and OTP.' });
        return;
      }

      if (otp !== '123456' && otp !== '000000') {
        res.status(400).json({ success: false, message: 'Invalid OTP. Please enter 123456.' });
        return;
      }

      const cleanPhone = phone.replace(/[^0-9+]/g, '');
      const last10 = cleanPhone.slice(-10);
      let user = await db.getOne('SELECT * FROM users WHERE phone LIKE ? OR phone LIKE ?', [`%${last10}%`, cleanPhone]);

      if (!user) {
        const userId = `usr_${uuidv4().substring(0, 8)}`;
        const email = `user_${last10}@manaangadi.demo`;
        const dummyPasswordHash = await bcrypt.hash('Customer@123', 10);
        const name = full_name || `Customer (+91 ${last10})`;

        await db.run(
          `INSERT INTO users (id, email, password_hash, full_name, phone, role, status)
           VALUES (?, ?, ?, ?, ?, 'customer', 'active')`,
          [userId, email, dummyPasswordHash, name, `+91 ${last10}`]
        );

        user = await db.getOne('SELECT * FROM users WHERE id = ?', [userId]);
      }

      const token = generateToken({ userId: user.id, email: user.email, role: user.role });

      res.json({
        success: true,
        message: 'Phone number verified successfully! Welcome to MaNa Angadi.',
        token,
        user: {
          id: user.id,
          email: user.email,
          full_name: user.full_name,
          phone: user.phone,
          role: user.role,
          avatar_url: user.avatar_url,
          status: user.status
        }
      });
    } catch (err: any) {
      console.error('verifyOtp error:', err);
      res.status(500).json({ success: false, message: 'Failed to verify OTP.' });
    }
  }
};

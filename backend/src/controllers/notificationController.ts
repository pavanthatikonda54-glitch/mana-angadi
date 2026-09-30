import { Response } from 'express';
import { db } from '../config/db.js';
import { AuthRequest } from '../middleware/auth.js';

export const notificationController = {
  // 1. Get user notifications
  async getUserNotifications(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) return;

      const notifications = await db.query(
        `SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 25`,
        [req.user.userId]
      );

      const unreadCount = await db.getOne(
        `SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0`,
        [req.user.userId]
      );

      res.json({
        success: true,
        notifications,
        unreadCount: unreadCount ? unreadCount.count : 0
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch notifications.' });
    }
  },

  // 2. Mark notification as read
  async markAsRead(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) return;
      const { id } = req.params;

      if (id === 'all') {
        await db.run('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [req.user.userId]);
      } else {
        await db.run('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [id, req.user.userId]);
      }

      res.json({ success: true, message: 'Notifications marked as read.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to update notification.' });
    }
  }
};

import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/db.js';
import { AuthRequest } from '../middleware/auth.js';

export const supportController = {
  // 1. Create Support Ticket
  async createTicket(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) return;
      const { subject, category = 'Order Issue', priority = 'Medium', order_id, message } = req.body;

      if (!subject || !message) {
        res.status(400).json({ success: false, message: 'Subject and initial message are required.' });
        return;
      }

      const count = await db.getOne('SELECT COUNT(*) as count FROM support_tickets');
      const ticketNumber = `TKT-2026-${(count ? count.count + 1 : 1).toString().padStart(4, '0')}`;
      const ticketId = `tkt_${uuidv4().substring(0, 8)}`;

      await db.run(
        `INSERT INTO support_tickets (id, ticket_number, user_id, order_id, subject, category, priority, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [ticketId, ticketNumber, req.user.userId, order_id || null, subject, category, priority, 'open']
      );

      // Add message
      const user = await db.getOne('SELECT full_name FROM users WHERE id = ?', [req.user.userId]);
      await db.run(
        `INSERT INTO support_messages (id, ticket_id, sender_id, sender_name, message, is_staff)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [`msg_${uuidv4().substring(0, 8)}`, ticketId, req.user.userId, user?.full_name || 'Customer', message, 0]
      );

      res.status(201).json({
        success: true,
        message: `Support ticket ${ticketNumber} created successfully. Our team will respond shortly.`,
        ticketId,
        ticketNumber
      });
    } catch (err: any) {
      console.error('createTicket error:', err);
      res.status(500).json({ success: false, message: 'Failed to create support ticket.' });
    }
  },

  // 2. List Tickets (Customer / Admin)
  async getTickets(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) return;

      let sql = `
        SELECT 
          st.*,
          u.full_name as user_name,
          u.email as user_email,
          o.order_number
        FROM support_tickets st
        JOIN users u ON st.user_id = u.id
        LEFT JOIN orders o ON st.order_id = o.id
      `;
      const params: any[] = [];

      if (req.user.role !== 'admin') {
        sql += ` WHERE st.user_id = ?`;
        params.push(req.user.userId);
      }

      sql += ` ORDER BY st.created_at DESC`;
      const tickets = await db.query(sql, params);

      res.json({ success: true, tickets });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch support tickets.' });
    }
  },

  // 3. Get Ticket Conversation by ID
  async getTicketDetails(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) return;
      const { id } = req.params;

      const ticket = await db.getOne(
        `SELECT st.*, u.full_name as user_name, u.email as user_email, o.order_number
         FROM support_tickets st
         JOIN users u ON st.user_id = u.id
         LEFT JOIN orders o ON st.order_id = o.id
         WHERE st.id = ?`,
        [id]
      );

      if (!ticket) {
        res.status(404).json({ success: false, message: 'Ticket not found.' });
        return;
      }

      if (req.user.role !== 'admin' && ticket.user_id !== req.user.userId) {
        res.status(403).json({ success: false, message: 'Unauthorized to view this ticket.' });
        return;
      }

      const messages = await db.query(
        `SELECT * FROM support_messages WHERE ticket_id = ? ORDER BY created_at ASC`,
        [id]
      );

      res.json({ success: true, ticket: { ...ticket, messages } });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to fetch ticket conversation.' });
    }
  },

  // 4. Send Message in Ticket
  async replyTicket(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) return;
      const { id } = req.params;
      const { message, status } = req.body;

      if (!message) {
        res.status(400).json({ success: false, message: 'Message content is required.' });
        return;
      }

      const ticket = await db.getOne('SELECT * FROM support_tickets WHERE id = ?', [id]);
      if (!ticket) {
        res.status(404).json({ success: false, message: 'Ticket not found.' });
        return;
      }

      const isStaff = req.user.role === 'admin';
      const sender = await db.getOne('SELECT full_name FROM users WHERE id = ?', [req.user.userId]);

      await db.run(
        `INSERT INTO support_messages (id, ticket_id, sender_id, sender_name, message, is_staff)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [`msg_${uuidv4().substring(0, 8)}`, id, req.user.userId, isStaff ? 'MaNa Angadi Support' : (sender?.full_name || 'Customer'), message, isStaff ? 1 : 0]
      );

      if (status) {
        await db.run('UPDATE support_tickets SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [status, id]);
      }

      res.json({ success: true, message: 'Reply sent.' });
    } catch (err: any) {
      res.status(500).json({ success: false, message: 'Failed to reply to ticket.' });
    }
  }
};

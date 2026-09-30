import React, { useState, useEffect } from 'react';
import { 
  LifeBuoy, 
  MessageSquare, 
  Send, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Plus, 
  Phone, 
  Mail,
  ArrowRight
} from 'lucide-react';
import api from '../services/api.js';
import { SupportTicket } from '../types/index.js';

export const SupportPage: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [activeTicket, setActiveTicket] = useState<SupportTicket | null>(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);

  // New ticket modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('Order Issue');
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [message, setMessage] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/support/tickets');
      if (res.data.success) {
        setTickets(res.data.tickets || []);
        if (res.data.tickets?.length > 0 && !activeTicket) {
          fetchTicketDetails(res.data.tickets[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to fetch support tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketDetails = async (id: string) => {
    try {
      const res = await api.get(`/support/tickets/${id}`);
      if (res.data.success && res.data.ticket) {
        setActiveTicket(res.data.ticket);
      }
    } catch (err) {
      console.error('Failed to load ticket:', err);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !message) return;
    setCreating(true);
    try {
      const res = await api.post('/support/tickets', { subject, category, priority, message });
      if (res.data.success) {
        setShowCreateModal(false);
        setSubject('');
        setMessage('');
        await fetchTickets();
      }
    } catch (err) {
      console.error('Failed to create ticket:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTicket || !replyText.trim()) return;
    try {
      const res = await api.post(`/support/tickets/${activeTicket.id}/reply`, { message: replyText });
      if (res.data.success) {
        setReplyText('');
        fetchTicketDetails(activeTicket.id);
      }
    } catch (err) {
      console.error('Failed to reply:', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-navy-950 via-slate-900 to-navy-950 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-xl border border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-black font-display text-white">
              Customer Support Center
            </h1>
            <span className="bg-brand-500 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
              24/7 HELPDESK
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Need assistance with your orders, returns, payments or delivery? Raise a ticket and get resolved fast.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-5 py-3 rounded-2xl text-xs shadow-lg transition flex items-center space-x-2 flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Open New Support Ticket</span>
        </button>
      </div>

      {/* Ticket List & Message Thread Split View */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Left: Tickets List (5 cols) */}
        <div className="md:col-span-5 bg-white rounded-3xl border border-slate-200/80 p-4 space-y-3 shadow-sm">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 px-2 pt-2">
            Your Support Tickets ({tickets.length})
          </h3>

          {tickets.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-400">
              No support tickets found. Click above to open a ticket.
            </div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {tickets.map((t) => (
                <button
                  key={t.id}
                  onClick={() => fetchTicketDetails(t.id)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition ${
                    activeTicket?.id === t.id
                      ? 'border-brand-500 bg-brand-50/40 ring-1 ring-brand-500 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-xs text-brand-600">{t.ticket_number}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      t.status === 'open' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {t.status}
                    </span>
                  </div>
                  <div className="font-bold text-xs text-slate-900 truncate">{t.subject}</div>
                  <div className="text-[10px] text-slate-500 mt-1 flex justify-between">
                    <span>Category: {t.category}</span>
                    <span>{new Date(t.created_at).toLocaleDateString('en-IN')}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Message Conversation Thread (7 cols) */}
        <div className="md:col-span-7 bg-white rounded-3xl border border-slate-200/80 shadow-sm flex flex-col h-[560px] overflow-hidden">
          {activeTicket ? (
            <>
              {/* Thread Header */}
              <div className="p-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between flex-shrink-0">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-xs text-brand-600">{activeTicket.ticket_number}</span>
                    <h3 className="font-bold text-sm text-slate-900 truncate">{activeTicket.subject}</h3>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Category: {activeTicket.category} • Priority: {activeTicket.priority}
                  </div>
                </div>
              </div>

              {/* Messages Feed */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50/30">
                {activeTicket.messages?.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.is_staff ? 'items-start' : 'items-end'}`}
                  >
                    <div className="text-[10px] font-bold text-slate-400 mb-1 px-1">
                      {msg.sender_name} ({msg.is_staff ? 'Official Support' : 'You'})
                    </div>
                    <div
                      className={`p-3.5 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                        msg.is_staff
                          ? 'bg-white border border-slate-200 text-slate-800 rounded-tl-none shadow-sm'
                          : 'bg-brand-600 text-white rounded-tr-none shadow-sm'
                      }`}
                    >
                      {msg.message}
                    </div>
                    <div className="text-[9px] text-slate-400 mt-1 px-1">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="p-3 border-t border-slate-200 bg-white flex items-center space-x-2">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your response to support staff..."
                  className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-brand-500"
                />
                <button
                  type="submit"
                  disabled={!replyText.trim()}
                  className="bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white p-2.5 rounded-xl shadow transition"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-2">
              <MessageSquare className="w-10 h-10 text-slate-300" />
              <div className="text-sm font-semibold">Select a ticket to view conversation</div>
            </div>
          )}
        </div>

      </div>

      {/* Create Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-base text-slate-900 font-display">Create New Support Ticket</h3>

            <form onSubmit={handleCreateTicket} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Issue with order delivery date"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2"
                  >
                    <option value="Order Issue">Order Issue</option>
                    <option value="Delivery Delay">Delivery Delay</option>
                    <option value="Return / Refund">Return / Refund</option>
                    <option value="Payment / UPI">Payment / UPI</option>
                    <option value="Product Quality">Product Quality</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold block mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Description / Message</label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your issue with order number if applicable..."
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-5 py-2 rounded-xl shadow"
                >
                  {creating ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

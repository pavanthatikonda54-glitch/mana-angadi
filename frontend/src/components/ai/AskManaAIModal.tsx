import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  X, 
  Send, 
  Bot, 
  User, 
  ShoppingCart, 
  ArrowRight, 
  Check, 
  Star,
  RefreshCw,
  Brain,
  Layers,
  Database,
  Trash2,
  Zap,
  Info,
  ChevronDown,
  ChevronUp,
  Tag,
  Clock,
  ShieldCheck,
  Split
} from 'lucide-react';
import api from '../../services/api.js';
import { useCart } from '../../context/CartContext.js';

interface RecalledMemoryItem {
  id: string;
  content: string;
  score: number;
  metadata: {
    category?: string;
    confidence?: number;
    source?: string;
    relevanceExplanation?: string;
    [key: string]: any;
  };
  created_at: string;
  relevanceLabel?: 'High' | 'Medium' | 'Low';
  usedInResponse?: boolean;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  products?: any[];
  timestamp: string;
  recalledMemories?: RecalledMemoryItem[];
  newMemoriesRetained?: any[];
  memoryReasoning?: string;
  comparison?: {
    beforeMemory: {
      behavior: string;
      sampleResponse: string;
      limitation: string;
    };
    afterMemory: {
      behavior: string;
      sampleResponse: string;
      valueDelivered: string;
    };
  };
  metrics?: {
    latencyMs: number;
    memoriesRecalledCount: number;
    memoriesRetainedCount: number;
    memoryEngine: string;
  };
}

interface AskManaAIModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AskManaAIModal: React.FC<AskManaAIModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  // Tab state: 'chat' | 'memory_hub' | 'before_after'
  const [activeTab, setActiveTab] = useState<'chat' | 'memory_hub' | 'before_after'>('chat');
  const [enableMemory, setEnableMemory] = useState<boolean>(true);
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Namaste! 🙏 I am MaNa AI Concierge, powered by Hindsight Persistent Agent Memory. I remember your regional craft preferences, dietary habits, and procurement budgets across all visits.\n\nTry testing me: Tell me your preferences in Interaction 1, then ask for recommendations in Interaction 2 to see memory recall in action!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [addedItem, setAddedItem] = useState<string | null>(null);
  const [bankMemories, setBankMemories] = useState<any[]>([]);
  const [isMemoryLoading, setIsMemoryLoading] = useState(false);
  const [expandedComparisonId, setExpandedComparisonId] = useState<string | null>(null);
  const [demoStatus, setDemoStatus] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const demoScenarios = [
    {
      title: '1. Seed Interaction 1 (Preferences)',
      query: 'I need to buy Pochampally handlooms and cold-pressed oils for my niece wedding in Hyderabad, budget under ₹10,000.',
      desc: 'Stores budget ceiling, regional craft, and dietary preferences in Hindsight.'
    },
    {
      title: '2. Test Interaction 2 (Recall & Filter)',
      query: 'Show me suitable gifts for the wedding ceremony.',
      desc: 'Hindsight automatically recalls budget (₹10k) and Pochampally silk preference without re-asking.'
    },
    {
      title: '3. Test Dietary Reorder (Recall)',
      query: 'I need cooking oil for my household.',
      desc: 'Hindsight recalls cold-pressed / wood ganuga preference automatically.'
    }
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      fetchBankMemories();
    }
  }, [isOpen]);

  const fetchBankMemories = async () => {
    setIsMemoryLoading(true);
    try {
      const res = await api.get('/ai/memory/list?bankId=demo_user_hindsight');
      if (res.data.success) {
        setBankMemories(res.data.memories || []);
      }
    } catch (e) {
      console.error('Failed to fetch Hindsight memories', e);
    } finally {
      setIsMemoryLoading(false);
    }
  };

  const handleClearMemories = async () => {
    try {
      await api.delete('/ai/memory/clear', { data: { bankId: 'demo_user_hindsight' } });
      setBankMemories([]);
      setDemoStatus('Memory bank cleared successfully.');
      setTimeout(() => setDemoStatus(null), 3000);
    } catch (e) {
      console.error('Failed to clear memories', e);
    }
  };

  const handleDeleteSingleMemory = async (memoryId: string) => {
    try {
      await api.delete(`/ai/memory/${memoryId}?bankId=demo_user_hindsight`);
      setBankMemories(prev => prev.filter(m => m.id !== memoryId));
    } catch (e) {
      console.error('Failed to delete memory', e);
    }
  };

  const handleSeedDemo = async () => {
    setIsLoading(true);
    try {
      const res = await api.post('/ai/demo-seed', { bankId: 'demo_user_hindsight' });
      if (res.data.success) {
        setDemoStatus('✅ Demo preferences seeded into Hindsight Bank!');
        await fetchBankMemories();
        const infoMsg: Message = {
          id: `demo_seed_${Date.now()}`,
          sender: 'ai',
          text: '⚡ [Demo Scenario Loaded]: 4 persistent memories (₹10,000 budget, Pochampally handlooms, Cold-pressed oils, Wedding context) are now retained in Hindsight. Ask any query now to see instant recall!',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, infoMsg]);
      }
    } catch (e) {
      console.error('Failed to seed demo', e);
    } finally {
      setIsLoading(false);
      setTimeout(() => setDemoStatus(null), 4000);
    }
  };

  if (!isOpen) return null;

  const handleSendMessage = async (queryToSend?: string) => {
    const text = queryToSend || inputQuery.trim();
    if (!text || isLoading) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!queryToSend) setInputQuery('');
    setIsLoading(true);

    try {
      const res = await api.post('/ai/agent-chat', { 
        message: text,
        bankId: 'demo_user_hindsight',
        enableMemory
      });

      if (res.data.success) {
        const aiMessage: Message = {
          id: `ai_${Date.now()}`,
          sender: 'ai',
          text: res.data.reply,
          products: res.data.recommendedProducts,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          recalledMemories: res.data.recalledMemories,
          newMemoriesRetained: res.data.newMemoriesRetained,
          memoryReasoning: res.data.memoryReasoning,
          comparison: res.data.comparison,
          metrics: res.data.metrics
        };
        setMessages((prev) => [...prev, aiMessage]);
        // Refresh memory bank
        fetchBankMemories();
      }
    } catch (err) {
      const errorMsg: Message = {
        id: `ai_err_${Date.now()}`,
        sender: 'ai',
        text: 'Sorry, I encountered a temporary connection issue. Please try again!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async (product: any) => {
    try {
      await addToCart(product.id, undefined, 1);
      setAddedItem(product.id);
      setTimeout(() => setAddedItem(null), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-4xl h-[92vh] max-h-[820px] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Top Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-amber-700 via-amber-800 to-slate-900 text-white flex items-center justify-between flex-shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-inner">
              <Brain className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg leading-tight tracking-wide">MaNa AI Concierge</h3>
                <span className="bg-amber-400/20 text-amber-200 border border-amber-400/30 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">
                  Hindsight Memory Core
                </span>
              </div>
              <p className="text-xs text-amber-100/80">
                Persistent Agent Memory • Regional Indian Marketplace
              </p>
            </div>
          </div>

          {/* Navigation Tabs & Controls */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex bg-slate-800/80 p-1 rounded-xl border border-slate-700 text-xs">
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                  activeTab === 'chat'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Bot className="w-3.5 h-3.5" /> Chat
              </button>
              <button
                onClick={() => { setActiveTab('memory_hub'); fetchBankMemories(); }}
                className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                  activeTab === 'memory_hub'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Database className="w-3.5 h-3.5" /> Memory Hub ({bankMemories.length})
              </button>
              <button
                onClick={() => setActiveTab('before_after')}
                className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
                  activeTab === 'before_after'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <Split className="w-3.5 h-3.5" /> Before vs After
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sub-bar: Memory Toggle & Quick Seed Demo Bar */}
        <div className="bg-slate-100 dark:bg-slate-800/90 px-5 py-2 border-b border-slate-200 dark:border-slate-750 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={enableMemory} 
                onChange={(e) => setEnableMemory(e.target.checked)}
                className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300 dark:border-slate-600"
              />
              <span className={`font-semibold ${enableMemory ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500'}`}>
                {enableMemory ? '⚡ Hindsight Memory: ACTIVE' : '⚪ Hindsight Memory: DISABLED (Stateless Mode)'}
              </span>
            </label>

            <span className="hidden md:inline text-slate-400">|</span>
            <span className="hidden md:inline text-slate-600 dark:text-slate-300">
              Bank ID: <code className="bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-amber-700 dark:text-amber-400 font-mono">demo_user_hindsight</code>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSeedDemo}
              disabled={isLoading}
              className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg shadow-sm transition flex items-center gap-1 text-[11px]"
            >
              <Zap className="w-3 h-3" /> Quick Seed Demo
            </button>
            <button
              onClick={handleClearMemories}
              className="px-2 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-rose-600 hover:text-white text-slate-700 dark:text-slate-300 rounded-lg transition flex items-center gap-1 text-[11px]"
              title="Clear all stored memories for a fresh start"
            >
              <Trash2 className="w-3 h-3" /> Reset Bank
            </button>
          </div>
        </div>

        {demoStatus && (
          <div className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 px-5 py-1.5 text-xs font-medium border-b border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" /> {demoStatus}
          </div>
        )}

        {/* TAB 1: Main Conversation View */}
        {activeTab === 'chat' && (
          <>
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-start gap-2.5 max-w-[90%] md:max-w-[85%]">
                    {msg.sender === 'ai' && (
                      <div className="w-8 h-8 rounded-full bg-amber-700 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}
                    
                    <div 
                      className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                        msg.sender === 'user' 
                          ? 'bg-amber-700 text-white rounded-tr-none' 
                          : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-none'
                      }`}
                    >
                      {/* Message Content */}
                      <div className="whitespace-pre-line">{msg.text}</div>

                      {/* Memory Recall Badge / Reasoning Header */}
                      {msg.recalledMemories && msg.recalledMemories.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700/80">
                          <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1.5">
                            <Brain className="w-3.5 h-3.5" />
                            <span>Retrieved {msg.recalledMemories.length} Hindsight Memories:</span>
                          </div>
                          <div className="space-y-1">
                            {msg.recalledMemories.map((mem) => (
                              <div 
                                key={mem.id} 
                                className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-md p-2 text-xs text-slate-700 dark:text-slate-300"
                              >
                                <div className="flex items-center justify-between font-medium text-amber-900 dark:text-amber-200">
                                  <span>{mem.content}</span>
                                  <span className="bg-amber-200/70 dark:bg-amber-900/60 text-[10px] px-1.5 py-0.5 rounded font-mono">
                                    Score: {mem.score}
                                  </span>
                                </div>
                                {mem.metadata?.relevanceExplanation && (
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                    💡 <em>Why relevant:</em> {mem.metadata.relevanceExplanation}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* New Memory Retained Notice */}
                      {msg.newMemoriesRetained && msg.newMemoriesRetained.length > 0 && (
                        <div className="mt-2 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/30 p-1.5 rounded border border-emerald-200 dark:border-emerald-800/50">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Retained {msg.newMemoriesRetained.length} new preference constraint into Hindsight Bank</span>
                        </div>
                      )}

                      {/* Expandable Before vs After Comparison Card */}
                      {msg.comparison && (
                        <div className="mt-3 pt-2">
                          <button
                            onClick={() => setExpandedComparisonId(expandedComparisonId === msg.id ? null : msg.id)}
                            className="text-xs text-amber-700 dark:text-amber-400 hover:underline font-semibold flex items-center gap-1"
                          >
                            <Split className="w-3 h-3" />
                            {expandedComparisonId === msg.id ? 'Hide Before vs After Memory Impact' : 'View Before vs After Memory Impact'}
                            {expandedComparisonId === msg.id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          </button>

                          {expandedComparisonId === msg.id && (
                            <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-900/90 p-2.5 rounded-xl border border-slate-300 dark:border-slate-700">
                              <div className="p-2.5 bg-rose-50 dark:bg-rose-950/30 rounded-lg border border-rose-200 dark:border-rose-900/50">
                                <div className="font-bold text-rose-800 dark:text-rose-300 mb-1 flex items-center gap-1">
                                  <span>❌ Before Memory (Stateless)</span>
                                </div>
                                <p className="text-slate-600 dark:text-slate-300 italic mb-1.5">"{msg.comparison.beforeMemory.sampleResponse}"</p>
                                <p className="text-[11px] text-rose-700 dark:text-rose-400 font-medium">⚠️ {msg.comparison.beforeMemory.limitation}</p>
                              </div>

                              <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-900/50">
                                <div className="font-bold text-emerald-800 dark:text-emerald-300 mb-1 flex items-center gap-1">
                                  <span>✅ After Memory (Hindsight)</span>
                                </div>
                                <p className="text-slate-600 dark:text-slate-300 italic mb-1.5">"{msg.comparison.afterMemory.sampleResponse}"</p>
                                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">✨ {msg.comparison.afterMemory.valueDelivered}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Product Recommendation Cards Carousel */}
                      {msg.products && msg.products.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700">
                          <p className="font-bold text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                            Curated Products Matching Constraints ({msg.products.length}):
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {msg.products.map((p) => (
                              <div 
                                key={p.id}
                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 flex flex-col justify-between hover:shadow-md transition"
                              >
                                <div>
                                  <div className="flex items-start justify-between gap-2">
                                    <h4 className="font-bold text-slate-900 dark:text-white text-xs line-clamp-1">
                                      {p.title}
                                    </h4>
                                    <span className="text-[10px] bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 px-1.5 py-0.5 rounded font-semibold whitespace-nowrap">
                                      {p.discount_percent}% OFF
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                                    {p.short_description}
                                  </p>
                                  {p.matchReason && (
                                    <p className="text-[10px] text-amber-700 dark:text-amber-400 font-medium mt-1">
                                      🎯 {p.matchReason}
                                    </p>
                                  )}
                                </div>

                                <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                  <div className="flex items-baseline gap-1.5">
                                    <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                                      ₹{p.price.toLocaleString('en-IN')}
                                    </span>
                                    <span className="text-[10px] text-slate-400 line-through">
                                      ₹{p.mrp.toLocaleString('en-IN')}
                                    </span>
                                  </div>

                                  <button
                                    onClick={() => handleAddToCart(p)}
                                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition flex items-center gap-1 ${
                                      addedItem === p.id 
                                        ? 'bg-emerald-600 text-white' 
                                        : 'bg-amber-600 hover:bg-amber-700 text-white'
                                    }`}
                                  >
                                    {addedItem === p.id ? (
                                      <>
                                        <Check className="w-3 h-3" /> Added
                                      </>
                                    ) : (
                                      <>
                                        <ShoppingCart className="w-3 h-3" /> Add
                                      </>
                                    )}
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Timestamp & Metrics footer */}
                      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                        <span>{msg.timestamp}</span>
                        {msg.metrics && (
                          <span className="font-mono">
                            ⚡ {msg.metrics.latencyMs}ms • Recalled: {msg.metrics.memoriesRecalledCount} • Retained: {msg.metrics.memoriesRetainedCount}
                          </span>
                        )}
                      </div>
                    </div>

                    {msg.sender === 'user' && (
                      <div className="w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-center gap-2 text-slate-500 text-xs italic bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 w-fit">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-600" />
                  <span>Querying Hindsight Memory Bank & ranking catalog...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Demo Script Buttons */}
            <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-750 flex items-center gap-2 overflow-x-auto text-xs">
              <span className="font-bold text-slate-500 text-[11px] whitespace-nowrap flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-600" /> Demo Steps:
              </span>
              {demoScenarios.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(s.query)}
                  className="px-2.5 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg whitespace-nowrap text-slate-700 dark:text-slate-200 hover:border-amber-500 hover:text-amber-700 dark:hover:text-amber-400 transition"
                  title={s.desc}
                >
                  {s.title}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask MaNa AI (e.g., 'Gifts for wedding under ₹10k' or 'Organic cold pressed oils')..."
                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={isLoading || !inputQuery.trim()}
                className="p-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl shadow transition"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </>
        )}

        {/* TAB 2: Live Memory Inspector Hub */}
        {activeTab === 'memory_hub' && (
          <div className="flex-1 overflow-y-auto p-5 md:p-6 bg-slate-50 dark:bg-slate-900">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-amber-600" />
                  Hindsight Persistent Memory Bank
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Real-time inspection of active memories stored in the agent memory bank for this customer.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={fetchBankMemories}
                  className="p-1.5 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 text-slate-700 dark:text-slate-300 rounded-lg text-xs flex items-center gap-1 font-medium"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isMemoryLoading ? 'animate-spin' : ''}`} /> Refresh
                </button>
                <button
                  onClick={handleSeedDemo}
                  className="px-2.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1"
                >
                  <Zap className="w-3.5 h-3.5" /> Re-Seed Demo
                </button>
              </div>
            </div>

            {bankMemories.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-slate-800/60 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-6">
                <Brain className="w-12 h-12 text-slate-400 mx-auto mb-3 stroke-1" />
                <h5 className="font-bold text-slate-700 dark:text-slate-300 text-sm">No memories retained yet</h5>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Click "Re-Seed Demo" or have a conversation in the Chat tab. The agent will automatically extract and retain preferences.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {bankMemories.map((mem) => (
                  <div 
                    key={mem.id}
                    className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          {mem.metadata?.category || 'preference'}
                        </span>
                        <button
                          onClick={() => handleDeleteSingleMemory(mem.id)}
                          className="text-slate-400 hover:text-rose-500 p-1 rounded"
                          title="Delete memory"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">
                        {mem.content}
                      </p>

                      {mem.metadata?.relevanceExplanation && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 bg-slate-50 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                          💡 <strong>Relevance Rationale:</strong> {mem.metadata.relevanceExplanation}
                        </p>
                      )}
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-750 flex items-center justify-between text-[10px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {new Date(mem.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span className="font-mono bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">
                        Confidence: {Math.round((mem.metadata?.confidence || 0.95) * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Before vs After Memory Interactive Showcase */}
        {activeTab === 'before_after' && (
          <div className="flex-1 overflow-y-auto p-5 md:p-6 bg-slate-50 dark:bg-slate-900 space-y-6">
            <div>
              <h4 className="font-bold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                <Split className="w-5 h-5 text-amber-600" />
                Why Agent Memory Matters: Before vs. After
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Direct side-by-side contrast of the user journey with standard stateless AI vs. Hindsight-powered persistent memory.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* BEFORE CARD */}
              <div className="bg-rose-50/70 dark:bg-rose-950/20 border-2 border-rose-200 dark:border-rose-900/60 rounded-2xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-200 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      Stateless Standard Chatbot (Before)
                    </span>
                  </div>
                  
                  <h5 className="font-bold text-slate-900 dark:text-white text-sm mb-2">
                    Generic, Repetitive Prompting
                  </h5>
                  
                  <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-2 mb-4">
                    <li className="flex items-start gap-1.5">
                      <span className="text-rose-600 font-bold">❌</span>
                      <span>Forgets user's ₹10k wedding procurement budget every new session.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-rose-600 font-bold">❌</span>
                      <span>Re-recommends factory powerloom items despite previous requests for GI-tagged Pochampally silk.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-rose-600 font-bold">❌</span>
                      <span>Forces customer to type repetitive dietary criteria (cold-pressed wood ganuga oil) repeatedly.</span>
                    </li>
                  </ul>

                  <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-rose-150 text-xs text-slate-600 dark:text-slate-300 italic">
                    "I found 50 sarees. What is your budget? Are you looking for silk or cotton? Is there a specific region you prefer?"
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-rose-200 dark:border-rose-900/40 text-[11px] text-rose-700 dark:text-rose-400 font-semibold">
                  High churn rate • Frustrating user friction • Stateless
                </div>
              </div>

              {/* AFTER CARD */}
              <div className="bg-emerald-50/70 dark:bg-emerald-950/20 border-2 border-emerald-300 dark:border-emerald-800/80 rounded-2xl p-5 flex flex-col justify-between shadow-sm">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                      Hindsight Memory Augmented (After)
                    </span>
                  </div>

                  <h5 className="font-bold text-slate-900 dark:text-white text-sm mb-2">
                    Context-Aware, One-Click Personalization
                  </h5>

                  <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-2 mb-4">
                    <li className="flex items-start gap-1.5">
                      <span className="text-emerald-600 font-bold">✅</span>
                      <span>Instantly remembers ₹10k ceiling and prioritizes certified Silk Mark Pochampally sarees.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-emerald-600 font-bold">✅</span>
                      <span>Recalls cold-pressed oil preference and surfaces farm-direct Godavari cold-pressed oils.</span>
                    </li>
                    <li className="flex items-start gap-1.5">
                      <span className="text-emerald-600 font-bold">✅</span>
                      <span>Zero repetitive prompts — frictionless conversational procurement.</span>
                    </li>
                  </ul>

                  <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-emerald-200 text-xs text-slate-700 dark:text-slate-200 italic font-medium">
                    "Remembering your niece's wedding in Hyderabad and keeping under your ₹10,000 budget, here are authentic GI-Tagged Pochampally Silk Handlooms with Silk Mark certification..."
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-emerald-200 dark:border-emerald-800/40 text-[11px] text-emerald-700 dark:text-emerald-300 font-semibold">
                  Delightful VIP experience • Instant conversion • Hindsight Powered
                </div>
              </div>
            </div>

            <div className="text-center pt-2">
              <button
                onClick={() => { setActiveTab('chat'); }}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow transition text-xs"
              >
                Experience Live Demo in Chat Tab →
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Send, Loader2, Maximize2, Minimize2, CheckSquare, Calendar, Activity, RefreshCw } from 'lucide-react';
import { useAI } from '../../context/AIContext';
import api from '../../api/axios';

export default function AIAssistantPanel() {
  const { isOpen, closeAI, initialMessage } = useAI();
  const [isExpanded, setIsExpanded] = useState(false);
  const initialMessages = [
    { role: 'model', parts: [{ text: "Hi! I'm your NexTASK AI Assistant. How can I help you manage your tasks today?" }] }
  ];
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    if (initialMessage && isOpen) {
      setInput(initialMessage);
    }
  }, [initialMessage, isOpen]);

  const handleSend = async (textToSend = input) => {
    if (!textToSend.trim()) return;

    const userMsg = { role: 'user', parts: [{ text: textToSend }] };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Cleanly format the base URL to prevent duplicate /api paths
      const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const baseUrl = rawApiUrl.endsWith('/api') ? rawApiUrl.slice(0, -4) : rawApiUrl;
      
      const response = await fetch(`${baseUrl}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('tf_token')}`
        },
        body: JSON.stringify({
          message: textToSend,
          history: messages
        })
      });

      if (!response.ok) {
        let errorMsg = 'Network response was not ok';
        try {
          const errData = await response.json();
          if (errData.message) errorMsg = errData.message;
        } catch (e) {
          // ignore json parse error
        }
        throw new Error(errorMsg);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: '' }] }]);

      let buffer = '';
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        
        for (const line of lines) {
          const trimmedLine = line.trim();
          if (trimmedLine.startsWith('data: ')) {
            const dataStr = trimmedLine.substring(6); // remove 'data: '
            if (dataStr === '[DONE]') {
              break;
            }
            try {
              const data = JSON.parse(dataStr);
              if (data.text) {
                setMessages(prev => {
                  const newMsgs = [...prev];
                  const lastIndex = newMsgs.length - 1;
                  if (lastIndex < 0) return prev;
                  const currentText = newMsgs[lastIndex]?.parts?.[0]?.text || '';
                  const lastMsg = {
                    ...newMsgs[lastIndex],
                    parts: [{ text: currentText + data.text }]
                  };
                  newMsgs[lastIndex] = lastMsg;
                  return newMsgs;
                });
              } else if (data.error) {
                 console.error('AI Error:', data.error);
                 setMessages(prev => {
                   const newMsgs = [...prev];
                   const lastIndex = newMsgs.length - 1;
                   if (lastIndex >= 0) {
                     newMsgs[lastIndex] = {
                       ...newMsgs[lastIndex],
                       parts: [{ text: (newMsgs[lastIndex]?.parts?.[0]?.text || '') + `\n\n[Error: ${data.error}]` }]
                     };
                   }
                   return newMsgs;
                 });
              }
            } catch (e) {
              // Ignore parse error as it's handled by buffering, or it is malformed
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      
      let displayMsg = error.message;
      // Sanitize technical or quota errors into user-friendly messages
      if (displayMsg.includes('429') || displayMsg.toLowerCase().includes('quota')) {
        displayMsg = "You have reached your daily AI usage limit. Please take a break and try again later!";
      } else if (displayMsg.includes('GoogleGenerativeAI') || displayMsg.includes('Network response was not ok')) {
        displayMsg = "I'm currently experiencing technical difficulties. Please try again later.";
      }
      
      setMessages(prev => [...prev, { role: 'model', parts: [{ text: `Sorry, ${displayMsg}` }] }]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { icon: CheckSquare, label: 'Break down a task', prompt: 'I need to break down a large task. What information do you need?' },
    { icon: Calendar, label: 'Sprint Plan', prompt: 'Help me plan a sprint for the upcoming week based on my active tasks.' },
    { icon: Activity, label: 'Summarize Progress', prompt: 'Summarize the recent project progress.' },
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className={`fixed bottom-6 right-6 z-50 flex flex-col overflow-hidden ${
          isExpanded ? 'w-[600px] h-[80vh]' : 'w-[380px] h-[600px]'
        }`}
        style={{
          background: 'rgba(10, 15, 30, 0.95)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: '1.5rem',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.1)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shadow-[0_0_12px_rgba(99,102,241,0.5)]">
              <Sparkles size={16} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100">NexTASK AI</h3>
              <p className="text-[10px] text-indigo-300 font-medium tracking-wide">Powered by Gemini</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={() => {
                setMessages(initialMessages);
                setInput('');
              }} 
              title="Refresh Chat"
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <RefreshCw size={14} />
            </button>
            <button onClick={() => setIsExpanded(!isExpanded)} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-slate-200 transition-colors">
              {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
            <button onClick={closeAI} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-br-sm' 
                    : 'bg-white/5 text-slate-200 border border-white/10 rounded-bl-sm'
                }`}
              >
                {/* Basic markdown rendering (bold, lists) - for a real app, use react-markdown */}
                {msg.parts[0].text.split('\n').map((line, idx) => (
                  <span key={idx}>
                    {line.replace(/\*\*(.*?)\*\*/g, '$1')} 
                    {idx !== msg.parts[0].text.split('\n').length - 1 && <br />}
                  </span>
                ))}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-2xl px-4 py-3 bg-white/5 border border-white/10 rounded-bl-sm flex gap-1">
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        {messages.length < 3 && (
          <div className="px-5 py-3 flex gap-2 overflow-x-auto no-scrollbar border-t border-white/5">
            {quickActions.map((action, i) => (
              <button
                key={i}
                onClick={() => handleSend(action.prompt)}
                className="flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-full bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-300 text-xs font-medium transition-colors"
              >
                <action.icon size={12} />
                {action.label}
              </button>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 bg-white/[0.02] border-t border-white/10">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex items-center gap-2 relative"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="absolute right-2 p-2 rounded-lg bg-indigo-500 text-white disabled:opacity-50 disabled:bg-white/10 transition-colors"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
            </button>
          </form>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

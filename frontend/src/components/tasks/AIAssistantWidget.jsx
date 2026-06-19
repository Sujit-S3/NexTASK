import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, Check, X } from 'lucide-react';
import api from '../../api/axios';

export default function AIAssistantWidget({ title, description, onApply }) {
  const [loading, setLoading] = useState(false);
  const [suggestion, setSuggestion] = useState(null);
  const [error, setError] = useState('');

  const generateSuggestion = async () => {
    if (!title.trim()) {
      setError('Please enter a task title first.');
      return;
    }
    
    setError('');
    setLoading(true);
    
    try {
      const res = await api.post('/ai/suggest', { title, description });
      if (res.data.success) {
        setSuggestion(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to get AI suggestions.');
    } finally {
      setLoading(false);
    }
  };

  const applySuggestions = () => {
    if (!suggestion) return;
    
    let updatedDescription = suggestion.description;
    
    if (suggestion.estimatedHours) {
      updatedDescription += `\n\n**Estimated Time:** ${suggestion.estimatedHours} hours`;
    }
    
    if (suggestion.dependencies && suggestion.dependencies.length > 0) {
      updatedDescription += '\n\n**Dependencies:**\n' + suggestion.dependencies.map(d => `- ${d}`).join('\n');
    }

    if (suggestion.subtasks && suggestion.subtasks.length > 0) {
      updatedDescription += '\n\n**Subtasks:**\n' + suggestion.subtasks.map(t => `- [ ] ${t.title}`).join('\n');
    }
    
    onApply({
      description: updatedDescription,
      priority: suggestion.priority || 'medium',
    });
    
    setSuggestion(null);
  };

  return (
    <div className="mb-5 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl p-4 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-50"></div>
      
      <div className="flex items-start justify-between">
        <div>
          <h4 className="flex items-center gap-2 font-semibold text-indigo-300 text-sm mb-1">
            <Sparkles size={16} className="text-indigo-400" />
            AI Task Assistant
          </h4>
          <p className="text-xs text-slate-400">Generate subtasks, estimates, and polish descriptions.</p>
        </div>
        
        {!suggestion && (
          <button
            type="button"
            onClick={generateSuggestion}
            disabled={loading || !title}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
            {loading ? 'Thinking...' : 'Magic Breakdown'}
          </button>
        )}
      </div>

      {error && <p className="text-xs text-red-400 mt-2">{error}</p>}

      <AnimatePresence>
        {suggestion && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-indigo-500/20"
          >
            <div className="mb-3">
              <span className="text-[10px] uppercase tracking-wider text-indigo-400 font-bold">Suggested Description:</span>
              <p className="text-xs text-slate-300 mt-1 whitespace-pre-wrap">{suggestion.description}</p>
            </div>
            
            {suggestion.subtasks && suggestion.subtasks.length > 0 && (
              <div className="mb-3">
                <span className="text-[10px] uppercase tracking-wider text-indigo-400 font-bold">Subtasks:</span>
                <ul className="text-xs text-slate-300 mt-1 space-y-1">
                  {suggestion.subtasks.map((task, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-sm border border-slate-500 flex-shrink-0" />
                      {task.title}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="flex gap-2 mt-4">
              <button
                type="button"
                onClick={applySuggestions}
                className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold py-2 rounded-lg transition-colors"
              >
                <Check size={14} /> Apply AI Suggestions
              </button>
              <button
                type="button"
                onClick={() => setSuggestion(null)}
                className="flex items-center justify-center gap-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
              >
                <X size={14} /> Discard
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { Activity, PlusCircle, RefreshCw, Trash2, UserPlus, MessageCircle } from 'lucide-react';
import api from '../../api/axios';
import { useSocketContext } from '../../contexts/SocketContext';

const iconMap = {
  created: { icon: PlusCircle, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)' },
  updated: { icon: RefreshCw, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)' },
  status_changed: { icon: Activity, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  deleted: { icon: Trash2, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  assigned: { icon: UserPlus, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  commented: { icon: MessageCircle, color: '#06b6d4', bg: 'rgba(6,182,212,0.1)' },
};

export default function ActivityTimeline() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocketContext();

  const fetchActivities = async () => {
    try {
      const res = await api.get('/activities?limit=15');
      if (res.data.success) {
        setActivities(res.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();

    if (socket) {
      socket.on('activity:new', fetchActivities);
    }

    return () => {
      if (socket) {
        socket.off('activity:new', fetchActivities);
      }
    };
  }, [socket]);

  if (loading) {
    return (
      <div className="w-full h-[400px] rounded-2xl border border-white/10 p-6 flex flex-col skeleton" />
    );
  }

  return (
    <div 
      className="w-full rounded-2xl border border-white/10 p-6"
      style={{
        background: 'rgba(13, 20, 40, 0.4)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <div className="flex items-center gap-2 mb-6">
        <Activity size={20} className="text-indigo-400" />
        <h2 className="text-lg font-bold text-slate-100">Activity Timeline</h2>
      </div>

      <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
        <AnimatePresence>
          {activities.length === 0 ? (
            <div className="text-center text-sm text-slate-400 py-4">No recent activity.</div>
          ) : (
            activities.map((act, index) => {
              const { icon: Icon, color, bg } = iconMap[act.action] || iconMap['updated'];
              return (
                <motion.div 
                  key={act._id} 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active"
                >
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10" style={{ backgroundColor: bg }}>
                    <Icon size={18} style={{ color }} />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-white/5 bg-white/[0.02] shadow">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm text-slate-200">{act.user?.name || 'System'}</span>
                      <time className="text-xs text-slate-400">{formatDistanceToNow(new Date(act.createdAt), { addSuffix: true })}</time>
                    </div>
                    <div className="text-sm text-slate-300 leading-snug">
                      {act.details}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

import { motion, AnimatePresence } from 'framer-motion';
import { Bell, CheckCheck } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { markAllRead } from '../../store/notificationSlice';
import useNotifications from '../../hooks/useNotifications';
import NotificationItem from './NotificationItem';

export default function NotificationDropdown({ onClose }) {
  const dispatch = useDispatch();
  const { notifications, unreadCount, loading } = useNotifications();

  const handleMarkAll = async () => {
    await dispatch(markAllRead());
  };

  return (
    <motion.div
      className="dropdown-panel right-0 top-12 w-96 max-h-[80vh] flex flex-col"
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.97 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Top gradient accent */}
      <div className="absolute top-0 left-0 right-0 h-px rounded-t-2xl"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(99,102,241,0.5), rgba(6,182,212,0.3), transparent)' }} />

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <Bell size={13} style={{ color: 'rgba(165,180,252,0.9)' }} />
          </div>
          <h3 className="font-semibold text-sm" style={{ color: 'rgba(241,245,249,0.9)' }}>Notifications</h3>
          {unreadCount > 0 && (
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)', color: 'rgba(165,180,252,0.9)' }}
            >
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <motion.button
            onClick={handleMarkAll}
            className="flex items-center gap-1 text-xs font-medium"
            style={{ color: 'rgba(148,163,184,0.6)' }}
            whileHover={{ color: 'rgba(165,180,252,0.9)' }}
          >
            <CheckCheck size={13} />
            Mark all read
          </motion.button>
        )}
      </div>

      {/* List */}
      <div className="overflow-y-auto flex-1">
        {loading ? (
          <div className="space-y-0 p-2">
            {[1,2,3].map((i) => (
              <div key={i} className="flex items-start gap-3 p-3">
                <div className="skeleton w-8 h-8 rounded-full shrink-0" />
                <div className="flex-1 space-y-2 pt-1">
                  <div className="skeleton h-3 rounded-lg" style={{ width: `${80 - i * 10}%` }} />
                  <div className="skeleton h-2.5 rounded-lg w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-12 text-center">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
            >
              <Bell size={20} style={{ color: 'rgba(148,163,184,0.3)' }} />
            </div>
            <p className="text-sm" style={{ color: 'rgba(148,163,184,0.5)' }}>All caught up!</p>
          </div>
        ) : (
          <AnimatePresence>
            {notifications.slice(0, 15).map((notif) => (
              <NotificationItem key={notif._id} notification={notif} onClose={onClose} />
            ))}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}

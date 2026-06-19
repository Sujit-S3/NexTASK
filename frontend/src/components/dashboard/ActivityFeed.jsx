import { motion, AnimatePresence } from 'framer-motion';
import { formatRelative } from '../../utils/formatters';
import { CheckSquare, MessageCircle, AlertCircle, Bell } from 'lucide-react';
import Avatar from '../common/Avatar';

const TYPE_CONFIG = {
  task_assigned:  { icon: CheckSquare,  color: 'rgba(165,180,252,0.9)',  bg: 'rgba(99,102,241,0.12)'  },
  task_updated:   { icon: CheckSquare,  color: 'rgba(147,197,253,0.9)',  bg: 'rgba(59,130,246,0.12)'  },
  task_completed: { icon: CheckSquare,  color: 'rgba(110,231,183,0.9)',  bg: 'rgba(16,185,129,0.12)'  },
  comment_added:  { icon: MessageCircle,color: 'rgba(196,181,253,0.9)',  bg: 'rgba(139,92,246,0.12)'  },
  task_overdue:   { icon: AlertCircle,  color: 'rgba(252,165,165,0.9)',  bg: 'rgba(239,68,68,0.12)'   },
  default:        { icon: Bell,         color: 'rgba(148,163,184,0.7)',  bg: 'rgba(255,255,255,0.06)' },
};

const listVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
};

export default function ActivityFeed({ activities = [], loading }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1,2,3,4].map((i) => (
          <div key={i} className="flex items-start gap-3 p-2">
            <div className="skeleton w-8 h-8 rounded-full shrink-0" />
            <div className="flex-1 space-y-2 pt-1">
              <div className="skeleton h-3 rounded-lg" style={{ width: `${90 - i * 8}%` }} />
              <div className="skeleton h-2.5 rounded-lg w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!activities?.length) {
    return (
      <div className="py-8 text-center">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <Bell size={18} style={{ color: 'rgba(148,163,184,0.4)' }} />
        </div>
        <p className="text-sm" style={{ color: 'rgba(148,163,184,0.5)' }}>No recent activity</p>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-0.5"
      variants={listVariants}
      initial="hidden"
      animate="show"
    >
      <AnimatePresence>
        {activities.map((item, i) => {
          const { icon: Icon, color, bg } = TYPE_CONFIG[item.type] || TYPE_CONFIG.default;
          return (
            <motion.div
              key={item._id || i}
              variants={itemVariants}
              className="flex items-start gap-3 p-3 rounded-xl group transition-colors duration-200"
              style={{ cursor: 'default' }}
              whileHover={{ background: 'rgba(255,255,255,0.03)' }}
            >
              <div className="relative shrink-0">
                {item.sender ? (
                  <div className="rounded-full ring-1 ring-white/10 overflow-hidden">
                    <Avatar name={item.sender.name} src={item.sender.avatar} size="sm" />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: bg }}>
                    <Icon size={14} style={{ color }} />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm leading-snug" style={{ color: 'rgba(203,213,225,0.85)' }}>{item.message}</p>
                <p className="text-xs mt-0.5" style={{ color: 'rgba(148,163,184,0.5)' }}>{formatRelative(item.createdAt)}</p>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
}

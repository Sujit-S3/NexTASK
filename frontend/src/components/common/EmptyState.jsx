import { motion } from 'framer-motion';
import { InboxIcon, SearchX, AlertCircle, FolderOpen } from 'lucide-react';

const VARIANTS = {
  tasks:   { icon: InboxIcon,   title: 'No tasks yet',         desc: 'Tasks will appear here once created.' },
  search:  { icon: SearchX,     title: 'No results found',     desc: 'Try adjusting your search or filters.' },
  error:   { icon: AlertCircle, title: 'Something went wrong', desc: 'Failed to load data. Please try again.' },
  users:   { icon: FolderOpen,  title: 'No users found',       desc: 'Users you add will appear here.' },
  default: { icon: FolderOpen,  title: 'Nothing here yet',     desc: 'This section is empty.' },
};

export default function EmptyState({ variant = 'default', title, description, action }) {
  const { icon: Icon, title: defaultTitle, desc } = VARIANTS[variant] || VARIANTS.default;

  return (
    <motion.div
      className="flex flex-col items-center justify-center py-20 px-4 text-center"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Icon container */}
      <div className="relative mb-6">
        {/* Ambient glow */}
        <div
          className="absolute inset-0 rounded-3xl animate-pulse-slow"
          style={{
            background: 'rgba(10,132,255,0.06)',
            boxShadow: '0 0 40px rgba(10,132,255,0.10)',
            transform: 'scale(1.3)',
            filter: 'blur(8px)',
          }}
        />
        <motion.div
          className="relative w-20 h-20 rounded-3xl flex items-center justify-center"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            background: 'rgba(255,255,255,0.80)',
            border: '1px solid rgba(255,255,255,0.90)',
            boxShadow: '0 8px 28px rgba(0,0,0,0.07), inset 0 1px 0 rgba(255,255,255,0.95)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <Icon size={28} style={{ color: 'rgba(0,0,0,0.28)' }} />
        </motion.div>
      </div>

      <h3
        className="text-base font-semibold mb-2"
        style={{ color: 'rgba(0,0,0,0.70)', letterSpacing: '-0.015em' }}
      >
        {title || defaultTitle}
      </h3>
      <p
        className="text-sm max-w-xs mb-7"
        style={{ color: 'rgba(0,0,0,0.38)', lineHeight: 1.6 }}
      >
        {description || desc}
      </p>
      {action}
    </motion.div>
  );
}

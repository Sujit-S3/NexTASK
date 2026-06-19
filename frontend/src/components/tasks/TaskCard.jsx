import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MessageCircle, User2 } from 'lucide-react';
import { PriorityBadge, StatusBadge } from '../common/Badge';
import Avatar from '../common/Avatar';
import { formatDueDate, isOverdue } from '../../utils/formatters';

// Color mapping for priority — iOS semantic palette
const priorityGlow = {
  urgent: { color: '#FF3B30', glow: 'rgba(255,59,48,0.18)',  strip: 'linear-gradient(180deg, #FF3B30, #FF6B6B)' },
  high:   { color: '#FF9F0A', glow: 'rgba(255,159,10,0.18)', strip: 'linear-gradient(180deg, #FF9F0A, #FBBF24)' },
  medium: { color: '#FFD60A', glow: 'rgba(255,214,10,0.16)', strip: 'linear-gradient(180deg, #FFD60A, #FCD34D)' },
  low:    { color: '#30D158', glow: 'rgba(48,209,88,0.15)',  strip: 'linear-gradient(180deg, #30D158, #4ADE80)' },
};

export default function TaskCard({ task, onEdit, onDelete }) {
  const navigate  = useNavigate();
  const due       = task.dueDate ? formatDueDate(task.dueDate, task.status) : null;
  const overdue   = isOverdue(task.dueDate, task.status);
  const priority  = priorityGlow[task.priority] || { color: '#5E5CE6', glow: 'rgba(94,92,230,0.15)', strip: 'linear-gradient(180deg, #5E5CE6, #8B5CF6)' };

  return (
    <motion.div
      onClick={() => navigate(`/tasks/${task._id}`)}
      className="relative overflow-hidden cursor-pointer"
      style={{
        background: 'var(--card-bg)',
        backdropFilter: 'var(--glass-blur)',
        WebkitBackdropFilter: 'var(--glass-blur)',
        border: '1px solid var(--c-border)',
        borderRadius: '1.5rem',
        boxShadow: 'var(--glass-shadow)',
        padding: '1.125rem',
      }}
      whileHover={{
        y: -5,
        boxShadow: `0 20px 48px var(--c-shadow), 0 8px 20px ${priority.glow}`,
        borderColor: 'var(--c-accent)',
      }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Priority stripe — left edge glow gradient */}
      <div
        className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full"
        style={{ background: priority.strip, marginLeft: '1px' }}
      />

      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3 pl-3">
        <div className="flex flex-wrap gap-1.5">
          <PriorityBadge priority={task.priority} />
          <StatusBadge status={task.status} />
        </div>
      </div>

      {/* Title */}
      <h3
        className="font-semibold text-sm leading-snug mb-1.5 line-clamp-2 pl-3"
        style={{ color: 'var(--c-text-1)', letterSpacing: '-0.01em' }}
      >
        {task.title}
      </h3>

      {/* Description */}
      {task.description && (
        <p
          className="text-xs line-clamp-2 mb-3 pl-3"
          style={{ color: 'var(--c-text-3)' }}
        >
          {task.description}
        </p>
      )}

      {/* Footer */}
      <div
        className="flex items-center justify-between mt-3 pt-3 pl-3"
        style={{ borderTop: '1px solid var(--c-border)' }}
      >
        {/* Assignee */}
        <div className="flex items-center gap-1.5">
          {task.assignedTo ? (
            <>
              <div
                className="rounded-full overflow-hidden"
                style={{ boxShadow: '0 0 0 1.5px var(--c-accent)' }}
              >
                <Avatar name={task.assignedTo.name} src={task.assignedTo.avatar} size="xs" />
              </div>
              <span className="text-xs truncate max-w-[80px]" style={{ color: 'var(--c-text-3)' }}>
                {task.assignedTo.name}
              </span>
            </>
          ) : (
            <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--c-text-4)' }}>
              <User2 size={11} />
              Unassigned
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {task.commentCount > 0 && (
            <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--c-text-3)' }}>
              <MessageCircle size={11} />
              {task.commentCount}
            </span>
          )}
          {due && (
            <span
              className="flex items-center gap-1 text-xs font-medium"
              style={{
                color: overdue ? '#FF3B30' : 'var(--c-text-3)',
              }}
            >
              <Calendar size={11} />
              {due.label}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

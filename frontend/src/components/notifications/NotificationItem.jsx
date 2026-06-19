import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Check, Trash2, CheckSquare, MessageCircle, AlertCircle, Bell } from 'lucide-react';
import { markRead, deleteNotif } from '../../store/notificationSlice';
import { formatRelative } from '../../utils/formatters';
import Avatar from '../common/Avatar';

const TYPE_ICONS = {
  task_assigned:  { icon: CheckSquare,   iconColor: 'rgba(165,180,252,0.9)', bg: 'rgba(99,102,241,0.12)'  },
  task_updated:   { icon: CheckSquare,   iconColor: 'rgba(147,197,253,0.9)', bg: 'rgba(59,130,246,0.12)'  },
  task_completed: { icon: Check,         iconColor: 'rgba(110,231,183,0.9)', bg: 'rgba(16,185,129,0.12)'  },
  task_overdue:   { icon: AlertCircle,   iconColor: 'rgba(252,165,165,0.9)', bg: 'rgba(239,68,68,0.12)'   },
  comment_added:  { icon: MessageCircle, iconColor: 'rgba(196,181,253,0.9)', bg: 'rgba(139,92,246,0.12)'  },
  default:        { icon: Bell,          iconColor: 'rgba(148,163,184,0.7)', bg: 'rgba(255,255,255,0.06)' },
};

export default function NotificationItem({ notification, onClose }) {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { icon: Icon, iconColor, bg } = TYPE_ICONS[notification.type] || TYPE_ICONS.default;

  const handleClick = () => {
    if (!notification.isRead) dispatch(markRead(notification._id));
    if (notification.task?._id) {
      navigate(`/tasks/${notification.task._id}`);
      onClose?.();
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    dispatch(deleteNotif(notification._id));
  };

  return (
    <div
      onClick={handleClick}
      className="group flex items-start gap-3 px-4 py-3.5 cursor-pointer transition-colors duration-150"
      style={{
        background: !notification.isRead ? 'rgba(99,102,241,0.05)' : 'transparent',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
      onMouseLeave={(e) => e.currentTarget.style.background = !notification.isRead ? 'rgba(99,102,241,0.05)' : 'transparent'}
    >
      {/* Icon / Avatar */}
      <div className="relative shrink-0">
        {notification.sender ? (
          <div className="rounded-full overflow-hidden ring-1 ring-white/10">
            <Avatar name={notification.sender.name} src={notification.sender.avatar} size="sm" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: bg }}>
            <Icon size={14} style={{ color: iconColor }} />
          </div>
        )}
        {!notification.isRead && (
          <span
            className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full"
            style={{ background: '#6366f1', boxShadow: '0 0 6px rgba(99,102,241,0.8)', border: '2px solid rgba(6,13,26,0.9)' }}
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm leading-snug"
          style={{ color: !notification.isRead ? 'rgba(241,245,249,0.95)' : 'rgba(148,163,184,0.75)', fontWeight: !notification.isRead ? 500 : 400 }}
        >
          {notification.message}
        </p>
        {notification.task?.title && (
          <p className="text-xs truncate mt-0.5" style={{ color: 'rgba(148,163,184,0.45)' }}>
            📋 {notification.task.title}
          </p>
        )}
        <p className="text-xs mt-1" style={{ color: 'rgba(148,163,184,0.4)' }}>{formatRelative(notification.createdAt)}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        {!notification.isRead && (
          <button
            onClick={(e) => { e.stopPropagation(); dispatch(markRead(notification._id)); }}
            className="p-1 rounded-lg transition-colors"
            style={{ color: 'rgba(148,163,184,0.5)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(110,231,183,0.9)'; e.currentTarget.style.background = 'rgba(16,185,129,0.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(148,163,184,0.5)'; e.currentTarget.style.background = 'transparent'; }}
            title="Mark as read"
          >
            <Check size={13} />
          </button>
        )}
        <button
          onClick={handleDelete}
          className="p-1 rounded-lg transition-colors"
          style={{ color: 'rgba(148,163,184,0.5)' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(252,165,165,0.9)'; e.currentTarget.style.background = 'rgba(239,68,68,0.1)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(148,163,184,0.5)'; e.currentTarget.style.background = 'transparent'; }}
          title="Delete"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}

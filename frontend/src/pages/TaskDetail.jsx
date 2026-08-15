import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Edit2, Trash2, Calendar, User2, Tag, Clock, RefreshCw } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTaskById, updateTask, deleteTask } from '../store/taskSlice';
import { PriorityBadge, StatusBadge } from '../components/common/Badge';
import Avatar from '../components/common/Avatar';
import CommentSection from '../components/tasks/CommentSection';
import ConfirmDialog from '../components/common/ConfirmDialog';
import Modal from '../components/common/Modal';
import TaskForm from '../components/tasks/TaskForm';
import { formatDate, formatRelative, isOverdue } from '../utils/formatters';
import { getUsers } from '../api/user.api';
import useSocket from '../hooks/useSocket';
import toast from 'react-hot-toast';

const STATUS_ACTIONS = [
  { value: 'todo',        label: 'Todo',        dot: '#94a3b8', active: 'rgba(148,163,184,0.2)', activeBorder: 'rgba(148,163,184,0.4)' },
  { value: 'in-progress', label: 'In Progress', dot: '#3b82f6', active: 'rgba(59,130,246,0.2)',  activeBorder: 'rgba(59,130,246,0.5)'  },
  { value: 'review',      label: 'In Review',   dot: '#8b5cf6', active: 'rgba(139,92,246,0.2)', activeBorder: 'rgba(139,92,246,0.5)'  },
  { value: 'completed',   label: 'Completed',   dot: '#10b981', active: 'rgba(16,185,129,0.2)', activeBorder: 'rgba(16,185,129,0.5)'  },
];

const cardStyle = {
  background: 'var(--card-bg)',
  backdropFilter: 'var(--glass-blur)',
  WebkitBackdropFilter: 'var(--glass-blur)',
  border: '1px solid var(--c-border)',
  borderRadius: '1.25rem',
  boxShadow: 'var(--glass-shadow)',
  padding: '1.5rem',
};

const metaLabel = { fontSize: '0.7rem', color: 'var(--c-text-3)', letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' };
const metaValue = { fontSize: '0.875rem', fontWeight: 500, color: 'var(--c-text-1)' };

export default function TaskDetail() {
  const { id }    = useParams();
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { joinTaskRoom, leaveTaskRoom, socketReady } = useSocket() || {};
  const { user }  = useSelector((s) => s.auth);
  const { task, taskLoading } = useSelector((s) => s.tasks);
  const isAdmin   = user?.role === 'admin';

  const [editOpen,      setEditOpen]      = useState(false);
  const [deleteOpen,    setDeleteOpen]    = useState(false);
  const [editLoading,   setEditLoading]   = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [users,         setUsers]         = useState([]);
  const [statusLoading, setStatusLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchTaskById(id));
  }, [id]);

  // Separate from the data fetch above and keyed on socketReady too: on a
  // direct load/refresh of this page, SocketProvider's connection effect
  // hasn't necessarily run yet when this effect first fires, so joining
  // would silently no-op without a retry once the socket comes up.
  useEffect(() => {
    if (!socketReady) return;
    joinTaskRoom?.(id);
    return () => leaveTaskRoom?.(id);
  }, [id, socketReady]);

  useEffect(() => {
    if (isAdmin) getUsers({ limit: 100 }).then((r) => setUsers(r.data || [])).catch(() => {});
  }, [isAdmin]);

  const handleStatusChange = async (newStatus) => {
    setStatusLoading(true);
    try {
      await dispatch(updateTask({ id, data: { status: newStatus } })).unwrap();
      toast.success('Status updated!');
    } catch { toast.error('Failed to update status'); }
    finally { setStatusLoading(false); }
  };

  const handleEditSubmit = async (data) => {
    setEditLoading(true);
    try {
      await dispatch(updateTask({ id, data })).unwrap();
      toast.success('Task updated!');
      setEditOpen(false);
    } catch { toast.error('Failed to update task'); }
    finally { setEditLoading(false); }
  };

  const handleDelete = async () => {
    setDeleteLoading(true);
    try {
      await dispatch(deleteTask(id)).unwrap();
      toast.success('Task deleted');
      navigate('/tasks');
    } catch { toast.error('Failed to delete task'); }
    finally { setDeleteLoading(false); }
  };

  if (taskLoading) {
    return (
      <div className="max-w-3xl space-y-4">
        <div className="skeleton h-8 w-40 rounded-xl" />
        <div style={{ ...cardStyle, padding: '1.5rem' }} className="space-y-4">
          <div className="flex gap-2">
            <div className="skeleton h-6 w-20 rounded-full" />
            <div className="skeleton h-6 w-24 rounded-full" />
          </div>
          {[1,2,3,4,5].map((i) => <div key={i} className="skeleton h-4 rounded-lg" style={{ width: `${90 - i * 8}%` }} />)}
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="text-center py-20">
        <p className="text-sm mb-4" style={{ color: 'var(--c-text-3)' }}>Task not found.</p>
        <button onClick={() => navigate('/tasks')} className="btn-primary">← Back to Tasks</button>
      </div>
    );
  }

  const overdue = isOverdue(task.dueDate, task.status);

  return (
    <motion.div
      className="max-w-3xl space-y-5"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Back + actions */}
      <div className="flex items-center justify-between">
        <motion.button
          onClick={() => navigate(-1)}
          className="btn-ghost gap-1 text-sm"
          style={{ color: 'var(--c-text-3)' }}
          whileHover={{ x: -2, color: 'var(--c-accent)' }}
          whileTap={{ scale: 0.97 }}
        >
          <ArrowLeft size={15} /> Back
        </motion.button>
        {isAdmin && (
          <div className="flex gap-2">
            <motion.button onClick={() => setEditOpen(true)} className="btn-outline btn-sm" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Edit2 size={12} /> Edit
            </motion.button>
            <motion.button onClick={() => setDeleteOpen(true)} className="btn-danger btn-sm" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Trash2 size={12} /> Delete
            </motion.button>
          </div>
        )}
      </div>

      {/* Main card */}
      <div style={cardStyle} className="space-y-5">
        {/* Top accent */}
        <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl" style={{ background: 'linear-gradient(90deg, transparent, var(--c-accent), transparent)', position: 'relative' }} />

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <PriorityBadge priority={task.priority} />
          <StatusBadge status={task.status} />
          {overdue && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#FF3B30' }}>
              ⚠ Overdue
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-xl font-bold leading-tight" style={{ color: 'var(--c-text-1)', letterSpacing: '-0.02em' }}>
          {task.title}
        </h1>

        {/* Description */}
        {task.description && (
          <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--c-text-2)' }}>
            {task.description}
          </p>
        )}

        {/* Tags */}
        {task.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {task.tags.map((tag) => (
              <span key={tag}
                className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium"
                style={{ background: 'var(--c-icon-bg)', border: '1px solid var(--c-border)', color: 'var(--c-accent)' }}>
                <Tag size={9} /> {tag}
              </span>
            ))}
          </div>
        )}

        {/* Divider */}
        <div style={{ borderTop: '1px solid var(--c-border)', margin: '0.25rem 0' }} />

        {/* Meta grid */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <p style={metaLabel}><User2 size={10} /> Assigned To</p>
            {task.assignedTo ? (
              <div className="flex items-center gap-2">
                <div className="rounded-full overflow-hidden ring-1 ring-white/10">
                  <Avatar name={task.assignedTo.name} src={task.assignedTo.avatar} size="xs" />
                </div>
                <span style={metaValue}>{task.assignedTo.name}</span>
              </div>
            ) : <span style={{ ...metaValue, color: 'var(--c-text-3)' }}>Unassigned</span>}
          </div>

          <div>
            <p style={metaLabel}><User2 size={10} /> Created By</p>
            {task.createdBy ? (
              <div className="flex items-center gap-2">
                <div className="rounded-full overflow-hidden ring-1 ring-white/10">
                  <Avatar name={task.createdBy.name} src={task.createdBy.avatar} size="xs" />
                </div>
                <span style={metaValue}>{task.createdBy.name}</span>
              </div>
            ) : <span style={{ ...metaValue, color: 'var(--c-text-3)' }}>—</span>}
          </div>

          <div>
            <p style={metaLabel}><Calendar size={10} /> Due Date</p>
            <span style={{ ...metaValue, color: overdue ? '#FF3B30' : 'var(--c-text-1)' }}>
              {task.dueDate ? formatDate(task.dueDate) : '—'}
            </span>
          </div>

          <div>
            <p style={metaLabel}><Clock size={10} /> Created</p>
            <span style={metaValue}>{formatRelative(task.createdAt)}</span>
          </div>
        </div>

        {/* Status update */}
        <div style={{ borderTop: '1px solid var(--c-border)', paddingTop: '1.25rem' }}>
          <p className="text-xs font-semibold mb-3 flex items-center gap-1.5"
            style={{ color: 'var(--c-text-3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            <RefreshCw size={10} />
            Update Status
          </p>
          <div className="flex flex-wrap gap-2">
            {STATUS_ACTIONS.map(({ value, label, dot, active, activeBorder }) => {
              const isCurrent = task.status === value;
              return (
                <motion.button
                  key={value}
                  disabled={statusLoading || isCurrent}
                  onClick={() => handleStatusChange(value)}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-all duration-200"
                  style={{
                    background: isCurrent ? active : 'var(--c-bg)',
                    border: `1px solid ${isCurrent ? activeBorder : 'var(--c-border)'}`,
                    color: isCurrent ? 'var(--c-text-1)' : 'var(--c-text-3)',
                    cursor: isCurrent ? 'default' : 'pointer',
                    boxShadow: isCurrent ? `0 0 12px ${active}` : 'none',
                  }}
                  whileHover={!isCurrent ? { scale: 1.04, background: 'var(--c-surface-hover)' } : {}}
                  whileTap={!isCurrent ? { scale: 0.97 } : {}}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: dot, boxShadow: isCurrent ? `0 0 6px ${dot}` : 'none' }} />
                  {label}
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Comments */}
      <div style={cardStyle}>
        <CommentSection taskId={id} />
      </div>

      {/* Edit modal */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Task" size="lg">
        <TaskForm onSubmit={handleEditSubmit} initialData={task} loading={editLoading} users={users} isAdmin={isAdmin} />
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete Task?"
        message={`"${task.title}" will be permanently deleted.`}
      />
    </motion.div>
  );
}

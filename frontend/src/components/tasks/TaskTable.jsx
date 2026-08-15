import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronUp, ChevronDown, Edit2, Trash2, Eye } from 'lucide-react';
import { PriorityBadge, StatusBadge } from '../common/Badge';
import Avatar from '../common/Avatar';
import { formatDate, isOverdue } from '../../utils/formatters';
import { TableRowSkeleton } from '../common/LoadingSkeleton';
import EmptyState from '../common/EmptyState';
import { PRIORITIES, STATUSES } from '../../utils/constants';

const PRIORITY_RANK = Object.fromEntries(PRIORITIES.map((p, i) => [p.value, i]));
const STATUS_RANK   = Object.fromEntries(STATUSES.map((s, i) => [s.value, i]));

export default function TaskTable({ tasks, loading, onEdit, onDelete, isAdmin }) {
  const navigate = useNavigate();
  const [sortField, setSortField] = useState('createdAt');
  const [sortDir,   setSortDir]   = useState('desc');

  const handleSort = (field) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('asc'); }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <ChevronUp size={12} style={{ color: 'var(--c-text-4)' }} />;
    return sortDir === 'asc'
      ? <ChevronUp   size={12} style={{ color: 'var(--c-accent)' }} />
      : <ChevronDown size={12} style={{ color: 'var(--c-accent)' }} />;
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    let av = a[sortField], bv = b[sortField];
    if (sortField === 'assignedTo') { av = a.assignedTo?.name || ''; bv = b.assignedTo?.name || ''; }
    // Priority/status are workflow-ordered (low→critical, todo→completed),
    // not alphabetical — sort by that rank instead of the raw string value.
    else if (sortField === 'priority') { av = PRIORITY_RANK[av] ?? -1; bv = PRIORITY_RANK[bv] ?? -1; }
    else if (sortField === 'status')   { av = STATUS_RANK[av]   ?? -1; bv = STATUS_RANK[bv]   ?? -1; }
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ?  1 : -1;
    return 0;
  });

  const COLS = [
    { key: 'title',      label: 'Task',     sortable: true },
    { key: 'priority',   label: 'Priority', sortable: true },
    { key: 'status',     label: 'Status',   sortable: true },
    { key: 'assignedTo', label: 'Assignee', sortable: true },
    { key: 'dueDate',    label: 'Due',      sortable: true },
    { key: 'actions',    label: '',         sortable: false },
  ];

  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            {COLS.map((col) => (
              <th
                key={col.key}
                onClick={() => col.sortable && handleSort(col.key)}
                className={col.sortable ? 'cursor-pointer select-none' : ''}
              >
                <div className="flex items-center gap-1.5 group">
                  <span
                    className={col.sortable ? 'transition-colors duration-150' : ''}
                    onMouseEnter={(e) => col.sortable && (e.currentTarget.style.color = 'var(--c-accent)')}
                    onMouseLeave={(e) => col.sortable && (e.currentTarget.style.color = '')}
                  >
                    {col.label}
                  </span>
                  {col.sortable && <SortIcon field={col.key} />}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <TableRowSkeleton cols={COLS.length} rows={5} />
          ) : sortedTasks.length === 0 ? (
            <tr>
              <td colSpan={COLS.length}>
                <EmptyState variant="tasks" />
              </td>
            </tr>
          ) : (
            sortedTasks.map((task, i) => {
              const overdue = isOverdue(task.dueDate, task.status);
              return (
                <motion.tr
                  key={task._id}
                  className="cursor-pointer group"
                  onClick={() => navigate(`/tasks/${task._id}`)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <td>
                    <div className="max-w-xs">
                      <p
                        className="font-medium line-clamp-1"
                        style={{ color: 'var(--c-text-1)', letterSpacing: '-0.01em' }}
                      >
                        {task.title}
                      </p>
                      {task.description && (
                        <p className="text-xs line-clamp-1 mt-0.5" style={{ color: 'var(--c-text-3)' }}>
                          {task.description}
                        </p>
                      )}
                    </div>
                  </td>
                  <td><PriorityBadge priority={task.priority} /></td>
                  <td><StatusBadge status={task.status} /></td>
                  <td>
                    {task.assignedTo ? (
                      <div className="flex items-center gap-2">
                        <div
                          className="rounded-full overflow-hidden"
                          style={{ boxShadow: '0 0 0 1.5px var(--c-accent)' }}
                        >
                          <Avatar name={task.assignedTo.name} src={task.assignedTo.avatar} size="xs" />
                        </div>
                        <span className="text-sm" style={{ color: 'var(--c-text-2)' }}>
                          {task.assignedTo.name}
                        </span>
                      </div>
                    ) : (
                      <span style={{ color: 'var(--c-text-4)' }}>—</span>
                    )}
                  </td>
                  <td>
                    {task.dueDate ? (
                      <span
                        className="text-sm font-medium"
                        style={{ color: overdue ? '#FF3B30' : 'var(--c-text-2)' }}
                      >
                        {formatDate(task.dueDate)}
                        {overdue && (
                          <span
                            className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full"
                            style={{ background: 'rgba(255,59,48,0.10)', color: '#FF3B30' }}
                          >
                            Overdue
                          </span>
                        )}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--c-text-4)' }}>—</span>
                    )}
                  </td>
                  <td>
                    <div
                      className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <motion.button
                        onClick={() => navigate(`/tasks/${task._id}`)}
                        className="p-1.5 rounded-lg transition-all duration-150"
                        style={{ color: 'var(--c-text-3)', background: 'transparent' }}
                        title="View"
                        whileHover={{ scale: 1.1, background: 'var(--c-icon-bg)', color: 'var(--c-accent)' }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Eye size={14} />
                      </motion.button>
                      {isAdmin && (
                        <>
                          <motion.button
                            onClick={() => onEdit?.(task)}
                            className="p-1.5 rounded-lg transition-all duration-150"
                            style={{ color: 'var(--c-text-3)', background: 'transparent' }}
                            title="Edit"
                            whileHover={{ scale: 1.1, background: 'rgba(14,165,233,0.09)', color: 'rgba(14,165,233,0.85)' }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Edit2 size={14} />
                          </motion.button>
                          <motion.button
                            onClick={() => onDelete?.(task)}
                            className="p-1.5 rounded-lg transition-all duration-150"
                            style={{ color: 'var(--c-text-3)', background: 'transparent' }}
                            title="Delete"
                            whileHover={{ scale: 1.1, background: 'rgba(255,59,48,0.09)', color: 'rgba(255,59,48,0.80)' }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Trash2 size={14} />
                          </motion.button>
                        </>
                      )}
                    </div>
                  </td>
                </motion.tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

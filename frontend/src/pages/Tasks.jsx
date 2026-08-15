import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, LayoutGrid, List, Columns, Calendar as CalendarIcon, Search, X } from 'lucide-react';
import { useSelector } from 'react-redux';
import useTasks from '../hooks/useTasks';
import useDebounce from '../hooks/useDebounce';
import TaskTable from '../components/tasks/TaskTable';
import TaskCard from '../components/tasks/TaskCard';
import KanbanBoard from '../components/tasks/KanbanBoard';
import CalendarView from '../components/tasks/CalendarView';
import TaskFilters from '../components/tasks/TaskFilters';
import TaskForm from '../components/tasks/TaskForm';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { getUsers } from '../api/user.api';
import toast from 'react-hot-toast';

export default function Tasks() {
  const navigate      = useNavigate();
  const [searchParams]= useSearchParams();
  const { user }      = useSelector((s) => s.auth);
  const isAdmin       = user?.role === 'admin';

  const { tasks, loading, filters, pagination, setFilter, setPage, clearFilters, updateTask, deleteTask } = useTasks();

  const [view,        setView]        = useState('list');
  const [search,      setSearch]      = useState(searchParams.get('search') || '');
  const [searchFocus, setSearchFocus] = useState(false);
  const [editTask,    setEditTask]     = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editLoading, setEditLoading]  = useState(false);
  const [users,       setUsers]        = useState([]);

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => { setFilter({ search: debouncedSearch }); }, [debouncedSearch]);

  useEffect(() => {
    if (isAdmin) getUsers({ limit: 100 }).then((r) => setUsers(r.data || [])).catch(() => {});
  }, [isAdmin]);

  const handleFilterChange = (f) => setFilter(f);

  const handleEditSubmit = async (data) => {
    setEditLoading(true);
    try {
      await updateTask(editTask._id, data);
      toast.success('Task updated!');
      setEditTask(null);
    } catch { toast.error('Failed to update task'); }
    finally { setEditLoading(false); }
  };

  const handleDeleteConfirm = async () => {
    setDeleteLoading(true);
    try {
      await deleteTask(deleteConfirm._id);
      toast.success('Task deleted');
      setDeleteConfirm(null);
    } catch { toast.error('Failed to delete task'); }
    finally { setDeleteLoading(false); }
  };

  const viewOptions = [
    { key: 'list',     icon: List,          label: 'List' },
    { key: 'grid',     icon: LayoutGrid,    label: 'Grid' },
    { key: 'kanban',   icon: Columns,       label: 'Board' },
    { key: 'calendar', icon: CalendarIcon,  label: 'Calendar' },
  ];

  const panelStyle = {
    background: 'var(--card-bg)',
    backdropFilter: 'var(--glass-blur)',
    WebkitBackdropFilter: 'var(--glass-blur)',
    border: '1px solid var(--c-border)',
    borderRadius: '1.25rem',
    boxShadow: 'var(--glass-shadow)',
    padding: '1.25rem',
  };

  return (
    <motion.div
      className="space-y-5 max-w-screen-xl"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">{pagination.total} task{pagination.total !== 1 ? 's' : ''}</p>
        </div>
        {isAdmin && (
          <motion.button
            onClick={() => navigate('/tasks/new')}
            className="btn-primary self-start"
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
          >
            <Plus size={16} /> New Task
          </motion.button>
        )}
      </div>

      {/* Search + Filters + View toggle */}
      <div style={panelStyle}>
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div
            className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 flex-1 transition-all duration-200"
            style={{
              background: 'var(--input-bg)',
              border: `1px solid ${searchFocus ? 'var(--c-accent)' : 'var(--input-border)'}`,
              boxShadow: searchFocus ? '0 0 0 3px rgba(10,132,255,0.15)' : 'none',
            }}
          >
            <Search size={14} style={{ color: 'var(--c-text-3)', transition: 'color 0.2s' }} />
            <input
              type="text"
              placeholder="Search tasks by title or description…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onFocus={() => setSearchFocus(true)}
              onBlur={() => setSearchFocus(false)}
              className="placeholder:text-slate-400 dark:placeholder:text-slate-500"
              style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--c-text-1)', fontSize: '0.875rem', flex: 1 }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ color: 'var(--c-text-3)' }}>
                <X size={12} />
              </button>
            )}
          </div>

          {/* View toggle */}
          <div
            className="flex items-center p-1 gap-0.5 rounded-xl"
            style={{ background: 'var(--c-bg)', border: '1px solid var(--c-border)' }}
          >
            {viewOptions.map(({ key, icon: Icon, label }) => (
              <motion.button
                key={key}
                onClick={() => setView(key)}
                title={label}
                className="p-2 rounded-lg text-xs font-medium transition-all duration-200"
                style={{
                  background: view === key ? 'var(--c-icon-bg)' : 'transparent',
                  color: view === key ? 'var(--c-accent)' : 'var(--c-text-3)',
                  border: view === key ? '1px solid var(--c-border)' : '1px solid transparent',
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon size={15} />
              </motion.button>
            ))}
          </div>
        </div>

        <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--c-border)' }}>
          <TaskFilters
            filters={filters}
            onChange={handleFilterChange}
            onClear={clearFilters}
            users={users}
            isAdmin={isAdmin}
          />
        </div>
      </div>

      {/* Task views */}
      {view === 'list' && (
        <TaskTable tasks={tasks} loading={loading} isAdmin={isAdmin} onEdit={setEditTask} onDelete={setDeleteConfirm} />
      )}
      {view === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="skeleton rounded-2xl" style={{ height: '12rem' }} />
              ))
            : tasks.map((t) => (
                <TaskCard key={t._id} task={t} onEdit={() => setEditTask(t)} onDelete={() => setDeleteConfirm(t)} />
              ))
          }
        </div>
      )}
      {view === 'kanban' && (
        <KanbanBoard tasks={tasks} loading={loading} isAdmin={isAdmin} onEdit={setEditTask} onDelete={setDeleteConfirm} updateTask={updateTask} />
      )}
      {view === 'calendar' && (
        <CalendarView tasks={tasks} loading={loading} onEdit={setEditTask} />
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
            <motion.button
              key={p}
              onClick={() => setPage(p)}
              className="w-9 h-9 rounded-xl text-sm font-medium transition-all"
              style={{
                background: filters.page === p ? 'var(--c-accent)' : 'var(--c-surface)',
                border: `1px solid ${filters.page === p ? 'var(--c-accent)' : 'var(--c-border)'}`,
                color: filters.page === p ? '#fff' : 'var(--c-text-2)',
                boxShadow: filters.page === p ? '0 4px 12px var(--c-shadow)' : 'none',
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {p}
            </motion.button>
          ))}
        </div>
      )}

      {/* Edit modal */}
      <Modal isOpen={!!editTask} onClose={() => setEditTask(null)} title="Edit Task" size="lg">
        {editTask && (
          <TaskForm
            onSubmit={handleEditSubmit}
            initialData={editTask}
            loading={editLoading}
            users={users}
            isAdmin={isAdmin}
          />
        )}
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDeleteConfirm}
        loading={deleteLoading}
        title="Delete Task?"
        message={`"${deleteConfirm?.title}" will be permanently deleted.`}
      />
    </motion.div>
  );
}

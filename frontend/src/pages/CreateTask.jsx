import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { createTask } from '../store/taskSlice';
import TaskForm from '../components/tasks/TaskForm';
import { getUsers } from '../api/user.api';
import toast from 'react-hot-toast';

export default function CreateTask() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const [loading, setLoading] = useState(false);
  const [users,   setUsers]   = useState([]);

  useEffect(() => {
    getUsers({ limit: 100 }).then((r) => setUsers(r.data || [])).catch(() => {});
  }, []);

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      const result = await dispatch(createTask(data));
      if (result.meta.requestStatus === 'fulfilled') {
        toast.success('Task created! 🎉');
        navigate(`/tasks/${result.payload.data._id}`);
      } else {
        toast.error(result.payload || 'Failed to create task');
      }
    } catch { toast.error('Failed to create task'); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/tasks')} className="btn-ghost gap-1 text-slate-500">
          <ArrowLeft size={16} /> Back
        </button>
      </div>

      <div>
        <h1 className="page-title">Create New Task</h1>
        <p className="page-subtitle">Fill in the details below to create a new task and assign it to your team.</p>
      </div>

      <div className="card overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-brand-50 to-violet-50 dark:from-brand-950/30 dark:to-violet-950/30 border-b border-slate-200 dark:border-slate-700/50">
          <p className="text-sm font-medium text-brand-700 dark:text-brand-300">New Task</p>
        </div>
        <TaskForm
          onSubmit={handleSubmit}
          loading={loading}
          users={users}
          isAdmin={true}
        />
      </div>
    </div>
  );
}

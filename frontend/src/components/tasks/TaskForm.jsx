import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { PRIORITIES, STATUSES } from '../../utils/constants';
import AIAssistantWidget from './AIAssistantWidget';

export default function TaskForm({ onSubmit, initialData, loading, users = [], isAdmin }) {
  const buildInitialForm = () => {
    const base = {
      title:       '',
      description: '',
      priority:    'medium',
      status:      'todo',
      assignedTo:  '',
      dueDate:     '',
      tags:        '',
    };
    if (!initialData) return base;
    return {
      ...base,
      ...initialData,
      dueDate:    initialData.dueDate    ? initialData.dueDate.slice(0, 10) : '',
      assignedTo: initialData.assignedTo?._id || initialData.assignedTo || '',
      tags:       (initialData.tags || []).join(', '),
    };
  };

  const [form, setForm] = useState(buildInitialForm);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.title.trim())       e.title = 'Title is required';
    else if (form.title.length < 3) e.title = 'Title must be at least 3 characters';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (errors[name]) setErrors((e) => ({ ...e, [name]: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const payload = {
      title:       form.title.trim(),
      description: form.description.trim(),
      priority:    form.priority,
      status:      form.status,
      dueDate:     form.dueDate || null,
      tags:        form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
    };
    if (form.assignedTo) payload.assignedTo = form.assignedTo;

    onSubmit(payload);
  };

  const handleApplyAI = (suggestions) => {
    setForm(prev => ({ ...prev, ...suggestions }));
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-5">
      <AIAssistantWidget 
        title={form.title} 
        description={form.description} 
        onApply={handleApplyAI} 
      />

      {/* Title */}
      <div>
        <label className="label">Title <span className="text-red-500">*</span></label>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          className={errors.title ? 'input-error' : 'input'}
          placeholder="Enter task title…"
        />
        {errors.title && <p className="error-msg">{errors.title}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="label">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={3}
          className="input resize-none"
          placeholder="Describe the task in detail…"
        />
      </div>

      {/* Priority & Status */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Priority</label>
          <select name="priority" value={form.priority} onChange={handleChange} className="select">
            {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Status</label>
          <select name="status" value={form.status} onChange={handleChange} className="select"
            disabled={!isAdmin && !initialData}>
            {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {/* Assignee (admin only) */}
      {isAdmin && users.length > 0 && (
        <div>
          <label className="label">Assign To</label>
          <select name="assignedTo" value={form.assignedTo} onChange={handleChange} className="select">
            <option value="">— Unassigned —</option>
            {users.map((u) => <option key={u._id} value={u._id}>{u.name} ({u.email})</option>)}
          </select>
        </div>
      )}

      {/* Due date */}
      <div>
        <label className="label">Due Date</label>
        <input
          type="date"
          name="dueDate"
          value={form.dueDate}
          onChange={handleChange}
          className="input"
          min={new Date().toISOString().split('T')[0]}
        />
      </div>

      {/* Tags */}
      <div>
        <label className="label">Tags <span className="text-xs text-slate-400">(comma-separated)</span></label>
        <input
          name="tags"
          value={form.tags}
          onChange={handleChange}
          className="input"
          placeholder="e.g. frontend, bug, urgent"
        />
      </div>

      {/* Submit */}
      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={loading} className="btn-primary flex-1">
          {loading ? <><Loader2 size={15} className="animate-spin" /> Saving…</> : (initialData ? 'Update Task' : 'Create Task')}
        </button>
      </div>
    </form>
  );
}

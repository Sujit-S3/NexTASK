import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Edit2, Trash2, ToggleLeft, ToggleRight,
  Settings, Loader2, Users as UsersIcon, X,
} from 'lucide-react';
import { RoleBadge } from '../components/common/Badge';
import Avatar from '../components/common/Avatar';
import OnlineIndicator from '../components/common/OnlineIndicator';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import { TableRowSkeleton } from '../components/common/LoadingSkeleton';
import { useSelector } from 'react-redux';
import * as userApi from '../api/user.api';
import { formatDate, formatRelative } from '../utils/formatters';
import toast from 'react-hot-toast';

const INIT_FORM = { name: '', email: '', password: '', role: 'member', department: '', jobTitle: '' };

const inputClasses = "w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-white/5 border border-slate-300 dark:border-white/10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";

const selectStyleObj = {
  backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
  backgroundPosition: 'right 0.75rem center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: '1.25em 1.25em',
};

const InputField = ({ label, name, type = 'text', placeholder, error, required, value, onChange }) => (
  <div>
    <label className="label">{label}{required && <span className="text-red-400 ml-[2px]">*</span>}</label>
    <input
      type={type} name={name} value={value} onChange={onChange}
      placeholder={placeholder}
      className={`${inputClasses} ${error ? '!border-red-500' : ''}`}
    />
    {error && <p className="error-msg">{error}</p>}
  </div>
);

export default function Users() {
  const { onlineUsers } = useSelector((s) => s.ui);

  const [users,       setUsers]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [searchFocus, setSearchFocus] = useState(false);
  const [roleFilter,  setRoleFilter]  = useState('');
  const [pagination,  setPagination]  = useState({ total: 0, pages: 1, page: 1 });

  const [createOpen,  setCreateOpen]  = useState(false);
  const [editUser,    setEditUser]    = useState(null);
  const [deleteUser,  setDeleteUser]  = useState(null);

  const [form,        setForm]        = useState(INIT_FORM);
  const [formErrors,  setFormErrors]  = useState({});
  const [saving,      setSaving]      = useState(false);
  const [deleting,    setDeleting]    = useState(false);

  useEffect(() => { loadUsers(); }, [search, roleFilter, pagination.page]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await userApi.getUsers({ search, role: roleFilter, page: pagination.page, limit: 15 });
      setUsers(res.data || []);
      setPagination(res.pagination || pagination);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };

  const validateForm = () => {
    const e = {};
    if (!form.name.trim() || form.name.length < 2) e.name = 'Name is required (min 2 chars)';
    if (!/^\S+@\S+\.\S+$/.test(form.email))        e.email = 'Valid email required';
    if (!editUser && form.password.length < 6)      e.password = 'Password min 6 chars';
    return e;
  };

  const openCreate = () => { setForm(INIT_FORM); setFormErrors({}); setEditUser(null); setCreateOpen(true); };
  const openEdit   = (u)  => { setForm({ ...INIT_FORM, ...u, password: '' }); setFormErrors({}); setEditUser(u); setCreateOpen(true); };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (formErrors[name]) setFormErrors((e2) => ({ ...e2, [name]: '' }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const errs = validateForm();
    if (Object.keys(errs).length) { setFormErrors(errs); return; }
    setSaving(true);
    try {
      if (editUser) {
        const payload = { name: form.name, email: form.email, role: form.role, department: form.department, jobTitle: form.jobTitle };
        await userApi.updateUser(editUser._id, payload);
        toast.success('User updated!');
      } else {
        await userApi.createUser(form);
        toast.success('User created!');
      }
      setCreateOpen(false);
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save user');
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await userApi.deleteUser(deleteUser._id);
      toast.success('User deleted');
      setDeleteUser(null);
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    } finally { setDeleting(false); }
  };

  const handleToggleStatus = async (u) => {
    try {
      await userApi.toggleUserStatus(u._id);
      toast.success(`User ${u.isActive ? 'deactivated' : 'activated'}`);
      loadUsers();
    } catch { toast.error('Failed to update status'); }
  };



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
          <h1 className="page-title flex items-center gap-2">
            <UsersIcon size={22} style={{ color: 'var(--c-accent)' }} /> Team Members
          </h1>
          <p className="page-subtitle">{pagination.total} user{pagination.total !== 1 ? 's' : ''} registered</p>
        </div>
        <motion.button
          onClick={openCreate}
          className="btn-primary self-start"
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus size={16} /> Add User
        </motion.button>
      </div>

      {/* Filters */}
      <div style={panelStyle} className="flex flex-col sm:flex-row gap-3">
        <div
          className="flex items-center gap-2.5 rounded-xl px-3.5 py-2 flex-1 transition-all duration-200"
          style={{
            background: 'var(--input-bg)',
            border: `1px solid ${searchFocus ? 'var(--c-accent)' : 'var(--input-border)'}`,
            boxShadow: searchFocus ? '0 0 0 3px rgba(10,132,255,0.15)' : 'none',
          }}
        >
          <Search size={14} style={{ color: 'var(--c-text-3)' }} />
          <input
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPagination((p) => ({ ...p, page: 1 })); }}
            onFocus={() => setSearchFocus(true)}
            onBlur={() => setSearchFocus(false)}
            style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--c-text-1)', fontSize: '0.875rem', flex: 1 }}
          />
          {search && <button onClick={() => setSearch('')} style={{ color: 'var(--c-text-3)' }}><X size={12} /></button>}
        </div>
        <select
          value={roleFilter}
          onChange={(e) => { setRoleFilter(e.target.value); setPagination((p) => ({ ...p, page: 1 })); }}
          className={`${inputClasses} appearance-none pr-10 cursor-pointer w-auto`}
          style={selectStyleObj}
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="member">Member</option>
        </select>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Department</th>
              <th>Status</th>
              <th>Last Seen</th>
              <th>Joined</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <TableRowSkeleton cols={7} rows={6} />
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <EmptyState
                    variant="users"
                    action={
                      <motion.button onClick={openCreate} className="btn-primary btn-sm" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        Add First User
                      </motion.button>
                    }
                  />
                </td>
              </tr>
            ) : (
              users.map((u, i) => {
                const isOnline = onlineUsers.includes(u._id);
                return (
                  <motion.tr
                    key={u._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="relative shrink-0">
                          <div className="rounded-xl overflow-hidden ring-1 ring-white/10">
                            <Avatar name={u.name} src={u.avatar} size="sm" />
                          </div>
                          <OnlineIndicator online={isOnline} size="xs" className="absolute -bottom-0.5 -right-0.5" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm" style={{ color: 'var(--c-text-1)' }}>{u.name}</p>
                          <p className="text-xs" style={{ color: 'var(--c-text-3)' }}>{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td><RoleBadge role={u.role} /></td>
                    <td><span className="text-sm" style={{ color: 'var(--c-text-2)' }}>{u.department || '—'}</span></td>
                    <td>
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{
                          background: u.isActive ? 'rgba(16,185,129,0.1)' : 'var(--c-icon-bg)',
                          border: `1px solid ${u.isActive ? 'rgba(16,185,129,0.25)' : 'var(--c-border)'}`,
                          color: u.isActive ? 'var(--c-text-1)' : 'var(--c-text-3)',
                        }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: u.isActive ? '#10b981' : '#64748b', boxShadow: u.isActive ? '0 0 6px rgba(16,185,129,0.5)' : 'none' }} />
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td><span className="text-xs" style={{ color: 'var(--c-text-3)' }}>{formatRelative(u.lastSeen)}</span></td>
                    <td><span className="text-xs" style={{ color: 'var(--c-text-3)' }}>{formatDate(u.createdAt)}</span></td>
                    <td>
                      <div className="flex items-center gap-0.5">
                        <motion.button onClick={() => openEdit(u)} className="btn-ghost p-1.5" title="Edit user" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                          style={{ color: 'var(--c-text-3)' }}
                          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--c-accent)'}
                          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--c-text-3)'}
                        >
                          <Edit2 size={14} />
                        </motion.button>
                        <motion.button
                          onClick={() => handleToggleStatus(u)}
                          className="btn-ghost p-1.5"
                          title={u.isActive ? 'Deactivate' : 'Activate'}
                          whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                          style={{ color: 'var(--c-text-3)' }}
                          onMouseEnter={(e) => e.currentTarget.style.color = u.isActive ? '#eab308' : '#10b981'}
                          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--c-text-3)'}
                        >
                          {u.isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                        </motion.button>
                        <motion.button onClick={() => setDeleteUser(u)} className="btn-ghost p-1.5" title="Delete user" whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                          style={{ color: 'var(--c-text-3)' }}
                          onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--c-text-3)'}
                        >
                          <Trash2 size={14} />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((p) => (
            <motion.button
              key={p}
              onClick={() => setPagination((prev) => ({ ...prev, page: p }))}
              style={{
                width: '2.25rem', height: '2.25rem', borderRadius: '0.75rem',
                fontSize: '0.875rem', fontWeight: 500, transition: 'all 0.2s',
                background: pagination.page === p ? 'var(--c-accent)' : 'var(--c-surface)',
                border: `1px solid ${pagination.page === p ? 'var(--c-accent)' : 'var(--c-border)'}`,
                color: pagination.page === p ? '#fff' : 'var(--c-text-2)',
                boxShadow: pagination.page === p ? '0 4px 12px var(--c-shadow)' : 'none',
              }}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            >
              {p}
            </motion.button>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title={editUser ? 'Edit User' : 'Add New User'} size="md">
        <form onSubmit={handleSave} className="p-6 space-y-4">
          <InputField label="Full Name" name="name" placeholder="John Doe" error={formErrors.name} required value={form.name} onChange={handleFormChange} />
          <InputField label="Email" name="email" type="email" placeholder="john@company.com" error={formErrors.email} required value={form.email} onChange={handleFormChange} />
          {!editUser && (
            <InputField label="Password" name="password" type="password" placeholder="Min. 6 characters" error={formErrors.password} required value={form.password} onChange={handleFormChange} />
          )}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Role</label>
              <select name="role" value={form.role} onChange={handleFormChange} className={`${inputClasses} appearance-none pr-10 cursor-pointer`} style={selectStyleObj}>
                <option value="member">Member</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="label">Department</label>
              <input name="department" value={form.department} onChange={handleFormChange} placeholder="Engineering" className={inputClasses} />
            </div>
          </div>
          <div>
            <label className="label">Job Title</label>
            <input name="jobTitle" value={form.jobTitle} onChange={handleFormChange} placeholder="Software Engineer" className={inputClasses} />
          </div>
          <div className="flex gap-3 pt-2">
            <motion.button type="button" onClick={() => setCreateOpen(false)} className="btn-outline flex-1" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              Cancel
            </motion.button>
            <motion.button type="submit" disabled={saving} className="btn-primary flex-1" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : (editUser ? 'Update User' : 'Create User')}
            </motion.button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteUser}
        onClose={() => setDeleteUser(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete User?"
        message={`"${deleteUser?.name}" will be permanently deleted and their tasks will be unassigned.`}
      />
    </motion.div>
  );
}

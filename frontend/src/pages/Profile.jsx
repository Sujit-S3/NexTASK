import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Briefcase, Edit2, Save,
  CheckSquare, Clock, TrendingUp, Loader2, Lock, Eye, EyeOff, ChevronDown,
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMe, setUser } from '../store/authSlice';
import * as userApi from '../api/user.api';
import { changePassword } from '../api/auth.api';
import Avatar from '../components/common/Avatar';
import { RoleBadge } from '../components/common/Badge';
import { formatDate } from '../utils/formatters';
import toast from 'react-hot-toast';

const fieldStyle = {
  background: 'var(--input-bg)',
  border: '1px solid var(--input-border)',
  borderRadius: '0.75rem',
  color: 'var(--c-text-1)',
  padding: '0.625rem 1rem',
  width: '100%',
  fontSize: '0.875rem',
  outline: 'none',
  transition: 'all 0.2s ease',
};

export default function Profile() {
  const dispatch  = useDispatch();
  const { user }  = useSelector((s) => s.auth);

  const [profile,      setProfile]      = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [editing,      setEditing]      = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [form,         setForm]         = useState({});

  const [pwForm,       setPwForm]       = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwErrors,     setPwErrors]     = useState({});
  const [pwSaving,     setPwSaving]     = useState(false);
  const [showPw,       setShowPw]       = useState(false);
  const [pwOpen,       setPwOpen]       = useState(false);

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const res = await userApi.getMyProfile();
      setProfile(res.data);
      setForm({
        name:       res.data.name       || '',
        email:      res.data.email      || '',
        department: res.data.department || '',
        jobTitle:   res.data.jobTitle   || '',
        bio:        res.data.bio        || '',
      });
    } catch { toast.error('Failed to load profile'); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await userApi.updateUser(user._id, form);
      setProfile((p) => ({ ...p, ...res.data }));
      dispatch(setUser(res.data));
      setEditing(false);
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally { setSaving(false); }
  };

  const handleCancel = () => {
    setForm({ name: profile.name || '', email: profile.email || '', department: profile.department || '', jobTitle: profile.jobTitle || '', bio: profile.bio || '' });
    setEditing(false);
  };

  const validatePw = () => {
    const e = {};
    if (!pwForm.currentPassword)       e.currentPassword = 'Required';
    if (pwForm.newPassword.length < 6) e.newPassword = 'Min 6 characters';
    if (!/\d/.test(pwForm.newPassword)) e.newPassword = 'Must contain a number';
    if (pwForm.newPassword !== pwForm.confirm) e.confirm = 'Passwords do not match';
    return e;
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    const errs = validatePw();
    if (Object.keys(errs).length) { setPwErrors(errs); return; }
    setPwSaving(true);
    try {
      await changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
      setPwOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setPwSaving(false); }
  };

  const cardStyle = {
    background: 'var(--c-surface)',
    border: '1px solid var(--c-border)',
    borderRadius: '1.25rem',
    boxShadow: 'var(--glass-shadow)',
    overflow: 'hidden',
  };

  if (loading) {
    return (
      <div className="max-w-4xl space-y-4">
        <div className="skeleton h-7 w-40 rounded-xl" />
        <div style={{ ...cardStyle, padding: '1.5rem' }} className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="skeleton w-24 h-24 rounded-full" />
            <div className="space-y-2 flex-1">
              <div className="skeleton h-6 w-48 rounded-lg" />
              <div className="skeleton h-4 w-64 rounded-lg" />
            </div>
          </div>
          {[1,2,3].map((i) => <div key={i} className="skeleton h-24 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  const stats = profile?.stats;

  return (
    <motion.div
      className="max-w-4xl space-y-6 mx-auto"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <div>
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Manage your personal information and account settings.</p>
      </div>

      {/* Profile Card */}
      <div style={cardStyle}>
        {/* Banner */}
        <div className="h-32 w-full" style={{ background: 'linear-gradient(135deg, #4c2db3 0%, #2b5b90 100%)' }} />

        {/* Avatar & Header */}
        <div className="px-8 pb-8 relative">
          <div className="flex items-start justify-between">
            <div className="flex items-end gap-5">
              <div 
                className="w-24 h-24 rounded-full flex items-center justify-center shrink-0 relative -mt-12 z-10"
                style={{ 
                  background: 'linear-gradient(135deg, #4f46e5, #3b82f6)',
                  border: '4px solid var(--c-surface)',
                  boxShadow: '0 0 24px rgba(59, 130, 246, 0.5)'
                }}
              >
                <span className="text-3xl font-bold text-white tracking-wide">
                  {profile?.name ? profile.name.split(' ').map(n=>n[0]).join('').substring(0,2).toUpperCase() : 'U'}
                </span>
              </div>
              <div className="pb-1">
                <div className="flex items-center gap-3 mb-1.5">
                  <h2 className="text-2xl font-bold text-[var(--c-text-1)] tracking-tight">{profile?.name}</h2>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: 'var(--c-icon-bg)', color: 'var(--c-accent)' }}>
                    {profile?.role || 'Member'}
                  </span>
                </div>
                <p className="text-sm flex items-center gap-2" style={{ color: 'var(--c-text-3)' }}>
                  <Mail size={14} /> {profile?.email}
                </p>
              </div>
            </div>

            <div className="pt-4">
              {editing ? (
                <div className="flex gap-2">
                  <motion.button onClick={handleCancel} className="px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105 active:scale-95 btn-secondary">
                    Cancel
                  </motion.button>
                  <motion.button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105 active:scale-95 btn-primary">
                    {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save
                  </motion.button>
                </div>
              ) : (
                <motion.button 
                  onClick={() => setEditing(true)} 
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all hover:scale-105 active:scale-95 btn-primary"
                >
                  <Edit2 size={15} /> Edit Profile
                </motion.button>
              )}
            </div>
          </div>

          <AnimatePresence mode="wait">
            {!editing ? (
              <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-8">
                {/* Stats */}
                {stats && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                    {[
                      { 
                        id: 'assigned', label: 'Assigned', desc: 'Tasks assigned to you',
                        value: stats.assignedCount, icon: CheckSquare, color: 'var(--c-accent)', bg: 'var(--c-icon-bg)', 
                      },
                      { 
                        id: 'completed', label: 'Completed', desc: 'Tasks completed',
                        value: stats.completedCount, icon: TrendingUp, color: '#10b981', bg: 'rgba(16,185,129,0.1)',
                      },
                      { 
                        id: 'progress', label: 'In Progress', desc: 'Tasks in progress',
                        value: stats.inProgressCount, icon: Clock, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)',
                      },
                    ].map(({ id, label, desc, value, icon: Icon, color, bg }) => (
                      <div key={id} className="relative rounded-2xl p-5 overflow-hidden flex flex-col justify-between h-36" style={{ background: 'var(--card-bg)', border: '1px solid var(--c-border)' }}>
                        {/* Bottom glow line */}
                        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-full h-16 blur-2xl" style={{ background: color, opacity: 0.15 }} />
                        <div className="absolute bottom-0 left-0 right-0 h-[3px]" style={{ background: color, opacity: 0.8 }} />
                        
                        <div className="flex items-center gap-4 relative z-10">
                          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg border border-white/5" style={{ background: bg }}>
                            <Icon size={24} style={{ color: color }} />
                          </div>
                          <p className="text-3xl font-bold" style={{ color: 'var(--c-text-1)' }}>{value ?? 0}</p>
                        </div>
                        
                        <div className="relative z-10 mt-3">
                          <p className="text-[15px] font-bold text-[var(--c-text-1)] mb-1">{label}</p>
                          <p className="text-xs" style={{ color: 'var(--c-text-3)' }}>{desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Member Footer */}
                <div className="mt-6 p-4 rounded-2xl flex items-center justify-between" style={{ background: 'var(--card-bg)', border: '1px solid var(--c-border)' }}>
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--c-icon-bg)' }}>
                      <Briefcase size={16} style={{ color: 'var(--c-accent)' }} />
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: 'var(--c-text-3)' }}>Member since</p>
                      <p className="text-sm font-bold text-[var(--c-text-1)]">{formatDate(profile?.createdAt)}</p>
                    </div>
                  </div>
                  <div className="px-5 py-2 rounded-full flex items-center gap-2" style={{ border: '1px solid var(--c-border)', background: 'transparent' }}>
                    <span style={{ color: '#F59E0B', fontSize: '12px' }}>★</span>
                    <span className="text-sm font-semibold text-[var(--c-text-1)]">{profile?.role || 'Member'}</span>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="edit" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-8 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Full Name', key: 'name', placeholder: 'Your name' },
                    { label: 'Email', key: 'email', placeholder: 'you@email.com', type: 'email' },
                    { label: 'Job Title', key: 'jobTitle', placeholder: 'Software Engineer' },
                    { label: 'Department', key: 'department', placeholder: 'Engineering' },
                  ].map(({ label, key, placeholder, type = 'text' }) => (
                    <div key={key}>
                      <label className="label">{label}</label>
                      <input
                        type={type}
                        value={form[key]}
                        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                        placeholder={placeholder}
                        style={fieldStyle}
                        onFocus={(e) => { e.target.style.borderColor = 'rgba(99,102,241,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'; }}
                        onBlur={(e) => { e.target.style.borderColor = 'var(--input-border)'; e.target.style.boxShadow = 'none'; }}
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="label">Bio <span className="text-slate-600 normal-case">(max 500 chars)</span></label>
                  <textarea
                    value={form.bio}
                    onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                    rows={3}
                    maxLength={500}
                    placeholder="Tell your team a bit about yourself…"
                    style={{ ...fieldStyle, resize: 'none' }}
                    onFocus={(e) => { e.target.style.borderColor = 'rgba(99,102,241,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'; }}
                    onBlur={(e) => { e.target.style.borderColor = 'var(--input-border)'; e.target.style.boxShadow = 'none'; }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Password Change */}
      <div style={cardStyle}>
        <button
          onClick={() => setPwOpen((o) => !o)}
          className="flex items-center justify-between w-full p-5"
          style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <Lock size={16} style={{ color: 'rgba(252,211,77,0.8)' }} />
            </div>
            <div className="text-left">
              <p className="font-semibold text-sm" style={{ color: 'var(--c-text-1)' }}>Change Password</p>
              <p className="text-xs" style={{ color: 'var(--c-text-3)' }}>Update your account password</p>
            </div>
          </div>
          <motion.div animate={{ rotate: pwOpen ? 180 : 0 }} transition={{ duration: 0.25 }}>
            <ChevronDown size={16} style={{ color: 'var(--c-text-3)' }} />
          </motion.div>
        </button>

        <AnimatePresence>
          {pwOpen && (
            <motion.form
              onSubmit={handlePasswordChange}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="px-5 pb-5 pt-0 space-y-4" style={{ borderTop: '1px solid var(--c-border)' }}>
                <div className="pt-4 space-y-4">
                  {[
                    { name: 'currentPassword', label: 'Current Password',  placeholder: 'Your current password' },
                    { name: 'newPassword',     label: 'New Password',      placeholder: 'Min 6 chars + 1 number' },
                    { name: 'confirm',         label: 'Confirm Password',  placeholder: 'Repeat new password' },
                  ].map(({ name, label, placeholder }) => (
                    <div key={name}>
                      <label className="label">{label}</label>
                      <div className="relative">
                        <input
                          type={showPw ? 'text' : 'password'}
                          value={pwForm[name]}
                          onChange={(e) => { setPwForm((f) => ({ ...f, [name]: e.target.value })); if (pwErrors[name]) setPwErrors((e2) => ({ ...e2, [name]: '' })); }}
                          placeholder={placeholder}
                          style={{
                            ...fieldStyle,
                            paddingRight: '2.5rem',
                            borderColor: pwErrors[name] ? 'rgba(239,68,68,0.5)' : 'var(--input-border)',
                          }}
                          onFocus={(e) => { e.target.style.borderColor = pwErrors[name] ? 'rgba(239,68,68,0.7)' : 'rgba(99,102,241,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.15)'; }}
                          onBlur={(e) => { e.target.style.borderColor = pwErrors[name] ? 'rgba(239,68,68,0.5)' : 'var(--input-border)'; e.target.style.boxShadow = 'none'; }}
                        />
                        <button type="button" onClick={() => setShowPw((p) => !p)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                          style={{ color: 'var(--c-text-3)' }}>
                          {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                      {pwErrors[name] && <p className="error-msg">{pwErrors[name]}</p>}
                    </div>
                  ))}
                  <div className="flex gap-3">
                    <motion.button type="button" onClick={() => { setPwOpen(false); setPwErrors({}); }} className="btn-outline flex-1" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                      Cancel
                    </motion.button>
                    <motion.button type="submit" disabled={pwSaving} className="btn-primary flex-1" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                      {pwSaving ? <><Loader2 size={14} className="animate-spin" /> Changing…</> : 'Change Password'}
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

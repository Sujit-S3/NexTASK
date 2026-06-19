import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Eye, EyeOff, UserPlus } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';



const formVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};
const fieldVariants = {
  hidden: { opacity: 0, y: 8 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
};

export default function Register() {
  const navigate = useNavigate();
  const { register, loading, error, clearError, isAuthenticated } = useAuth();

  const [form, setForm]   = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => { if (isAuthenticated) navigate('/dashboard', { replace: true }); }, [isAuthenticated]);
  useEffect(() => { return () => clearError(); }, []);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors((e2) => ({ ...e2, [e.target.name]: '' }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim() || form.name.length < 2)  e.name = 'Name must be at least 2 characters';
    if (!/^\S+@\S+\.\S+$/.test(form.email))         e.email = 'Enter a valid email';
    if (form.password.length < 6)                    e.password = 'Password must be at least 6 characters';
    if (!/\d/.test(form.password))                   e.password = 'Password must contain a number';
    if (form.password !== form.confirmPassword)      e.confirmPassword = 'Passwords do not match';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const result = await register({ name: form.name, email: form.email, password: form.password });
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Account created! Welcome to NexTASK 🚀');
      navigate('/dashboard', { replace: true });
    } else {
      toast.error(result.payload || 'Registration failed');
    }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h2 className="text-2xl font-bold mb-1 text-slate-800 dark:text-white tracking-tight">
          Create account
        </h2>
        <p className="text-sm mb-6 text-slate-500 dark:text-slate-400">
          Join NexTASK and collaborate with your team
        </p>
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 px-4 py-3 rounded-2xl text-sm overflow-hidden bg-red-50 text-red-600 border border-red-200 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.form onSubmit={handleSubmit} className="space-y-4" variants={formVariants} initial="hidden" animate="show">
        {/* Full Name */}
        <motion.div variants={fieldVariants}>
          <label className="label">Full Name</label>
          <input
            id="name" type="text" name="name"
            value={form.name} onChange={handleChange}
            placeholder="Jane Doe" disabled={loading}
            className={errors.name ? "input-error" : "input"}
          />
          {errors.name && <p className="error-msg">{errors.name}</p>}
        </motion.div>

        {/* Email */}
        <motion.div variants={fieldVariants}>
          <label className="label">Email address</label>
          <input
            id="email" type="email" name="email"
            value={form.email} onChange={handleChange}
            placeholder="you@company.com" disabled={loading}
            className={errors.email ? "input-error" : "input"}
          />
          {errors.email && <p className="error-msg">{errors.email}</p>}
        </motion.div>

        {/* Password */}
        <motion.div variants={fieldVariants}>
          <div className="flex items-center justify-between mb-1.5">
            <label className="label mb-0">Password</label>
            <button
              type="button" onClick={() => setShowPw((p) => !p)}
              className="text-xs flex items-center gap-1 transition-colors text-slate-400 hover:text-blue-500 dark:text-slate-500 dark:hover:text-blue-400"
            >
              {showPw ? <EyeOff size={12} /> : <Eye size={12} />} {showPw ? 'Hide' : 'Show'}
            </button>
          </div>
          <input
            id="password" type={showPw ? 'text' : 'password'} name="password"
            value={form.password} onChange={handleChange}
            placeholder="Min. 6 chars + 1 number" disabled={loading}
            className={errors.password ? "input-error" : "input"}
          />
          {errors.password && <p className="error-msg">{errors.password}</p>}
        </motion.div>

        {/* Confirm Password */}
        <motion.div variants={fieldVariants}>
          <label className="label">Confirm Password</label>
          <input
            id="confirmPassword" type={showPw ? 'text' : 'password'} name="confirmPassword"
            value={form.confirmPassword} onChange={handleChange}
            placeholder="Repeat password" disabled={loading}
            className={errors.confirmPassword ? "input-error" : "input"}
          />
          {errors.confirmPassword && <p className="error-msg">{errors.confirmPassword}</p>}
        </motion.div>

        <motion.div variants={fieldVariants} className="pt-2">
          <motion.button
            type="submit" disabled={loading}
            className="w-full btn-primary"
            whileHover={{ scale: 1.01, y: -1 }}
            whileTap={{ scale: 0.99 }}
          >
            {loading
              ? <><Loader2 size={18} className="animate-spin" /> Creating account…</>
              : <><UserPlus size={18} /> Create Account</>
            }
          </motion.button>
        </motion.div>
      </motion.form>

      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        className="text-center text-sm mt-6 text-slate-500 dark:text-slate-400"
      >
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-semibold text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
        >
          Sign in
        </Link>
      </motion.p>
    </>
  );
}

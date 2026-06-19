import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Eye, EyeOff, LogIn } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import toast from 'react-hot-toast';



const formVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};
const fieldVariants = {
  hidden: { opacity: 0, y: 10 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};

export default function Login() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login, loading, error, clearError, isAuthenticated } = useAuth();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => { if (isAuthenticated) navigate(from, { replace: true }); }, [isAuthenticated]);
  useEffect(() => { return () => clearError(); }, []);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('Please fill in all fields'); return; }
    const result = await login(form);
    if (result.meta.requestStatus === 'fulfilled') {
      toast.success('Welcome back! 👋');
      navigate(from, { replace: true });
    } else {
      toast.error(result.payload || 'Login failed');
    }
  };

  return (
    <>
      <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <h2 className="text-2xl font-bold mb-1 text-slate-800 dark:text-white tracking-tight">
          Welcome back
        </h2>
        <p className="text-sm mb-6 text-slate-500 dark:text-slate-400">
          Sign in to your account to continue
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
        {/* Email */}
        <motion.div variants={fieldVariants}>
          <label className="label">Email address</label>
          <input
            id="email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
            placeholder="you@company.com"
            className="input"
            disabled={loading}
          />
        </motion.div>

        {/* Password */}
        <motion.div variants={fieldVariants}>
          <label className="label">Password</label>
          <div className="relative">
            <input
              id="password"
              type={showPw ? 'text' : 'password'}
              name="password"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              placeholder="••••••••"
            className="input pr-11"
            disabled={loading}
          />
          <button
            type="button"
            onClick={() => setShowPw((p) => !p)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors"
          >
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </motion.div>

        <motion.div variants={fieldVariants} className="pt-2">
          <motion.button
            type="submit"
            disabled={loading}
            className="w-full btn-primary"
            whileHover={{ scale: 1.01, y: -1 }}
            whileTap={{ scale: 0.99 }}
          >
            {loading
              ? <><Loader2 size={18} className="animate-spin" /> Signing in…</>
              : <><LogIn size={18} /> Sign In</>
            }
          </motion.button>
        </motion.div>
      </motion.form>

      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        className="text-center text-sm mt-6 text-slate-500 dark:text-slate-400"
      >
        Don't have an account?{' '}
        <Link
          to="/register"
          className="font-semibold text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
        >
          Create one
        </Link>
      </motion.p>
    </>
  );
}

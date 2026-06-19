import { Outlet } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import Logo from '../components/common/Logo';
import { useTheme } from '../contexts/ThemeContext';

export default function AuthLayout() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-[#0A0A10] dark:to-[#10141D] transition-colors duration-300">
      {/* Ambient background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-[550px] h-[550px] rounded-full animate-blob-drift-1 bg-indigo-500/10 dark:bg-indigo-500/20 blur-[48px]" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full animate-blob-drift-2 bg-sky-500/10 dark:bg-sky-500/20 blur-[48px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-violet-500/5 dark:bg-violet-500/10 blur-[60px]" />
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle, currentColor 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      </div>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-2.5 rounded-full bg-white/50 dark:bg-slate-800/50 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 text-slate-600 dark:text-slate-300 hover:bg-white/80 dark:hover:bg-slate-700/80 transition-all z-20 shadow-sm"
        aria-label="Toggle theme"
      >
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div className="w-full max-w-md relative z-10" style={{ animation: 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) both' }}>
        {/* Logo area */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center mb-5 relative">
            <div className="absolute -inset-4 rounded-3xl animate-glow-pulse bg-blue-500/10 dark:bg-blue-500/20 blur-[12px]" />
            <Logo size={100} variant="wide" className="relative z-10" />
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-Time Task &amp; Team Collaboration
          </p>
        </div>

        {/* Glass card */}
        <div className="rounded-[2rem] p-8 relative overflow-hidden bg-white/70 dark:bg-[#10141D]/80 backdrop-blur-[48px] saturate-200 border border-white/90 dark:border-white/10 shadow-[0_24px_72px_rgba(0,0,0,0.08)] dark:shadow-[0_24px_72px_rgba(0,0,0,0.4)]">
          <div className="absolute top-0 left-12 right-12 h-px bg-gradient-to-r from-transparent via-white/90 dark:via-white/20 to-transparent" />
          <Outlet />
        </div>

        <p className="text-center text-xs mt-6 text-slate-400 dark:text-slate-600">
          © {new Date().getFullYear()} NexTASK. All rights reserved.
        </p>
      </div>
    </div>
  );
}

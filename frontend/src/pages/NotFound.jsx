import { useNavigate } from 'react-router-dom';
import { Home, ArrowLeft, Zap } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface-950 via-brand-950 to-violet-950 p-6">
      <div className="text-center max-w-md animate-bounce-in">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-brand flex items-center justify-center shadow-glow">
            <Zap size={28} className="text-white" />
          </div>
        </div>

        {/* 404 number */}
        <div className="relative mb-6">
          <p className="text-[10rem] font-black text-white/5 leading-none select-none">404</p>
          <div className="absolute inset-0 flex items-center justify-center">
            <div>
              <p className="text-6xl font-black text-gradient leading-none mb-2">404</p>
              <p className="text-xl font-semibold text-white">Page not found</p>
            </div>
          </div>
        </div>

        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
          Oops! The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="btn-outline border-white/20 text-slate-300 hover:bg-white/10"
          >
            <ArrowLeft size={16} /> Go Back
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn bg-gradient-brand text-white hover:opacity-90 shadow-glow"
          >
            <Home size={16} /> Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

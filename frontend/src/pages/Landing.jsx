import { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionTemplate,
  AnimatePresence
} from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Logo from '../components/common/Logo';

export default function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated } = useSelector((s) => s.auth);
  
  // Ref for the main container to calculate mouse position
  const containerRef = useRef(null);

  // Mouse position values (-1 to 1)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for fluid motion
  const smoothX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothY = useSpring(mouseY, { stiffness: 50, damping: 20 });

  // 3D Tilt transforms
  const rotateX = useTransform(smoothY, [-1, 1], [12, -12]);
  const rotateY = useTransform(smoothX, [-1, 1], [-12, 12]);

  // Dynamic light source transforms
  const lightX = useTransform(smoothX, [-1, 1], ['20%', '80%']);
  const lightY = useTransform(smoothY, [-1, 1], ['20%', '80%']);

  // Magnetic Button State
  const btnRef = useRef(null);
  const [btnHovered, setBtnHovered] = useState(false);
  const btnX = useMotionValue(0);
  const btnY = useMotionValue(0);
  const smoothBtnX = useSpring(btnX, { stiffness: 150, damping: 15 });
  const smoothBtnY = useSpring(btnY, { stiffness: 150, damping: 15 });

  // Easter egg state
  const [logoHovered, setLogoHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
    const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
    mouseX.set(x);
    mouseY.set(y);

    // Magnetic Button Logic
    if (btnRef.current && btnHovered) {
      const btnRect = btnRef.current.getBoundingClientRect();
      const bx = e.clientX - (btnRect.left + btnRect.width / 2);
      const by = e.clientY - (btnRect.top + btnRect.height / 2);
      btnX.set(bx * 0.3); // Magnetic pull strength
      btnY.set(by * 0.3);
    }
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  const resetBtn = () => {
    setBtnHovered(false);
    btnX.set(0);
    btnY.set(0);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-screen overflow-hidden flex items-center justify-center selection:bg-indigo-500/30"
      style={{
        background: '#0B0F19',
        perspective: '2000px',
      }}
    >
      {/* Intense Glowing Backlights */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        className="absolute inset-0 pointer-events-none flex items-center justify-center"
      >
        <div className="absolute w-[40vw] h-[60vh] bg-blue-600/20 blur-[150px] -translate-x-1/3 rounded-full" />
        <div className="absolute w-[40vw] h-[60vh] bg-purple-600/20 blur-[150px] translate-x-1/3 rounded-full" />
      </motion.div>

      {/* Main Container */}
      <motion.div
        animate={{ y: [-4, 4, -4] }}
        transition={{ repeat: Infinity, duration: 6, ease: 'easeInOut' }}
        className="relative z-10 w-full max-w-sm md:max-w-md flex flex-col items-center"
      >
        {/* 3D Glass Platform */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
          className="relative w-full rounded-[2.5rem] p-10 md:p-12 flex flex-col items-center justify-center cursor-default"
        >
          {/* Deep Dark Glass Background */}
          <div
            className="absolute inset-0 rounded-[2.5rem] border border-white/5"
            style={{
              background: 'rgba(15, 23, 42, 0.4)',
              backdropFilter: 'blur(40px) saturate(150%)',
              WebkitBackdropFilter: 'blur(40px) saturate(150%)',
              boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.1), 0 20px 40px rgba(0,0,0,0.5)',
              transform: 'translateZ(-10px)',
            }}
          />

          {/* Logo Hero */}
          <motion.div
            onMouseEnter={() => setLogoHovered(true)}
            onMouseLeave={() => setLogoHovered(false)}
            style={{ transform: 'translateZ(50px)' }}
            className="relative flex flex-col items-center mb-12"
          >
            <div className="scale-125 drop-shadow-2xl">
              <Logo size={60} variant="icon" />
            </div>
          </motion.div>

          {/* Feature List */}
          <motion.div
            style={{ transform: 'translateZ(30px)' }}
            className="w-full flex flex-col gap-5 mb-12 px-2"
          >
            {/* Item 1 */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-5"
            >
              <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><polyline points="9 11 12 14 22 4"></polyline></svg>
              </div>
              <span className="text-slate-300 font-medium tracking-wide text-[1.1rem]">Organize Tasks.</span>
            </motion.div>
            
            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/5 to-transparent" />

            {/* Item 2 */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="flex items-center gap-5"
            >
              <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.2)]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
              </div>
              <span className="text-slate-300 font-medium tracking-wide text-[1.1rem]">Accelerate Teams.</span>
            </motion.div>

            <div className="h-px w-full bg-gradient-to-r from-transparent via-white/5 to-transparent" />

            {/* Item 3 */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.0 }}
              className="flex items-center gap-5"
            >
              <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-400 shadow-[0_0_15px_rgba(20,184,166,0.2)]">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"></path><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"></path><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"></path><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"></path></svg>
              </div>
              <span className="text-slate-300 font-medium tracking-wide text-[1.1rem]">Deliver Results.</span>
            </motion.div>
          </motion.div>

          {/* Gradient Pill Button */}
          <motion.div
            style={{ transform: 'translateZ(40px)' }}
          >
            <motion.div
              ref={btnRef}
              style={{ x: smoothBtnX, y: smoothBtnY }}
              onMouseEnter={() => setBtnHovered(true)}
              onMouseLeave={resetBtn}
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}
              className="relative group cursor-pointer rounded-full p-[1px] overflow-hidden transition-transform active:scale-95"
            >
              {/* Gradient Border */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-70 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Inner Button Content */}
              <div className="relative flex items-center gap-3 px-8 py-3 rounded-full bg-[#0B0F19]/90 backdrop-blur-xl">
                <span className="font-medium text-slate-200 text-[1.05rem] tracking-wide group-hover:text-white transition-colors">
                  {isAuthenticated ? 'Open Workspace' : 'Get Started'}
                </span>
                <ArrowRight size={18} className="text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
            </motion.div>
          </motion.div>

        </motion.div>
      </motion.div>
    </div>
  );
}

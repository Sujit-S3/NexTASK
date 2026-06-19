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
        background: 'linear-gradient(135deg, #f8f9fa 0%, #ced4da 100%)',
        perspective: '2000px',
      }}
    >
      {/* Background Ambient Orbs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
        className="absolute inset-0 pointer-events-none"
      >
        <div className="absolute top-[20%] left-[20%] w-[40vw] h-[40vw] rounded-full mix-blend-multiply blur-[100px] opacity-40 bg-blue-200 animate-blob-drift-1" />
        <div className="absolute bottom-[20%] right-[20%] w-[35vw] h-[35vw] rounded-full mix-blend-multiply blur-[100px] opacity-40 bg-purple-200 animate-blob-drift-2" />
        <div className="absolute top-[40%] left-[60%] w-[30vw] h-[30vw] rounded-full mix-blend-multiply blur-[100px] opacity-30 bg-cyan-200 animate-blob-drift-1" style={{ animationDelay: '-2s' }} />
      </motion.div>

      {/* Main Container - Ambient Floating */}
      <motion.div
        animate={{ y: [-8, 8, -8] }}
        transition={{ repeat: Infinity, duration: 10, ease: 'easeInOut' }}
        className="relative z-10 w-full max-w-lg flex flex-col items-center"
      >
        {/* 3D Glass Platform */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
          className="relative w-full aspect-square md:aspect-[4/3] rounded-[3rem] p-8 md:p-12 flex flex-col items-center justify-center cursor-default"
        >
          {/* Platform Background - Frosted Glass */}
          <div
            className="absolute inset-0 rounded-[3rem] border border-white/60 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1),inset_0_0_0_1px_rgba(255,255,255,0.4)]"
            style={{
              background: 'rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(32px) saturate(150%)',
              WebkitBackdropFilter: 'blur(32px) saturate(150%)',
              transform: 'translateZ(-20px)',
            }}
          />

          {/* Dynamic Lighting Overlay */}
          <motion.div
            className="absolute inset-0 rounded-[3rem] pointer-events-none mix-blend-overlay"
            style={{
              background: useMotionTemplate`radial-gradient(circle 300px at ${lightX} ${lightY}, rgba(255,255,255,0.8), transparent 80%)`,
              transform: 'translateZ(1px)',
            }}
          />

          {/* Logo Hero */}
          <motion.div
            onMouseEnter={() => setLogoHovered(true)}
            onMouseLeave={() => setLogoHovered(false)}
            style={{ transform: 'translateZ(60px)' }}
            className="relative flex flex-col items-center mb-8"
          >
            {/* Easter Egg: Orbiting Particles */}
            <AnimatePresence>
              {logoHovered && (
                <>
                  <motion.div
                    initial={{ opacity: 0, scale: 0, rotate: 0 }}
                    animate={{ opacity: 1, scale: 1, rotate: 180 }}
                    exit={{ opacity: 0, scale: 0 }}
                    transition={{ duration: 1.5, ease: "linear", repeat: Infinity }}
                    className="absolute inset-0 pointer-events-none"
                  >
                    <div className="absolute -top-4 left-1/2 w-1.5 h-1.5 bg-indigo-400 rounded-full blur-[1px]" />
                    <div className="absolute -bottom-4 right-1/4 w-2 h-2 bg-purple-400 rounded-full blur-[1px]" />
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 0.5, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-[-20px] bg-indigo-400/20 rounded-full blur-xl -z-10"
                  />
                </>
              )}
            </AnimatePresence>

            <div className="scale-150 mb-6 drop-shadow-xl">
              <Logo size={80} variant="icon" />
            </div>
            
            <h1 
              className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent drop-shadow-sm"
              style={{
                backgroundImage: 'linear-gradient(180deg, rgba(15,23,42,1) 0%, rgba(51,65,85,1) 100%)',
              }}
            >
              NexTASK
            </h1>
          </motion.div>

          {/* Tagline */}
          <motion.div
            style={{ transform: 'translateZ(30px)' }}
            className="text-center space-y-1 mb-10"
          >
            {['Organize Tasks.', 'Accelerate Teams.', 'Deliver Results.'].map((line, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + (i * 0.2), duration: 0.8 }}
                className="text-lg md:text-xl font-medium text-slate-600/90 tracking-wide"
              >
                {line}
              </motion.p>
            ))}
          </motion.div>

          {/* Magnetic Glass Button */}
          <motion.div
            style={{ transform: 'translateZ(40px)' }}
          >
            <motion.div
              ref={btnRef}
              style={{ x: smoothBtnX, y: smoothBtnY }}
              onMouseEnter={() => setBtnHovered(true)}
              onMouseLeave={resetBtn}
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}
              className="relative group cursor-pointer"
            >
              <div 
                className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur opacity-20 group-hover:opacity-40 transition-opacity duration-500" 
              />
              <div
                className="relative flex items-center gap-3 px-8 py-4 rounded-full overflow-hidden"
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(15,23,42,0.2)',
                  boxShadow: 'none',
                }}
              >
                {/* Button Hover Ripple */}
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                
                <span className="relative z-10 font-semibold text-slate-800 text-lg tracking-wide">
                  {isAuthenticated ? 'Open Workspace' : 'Get Started'}
                </span>
                <ArrowRight size={20} className="relative z-10 text-slate-800 group-hover:translate-x-1 transition-transform" />
              </div>
            </motion.div>
          </motion.div>

        </motion.div>
      </motion.div>
    </div>
  );
}

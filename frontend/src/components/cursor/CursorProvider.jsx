import { useEffect, useRef, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

// ─── Config ───────────────────────────────────────────────────────────────────
const PARTICLE_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#3b82f6'];
const PARTICLE_COUNT  = 6;

function lerp(a, b, t) { return a + (b - a) * t; }

const isTouch = () =>
  typeof window !== 'undefined' &&
  ('ontouchstart' in window || navigator.maxTouchPoints > 0);

// ─── Particle ─────────────────────────────────────────────────────────────────
function Particle({ x, y, angle, distance, color }) {
  const rad = (angle * Math.PI) / 180;
  const tx  = Math.cos(rad) * distance;
  const ty  = Math.sin(rad) * distance;

  return (
    <motion.div
      className="fixed top-0 left-0 pointer-events-none z-[9998]"
      style={{ left: x - 3, top: y - 3 }}
      initial={{ x: 0, y: 0, opacity: 0.55, scale: 1 }}
      animate={{ x: tx, y: ty, opacity: 0, scale: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.44, ease: 'easeOut' }}
    >
      <div
        className="w-[5px] h-[5px] rounded-full"
        style={{ backgroundColor: color, boxShadow: `0 0 5px ${color}80` }}
      />
    </motion.div>
  );
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function CursorProvider({ children }) {
  const outerRef    = useRef(null);
  const innerRef    = useRef(null);
  const mouse       = useRef({ x: -300, y: -300 });
  const smoothPos   = useRef({ x: -300, y: -300 });
  const smoothScale = useRef(1);
  const targetScale = useRef(1);
  const rafId       = useRef(null);
  const visible     = useRef(false);
  const touchDevice = useRef(isTouch());
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (touchDevice.current) return;

    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;

    // Suppress default cursor globally
    const styleEl = document.createElement('style');
    styleEl.id = '__nx_cursor_hide__';
    styleEl.textContent = '*, *::before, *::after { cursor: none !important; }';
    document.head.appendChild(styleEl);

    const onMouseMove = (e) => {
      mouse.current = { x: e.clientX, y: e.clientY };
      if (!visible.current) {
        outer.style.opacity = '1';
        inner.style.opacity = '1';
        visible.current = true;
      }
    };

    const onMouseOver = (e) => {
      const isInteractive = !!e.target.closest(
        'button, a, input, textarea, select, [role="button"], label, [data-cursor-hover]'
      );
      targetScale.current = isInteractive ? 1.7 : 1;
    };

    const onMouseLeave = () => {
      outer.style.opacity = '0';
      inner.style.opacity = '0';
      visible.current = false;
    };

    const tick = () => {
      const sp = smoothPos.current;
      const m  = mouse.current;

      // Smooth position
      sp.x = lerp(sp.x, m.x, 0.11);
      sp.y = lerp(sp.y, m.y, 0.11);

      // Smooth scale
      smoothScale.current = lerp(smoothScale.current, targetScale.current, 0.10);

      // Outer ring — lagging smooth follower
      outer.style.transform = `translate(${sp.x - 20}px, ${sp.y - 20}px) scale(${smoothScale.current})`;
      // Inner dot — snaps to exact cursor
      inner.style.transform = `translate(${m.x - 3}px, ${m.y - 3}px)`;

      rafId.current = requestAnimationFrame(tick);
    };
    tick();

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseover', onMouseOver,  { passive: true });
    window.addEventListener('mouseleave', onMouseLeave, { passive: true });

    return () => {
      cancelAnimationFrame(rafId.current);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', onMouseOver);
      window.removeEventListener('mouseleave', onMouseLeave);
      document.getElementById('__nx_cursor_hide__')?.remove();
    };
  }, []);

  // ── Click particles ──────────────────────────────────────────────────────────
  const emitParticles = useCallback((e) => {
    if (touchDevice.current) return;
    const now = Date.now();
    const pts = Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      id:       now + i,
      x:        e.clientX,
      y:        e.clientY,
      color:    PARTICLE_COLORS[i % PARTICLE_COLORS.length],
      angle:    (360 / PARTICLE_COUNT) * i + (Math.random() * 18 - 9),
      distance: 14 + Math.random() * 14,
    }));
    setParticles(p => [...p, ...pts]);
    setTimeout(
      () => setParticles(p => p.filter(pt => !pts.some(np => np.id === pt.id))),
      500
    );
  }, []);

  useEffect(() => {
    if (touchDevice.current) return;
    window.addEventListener('click', emitParticles);
    return () => window.removeEventListener('click', emitParticles);
  }, [emitParticles]);

  if (touchDevice.current) return <>{children}</>;

  return (
    <>
      {children}

      {/* Outer ring — smooth follower */}
      <div
        ref={outerRef}
        className="fixed top-0 left-0 w-10 h-10 rounded-full pointer-events-none z-[9999]"
        style={{
          opacity: 0,
          willChange: 'transform',
          border: '1px solid rgba(99,102,241,0.28)',
          background: 'rgba(99,102,241,0.032)',
          backdropFilter: 'blur(0.5px)',
          transition: 'opacity 0.3s',
        }}
      />

      {/* Inner dot — exact position */}
      <div
        ref={innerRef}
        className="fixed top-0 left-0 w-[6px] h-[6px] rounded-full pointer-events-none z-[9999]"
        style={{
          opacity: 0,
          willChange: 'transform',
          background: 'rgba(99,102,241,0.9)',
          boxShadow: '0 0 7px 2px rgba(99,102,241,0.35)',
          transition: 'opacity 0.3s',
        }}
      />

      {/* Particles */}
      <AnimatePresence>
        {particles.map(p => <Particle key={p.id} {...p} />)}
      </AnimatePresence>
    </>
  );
}

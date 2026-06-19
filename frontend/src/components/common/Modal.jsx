import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export default function Modal({ isOpen, onClose, title, children, size = 'md', className = '' }) {
  const overlayRef = useRef(null);
  const { isDark } = useTheme();

  const sizes = {
    sm:   'max-w-sm',
    md:   'max-w-lg',
    lg:   'max-w-2xl',
    xl:   'max-w-4xl',
    full: 'max-w-screen-xl',
  };

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={overlayRef}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{
            background: 'transparent',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onMouseDown={(e) => { if (e.target === overlayRef.current) onClose(); }}
        >
          <motion.div
            className={`${sizes[size]} w-full overflow-hidden relative ${className}`}
            style={{
              background: isDark ? 'rgba(15, 23, 42, 0.75)' : 'rgba(255,255,255,0.82)',
              backdropFilter: 'blur(48px) saturate(200%)',
              WebkitBackdropFilter: 'blur(48px) saturate(200%)',
              border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.92)',
              borderTopColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.98)',
              borderRadius: '1.75rem',
              boxShadow: isDark
                ? '0 32px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)'
                : '0 32px 80px rgba(0,0,0,0.14), 0 16px 40px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,1)',
            }}
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{ opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          >
            {/* Subtle top shimmer line */}
            <div
              className="absolute top-0 left-8 right-8 h-px rounded-full"
              style={{ background: isDark ? 'linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent)' : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.9), transparent)' }}
            />

            {/* Header */}
            {title && (
              <div
                className="flex items-center justify-between px-6 py-5"
                style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.05)' }}
              >
                <h2
                  className="text-base font-semibold"
                  style={{ color: isDark ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.84)', letterSpacing: '-0.015em' }}
                >
                  {title}
                </h2>
                <motion.button
                  onClick={onClose}
                  className="p-1.5 rounded-xl transition-all duration-150"
                  style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.36)', background: 'transparent' }}
                  whileHover={{ scale: 1.08, background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)', color: isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.65)' }}
                  whileTap={{ scale: 0.92 }}
                >
                  <X size={16} />
                </motion.button>
              </div>
            )}

            <div className="overflow-y-auto max-h-[80vh]">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

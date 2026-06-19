import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

export default function CalendarWidget({ children }) {
  const { isDark } = useTheme();
  const [open, setOpen] = useState(false);
  const [time, setTime] = useState(new Date());
  const widgetRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (widgetRef.current && !widgetRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  const currentMonth = time.toLocaleString('default', { month: 'long' });
  const currentYear = time.getFullYear();
  const currentDate = time.getDate();
  const currentDay = time.getDay();
  
  // Basic calendar generation
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();
  
  const daysInMonth = getDaysInMonth(time.getFullYear(), time.getMonth());
  const firstDay = getFirstDayOfMonth(time.getFullYear(), time.getMonth());
  
  const blanks = Array(firstDay).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="relative" ref={widgetRef}>
      <div onClick={() => setOpen(!open)} className="cursor-pointer">
        {children}
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-1/2 translate-y-1/2 right-1/2 translate-x-1/2 w-64 rounded-2xl z-50 overflow-hidden shadow-2xl"
            style={{
              background: isDark ? 'rgba(16, 20, 29, 0.95)' : 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(32px) saturate(180%)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`,
              boxShadow: isDark ? '0 12px 40px rgba(0,0,0,0.4)' : '0 12px 40px rgba(0,0,0,0.1)',
            }}
          >
            {/* Header / Date */}
            <div 
              className="p-3 text-center relative overflow-hidden"
              style={{
                background: isDark ? 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(10,132,255,0.05))' : 'linear-gradient(135deg, rgba(10,132,255,0.1), rgba(10,132,255,0.02))',
                borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}`
              }}
            >
              <h3 className="text-sm font-semibold tracking-wide uppercase mb-1" style={{ color: isDark ? '#A5B4FC' : '#0A84FF' }}>
                {currentMonth} {currentYear}
              </h3>
              <p className="text-lg font-bold" style={{ color: 'var(--c-text-1)' }}>
                {formatDate(time).split(',')[0]}, {currentDate}
              </p>
            </div>

            {/* Calendar Grid */}
            <div className="p-3 pb-2">
              <div className="grid grid-cols-7 gap-1 text-center mb-1">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                  <div key={d} className="text-[10px] font-bold uppercase" style={{ color: 'var(--c-text-3)' }}>
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1 text-center">
                {blanks.map((_, i) => (
                  <div key={`blank-${i}`} className="p-1" />
                ))}
                {days.map((d) => {
                  const isToday = d === currentDate;
                  return (
                    <div 
                      key={d} 
                      className="p-0.5 text-xs rounded-md flex items-center justify-center aspect-square"
                      style={{
                        background: isToday 
                          ? (isDark ? '#6366f1' : '#0A84FF') 
                          : 'transparent',
                        color: isToday 
                          ? '#fff' 
                          : 'var(--c-text-1)',
                        fontWeight: isToday ? 'bold' : 'normal',
                        boxShadow: isToday ? '0 4px 12px rgba(99,102,241,0.3)' : 'none'
                      }}
                    >
                      {d}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Time / Footer */}
            <div 
              className="p-3 flex items-center justify-center gap-2"
              style={{
                background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)',
                borderTop: `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}`
              }}
            >
              <Clock size={14} style={{ color: isDark ? '#818CF8' : '#0A84FF' }} />
              <span className="text-base font-bold tabular-nums tracking-tight" style={{ color: 'var(--c-text-1)' }}>
                {formatTime(time)}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

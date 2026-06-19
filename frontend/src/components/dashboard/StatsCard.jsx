import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const colorMap = {
  brand: {
    gradient: 'linear-gradient(145deg, rgba(10,132,255,0.08), rgba(10,132,255,0.03))',
    glow: 'rgba(10,132,255,0.20)',
    iconBg: 'rgba(10,132,255,0.10)',
    iconColor: 'rgba(10,132,255,0.9)',
    accent: 'linear-gradient(90deg, #0A84FF, #5E5CE6)',
    border: 'rgba(10,132,255,0.18)',
    trendUp: '#30D158',
  },
  blue: {
    gradient: 'linear-gradient(145deg, rgba(14,165,233,0.08), rgba(14,165,233,0.03))',
    glow: 'rgba(14,165,233,0.20)',
    iconBg: 'rgba(14,165,233,0.10)',
    iconColor: 'rgba(14,165,233,0.9)',
    accent: 'linear-gradient(90deg, #0EA5E9, #38BDF8)',
    border: 'rgba(14,165,233,0.18)',
    trendUp: '#30D158',
  },
  emerald: {
    gradient: 'linear-gradient(145deg, rgba(48,209,88,0.08), rgba(48,209,88,0.03))',
    glow: 'rgba(48,209,88,0.18)',
    iconBg: 'rgba(48,209,88,0.10)',
    iconColor: 'rgba(48,209,88,0.92)',
    accent: 'linear-gradient(90deg, #30D158, #34D399)',
    border: 'rgba(48,209,88,0.18)',
    trendUp: '#30D158',
  },
  amber: {
    gradient: 'linear-gradient(145deg, rgba(255,159,10,0.08), rgba(255,159,10,0.03))',
    glow: 'rgba(255,159,10,0.18)',
    iconBg: 'rgba(255,159,10,0.10)',
    iconColor: 'rgba(255,159,10,0.92)',
    accent: 'linear-gradient(90deg, #FF9F0A, #FBBF24)',
    border: 'rgba(255,159,10,0.18)',
    trendUp: '#30D158',
  },
  red: {
    gradient: 'linear-gradient(145deg, rgba(255,59,48,0.08), rgba(255,59,48,0.03))',
    glow: 'rgba(255,59,48,0.18)',
    iconBg: 'rgba(255,59,48,0.09)',
    iconColor: 'rgba(255,59,48,0.88)',
    accent: 'linear-gradient(90deg, #FF3B30, #FF6B6B)',
    border: 'rgba(255,59,48,0.16)',
    trendUp: '#30D158',
  },
  violet: {
    gradient: 'linear-gradient(145deg, rgba(94,92,230,0.08), rgba(94,92,230,0.03))',
    glow: 'rgba(94,92,230,0.18)',
    iconBg: 'rgba(94,92,230,0.10)',
    iconColor: 'rgba(94,92,230,0.90)',
    accent: 'linear-gradient(90deg, #5E5CE6, #8B5CF6)',
    border: 'rgba(94,92,230,0.18)',
    trendUp: '#30D158',
  },
};

export default function StatsCard({ title, value, icon: Icon, color = 'brand', trend, trendLabel, subtitle, loading, index = 0 }) {
  const c = colorMap[color] || colorMap.brand;
  const cardRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    // Max 4° tilt — premium, not distracting
    setTilt({ x: y * 4, y: x * -4 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setIsHovered(false);
  };

  if (loading) {
    return (
      <div
        className="rounded-3xl p-5 space-y-4"
        style={{
          background: 'var(--c-surface)',
          border: '1px solid var(--c-border)',
          backdropFilter: 'var(--glass-blur)',
        }}
      >
        <div className="flex justify-between items-start">
          <div className="skeleton h-3 w-24 rounded-lg" />
          <div className="skeleton w-11 h-11 rounded-2xl" />
        </div>
        <div className="skeleton h-9 w-20 rounded-xl" />
        <div className="skeleton h-3 w-28 rounded-lg" />
      </div>
    );
  }

  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor = trend > 0 ? '#34D399' : trend < 0 ? '#FF6B6B' : 'var(--c-text-3)';

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="card transition-all duration-300 relative overflow-hidden cursor-default flex flex-col justify-between"
      style={{
        borderRadius: '1.25rem',
        padding: '1.5rem',
        background: 'var(--card-bg)',
        border: '1px solid var(--c-border)',
        boxShadow: isHovered
          ? `0 20px 60px rgba(0,0,0,0.2), 0 8px 24px ${c.glow}`
          : '0 4px 20px rgba(0,0,0,0.1)',
        transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) ${isHovered ? 'translateY(-2px)' : 'translateY(0)'}`,
        minHeight: '160px',
      }}
    >
      {/* Bottom glow line */}
      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-full h-16 blur-2xl transition-opacity duration-300" style={{ background: c.accent, opacity: isHovered ? 0.25 : 0.15 }} />
      <div className="absolute bottom-0 left-0 right-0 h-[2px] transition-opacity duration-300" style={{ background: c.accent, opacity: isHovered ? 1 : 0.7 }} />

      {/* Top Header */}
      <div className="flex justify-between items-start relative z-10">
        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: c.iconColor }}>
          {title}
        </p>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-lg" style={{ background: c.iconBg }}>
          <Icon size={18} style={{ color: c.iconColor }} />
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 mt-1">
        <p className="text-4xl font-bold tracking-tight mb-2" style={{ color: 'var(--c-text-1)' }}>
          {value ?? 0}
        </p>
        <div className="flex items-center gap-2">
          {trend !== undefined ? (
            <div className="flex items-center gap-1 font-semibold text-xs" style={{ color: trendColor }}>
              <TrendIcon size={12} strokeWidth={2.5} />
              <span>{Math.abs(trend)}%</span>
              <span className="font-normal" style={{ color: 'var(--c-text-3)' }}>{trendLabel}</span>
            </div>
          ) : (
            <p className="text-xs" style={{ color: 'var(--c-text-3)' }}>{subtitle}</p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

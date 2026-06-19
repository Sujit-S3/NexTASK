import { motion } from 'framer-motion';
import Avatar from '../common/Avatar';

const rankColors = [
  { bar: 'linear-gradient(90deg, #fbbf24, #f59e0b)', ring: 'rgba(251,191,36,0.4)', num: 'rgba(251,191,36,0.9)' },
  { bar: 'linear-gradient(90deg, #94a3b8, #cbd5e1)', ring: 'rgba(148,163,184,0.4)', num: 'rgba(203,213,225,0.9)' },
  { bar: 'linear-gradient(90deg, #cd7c54, #d97706)', ring: 'rgba(205,124,84,0.4)',  num: 'rgba(205,124,84,0.9)'  },
];
const defaultBar = 'linear-gradient(90deg, #6366f1, #8b5cf6)';

export default function TeamPerformance({ data = [], loading }) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1,2,3,4].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="skeleton w-9 h-9 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-3 w-28 rounded-lg" />
              <div className="skeleton h-1.5 rounded-full" style={{ width: `${70 - i * 12}%` }} />
            </div>
            <div className="skeleton h-5 w-8 rounded-lg" />
          </div>
        ))}
      </div>
    );
  }

  if (!data?.length) {
    return (
      <p className="text-sm py-6 text-center" style={{ color: 'rgba(148,163,184,0.5)' }}>
        No performance data yet
      </p>
    );
  }

  const maxCompleted = Math.max(...data.map((d) => d.completed || 0), 1);

  return (
    <div className="space-y-3.5">
      {data.map((member, i) => {
        const pct = Math.round((member.completed / maxCompleted) * 100);
        const rank = rankColors[i] || { bar: defaultBar, ring: 'rgba(99,102,241,0.3)', num: 'rgba(165,180,252,0.8)' };
        const rankNum = i + 1;

        return (
          <motion.div
            key={member.userId || i}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-3 group"
          >
            {/* Rank + Avatar */}
            <div className="relative shrink-0">
              <div className="rounded-xl overflow-hidden" style={{ boxShadow: `0 0 0 2px ${rank.ring}` }}>
                <Avatar name={member.name} src={member.avatar} size="sm" />
              </div>
              {i < 3 && (
                <div
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold"
                  style={{ background: rank.bar, color: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.4)' }}
                >
                  {rankNum}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium truncate" style={{ color: 'rgba(203,213,225,0.9)' }}>
                  {member.name}
                </span>
                <span className="text-xs font-bold ml-2 shrink-0" style={{ color: rank.num }}>
                  {member.completed}
                </span>
              </div>
              {/* Animated progress bar */}
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <motion.div
                  className="h-full rounded-full"
                  style={{ background: i < 3 ? rank.bar : defaultBar }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ delay: i * 0.1 + 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

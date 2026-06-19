import { PRIORITY_MAP, STATUS_MAP } from '../../utils/constants';

const premiumPriorityColors = {
  urgent: {
    bg:  'rgba(239,68,68,0.12)',
    border: 'rgba(239,68,68,0.25)',
    text: 'rgba(252,165,165,0.95)',
    dot: '#ef4444',
    glow: '0 0 6px rgba(239,68,68,0.4)',
  },
  high: {
    bg:  'rgba(249,115,22,0.12)',
    border: 'rgba(249,115,22,0.25)',
    text: 'rgba(253,186,116,0.95)',
    dot: '#f97316',
    glow: '0 0 6px rgba(249,115,22,0.3)',
  },
  medium: {
    bg:  'rgba(234,179,8,0.12)',
    border: 'rgba(234,179,8,0.22)',
    text: 'rgba(253,224,71,0.95)',
    dot: '#eab308',
    glow: '0 0 6px rgba(234,179,8,0.3)',
  },
  low: {
    bg:  'rgba(34,197,94,0.1)',
    border: 'rgba(34,197,94,0.2)',
    text: 'rgba(134,239,172,0.95)',
    dot: '#22c55e',
    glow: '0 0 6px rgba(34,197,94,0.3)',
  },
};

const premiumStatusColors = {
  todo: {
    bg:  'rgba(148,163,184,0.1)',
    border: 'rgba(148,163,184,0.2)',
    text: 'rgba(203,213,225,0.85)',
    dot: '#94a3b8',
    glow: 'none',
  },
  'in-progress': {
    bg:  'rgba(59,130,246,0.12)',
    border: 'rgba(59,130,246,0.25)',
    text: 'rgba(147,197,253,0.95)',
    dot: '#3b82f6',
    glow: '0 0 6px rgba(59,130,246,0.35)',
  },
  review: {
    bg:  'rgba(139,92,246,0.12)',
    border: 'rgba(139,92,246,0.25)',
    text: 'rgba(196,181,253,0.95)',
    dot: '#8b5cf6',
    glow: '0 0 6px rgba(139,92,246,0.35)',
  },
  completed: {
    bg:  'rgba(16,185,129,0.1)',
    border: 'rgba(16,185,129,0.22)',
    text: 'rgba(110,231,183,0.95)',
    dot: '#10b981',
    glow: '0 0 6px rgba(16,185,129,0.35)',
  },
};

export function PriorityBadge({ priority }) {
  const p = PRIORITY_MAP[priority];
  if (!p) return null;
  const c = premiumPriorityColors[priority] || {};
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: c.text,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: c.dot, boxShadow: c.glow }}
      />
      {p.label}
    </span>
  );
}

export function StatusBadge({ status }) {
  const s = STATUS_MAP[status];
  if (!s) return null;
  const c = premiumStatusColors[status] || {};
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: c.text,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full shrink-0"
        style={{ background: c.dot, boxShadow: c.glow }}
      />
      {s.label}
    </span>
  );
}

export function RoleBadge({ role }) {
  const isAdmin = role === 'admin';
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize"
      style={{
        background: isAdmin ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.06)',
        border: isAdmin ? '1px solid rgba(99,102,241,0.3)' : '1px solid rgba(255,255,255,0.1)',
        color: isAdmin ? 'rgba(165,180,252,0.95)' : 'rgba(148,163,184,0.85)',
      }}
    >
      {role}
    </span>
  );
}

export function CountBadge({ count, className = '' }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${className}`}
      style={{
        background: 'rgba(255,255,255,0.07)',
        border: '1px solid rgba(255,255,255,0.1)',
        color: 'rgba(148,163,184,0.8)',
      }}
    >
      {count}
    </span>
  );
}

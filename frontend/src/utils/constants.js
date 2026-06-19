// ─── Priority ─────────────────────────────────────────────────────────────────
export const PRIORITIES = [
  { value: 'low',      label: 'Low',      color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300', dot: 'bg-emerald-500' },
  { value: 'medium',   label: 'Medium',   color: 'bg-amber-100  text-amber-700  dark:bg-amber-900/40  dark:text-amber-300',  dot: 'bg-amber-500'   },
  { value: 'high',     label: 'High',     color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300', dot: 'bg-orange-500'  },
  { value: 'critical', label: 'Critical', color: 'bg-red-100    text-red-700    dark:bg-red-900/40    dark:text-red-300',    dot: 'bg-red-500'     },
];

export const PRIORITY_MAP = Object.fromEntries(PRIORITIES.map((p) => [p.value, p]));

// ─── Status ───────────────────────────────────────────────────────────────────
export const STATUSES = [
  { value: 'todo',        label: 'To Do',       color: 'bg-slate-100   text-slate-600   dark:bg-slate-800    dark:text-slate-300',   dot: 'bg-slate-400'   },
  { value: 'in-progress', label: 'In Progress',  color: 'bg-blue-100    text-blue-700    dark:bg-blue-900/40  dark:text-blue-300',    dot: 'bg-blue-500'    },
  { value: 'review',      label: 'Review',       color: 'bg-purple-100  text-purple-700  dark:bg-purple-900/40 dark:text-purple-300', dot: 'bg-purple-500'  },
  { value: 'completed',   label: 'Completed',    color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',dot: 'bg-emerald-500' },
];

export const STATUS_MAP = Object.fromEntries(STATUSES.map((s) => [s.value, s]));

// ─── Notification types ───────────────────────────────────────────────────────
export const NOTIF_TYPE_LABELS = {
  task_assigned:  'Task Assigned',
  task_updated:   'Task Updated',
  task_completed: 'Task Completed',
  task_overdue:   'Task Overdue',
  comment_added:  'New Comment',
  task_created:   'Task Created',
  task_deleted:   'Task Deleted',
  user_mentioned: 'Mentioned',
};

// ─── Roles ────────────────────────────────────────────────────────────────────
export const ROLES = [
  { value: 'admin',  label: 'Admin'  },
  { value: 'member', label: 'Member' },
];

// ─── Chart colours ────────────────────────────────────────────────────────────
export const CHART_COLORS = {
  brand:    '#6366f1',
  violet:   '#8b5cf6',
  blue:     '#3b82f6',
  cyan:     '#06b6d4',
  emerald:  '#10b981',
  amber:    '#f59e0b',
  orange:   '#f97316',
  red:      '#ef4444',
  slate:    '#94a3b8',
};

export const STATUS_CHART_COLORS = {
  'todo':        CHART_COLORS.slate,
  'in-progress': CHART_COLORS.blue,
  'review':      CHART_COLORS.violet,
  'completed':   CHART_COLORS.emerald,
};

export const PRIORITY_CHART_COLORS = {
  'low':      CHART_COLORS.emerald,
  'medium':   CHART_COLORS.amber,
  'high':     CHART_COLORS.orange,
  'critical': CHART_COLORS.red,
};

export default function OnlineIndicator({ online, size = 'sm', className = '' }) {
  const sizes = { xs: 'w-2 h-2', sm: 'w-2.5 h-2.5', md: 'w-3 h-3' };
  const s = sizes[size] || sizes.sm;
  return (
    <span className={`${s} rounded-full border-2 border-white dark:border-surface-900 ${online ? 'bg-emerald-400' : 'bg-slate-300 dark:bg-slate-600'} ${className}`} />
  );
}

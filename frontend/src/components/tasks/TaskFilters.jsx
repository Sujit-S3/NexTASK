import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import { PRIORITIES, STATUSES } from '../../utils/constants';

const filterSelectStyle = {
  padding: '0.4375rem 2.5rem 0.4375rem 0.875rem',
  borderRadius: '0.75rem',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  color: 'rgba(203,213,225,0.85)',
  fontSize: '0.75rem',
  fontWeight: 500,
  outline: 'none',
  appearance: 'none',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")",
  backgroundPosition: 'right 0.625rem center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: '1em 1em',
};

const focusHandlers = {
  onFocus: (e) => { e.target.style.borderColor = 'rgba(99,102,241,0.5)'; e.target.style.background = 'rgba(255,255,255,0.07)'; e.target.style.boxShadow = '0 0 0 2px rgba(99,102,241,0.12)'; },
  onBlur:  (e) => { e.target.style.borderColor = 'rgba(255,255,255,0.08)'; e.target.style.background = 'rgba(255,255,255,0.04)'; e.target.style.boxShadow = 'none'; },
};

export default function TaskFilters({ filters, onChange, onClear, users = [], isAdmin }) {
  const hasActive = filters.status || filters.priority || (isAdmin && filters.assignedTo) || filters.search;

  const FilterSelect = ({ value, onChange: handleChange, children }) => (
    <select value={value} onChange={handleChange} style={filterSelectStyle} {...focusHandlers}>
      {children}
    </select>
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <FilterSelect value={filters.status || ''} onChange={(e) => onChange({ status: e.target.value })}>
        <option value="">All Statuses</option>
        {STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
      </FilterSelect>

      <FilterSelect value={filters.priority || ''} onChange={(e) => onChange({ priority: e.target.value })}>
        <option value="">All Priorities</option>
        {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
      </FilterSelect>

      {isAdmin && users.length > 0 && (
        <FilterSelect value={filters.assignedTo || ''} onChange={(e) => onChange({ assignedTo: e.target.value })}>
          <option value="">All Members</option>
          {users.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
        </FilterSelect>
      )}

      <FilterSelect value={filters.sort || '-createdAt'} onChange={(e) => onChange({ sort: e.target.value })}>
        <option value="-createdAt">Newest First</option>
        <option value="createdAt">Oldest First</option>
        <option value="dueDate">Due (Soonest)</option>
        <option value="-dueDate">Due (Latest)</option>
        <option value="priority">Priority ↑</option>
        <option value="-priority">Priority ↓</option>
      </FilterSelect>

      <AnimatePresence>
        {hasActive && (
          <motion.button
            onClick={onClear}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl transition-all duration-200"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.15 }}
            style={{
              background: 'rgba(239,68,68,0.08)',
              border: '1px solid rgba(239,68,68,0.15)',
              color: 'rgba(252,165,165,0.7)',
            }}
            whileHover={{ background: 'rgba(239,68,68,0.14)', color: 'rgba(252,165,165,1)' }}
          >
            <RotateCcw size={11} />
            Clear
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

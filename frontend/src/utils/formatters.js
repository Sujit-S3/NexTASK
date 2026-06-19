import { formatDistanceToNow, format, isToday, isYesterday, isPast, parseISO } from 'date-fns';

export const formatDate = (date, fmt = 'MMM dd, yyyy') => {
  if (!date) return '—';
  try { return format(new Date(date), fmt); }
  catch { return '—'; }
};

export const formatDateTime = (date) => formatDate(date, 'MMM dd, yyyy · h:mm a');

export const formatRelative = (date) => {
  if (!date) return '';
  try { return formatDistanceToNow(new Date(date), { addSuffix: true }); }
  catch { return ''; }
};

export const formatSmartDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isToday(d))     return `Today at ${format(d, 'h:mm a')}`;
  if (isYesterday(d)) return `Yesterday at ${format(d, 'h:mm a')}`;
  return formatDate(date);
};

export const isOverdue = (dueDate, status) => {
  if (!dueDate || status === 'completed') return false;
  return isPast(new Date(dueDate));
};

export const getDaysUntilDue = (dueDate) => {
  if (!dueDate) return null;
  const diff = new Date(dueDate) - new Date();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

export const formatDueDate = (dueDate, status) => {
  if (!dueDate) return null;
  const days = getDaysUntilDue(dueDate);
  const overdue = isOverdue(dueDate, status);
  if (overdue) return { label: `${Math.abs(days)}d overdue`, urgent: true };
  if (days === 0) return { label: 'Due today', urgent: true };
  if (days === 1) return { label: 'Due tomorrow', urgent: false };
  if (days <= 3)  return { label: `Due in ${days}d`, urgent: false };
  return { label: formatDate(dueDate), urgent: false };
};

export const truncate = (str, len = 60) => {
  if (!str) return '';
  return str.length > len ? str.slice(0, len) + '…' : str;
};

export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const formatStatus = (status) => {
  const map = { 'todo': 'To Do', 'in-progress': 'In Progress', 'review': 'Review', 'completed': 'Completed' };
  return map[status] || capitalize(status);
};

export const getInitials = (name) => {
  if (!name) return '??';
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
};

export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return String(num);
};

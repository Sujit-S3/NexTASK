import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Menu, Search, Plus, Bell, X, Sparkles } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAI } from '../../context/AIContext';
import { toggleMobileSidebar } from '../../store/uiSlice';
import { fetchNotifications } from '../../store/notificationSlice';
import NotificationDropdown from '../notifications/NotificationDropdown';
import Avatar from './Avatar';
import useDebounce from '../../hooks/useDebounce';

export default function Header() {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const { isDark, toggleTheme } = useTheme();
  const { user }   = useSelector((s) => s.auth);
  const { unreadCount } = useSelector((s) => s.notifications);
  const { openAI } = useAI();

  const [search,      setSearch]      = useState('');
  const [showNotif,   setShowNotif]   = useState(false);
  const [showSearch,  setShowSearch]  = useState(false);
  const [searchFocus, setSearchFocus] = useState(false);
  const notifRef  = useRef(null);
  const searchRef = useRef(null);
  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => { dispatch(fetchNotifications()); }, []);

  useEffect(() => {
    if (debouncedSearch.trim()) {
      navigate(`/tasks?search=${encodeURIComponent(debouncedSearch)}`);
    }
  }, [debouncedSearch]);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Glass icon button helpers
  const iconBtnStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.5rem',
    borderRadius: '0.75rem',
    border: 'none',
    background: 'transparent',
    color: 'rgba(0,0,0,0.45)',
    cursor: 'pointer',
    transition: 'all 0.18s ease',
  };
  const iconBtnDark = {
    color: 'rgba(148,163,184,0.7)',
  };

  const onEnterIcon = (e) => {
    e.currentTarget.style.background = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
    e.currentTarget.style.color = isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.75)';
    e.currentTarget.style.transform = 'scale(1.06)';
  };
  const onLeaveIcon = (e) => {
    e.currentTarget.style.background = 'transparent';
    e.currentTarget.style.color = isDark ? 'rgba(148,163,184,0.7)' : 'rgba(0,0,0,0.45)';
    e.currentTarget.style.transform = 'scale(1)';
  };
  const onDownIcon = (e) => { e.currentTarget.style.transform = 'scale(0.94)'; };
  const onUpIcon   = (e) => { e.currentTarget.style.transform = 'scale(1.06)'; };

  return (
    <header
      className="h-16 flex items-center justify-between px-4 sm:px-6 shrink-0 z-10 relative"
      style={{
        background: isDark
          ? 'rgba(6,13,26,0.75)'
          : 'rgba(255,255,255,0.68)',
        backdropFilter: 'blur(32px) saturate(180%)',
        WebkitBackdropFilter: 'blur(32px) saturate(180%)',
        borderBottom: isDark
          ? '1px solid rgba(255,255,255,0.06)'
          : '1px solid rgba(0,0,0,0.05)',
        boxShadow: isDark
          ? '0 1px 0 rgba(255,255,255,0.03), 0 4px 16px rgba(0,0,0,0.25)'
          : '0 1px 0 rgba(255,255,255,0.9), 0 4px 16px rgba(0,0,0,0.04)',
      }}
    >
      {/* ── Left: mobile menu + search ──────────────────────────────────── */}
      <div className="flex items-center gap-2">

        {/* Desktop search bar */}
        <div
          className="hidden sm:flex items-center gap-2.5 rounded-xl px-3.5 py-2 transition-all duration-250"
          style={{
            width: searchFocus ? '320px' : '240px',
            background: searchFocus
              ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.90)')
              : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'),
            border: `1px solid ${searchFocus
              ? (isDark ? 'rgba(99,102,241,0.5)' : 'rgba(10,132,255,0.35)')
              : (isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)')}`,
            boxShadow: searchFocus
              ? (isDark ? '0 0 0 3px rgba(99,102,241,0.15)' : '0 0 0 3px rgba(10,132,255,0.10), 0 2px 8px rgba(0,0,0,0.04)')
              : 'none',
            transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <Search
            size={14}
            style={{
              color: searchFocus
                ? (isDark ? 'rgba(165,180,252,0.8)' : 'rgba(10,132,255,0.7)')
                : (isDark ? 'rgba(148,163,184,0.4)' : 'rgba(0,0,0,0.30)'),
              transition: 'color 0.2s',
              flexShrink: 0,
            }}
          />
          <input
            ref={searchRef}
            type="text"
            placeholder="Search tasks…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFocus={() => setSearchFocus(true)}
            onBlur={() => setSearchFocus(false)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: isDark ? 'rgba(241,245,249,0.9)' : 'rgba(0,0,0,0.80)',
              fontSize: '0.8125rem',
              width: '100%',
              letterSpacing: '-0.005em',
            }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{ color: isDark ? 'rgba(148,163,184,0.5)' : 'rgba(0,0,0,0.28)', background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Mobile search toggle */}
        <button
          onClick={() => setShowSearch(!showSearch)}
          style={{ ...iconBtnStyle, ...(isDark ? iconBtnDark : {}) }}
          onMouseEnter={onEnterIcon}
          onMouseLeave={onLeaveIcon}
          onMouseDown={onDownIcon}
          onMouseUp={onUpIcon}
          className="sm:hidden"
          aria-label="Search"
        >
          <Search size={17} />
        </button>
      </div>

      {/* Mobile search bar (dropdown) */}
      <AnimatePresence>
        {showSearch && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="absolute top-16 left-0 right-0 p-3 sm:hidden z-20"
            style={{
              background: isDark ? 'rgba(6,13,26,0.95)' : 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(24px)',
              borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
              boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
            }}
          >
            <div
              className="flex items-center gap-2 rounded-xl px-3.5 py-2.5"
              style={{
                background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                border: `1px solid ${isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.07)'}`,
              }}
            >
              <Search size={14} style={{ color: isDark ? 'rgba(148,163,184,0.5)' : 'rgba(0,0,0,0.32)' }} />
              <input
                autoFocus
                type="text"
                placeholder="Search tasks…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: isDark ? 'rgba(241,245,249,0.9)' : 'rgba(0,0,0,0.82)',
                  fontSize: '0.8125rem',
                  width: '100%',
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Right: action buttons ─────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5">

        {/* New Task (admin only) */}
        {user?.role === 'admin' && (
          <button
            onClick={() => navigate('/tasks/new')}
            className="btn-primary btn-sm hidden sm:inline-flex !text-slate-900 dark:!text-white font-semibold"
          >
            <Plus size={13} />
            New Task
          </button>
        )}

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          style={{ ...iconBtnStyle, ...(isDark ? iconBtnDark : {}) }}
          onMouseEnter={onEnterIcon}
          onMouseLeave={onLeaveIcon}
          onMouseDown={onDownIcon}
          onMouseUp={onUpIcon}
        >
          <AnimatePresence mode="wait">
            {isDark ? (
              <motion.div
                key="sun"
                initial={{ opacity: 0, rotate: -90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 90 }}
                transition={{ duration: 0.18 }}
              >
                <Sun size={17} />
              </motion.div>
            ) : (
              <motion.div
                key="moon"
                initial={{ opacity: 0, rotate: 90 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: -90 }}
                transition={{ duration: 0.18 }}
              >
                <Moon size={17} />
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        {/* AI Assistant */}
        <button
          onClick={() => openAI()}
          aria-label="Open AI Assistant"
          style={{ ...iconBtnStyle, color: isDark ? 'rgba(167,139,250,0.8)' : 'rgba(139,92,246,0.8)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = isDark ? 'rgba(139,92,246,0.15)' : 'rgba(139,92,246,0.1)';
            e.currentTarget.style.color = isDark ? '#c4b5fd' : '#8b5cf6';
            e.currentTarget.style.transform = 'scale(1.06)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.color = isDark ? 'rgba(167,139,250,0.8)' : 'rgba(139,92,246,0.8)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
          onMouseDown={onDownIcon}
          onMouseUp={onUpIcon}
        >
          <Sparkles size={17} />
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotif(!showNotif)}
            aria-label="Notifications"
            style={{ ...iconBtnStyle, ...(isDark ? iconBtnDark : {}), position: 'relative' }}
            onMouseEnter={onEnterIcon}
            onMouseLeave={onLeaveIcon}
            onMouseDown={onDownIcon}
            onMouseUp={onUpIcon}
          >
            <Bell size={17} />
            <AnimatePresence>
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  className="absolute top-1 right-1 min-w-[15px] h-[15px] text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5"
                  style={{
                    background: 'linear-gradient(135deg, #FF3B30, #FF6B6B)',
                    boxShadow: '0 0 8px rgba(255,59,48,0.55)',
                  }}
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
          {showNotif && <NotificationDropdown onClose={() => setShowNotif(false)} />}
        </div>

        {/* Avatar */}
        <button
          onClick={() => navigate('/profile')}
          aria-label="Go to profile"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            background: 'transparent',
            padding: 0,
            marginLeft: '0.125rem',
            borderRadius: '0.875rem',
            cursor: 'pointer',
            boxShadow: isDark
              ? '0 0 0 2px rgba(99,102,241,0.3)'
              : '0 0 0 2.5px rgba(10,132,255,0.25), 0 2px 8px rgba(0,0,0,0.08)',
            transition: 'box-shadow 0.2s ease, transform 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = isDark
              ? '0 0 0 2px rgba(99,102,241,0.7)'
              : '0 0 0 2.5px rgba(10,132,255,0.55), 0 4px 12px rgba(10,132,255,0.15)';
            e.currentTarget.style.transform = 'scale(1.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = isDark
              ? '0 0 0 2px rgba(99,102,241,0.3)'
              : '0 0 0 2.5px rgba(10,132,255,0.25), 0 2px 8px rgba(0,0,0,0.08)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
          onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.95)'; }}
          onMouseUp={(e)   => { e.currentTarget.style.transform = 'scale(1.05)'; }}
        >
          <div className="rounded-xl overflow-hidden">
            <Avatar name={user?.name} src={user?.avatar} size="sm" />
          </div>
        </button>

      </div>
    </header>
  );
}

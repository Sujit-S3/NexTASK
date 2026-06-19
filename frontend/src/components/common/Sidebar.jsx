import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, CheckSquare, Users, User,
  LogOut, ChevronLeft, Sparkles,
} from 'lucide-react';
import { logoutUser } from '../../store/authSlice';
import { toggleSidebar, setMobileSidebar } from '../../store/uiSlice';
import Avatar from './Avatar';
import OnlineIndicator from './OnlineIndicator';
import Logo from './Logo';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'member'] },
  { to: '/tasks',     icon: CheckSquare,     label: 'Tasks',     roles: ['admin', 'member'] },
  { to: '/users',     icon: Users,           label: 'Team',      roles: ['admin'] },
  { to: '/profile',   icon: User,            label: 'Profile',   roles: ['admin', 'member'] },
];

function NavItem({ to, icon: Icon, label, sidebarOpen, onClick }) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        `nav-link group ${isActive ? 'active' : ''} ${!sidebarOpen ? 'justify-center px-0' : ''}`
      }
      title={!sidebarOpen ? label : undefined}
    >
      {({ isActive }) => (
        <>
          <div className={`shrink-0 transition-all duration-200 ${isActive ? '' : 'opacity-60 group-hover:opacity-90'}`}>
            <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} />
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="truncate overflow-hidden whitespace-nowrap text-sm"
              >
                {label}
              </motion.span>
            )}
          </AnimatePresence>
        </>
      )}
    </NavLink>
  );
}

export default function Sidebar() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { user }  = useSelector((s) => s.auth);
  const { sidebarOpen, sidebarMobile, onlineUsers } = useSelector((s) => s.ui);

  const isOnline = onlineUsers.includes(user?._id);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  const filteredNav = navItems.filter((n) => n.roles.includes(user?.role));

  const mobileClass = sidebarMobile ? 'translate-x-0' : '-translate-x-[120%]';

  return (
    <aside
      className={`fixed top-2 left-2 bottom-2 z-30 flex flex-col overflow-hidden lg:translate-x-0 ${mobileClass}`}
      style={{
        width: sidebarOpen ? '272px' : '72px',
        background: 'var(--sidebar-bg)',
        backdropFilter: 'blur(40px) saturate(200%)',
        WebkitBackdropFilter: 'blur(40px) saturate(200%)',
        borderTop:    '1px solid var(--c-border)',
        borderLeft:   '1px solid var(--c-border)',
        borderRight:  '1px solid var(--c-border-sub)',
        borderBottom: '1px solid var(--c-border-sub)',
        borderRadius: '20px',
        boxShadow: '0 20px 60px var(--c-shadow), 0 8px 24px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.12)',
        transition: 'width 0.32s cubic-bezier(0.16, 1, 0.3, 1), transform 0.32s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div
        className={`flex items-center h-16 shrink-0 ${sidebarOpen ? 'justify-between px-4' : 'justify-center gap-1'}`}
        style={{ borderBottom: '1px solid var(--c-border-sub)' }}
      >
        <AnimatePresence mode="wait">
          {sidebarOpen ? (
            <motion.div
              key="full-logo"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2.5 overflow-hidden"
            >
              <Logo size={70} variant="wide" />
            </motion.div>
          ) : (
            <motion.div
              key="icon-logo"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              <Logo size={24} />
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => dispatch(toggleSidebar())}
          className={`hidden lg:flex items-center justify-center p-1.5 rounded-xl transition-all duration-200 ${sidebarOpen ? 'ml-auto' : ''}`}
          style={{ color: 'var(--c-text-4)', background: 'transparent' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--c-surface)'; e.currentTarget.style.color = 'var(--c-text-2)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--c-text-4)'; }}
          aria-label="Toggle sidebar"
        >
          <motion.div
            animate={{ rotate: sidebarOpen ? 0 : 180 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <ChevronLeft size={16} />
          </motion.div>
        </button>
      </div>

      {/* ── Navigation ─────────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-0.5 no-scrollbar">
        {filteredNav.map(({ to, icon, label }, index) => (
          <motion.div
            key={to}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05, duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <NavItem
              to={to}
              icon={icon}
              label={label}
              sidebarOpen={sidebarOpen}
              onClick={() => dispatch(setMobileSidebar(false))}
            />
          </motion.div>
        ))}
      </nav>

      {/* ── Admin badge ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {sidebarOpen && user?.role === 'admin' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="px-3 pb-2 overflow-hidden"
          >
            <div
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl"
              style={{
                background: 'rgba(10,132,255,0.08)',
                border: '1px solid rgba(10,132,255,0.16)',
              }}
            >
              <Sparkles size={11} style={{ color: 'var(--c-accent)' }} />
              <span className="text-xs font-semibold" style={{ color: 'var(--c-accent)' }}>
                Admin Panel
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── User section ────────────────────────────────────────────────── */}
      <div className="p-4 mt-auto shrink-0 mb-2">
        <div
          className={`flex items-center gap-3 p-2 rounded-2xl ${sidebarOpen ? '' : 'justify-center'} shadow-md`}
          style={{ background: 'var(--card-bg)', border: '1px solid var(--c-border)' }}
        >
          <div className="relative shrink-0">
            <div
              className="rounded-xl overflow-hidden"
              style={{ boxShadow: '0 0 0 2px rgba(10,132,255,0.28), 0 2px 8px var(--c-shadow)' }}
            >
              <Avatar name={user?.name} src={user?.avatar} size="sm" />
            </div>
            <OnlineIndicator online={isOnline} size="xs" className="absolute -bottom-0.5 -right-0.5" />
          </div>

          <AnimatePresence>
            {sidebarOpen && (
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="flex-1 min-w-0 overflow-hidden"
              >
                <p className="text-sm font-semibold truncate" style={{ color: 'var(--c-text-1)', letterSpacing: '-0.01em' }}>
                  {user?.name}
                </p>
                <p className="text-xs capitalize truncate" style={{ color: 'var(--c-text-3)' }}>
                  {user?.role}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {sidebarOpen && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={handleLogout}
                className="p-1.5 rounded-lg shrink-0 transition-all duration-200"
                style={{ color: 'var(--c-text-4)', background: 'transparent' }}
                title="Logout"
                onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255,59,48,0.85)'; e.currentTarget.style.background = 'rgba(255,59,48,0.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--c-text-4)'; e.currentTarget.style.background = 'transparent'; }}
              >
                <LogOut size={15} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </aside>
  );
}

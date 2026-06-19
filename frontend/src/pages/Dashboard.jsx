import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CheckSquare, Users, TrendingUp, Clock, AlertTriangle,
  Activity, BarChart2, Award,
} from 'lucide-react';
import { useSelector } from 'react-redux';
import * as dashApi from '../api/dashboard.api';
import StatsCard from '../components/dashboard/StatsCard';
import { StatusPieChart, PriorityBarChart, CompletionTrendChart } from '../components/dashboard/TaskChart';
import ActivityTimeline from '../components/dashboard/ActivityTimeline';
import TeamPerformance from '../components/dashboard/TeamPerformance';
import CalendarWidget from '../components/common/CalendarWidget';
import toast from 'react-hot-toast';

const SectionHeader = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-2.5 mb-5">
    <div
      className="w-7 h-7 rounded-xl flex items-center justify-center"
      style={{ background: 'var(--c-icon-bg)', border: '1px solid rgba(10,132,255,0.14)' }}
    >
      <Icon size={14} style={{ color: 'var(--c-accent)' }} />
    </div>
    <h3
      className="font-semibold text-sm"
      style={{ color: 'var(--c-text-1)', letterSpacing: '-0.01em' }}
    >
      {title}
    </h3>
  </div>
);

const pageVariants = {
  hidden: { opacity: 0 },
  show:   { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const rowVariants = {
  hidden: { opacity: 0, y: 14 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
};

export default function Dashboard() {
  const { user } = useSelector((s) => s.auth);
  const isAdmin  = user?.role === 'admin';

  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadDashboard(); }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = isAdmin ? await dashApi.getAdminDashboard() : await dashApi.getUserDashboard();
      setData(res.data);
    } catch { toast.error('Failed to load dashboard'); }
    finally  { setLoading(false); }
  };

  const s = data?.summary;

  return (
    <motion.div
      className="space-y-6 max-w-screen-xl"
      variants={pageVariants}
      initial="hidden"
      animate="show"
    >
      {/* Page header */}
      <motion.div variants={rowVariants}>
        <h1 className="page-title">
          {isAdmin ? 'Admin Dashboard' : `Hey, ${user?.name?.split(' ')[0]} 👋`}
        </h1>
        <p className="page-subtitle">
          {isAdmin ? "Here's your team's performance overview." : "Here's what's on your plate today."}
        </p>
      </motion.div>

      {/* ── Admin Dashboard ─────────────────────────────────────────────── */}
      {isAdmin ? (
        <>
          {/* Stat cards row 1 */}
          <motion.div variants={rowVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard title="Total Tasks"  value={s?.totalTasks}      icon={CheckSquare}   color="brand"   loading={loading} subtitle="all tasks"            index={0} />
            <StatsCard title="Completed"    value={s?.completedTasks}  icon={TrendingUp}    color="emerald" loading={loading} trend={s?.completionRate}    trendLabel="completion rate" index={1} />
            <StatsCard title="In Progress"  value={s?.inProgressTasks} icon={Activity}      color="blue"    loading={loading} subtitle="active"               index={2} />
            <StatsCard title="Overdue"      value={s?.overdueTasks}    icon={AlertTriangle} color="red"     loading={loading} subtitle="need attention"        index={3} />
          </motion.div>

          {/* Stat cards row 2 */}
          <motion.div variants={rowVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard title="Total Users"  value={s?.totalUsers}      icon={Users}         color="violet"  loading={loading} index={0} />
            <StatsCard title="Active Users" value={s?.activeUsers}     icon={Users}         color="brand"   loading={loading} index={1} />
            <StatsCard title="In Review"    value={s?.reviewTasks}     icon={Clock}         color="amber"   loading={loading} index={2} />
            <StatsCard title="This Month"   value={s?.tasksThisMonth}  icon={BarChart2}     color="blue"    loading={loading} trend={s?.taskGrowth} trendLabel="vs last month" index={3} />
          </motion.div>

          {/* Charts row */}
          <motion.div variants={rowVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="section-panel">
              <SectionHeader icon={BarChart2}   title="Tasks by Status" />
              <StatusPieChart data={data?.charts?.tasksByStatus} loading={loading} />
            </div>
            <div className="section-panel">
              <SectionHeader icon={BarChart2}   title="Tasks by Priority" />
              <PriorityBarChart data={data?.charts?.tasksByPriority} loading={loading} />
            </div>
            <div className="section-panel">
              <SectionHeader icon={TrendingUp}  title="7-Day Completion Trend" />
              <CompletionTrendChart data={data?.charts?.completionTrend} loading={loading} />
            </div>
          </motion.div>

          {/* Activity & Team */}
          <motion.div variants={rowVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ActivityTimeline />
            <div className="section-panel">
              <SectionHeader icon={Award}       title="Team Performance" />
              <TeamPerformance data={data?.teamPerformance} loading={loading} />
            </div>
          </motion.div>
        </>
      ) : (
        /* ── Member Dashboard ──────────────────────────────────────────── */
        <>
          <motion.div variants={rowVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard title="My Tasks"    value={s?.myTasks}          icon={CheckSquare}   color="brand"   loading={loading} index={0} />
            <StatsCard title="Completed"   value={s?.completedCount}   icon={TrendingUp}    color="emerald" loading={loading} trend={s?.completionRate} trendLabel="completion" index={1} />
            <StatsCard title="In Progress" value={s?.inProgressCount}  icon={Activity}      color="blue"    loading={loading} index={2} />
            <StatsCard title="Overdue"     value={s?.overdueCount}     icon={AlertTriangle} color="red"     loading={loading} index={3} />
          </motion.div>

          {/* Upcoming tasks */}
          <motion.div variants={rowVariants} className="relative section-panel" style={{ background: 'var(--card-bg)', border: '1px solid var(--c-border)', borderRadius: '1.25rem', padding: '1.5rem', minHeight: '180px' }}>
            <div className="relative z-10">
              <SectionHeader icon={Clock} title="Upcoming Deadlines" />
              {loading ? (
                <div className="space-y-3 mt-4">
                  {[1,2,3].map((i) => (
                    <div key={i} className="skeleton h-14 rounded-2xl" />
                  ))}
                </div>
              ) : !data?.upcomingTasks?.length ? (
                <p className="text-sm py-4" style={{ color: 'var(--c-text-2)' }}>
                  No upcoming deadlines 🪅
                </p>
              ) : (
                <div className="space-y-2 mt-4">
                  {data.upcomingTasks.map((task, i) => (
                    <motion.div
                      key={task._id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="flex items-center gap-3 p-3 rounded-2xl transition-all duration-200 cursor-pointer border border-transparent"
                      style={{
                        background: 'var(--c-surface)',
                        borderColor: 'var(--c-border)',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--c-surface-hover)';
                        e.currentTarget.style.borderColor = 'var(--c-accent)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'var(--c-surface)';
                        e.currentTarget.style.borderColor = 'var(--c-border)';
                      }}
                    >
                      <div
                        className="w-1 h-10 rounded-full"
                        style={{ background: 'var(--c-accent)', flexShrink: 0 }}
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-sm font-medium truncate"
                          style={{ color: 'var(--c-text-1)', letterSpacing: '-0.01em' }}
                        >
                          {task.title}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--c-text-3)' }}>
                          Due {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Glowing Calendar Graphic (only on empty state) */}
            {!loading && !data?.upcomingTasks?.length && (
              <div className="absolute right-16 top-1/2 -translate-y-1/2 hidden sm:block z-20 transition-transform hover:scale-105 active:scale-95">
                <CalendarWidget>
                  <div className="relative pt-6">
                    {/* Calendar Base Glow */}
                  <div className="absolute inset-0 blur-[32px] rounded-full" style={{ background: 'rgba(59, 130, 246, 0.35)', transform: 'scale(1.2)' }} />
                  
                  {/* Calendar Icon SVG */}
                  <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="rgba(99, 102, 241, 1)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="relative z-10" style={{ filter: 'drop-shadow(0 0 12px rgba(99,102,241,0.6))' }}>
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" fill="var(--card-bg)" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                    {/* Dots representing days */}
                    <circle cx="8" cy="14" r="0.8" fill="rgba(99, 102, 241, 1)" />
                    <circle cx="12" cy="14" r="0.8" fill="rgba(99, 102, 241, 1)" />
                    <circle cx="16" cy="14" r="0.8" fill="rgba(99, 102, 241, 1)" />
                    <circle cx="8" cy="18" r="0.8" fill="rgba(99, 102, 241, 1)" />
                    <circle cx="12" cy="18" r="0.8" fill="rgba(99, 102, 241, 1)" />
                    <circle cx="16" cy="18" r="0.8" fill="rgba(99, 102, 241, 1)" />
                  </svg>
                  
                  {/* Clock Badge */}
                  <div className="absolute bottom-2 -right-4 rounded-full z-20 shadow-xl" style={{ background: 'var(--c-surface)', padding: '6px' }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--c-text-1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ filter: 'drop-shadow(0 0 8px var(--c-accent))' }}>
                      <circle cx="12" cy="12" r="10" fill="var(--c-surface)" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  
                  {/* Sparkles */}
                  <div className="absolute -top-2 -left-8 text-blue-400 opacity-70" style={{ fontSize: '10px', textShadow: '0 0 10px currentColor' }}>✦</div>
                  <div className="absolute top-1/2 -left-12 text-indigo-400 opacity-60" style={{ fontSize: '14px', textShadow: '0 0 8px currentColor' }}>✦</div>
                  <div className="absolute bottom-4 -left-4 text-purple-400 opacity-80" style={{ fontSize: '8px', textShadow: '0 0 8px currentColor' }}>✦</div>
                  <div className="absolute top-6 -right-8 text-blue-300 opacity-70" style={{ fontSize: '12px', textShadow: '0 0 6px currentColor' }}>✦</div>
                </div>
              </CalendarWidget>
              </div>
            )}
          </motion.div>
        </>
      )}
    </motion.div>
  );
}

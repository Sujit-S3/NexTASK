import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays,
  parseISO
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { STATUSES } from '../../utils/constants';

const statusColors = {
  'todo': { bg: 'rgba(148,163,184,0.15)', text: '#94a3b8', border: 'rgba(148,163,184,0.3)' },
  'in-progress': { bg: 'rgba(59,130,246,0.15)', text: '#60a5fa', border: 'rgba(59,130,246,0.3)' },
  'review': { bg: 'rgba(139,92,246,0.15)', text: '#a78bfa', border: 'rgba(139,92,246,0.3)' },
  'completed': { bg: 'rgba(16,185,129,0.15)', text: '#34d399', border: 'rgba(16,185,129,0.3)' },
};

export default function CalendarView({ tasks, loading, onEdit }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center mb-4 px-2">
        <h2 className="text-lg font-bold text-slate-100">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={prevMonth}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors border border-white/10"
          >
            <ChevronLeft size={18} className="text-slate-300" />
          </button>
          <button 
            onClick={nextMonth}
            className="p-1.5 rounded-lg hover:bg-white/10 transition-colors border border-white/10"
          >
            <ChevronRight size={18} className="text-slate-300" />
          </button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const dateFormat = "EEEE";
    const days = [];
    let startDate = startOfWeek(currentMonth);

    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-center font-medium text-xs text-slate-400 py-2 border-b border-white/5">
          {format(addDays(startDate, i), dateFormat).substring(0, 3)}
        </div>
      );
    }
    return <div className="grid grid-cols-7 mb-2">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = "d";
    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = "";

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, dateFormat);
        const cloneDay = day;
        
        // Find tasks for this day
        const dayTasks = tasks.filter(task => {
          if (!task.dueDate) return false;
          return isSameDay(parseISO(task.dueDate), cloneDay);
        });

        const isCurrentMonth = isSameMonth(day, monthStart);
        const isToday = isSameDay(day, new Date());

        days.push(
          <div
            key={day.toString()}
            className={`min-h-[100px] p-2 border border-white/5 transition-colors ${
              !isCurrentMonth ? "bg-white/[0.01] opacity-50" : "bg-white/[0.03] hover:bg-white/[0.05]"
            }`}
          >
            <div className="flex justify-between items-center mb-1">
              <span className={`text-xs font-semibold ${isToday ? 'bg-indigo-500 text-white w-6 h-6 rounded-full flex items-center justify-center' : 'text-slate-300'}`}>
                {formattedDate}
              </span>
              {dayTasks.length > 0 && (
                <span className="text-[10px] text-slate-500">{dayTasks.length} task{dayTasks.length > 1 ? 's' : ''}</span>
              )}
            </div>
            
            <div className="flex flex-col gap-1 mt-2">
              {dayTasks.map(task => {
                const colors = statusColors[task.status] || statusColors['todo'];
                return (
                  <motion.div
                    key={task._id}
                    layoutId={`cal-task-${task._id}`}
                    onClick={() => onEdit(task)}
                    className="text-[10px] p-1.5 rounded truncate cursor-pointer transition-transform hover:scale-[1.02]"
                    style={{
                      backgroundColor: colors.bg,
                      color: colors.text,
                      borderLeft: `2px solid ${colors.border}`
                    }}
                    title={task.title}
                  >
                    {task.title}
                  </motion.div>
                );
              })}
            </div>
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div>{rows}</div>;
  };

  if (loading) {
    return (
      <div className="w-full h-[600px] rounded-2xl border border-white/10 p-6 flex flex-col skeleton">
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full rounded-2xl border border-white/10 p-4 lg:p-6"
      style={{
        background: 'rgba(13, 20, 40, 0.4)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {renderHeader()}
      {renderDays()}
      <div className="rounded-xl overflow-hidden border border-white/5">
        {renderCells()}
      </div>
    </motion.div>
  );
}

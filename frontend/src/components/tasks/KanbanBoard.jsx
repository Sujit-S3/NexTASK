import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DndContext, useDraggable, useDroppable, DragOverlay, closestCorners } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import TaskCard from './TaskCard';
import { STATUSES } from '../../utils/constants';

const COLUMNS = STATUSES;

const colConfig = {
  'todo':        { border: 'rgba(148,163,184,0.5)', glow: 'rgba(148,163,184,0.12)', bg: 'rgba(255,255,255,0.015)', dot: '#94a3b8' },
  'in-progress': { border: 'rgba(59,130,246,0.5)',  glow: 'rgba(59,130,246,0.1)',   bg: 'rgba(59,130,246,0.03)',   dot: '#3b82f6' },
  'review':      { border: 'rgba(139,92,246,0.5)',  glow: 'rgba(139,92,246,0.1)',   bg: 'rgba(139,92,246,0.03)',   dot: '#8b5cf6' },
  'completed':   { border: 'rgba(16,185,129,0.5)',  glow: 'rgba(16,185,129,0.1)',   bg: 'rgba(16,185,129,0.03)',   dot: '#10b981' },
};

function DraggableTaskCard({ task, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task._id,
    data: task,
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.4 : 1,
    cursor: 'grab',
  };

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <TaskCard task={task} onEdit={onEdit} onDelete={onDelete} />
    </div>
  );
}

function DroppableColumn({ col, cfg, tasks, onEdit, onDelete }) {
  const { setNodeRef, isOver } = useDroppable({
    id: col.value,
  });

  return (
    <motion.div
      className="flex flex-col rounded-2xl overflow-hidden"
      style={{
        background: isOver ? 'rgba(255,255,255,0.08)' : cfg.bg,
        border: `1px solid ${isOver ? cfg.border : cfg.border.replace('0.5', '0.12')}`,
        boxShadow: `0 4px 24px rgba(0,0,0,0.25)`,
        transition: 'all 0.2s ease',
      }}
    >
      <div
        className="px-4 py-3.5 flex items-center justify-between shrink-0"
        style={{
          borderBottom: `1px solid rgba(255,255,255,0.05)`,
          background: `linear-gradient(to right, ${cfg.bg}, rgba(255,255,255,0.01))`,
        }}
      >
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div
              className="w-2 h-2 rounded-full"
              style={{ background: cfg.dot, boxShadow: `0 0 8px ${cfg.dot}` }}
            />
          </div>
          <h3
            className="text-sm font-semibold"
            style={{ color: 'rgba(203,213,225,0.9)', letterSpacing: '-0.01em' }}
          >
            {col.label}
          </h3>
        </div>
        <span
          className="text-xs font-bold px-2 py-0.5 rounded-full"
          style={{
            background: cfg.bg,
            border: `1px solid ${cfg.border.replace('0.5', '0.25')}`,
            color: cfg.dot,
          }}
        >
          {tasks.length}
        </span>
      </div>

      <div ref={setNodeRef} className="flex-1 p-3 space-y-3 overflow-y-auto min-h-[150px]">
        {tasks.length === 0 ? (
          <div className="py-8 text-center opacity-50">
            <p className="text-xs" style={{ color: 'rgba(148,163,184,0.35)' }}>Drop here</p>
          </div>
        ) : (
          tasks.map((task) => (
            <DraggableTaskCard key={task._id} task={task} onEdit={onEdit} onDelete={onDelete} />
          ))
        )}
      </div>
    </motion.div>
  );
}

export default function KanbanBoard({ tasks, onEdit, onDelete, isAdmin, updateTask }) {
  const [activeTask, setActiveTask] = useState(null);
  const [localTasks, setLocalTasks] = useState(tasks);

  // Sync with props
  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const handleDragStart = (event) => {
    const { active } = event;
    setActiveTask(active.data.current);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id;
    const newStatus = over.id;
    const currentTask = localTasks.find((t) => t._id === taskId);

    if (currentTask && currentTask.status !== newStatus) {
      // Optimistic update
      setLocalTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, status: newStatus } : t))
      );
      
      try {
        if (updateTask) {
          await updateTask(taskId, { status: newStatus });
        }
      } catch (err) {
        // Revert on error
        setLocalTasks(tasks);
      }
    }
  };

  return (
    <DndContext
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 min-h-[400px]">
        {COLUMNS.map((col) => {
          const colTasks = localTasks.filter((t) => t.status === col.value);
          const cfg = colConfig[col.value] || colConfig['todo'];
          return (
            <DroppableColumn
              key={col.value}
              col={col}
              cfg={cfg}
              tasks={colTasks}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          );
        })}
      </div>

      <DragOverlay>
        {activeTask ? (
          <div style={{ opacity: 0.8, transform: 'scale(1.05)' }}>
            <TaskCard task={activeTask} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

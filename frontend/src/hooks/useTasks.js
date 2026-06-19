import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchTasks, createTask, updateTask, deleteTask, setFilter, clearFilters, setPage } from '../store/taskSlice';

export default function useTasks(autoFetch = true) {
  const dispatch  = useDispatch();
  const { tasks, task, stats, pagination, filters, loading, taskLoading, error } = useSelector((s) => s.tasks);

  useEffect(() => {
    if (autoFetch) dispatch(fetchTasks(filters));
  }, [filters]);

  return {
    tasks, task, stats, pagination, filters, loading, taskLoading, error,
    fetchTasks:   (params) => dispatch(fetchTasks(params)),
    createTask:   (data)   => dispatch(createTask(data)),
    updateTask:   (id, data) => dispatch(updateTask({ id, data })),
    deleteTask:   (id)     => dispatch(deleteTask(id)),
    setFilter:    (f)      => dispatch(setFilter(f)),
    clearFilters: ()       => dispatch(clearFilters()),
    setPage:      (p)      => dispatch(setPage(p)),
  };
}

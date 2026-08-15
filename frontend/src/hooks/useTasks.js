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
    // .unwrap() makes these reject on failure — without it, dispatching a
    // createAsyncThunk always resolves (fulfilled or rejected), so every
    // try/catch around a caller of these functions would silently never catch.
    fetchTasks:   (params) => dispatch(fetchTasks(params)).unwrap(),
    createTask:   (data)   => dispatch(createTask(data)).unwrap(),
    updateTask:   (id, data) => dispatch(updateTask({ id, data })).unwrap(),
    deleteTask:   (id)     => dispatch(deleteTask(id)).unwrap(),
    setFilter:    (f)      => dispatch(setFilter(f)),
    clearFilters: ()       => dispatch(clearFilters()),
    setPage:      (p)      => dispatch(setPage(p)),
  };
}

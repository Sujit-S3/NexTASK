import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as taskApi from '../api/task.api';

// ─── Thunks ───────────────────────────────────────────────────────────────────
export const fetchTasks = createAsyncThunk('tasks/fetchAll', async (params, { rejectWithValue }) => {
  try { return await taskApi.getTasks(params); }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to fetch tasks'); }
});

export const fetchTaskById = createAsyncThunk('tasks/fetchOne', async (id, { rejectWithValue }) => {
  try { return await taskApi.getTaskById(id); }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Task not found'); }
});

export const createTask = createAsyncThunk('tasks/create', async (data, { rejectWithValue }) => {
  try { return await taskApi.createTask(data); }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to create task'); }
});

export const updateTask = createAsyncThunk('tasks/update', async ({ id, data }, { rejectWithValue }) => {
  try { return await taskApi.updateTask(id, data); }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to update task'); }
});

export const deleteTask = createAsyncThunk('tasks/delete', async (id, { rejectWithValue }) => {
  try { await taskApi.deleteTask(id); return id; }
  catch (err) { return rejectWithValue(err.response?.data?.message || 'Failed to delete task'); }
});

export const fetchTaskStats = createAsyncThunk('tasks/stats', async (_, { rejectWithValue }) => {
  try { return await taskApi.getTaskStats(); }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

// ─── Slice ────────────────────────────────────────────────────────────────────
const taskSlice = createSlice({
  name: 'tasks',
  initialState: {
    tasks:      [],
    task:       null,
    stats:      null,
    pagination: { total: 0, page: 1, pages: 1, limit: 20 },
    filters: {
      search: '', status: '', priority: '', assignedTo: '',
      sort: '-createdAt', page: 1,
    },
    loading:       false,
    taskLoading:   false,
    error:         null,
  },
  reducers: {
    setFilter: (state, action) => {
      state.filters = { ...state.filters, ...action.payload, page: 1 };
    },
    setPage: (state, action) => {
      state.filters.page = action.payload;
    },
    clearFilters: (state) => {
      state.filters = { search: '', status: '', priority: '', assignedTo: '', sort: '-createdAt', page: 1 };
    },
    // Real-time socket updates
    socketTaskCreated: (state, action) => {
      state.tasks.unshift(action.payload);
      state.pagination.total += 1;
    },
    socketTaskUpdated: (state, action) => {
      const idx = state.tasks.findIndex((t) => t._id === action.payload._id);
      if (idx !== -1) state.tasks[idx] = action.payload;
      if (state.task?._id === action.payload._id) state.task = action.payload;
    },
    socketTaskDeleted: (state, action) => {
      state.tasks = state.tasks.filter((t) => t._id !== action.payload.taskId);
      state.pagination.total = Math.max(0, state.pagination.total - 1);
    },
    clearTaskError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      // fetchTasks
      .addCase(fetchTasks.pending,   (s) => { s.loading = true; s.error = null; })
      .addCase(fetchTasks.fulfilled, (s, a) => {
        s.loading = false;
        s.tasks = a.payload.data;
        s.pagination = a.payload.pagination;
      })
      .addCase(fetchTasks.rejected,  (s, a) => { s.loading = false; s.error = a.payload; })

      // fetchTaskById
      .addCase(fetchTaskById.pending,   (s) => { s.taskLoading = true; s.task = null; })
      .addCase(fetchTaskById.fulfilled, (s, a) => { s.taskLoading = false; s.task = a.payload.data; })
      .addCase(fetchTaskById.rejected,  (s, a) => { s.taskLoading = false; s.error = a.payload; })

      // createTask
      .addCase(createTask.fulfilled, (s, a) => {
        s.tasks.unshift(a.payload.data);
        s.pagination.total += 1;
      })

      // updateTask
      .addCase(updateTask.fulfilled, (s, a) => {
        const idx = s.tasks.findIndex((t) => t._id === a.payload.data._id);
        if (idx !== -1) s.tasks[idx] = a.payload.data;
        if (s.task?._id === a.payload.data._id) s.task = a.payload.data;
      })

      // deleteTask
      .addCase(deleteTask.fulfilled, (s, a) => {
        s.tasks = s.tasks.filter((t) => t._id !== a.payload);
        s.pagination.total = Math.max(0, s.pagination.total - 1);
      })

      // fetchTaskStats
      .addCase(fetchTaskStats.fulfilled, (s, a) => { s.stats = a.payload.data; });
  },
});

export const {
  setFilter, setPage, clearFilters,
  socketTaskCreated, socketTaskUpdated, socketTaskDeleted,
  clearTaskError,
} = taskSlice.actions;
export default taskSlice.reducer;

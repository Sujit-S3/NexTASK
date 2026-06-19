import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as notifApi from '../api/notification.api';

export const fetchNotifications = createAsyncThunk('notifications/fetch', async (params, { rejectWithValue }) => {
  try { return await notifApi.getNotifications(params); }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const markRead = createAsyncThunk('notifications/markRead', async (id, { rejectWithValue }) => {
  try { return await notifApi.markAsRead(id); }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const markAllRead = createAsyncThunk('notifications/markAllRead', async (_, { rejectWithValue }) => {
  try { return await notifApi.markAllAsRead(); }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const deleteNotif = createAsyncThunk('notifications/delete', async (id, { rejectWithValue }) => {
  try { await notifApi.deleteNotification(id); return id; }
  catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    items:       [],
    unreadCount: 0,
    loading:     false,
    pagination:  { total: 0, page: 1, pages: 1 },
  },
  reducers: {
    socketNotificationNew: (state, action) => {
      state.items.unshift(action.payload);
      state.unreadCount += 1;
    },
    setUnreadCount: (state, action) => { state.unreadCount = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending,   (s) => { s.loading = true; })
      .addCase(fetchNotifications.fulfilled, (s, a) => {
        s.loading = false;
        s.items = a.payload.data;
        s.unreadCount = a.payload.unreadCount;
        s.pagination = a.payload.pagination;
      })
      .addCase(fetchNotifications.rejected,  (s) => { s.loading = false; })

      .addCase(markRead.fulfilled, (s, a) => {
        const idx = s.items.findIndex((n) => n._id === a.payload.data._id);
        if (idx !== -1) s.items[idx] = a.payload.data;
        s.unreadCount = a.payload.unreadCount;
      })

      .addCase(markAllRead.fulfilled, (s) => {
        s.items = s.items.map((n) => ({ ...n, isRead: true }));
        s.unreadCount = 0;
      })

      .addCase(deleteNotif.fulfilled, (s, a) => {
        const notif = s.items.find((n) => n._id === a.payload);
        if (notif && !notif.isRead) s.unreadCount = Math.max(0, s.unreadCount - 1);
        s.items = s.items.filter((n) => n._id !== a.payload);
      });
  },
});

export const { socketNotificationNew, setUnreadCount } = notificationSlice.actions;
export default notificationSlice.reducer;

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as authApi from '../api/auth.api';

// ─── Load persisted auth from localStorage ────────────────────────────────────
const persistedUser  = JSON.parse(localStorage.getItem('tf_user')  || 'null');
const persistedToken = localStorage.getItem('tf_token') || null;

// ─── Thunks ───────────────────────────────────────────────────────────────────
export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const data = await authApi.login(credentials);
    localStorage.setItem('tf_user',  JSON.stringify(data.user));
    localStorage.setItem('tf_token', data.accessToken);
    if (data.refreshToken) localStorage.setItem('tf_refresh', data.refreshToken);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Login failed');
  }
});

export const registerUser = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const data = await authApi.register(userData);
    localStorage.setItem('tf_user',  JSON.stringify(data.user));
    localStorage.setItem('tf_token', data.accessToken);
    if (data.refreshToken) localStorage.setItem('tf_refresh', data.refreshToken);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Registration failed');
  }
});

export const logoutUser = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await authApi.logout();
  } catch {
    // Ignore logout errors
  } finally {
    localStorage.removeItem('tf_user');
    localStorage.removeItem('tf_token');
    localStorage.removeItem('tf_refresh');
  }
});

export const fetchMe = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try {
    const data = await authApi.getMe();
    localStorage.setItem('tf_user', JSON.stringify(data.user));
    return data.user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Session expired');
  }
});

export const updateMyProfile = createAsyncThunk('auth/updateProfile', async ({ id, data }, { rejectWithValue }) => {
  try {
    const res = await authApi.updateProfile(id, data);
    localStorage.setItem('tf_user', JSON.stringify(res.data));
    return res.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || 'Update failed');
  }
});

// ─── Slice ────────────────────────────────────────────────────────────────────
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:            persistedUser,
    token:           persistedToken,
    isAuthenticated: !!persistedToken && !!persistedUser,
    loading:         false,
    error:           null,
  },
  reducers: {
    clearAuthError: (state) => { state.error = null; },
    setUser: (state, action) => {
      state.user = action.payload;
      localStorage.setItem('tf_user', JSON.stringify(action.payload));
    },
  },
  extraReducers: (builder) => {
    // Login
    builder
      .addCase(loginUser.pending,   (s) => { s.loading = true;  s.error = null; })
      .addCase(loginUser.fulfilled, (s, a) => {
        s.loading = false; s.isAuthenticated = true;
        s.user = a.payload.user; s.token = a.payload.accessToken;
      })
      .addCase(loginUser.rejected,  (s, a) => { s.loading = false; s.error = a.payload; });

    // Register
    builder
      .addCase(registerUser.pending,   (s) => { s.loading = true;  s.error = null; })
      .addCase(registerUser.fulfilled, (s, a) => {
        s.loading = false; s.isAuthenticated = true;
        s.user = a.payload.user; s.token = a.payload.accessToken;
      })
      .addCase(registerUser.rejected,  (s, a) => { s.loading = false; s.error = a.payload; });

    // Logout
    builder.addCase(logoutUser.fulfilled, (s) => {
      s.user = null; s.token = null; s.isAuthenticated = false; s.error = null;
    });

    // Fetch me
    builder
      .addCase(fetchMe.fulfilled, (s, a) => { s.user = a.payload; s.isAuthenticated = true; })
      .addCase(fetchMe.rejected,  (s) => { s.user = null; s.token = null; s.isAuthenticated = false; });

    // Update profile
    builder.addCase(updateMyProfile.fulfilled, (s, a) => { s.user = a.payload; });
  },
});

export const { clearAuthError, setUser } = authSlice.actions;
export default authSlice.reducer;

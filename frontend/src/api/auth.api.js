import api from './axios';
import userApi from './user.api';

export const register  = (data)     => api.post('/auth/register', data).then((r) => r.data);
export const login     = (data)     => api.post('/auth/login', data).then((r) => r.data);
export const logout    = ()         => api.post('/auth/logout').then((r) => r.data);
export const getMe     = ()         => api.get('/auth/me').then((r) => r.data);
export const refreshToken = (token) => api.post('/auth/refresh-token', { refreshToken: token }).then((r) => r.data);
export const changePassword = (data) => api.patch('/auth/change-password', data).then((r) => r.data);
export const updateProfile = (id, data) => userApi.updateUser(id, data);

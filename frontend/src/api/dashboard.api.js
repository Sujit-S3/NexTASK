import api from './axios';

export const getAdminDashboard = () => api.get('/dashboard/admin').then((r) => r.data);
export const getUserDashboard  = () => api.get('/dashboard/user').then((r) => r.data);

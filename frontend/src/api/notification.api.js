import api from './axios';

export const getNotifications  = (params) => api.get('/notifications', { params }).then((r) => r.data);
export const getUnreadCount    = ()       => api.get('/notifications/unread-count').then((r) => r.data);
export const markAsRead        = (id)     => api.patch(`/notifications/${id}/read`).then((r) => r.data);
export const markAllAsRead     = ()       => api.patch('/notifications/read-all').then((r) => r.data);
export const deleteNotification= (id)     => api.delete(`/notifications/${id}`).then((r) => r.data);
export const clearAll          = ()       => api.delete('/notifications').then((r) => r.data);

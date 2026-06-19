import api from './axios';

export const getTasks     = (params) => api.get('/tasks', { params }).then((r) => r.data);
export const getTaskById  = (id)     => api.get(`/tasks/${id}`).then((r) => r.data);
export const createTask   = (data)   => api.post('/tasks', data).then((r) => r.data);
export const updateTask   = (id, data) => api.put(`/tasks/${id}`, data).then((r) => r.data);
export const deleteTask   = (id)     => api.delete(`/tasks/${id}`).then((r) => r.data);
export const assignTask   = (id, userId) => api.patch(`/tasks/${id}/assign`, { userId }).then((r) => r.data);
export const getTaskStats = ()       => api.get('/tasks/stats').then((r) => r.data);

// Comments
export const getComments   = (taskId, params) => api.get(`/tasks/${taskId}/comments`, { params }).then((r) => r.data);
export const addComment    = (taskId, data)    => api.post(`/tasks/${taskId}/comments`, data).then((r) => r.data);
export const updateComment = (taskId, commentId, data) => api.put(`/tasks/${taskId}/comments/${commentId}`, data).then((r) => r.data);
export const deleteComment = (taskId, commentId)       => api.delete(`/tasks/${taskId}/comments/${commentId}`).then((r) => r.data);

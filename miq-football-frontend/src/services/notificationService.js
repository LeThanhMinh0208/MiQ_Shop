import api from './api.js';

export const fetchNotifications    = () => api.get('/notifications').then((r) => r.data.data);
export const markNotificationRead  = (id) => api.patch(`/notifications/${id}/read`);
export const markAllNotificationsRead = () => api.patch('/notifications/read-all');

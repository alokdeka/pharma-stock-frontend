import api from './axios';

export const getSmartNotifications = () => api.get('/notifications/smart');
export const markNotificationRead = (id) => api.post(`/notifications/${id}/read`);

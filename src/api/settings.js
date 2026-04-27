import api from './axios';

export const getSettings = () => api.get('/settings');
export const updateSettings = (data) => api.put('/settings', data);
export const backupDatabase = () => api.get('/database/backup', { responseType: 'blob' });
export const restoreDatabase = (formData) => api.post('/database/restore', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

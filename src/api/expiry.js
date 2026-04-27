import api from './axios';

export const getExpiryDashboard = () => api.get('/expiry/dashboard');
export const getCriticalExpiry  = () => api.get('/expiry/critical');

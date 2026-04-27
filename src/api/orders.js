import api from './axios';

export const getOrders      = ()         => api.get('/orders');
export const createOrder    = (data)     => api.post('/orders', data);
export const getLowStock    = ()         => api.get('/stock/low');
export const updateOrderStatus = (id, status) => api.put(`/orders/${id}/status`, { status });

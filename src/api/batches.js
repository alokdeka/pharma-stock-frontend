import api from './axios';

export const getBatches     = ()       => api.get('/batches');
export const getBatch       = (id)     => api.get(`/batches/${id}`);
export const searchBatch    = (num)    => api.get(`/batches/search?batch_number=${num}`);
export const createBatch    = (data)   => api.post('/batches', data);
export const deleteBatch    = (id)     => api.delete(`/batches/${id}`);
export const sellBatch      = (id, data) => api.post(`/batches/${id}/sell`, data);
export const spoilBatch     = (id, data) => api.post(`/batches/${id}/spoil`, data);

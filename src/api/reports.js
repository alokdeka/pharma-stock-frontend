import api from './axios';

export const getInventoryReport  = ()             => api.get('/reports/inventory');
export const getExpirySummary    = ()             => api.get('/reports/expiry-summary');
export const getBatchSales       = (batchNumber)  => api.get(`/reports/batch-sales?batch_number=${batchNumber}`);
export const getTransactions     = (from, to)     => api.get(`/reports/transactions?from=${from}&to=${to}`);
export const getSalesTrend       = ()             => api.get('/reports/sales-trend');
export const getFinancials       = ()             => api.get('/reports/financials');

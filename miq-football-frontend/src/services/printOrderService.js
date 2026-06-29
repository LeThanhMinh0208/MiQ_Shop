import api from './api.js';

export const createPrintOrder = async (data) => {
  const { data: res } = await api.post('/print-orders', data);
  return res.data;
};

export const getMyPrintOrders = async () => {
  const { data: res } = await api.get('/print-orders/my');
  return res.data;
};

export const getAllPrintOrders = async () => {
  const { data: res } = await api.get('/print-orders');
  return res.data?.orders || [];
};

export const getPrintOrderById = async (id) => {
  const { data: res } = await api.get(`/print-orders/${id}`);
  return res.data;
};

export const updatePrintOrderStatus = async (id, status) => {
  const { data: res } = await api.patch(`/print-orders/${id}/status`, { status });
  return res.data;
};

export const deletePrintOrder = async (id) => {
  const { data: res } = await api.delete(`/print-orders/${id}`);
  return res.data;
};

import api from './api.js';

export const createPrintOrder = async (data) => {
  const { data: res } = await api.post('/print-orders', data);
  return res.data;
};

export const getMyPrintOrders = async () => {
  const { data: res } = await api.get('/print-orders/my-orders');
  return res.data;
};

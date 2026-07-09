import api from './api.js';

export const validateCoupon = async (code, orderAmount) => {
  const { data } = await api.post('/coupons/validate', { code, orderTotal: orderAmount });
  return data.data;
};

export const getCoupons = async () => {
  const { data } = await api.get('/coupons');
  return data.data;
};

export const createCoupon = async (body) => {
  const { data } = await api.post('/coupons', body);
  return data.data;
};

export const updateCoupon = async (id, body) => {
  const { data } = await api.patch(`/coupons/${id}`, body);
  return data.data;
};

export const deleteCoupon = async (id) => {
  const { data } = await api.delete(`/coupons/${id}`);
  return data.data;
};

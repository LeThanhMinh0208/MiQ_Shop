import api from './api.js';

export const validateCoupon = async (code, orderAmount) => {
  const { data } = await api.post('/coupons/validate', { code, orderTotal: orderAmount });
  return data.data;
};

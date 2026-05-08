import api from './api.js';

export const createOrder = async(orderData) => {
    const { data } = await api.post('/orders', orderData);
    return data.data;
};

export const createPaymentIntent = async(orderId) => {
    const { data } = await api.post(`/orders/${orderId}/payment-intent`);
    return data.data;
};

export const markOrderPaid = async(orderId) => {
    const { data } = await api.put(`/orders/${orderId}/pay`);
    return data.data;
};

export const fetchMyOrders = async() => {
    const { data } = await api.get('/orders/my-orders');
    return data.data;
};
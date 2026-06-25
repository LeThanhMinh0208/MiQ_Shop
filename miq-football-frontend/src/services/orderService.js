import api from './api.js';

export const createOrder = async(orderData) => {
    const { data } = await api.post('/orders', orderData);
    return data.data;
};

// Pre-flight stock check — call before showing checkout form and before submit.
// Returns { allOk: bool, items: [{ product, size, quantity, ok, available?, reason? }] }.
export const validateCartStock = async (items) => {
    const { data } = await api.post('/cart/validate', { items });
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

export const fetchOrderById = async(orderId) => {
    const { data } = await api.get(`/orders/${orderId}`);
    return data.data;
};

export const fetchMyOrders = async() => {
    const { data } = await api.get('/orders/my-orders');
    return data.data;
};

export const cancelOrder = async(orderId) => {
    const { data } = await api.put(`/orders/${orderId}/cancel`);
    return data.data;
};
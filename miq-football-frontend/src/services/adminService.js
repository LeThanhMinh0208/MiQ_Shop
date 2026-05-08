import api from './api.js';

// Products
export const adminCreateProduct = async(formData) => {
    const { data } = await api.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
};

export const adminUpdateProduct = async(id, productData) => {
    const { data } = await api.put(`/products/${id}`, productData);
    return data.data;
};

export const adminDeleteProduct = async(id) => {
    const { data } = await api.delete(`/products/${id}`);
    return data.data;
};

// Orders
export const adminGetAllOrders = async(params = {}) => {
    const { data } = await api.get('/orders', { params });
    return data.data;
};

export const adminUpdateOrderStatus = async(id, status, note) => {
    const { data } = await api.put(`/orders/${id}/status`, { status, note });
    return data.data;
};

// Categories
export const adminGetCategories = async() => {
    const { data } = await api.get('/categories');
    return data.data;
};

// AI - Customer Segmentation
export const adminGetSegmentation = async() => {
    const { data } = await api.get('/ai/segmentation');
    return data.data;
};
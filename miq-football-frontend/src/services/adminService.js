import api from './api.js';

// Products
export const adminCreateProduct = async (formData) => {
    const { data } = await api.post('/products', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
};

export const adminUpdateProduct = async (id, payload) => {
    const isForm = payload instanceof FormData;
    const { data } = await api.put(`/products/${id}`, payload, {
        ...(isForm ? { headers: { 'Content-Type': 'multipart/form-data' } } : {}),
    });
    return data.data;
};

export const adminDeleteProduct = async (id) => {
    const { data } = await api.delete(`/products/${id}`);
    return data.data;
};

// Orders
export const adminGetAllOrders = async (params = {}) => {
    const { data } = await api.get('/orders', { params });
    return data.data;
};

export const adminUpdateOrderStatus = async (id, status, note) => {
    const { data } = await api.put(`/orders/${id}/status`, { status, note });
    return data.data;
};

// Categories
export const adminGetCategories = async () => {
    const { data } = await api.get('/categories');
    return data.data;
};

export const adminGetAllCategories = async () => {
    const { data } = await api.get('/categories', { params: { showAll: 'true' } });
    return data.data;
};

export const adminCreateCategory = async (formData) => {
    const { data } = await api.post('/categories', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
};

export const adminUpdateCategory = async (id, formData) => {
    const { data } = await api.put(`/categories/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
};

export const adminDeleteCategory = async (id) => {
    const { data } = await api.delete(`/categories/${id}`);
    return data.data;
};

export const adminRestoreCategory = async (id) => {
    const { data } = await api.patch(`/categories/${id}/restore`);
    return data.data;
};

// AI - Customer Segmentation
export const adminGetSegmentation = async () => {
    const { data } = await api.get('/ai/segmentation');
    return data.data;
};

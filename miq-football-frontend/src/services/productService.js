import api from './api.js';

export const fetchProducts = async(params = {}) => {
    const { data } = await api.get('/products', { params });
    return data.data;
};

export const fetchProductById = async(id) => {
    const { data } = await api.get(`/products/${id}`);
    return data.data;
};

export const fetchBoughtTogether = async(productId) => {
    const { data } = await api.get(`/ai/recommendations/${productId}/bought-together`);
    return data.data;
};

export const fetchSimilarProducts = async(productId) => {
    const { data } = await api.get(`/ai/recommendations/${productId}/similar`);
    return data.data;
};
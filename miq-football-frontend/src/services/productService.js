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

export const fetchNewArrivals = async(limit = 5) => {
    const { data } = await api.get('/products/new-arrivals', { params: { limit } });
    return data.data;
};

export const fetchFlashSale = async(limit = 8) => {
    const { data } = await api.get('/products/flash-sale', { params: { limit } });
    return data.data;
};
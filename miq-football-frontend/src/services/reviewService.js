import api from './api.js';

export const fetchEligibility = async (productId) => {
    const { data } = await api.get(`/products/${productId}/can-review`);
    return data.data; // { canReview: bool, myReview: {...} | null }
};

export const submitReview = async (productId, payload) => {
    const { data } = await api.post(`/products/${productId}/reviews`, payload);
    return data.data; // { review, ratings }
};

export const deleteReview = async (productId, reviewId) => {
    const { data } = await api.delete(`/products/${productId}/reviews/${reviewId}`);
    return data.data; // { ratings }
};

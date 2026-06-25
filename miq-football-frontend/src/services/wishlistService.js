import api from './api.js';

export const toggleWishlistApi = async (productId) => {
    const { data } = await api.post(`/auth/wishlist/${productId}`);
    return data.data; // mảng product IDs
};

export const fetchWishlistApi = async () => {
    const { data } = await api.get('/auth/wishlist');
    return data.data; // mảng product objects (populated)
};

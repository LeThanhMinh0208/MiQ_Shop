import api from './api.js';

export const fetchCategories = async (showAll = false) => {
    const { data } = await api.get('/categories', { params: showAll ? { showAll: 'true' } : {} });
    return data.data;
};

export const fetchCategoryFeatured = async (slug, limit = 6) => {
    const { data } = await api.get(`/categories/${slug}/featured`, { params: { limit } });
    return data.data;
};

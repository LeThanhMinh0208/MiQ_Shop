import api from './api.js';

export const fetchOverview = async () => {
    const { data } = await api.get('/admin/stats/overview');
    return data.data;
};

export const fetchRevenueChart = async (days = 30) => {
    const { data } = await api.get('/admin/stats/revenue', { params: { days } });
    return data.data;
};

export const fetchTopProducts = async () => {
    const { data } = await api.get('/admin/stats/top-products');
    return data.data;
};

export const fetchTopCustomers = async () => {
    const { data } = await api.get('/admin/stats/top-customers');
    return data.data;
};

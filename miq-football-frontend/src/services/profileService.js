import api from './api.js';

export const updateProfile = async (data) => {
    const { data: res } = await api.put('/auth/profile', data);
    return res.data;
};

export const uploadAvatar = async (formData) => {
    const { data: res } = await api.post('/auth/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
};

export const changePassword = async (data) => {
    const { data: res } = await api.put('/auth/change-password', data);
    return res.data;
};

export const addAddress = async (data) => {
    const { data: res } = await api.post('/auth/addresses', data);
    return res.data;
};

export const updateAddress = async (addressId, data) => {
    const { data: res } = await api.put(`/auth/addresses/${addressId}`, data);
    return res.data;
};

export const deleteAddress = async (addressId) => {
    const { data: res } = await api.delete(`/auth/addresses/${addressId}`);
    return res.data;
};

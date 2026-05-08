import { create } from 'zustand';
import api from '../services/api.js';

export const useAuthStore = create((set) => ({
    user: null,
    isAuthenticated: false,
    loading: false,

    login: async(email, password) => {
        set({ loading: true });
        try {
            const { data } = await api.post('/auth/login', { email, password });
            set({ user: data.data.user, isAuthenticated: true, loading: false });
            return { success: true };
        } catch (error) {
            set({ loading: false });
            return { success: false, message: error.message };
        }
    },

    register: async(name, email, password) => {
        set({ loading: true });
        try {
            const { data } = await api.post('/auth/register', { name, email, password });
            set({ user: data.data.user, isAuthenticated: true, loading: false });
            return { success: true };
        } catch (error) {
            set({ loading: false });
            return { success: false, message: error.message };
        }
    },

    logout: async() => {
        await api.post('/auth/logout');
        set({ user: null, isAuthenticated: false });
    },

    checkAuth: async() => {
        try {
            const { data } = await api.get('/auth/me');
            set({ user: data.data, isAuthenticated: true });
        } catch {
            set({ user: null, isAuthenticated: false });
        }
    },
}));
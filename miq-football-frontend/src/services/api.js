import axios from 'axios';

// Axios instance với credentials để gửi/nhận HTTP-only cookie
const api = axios.create({
    baseURL: 'http://localhost:5000/api/v1',
    withCredentials: true, // Bắt buộc để gửi cookie kèm request
    headers: { 'Content-Type': 'application/json' },
});

// Interceptor xử lý lỗi tập trung
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = (error.response && error.response.data && error.response.data.message) || 'Có lỗi xảy ra';
        return Promise.reject(new Error(message));
    }
);

export default api;
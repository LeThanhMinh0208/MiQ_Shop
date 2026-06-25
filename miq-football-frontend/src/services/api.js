import axios from 'axios';

// Axios instance with credentials so the session cookie travels with every request
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
});

// Read a cookie value by name from document.cookie
function getCookie(name) {
    const match = document.cookie.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
}

// Double-submit CSRF token: on every state-changing request, echo the
// server-issued csrf-token cookie back in the X-CSRF-Token header.
api.interceptors.request.use((config) => {
    const method = (config.method || '').toLowerCase();
    if (['post', 'put', 'patch', 'delete'].includes(method)) {
        const token = getCookie('csrf-token');
        if (token) config.headers['X-CSRF-Token'] = token;
    }
    return config;
});

// Centralised error message extraction
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = (error.response && error.response.data && error.response.data.message) || 'Có lỗi xảy ra';
        return Promise.reject(new Error(message));
    }
);

export default api;

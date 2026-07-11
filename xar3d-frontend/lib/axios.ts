import Axios from 'axios';

const axios = Axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000',
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },
    withCredentials: false, // Token-based auth (Sanctum API tokens), no cookies needed
});

// Request interceptor: attach saved token automatically
axios.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers.set('Authorization', `Bearer ${token}`);
        }
    }
    return config;
});

// Response interceptor: global error handling
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (typeof window !== 'undefined') {
            if (error.response?.status === 401) {
                localStorage.removeItem('auth_token');
                window.location.href = '/login';
            }
            // Handle banned user — 403 from CheckBanned middleware
            if (error.response?.status === 403 &&
                error.response?.data?.message?.includes('ditangguhkan')) {
                localStorage.removeItem('auth_token');
                window.location.href = '/login?banned=1';
            }
        }
        return Promise.reject(error);
    }
);

export default axios;

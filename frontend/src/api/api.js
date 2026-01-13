import axios from 'axios';

const API_BASE_URL = 'http://127.0.0.1:8000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
    },
});

// 🔐 Attach access token if present
api.interceptors.request.use(
    (config) => {
        // Skip auth for login, signup, token refresh
        const url = (config.url || '').toString();
        const skipAuth = url.includes('/token') || url.includes('/users/') || url.includes('/communities/');

        if (!skipAuth) {
            const token = localStorage.getItem('access_token');
            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// 🔁 Refresh token logic
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refresh = localStorage.getItem('refresh_token');

            if (!refresh) {
                logoutUser();
                return Promise.reject(error);
            }

            try {
                const res = await axios.post(`${API_BASE_URL}/token/refresh/`, { refresh });
                localStorage.setItem('access_token', res.data.access);
                originalRequest.headers['Authorization'] = `Bearer ${res.data.access}`;
                return api(originalRequest);
            } catch (refreshError) {
                logoutUser();
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

function logoutUser() {
    localStorage.clear();
    window.location.href = '/login';
}

export default api;

// src/api/api.js
import axios from "axios";

// Use Vite environment variable (VITE_API_URL). Vite exposes vars via import.meta.env
// If not set, fall back to localhost. Ensure the URL ends with "/api" when used.
const rawApiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const API_BASE_URL = rawApiUrl.replace(/\/$/, "") + "/api";

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
    },
});

// Attach access token if present
api.interceptors.request.use(
    (config) => {
        const url = (config.url || "").toString();
        const skipAuth =
            url.includes("/token") || (url.includes("/users/") && config.method === "post");

        if (!skipAuth) {
            const token = localStorage.getItem("access_token");
            if (token) {
                config.headers["Authorization"] = `Bearer ${token}`;
            }
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// Refresh token logic
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (!error.response) return Promise.reject(error);
        if (originalRequest.url.includes("/token/refresh/")) {
            forceLogout();
            return Promise.reject(error);
        }

        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            const refresh = localStorage.getItem("refresh_token");
            if (!refresh) {
                forceLogout();
                return Promise.reject(error);
            }

            try {
                const res = await axios.post(`${API_BASE_URL}/token/refresh/`, { refresh });
                localStorage.setItem("access_token", res.data.access);
                originalRequest.headers.Authorization = `Bearer ${res.data.access}`;
                return api(originalRequest);
            } catch (err) {
                forceLogout();
                return Promise.reject(err);
            }
        }

        return Promise.reject(error);
    }
);

function forceLogout() {
    localStorage.clear();
    window.location.replace("/login");
}

export default api;
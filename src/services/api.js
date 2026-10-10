import axios from 'axios';

const API = axios.create({
  // Use the configured backend in production. Vite proxies /api to
  // Express during local development when no URL is configured.
  baseURL: import.meta.env.VITE_API_BASE_URL?.trim() || '/api',
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default API;

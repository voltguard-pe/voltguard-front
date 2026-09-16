import axios from 'axios';

const clientAxios = axios.create({
    // baseURL: `${import.meta.env.VITE_BACKEND_URL}/api/v1`,
    baseURL: `${import.meta.env.VITE_BACKEND_URL}/api/v1`,
    withCredentials: true,
});

// Interceptor para inyectar el Bearer Token en los Headers
clientAxios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default clientAxios;
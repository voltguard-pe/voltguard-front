import axios from 'axios';

const clientAxios = axios.create({
    // baseURL: `${import.meta.env.VITE_BACKEND_URL}/api/v1`,
    baseURL: `${import.meta.env.VITE_BACKEND_URL}/api/v1`,
    withCredentials: true,
});

export default clientAxios;
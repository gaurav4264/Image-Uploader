import axios from 'axios';

// Create an axios instance with a dynamic base URL
// In development: Uses relative path (proxied by Vite)
// In production: Uses VITE_API_URL environment variable
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '',
});

export default api;

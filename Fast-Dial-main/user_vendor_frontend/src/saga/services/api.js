import axios from 'axios';
const BASEURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';


const api = axios.create({
  baseURL: `${BASEURL}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
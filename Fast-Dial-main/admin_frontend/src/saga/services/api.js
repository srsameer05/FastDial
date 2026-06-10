import axios from 'axios';
const BASEURL = import.meta.env.DEV ? '/api/v1' : (import.meta.env.VITE_API_URL || '/api/v1');

const api = axios.create({
  baseURL: `${BASEURL}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;

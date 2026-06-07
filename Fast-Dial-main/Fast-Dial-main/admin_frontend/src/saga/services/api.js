import axios from 'axios';
const BASEURL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: `${BASEURL}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;

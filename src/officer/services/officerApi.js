import axios from 'axios';

const officerApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082',
  headers: { 'Content-Type': 'application/json' },
});

officerApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('officer_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

officerApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('officer_token');
      localStorage.removeItem('officer_user');
      window.location.href = '/officer/login';
    }
    return Promise.reject(error);
  }
);

export default officerApi;

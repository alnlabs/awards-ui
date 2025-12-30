import axios from 'axios';
import { API_BASE_URL } from '../config/api';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    // FastAPI returns response.data with structure: { status, message, error, data }
    // Axios wraps it in response.data, so we need response.data.data to get the actual data
    if (response.data && response.data.status) {
      return response.data;
    }
    return response.data;
  },
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        toast.error(data?.error || 'Session expired. Please login again.');
      } else if (status === 403) {
        toast.error(data?.error || 'Access denied');
      } else {
        toast.error(data?.error || data?.message || 'An error occurred');
      }

      return Promise.reject(data || error);
    }

    toast.error('Network error. Please check your connection.');
    return Promise.reject(error);
  }
);

export default api;


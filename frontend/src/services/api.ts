import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

export const getCsrfCookie = async () => {
  await axios.get('http://localhost:8000/sanctum/csrf-cookie', { withCredentials: true });
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('API Error:', error.response?.status, error.response?.data);
    
    if (error.response?.status === 401) {
      // Don't redirect automatically - let the component handle it
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      // Remove the window.location.href line - let React Router handle navigation
    }
    return Promise.reject(error);
  }
);

export default api;
import axios from 'axios';

// Determine the API base URL based on environment
const API_BASE_URL = import.meta.env.MODE === 'production'
  ? import.meta.env.VITE_API_URL || 'https://playlistpro-backend.onrender.com/api'  // Use full backend URL in production
  : import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Debug logging to verify the URL
console.log('🔧 API Configuration:', {
  mode: import.meta.env.MODE,
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
  viteApiUrl: import.meta.env.VITE_API_URL,
  finalApiUrl: API_BASE_URL
});

// Create axios instances
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const authAPIInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const playlistAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const schedulerAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to create API instance with token
const createApiInstance = (token) => {
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : undefined,
    },
  });
};

// Request interceptor to add auth token
const addAuthToken = (config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

// Add interceptors to all instances
[api, authAPIInstance, playlistAPI, schedulerAPI].forEach(instance => {
  instance.interceptors.request.use(addAuthToken);
  
  // Response interceptor for handling auth errors
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );
});

// Create authAPI object with login and register methods
const authAPI = {
  login: async (credentials) => {
    const response = await authAPIInstance.post('/auth/login', credentials);
    return response;
  },
  register: async (userData) => {
    const response = await authAPIInstance.post('/auth/register', userData);
    return response;
  },
  // Add other auth methods as needed
  forgotPassword: async (email) => {
    const response = await authAPIInstance.post('/auth/forgot-password', { email });
    return response;
  },
  resetPassword: async (token, password) => {
    const response = await authAPIInstance.post('/auth/reset-password', { token, password });
    return response;
  }
};

export { api, authAPI, playlistAPI, schedulerAPI, createApiInstance };
export default api;
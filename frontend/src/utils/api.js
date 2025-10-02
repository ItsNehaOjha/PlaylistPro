import axios from 'axios';

// Determine the API base URL based on environment
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.MODE === 'production' 
    ? 'https://playlistpro-backend.onrender.com/api'  // Replace with your actual backend URL
    : 'http://localhost:5001/api');

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
  withCredentials: true, // Important for CORS with credentials
});

const authAPIInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

const playlistAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

const schedulerAPI = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Function to create API instance with token
const createApiInstance = (token) => {
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : undefined,
    },
    withCredentials: true,
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
  
  // Enhanced response interceptor for production debugging
  instance.interceptors.response.use(
    (response) => {
      console.log(`✅ API Success: ${response.config.method?.toUpperCase()} ${response.config.url}`);
      return response;
    },
    (error) => {
      console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        baseURL: error.config?.baseURL
      });
      
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
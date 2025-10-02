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

// Cold start retry function for Render free tier
const apiRequestWithRetry = async (axiosInstance, config, maxRetries = 3) => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      console.log(`🔄 API Attempt ${attempt + 1}/${maxRetries}: ${config.method?.toUpperCase()} ${config.url}`);
      const response = await axiosInstance(config);
      
      if (attempt > 0) {
        console.log(`✅ API Success after ${attempt + 1} attempts (cold start resolved)`);
      }
      
      return response;
    } catch (error) {
      const isLastAttempt = attempt === maxRetries - 1;
      const isServerError = error.response?.status >= 500 || error.code === 'ECONNREFUSED' || !error.response;
      
      if (isServerError && !isLastAttempt) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 5000); // Exponential backoff, max 5s
        console.log(`⏳ Cold start detected, retrying in ${delay}ms... (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      throw error;
    }
  }
};

// Create axios instances with retry wrapper
const createInstanceWithRetry = (baseConfig) => {
  const instance = axios.create({
    ...baseConfig,
    baseURL: API_BASE_URL,
    timeout: 30000, // 30s timeout for cold starts
    withCredentials: true,
  });

  // Override request method to use retry logic
  const originalRequest = instance.request;
  instance.request = (config) => apiRequestWithRetry(originalRequest.bind(instance), config);

  return instance;
};

// Create axios instances
const api = createInstanceWithRetry({
  headers: { 'Content-Type': 'application/json' }
});

const authAPIInstance = createInstanceWithRetry({
  headers: { 'Content-Type': 'application/json' }
});

const playlistAPI = createInstanceWithRetry({
  headers: { 'Content-Type': 'application/json' }
});

const schedulerAPI = createInstanceWithRetry({
  headers: { 'Content-Type': 'application/json' }
});

// Function to create API instance with token
const createApiInstance = (token) => {
  return createInstanceWithRetry({
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : undefined,
    }
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
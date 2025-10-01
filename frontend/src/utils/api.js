import axios from 'axios';

// Determine the API base URL based on environment
const API_BASE_URL = import.meta.env.PROD 
  ? '/api'  // In production, API is served from the same domain
  : import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

// Create axios instances
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const authAPI = axios.create({
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

// Request interceptor to add auth token
const addAuthToken = (config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

// Add interceptors to all instances
[api, authAPI, playlistAPI, schedulerAPI].forEach(instance => {
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

export { api, authAPI, playlistAPI, schedulerAPI };
export default api;
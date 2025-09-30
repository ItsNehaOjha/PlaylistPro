// Create this new file for API configuration
import axios from 'axios';

const getBaseURL = () => {
  if (import.meta.env.PROD) {
    // In production, API is served from the same domain
    return '/api';
  }
  // In development, use the full URL
  return import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
};

export const API_BASE_URL = getBaseURL();

export const createApiInstance = (token) => {
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
};
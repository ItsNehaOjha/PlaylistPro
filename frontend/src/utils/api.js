// API configuration for PlaylistPro
import axios from 'axios';

const getBaseURL = () => {
  if (import.meta.env.PROD) {
    // In production, API is served from the same domain
    return '/api';
  }
  // In development, use the correct port 5001 (not 5000)
  return import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
};

export const API_BASE_URL = getBaseURL();

export const createApiInstance = (token) => {
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    timeout: 10000, // 10 second timeout
  });
};

// Default API instance
export const api = createApiInstance();

// Auth API methods
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post(`/auth/reset-password`, { token, password }),
  getMe: (token) => createApiInstance(token).get('/auth/me'),
};

// Playlist API methods
export const playlistAPI = {
  getPlaylists: (token) => createApiInstance(token).get('/playlists'),
  createPlaylist: (playlistData, token) => createApiInstance(token).post('/playlists', playlistData),
  updatePlaylist: (id, playlistData, token) => createApiInstance(token).put(`/playlists/${id}`, playlistData),
  deletePlaylist: (id, token) => createApiInstance(token).delete(`/playlists/${id}`),
};

// Scheduler API methods
export const schedulerAPI = {
  getSessions: (token) => createApiInstance(token).get('/scheduler/sessions'),
  createSession: (sessionData, token) => createApiInstance(token).post('/scheduler/sessions', sessionData),
};
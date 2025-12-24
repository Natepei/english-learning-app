// src/utils/api.js
import axios from 'axios';

// Get API base URL - supports both localhost and production URLs
const getApiBaseUrl = () => {
  // Try environment variable first
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Dynamic: use current host for production
  if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    // Production: use same origin with /api
    return `${window.location.protocol}//${window.location.host}/api`;
  }
  
  // Development: default to localhost
  return 'http://localhost:5000/api';
};

// Get full URL for any endpoint
const getApiUrl = (endpoint) => {
  const baseUrl = getApiBaseUrl();
  return endpoint.startsWith('/') ? `${baseUrl}${endpoint}` : `${baseUrl}/${endpoint}`;
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Automatically add the token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
export { getApiBaseUrl, getApiUrl };
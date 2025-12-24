// src/utils/api.js
import axios from 'axios';

const getBaseURL = () => {
  // Production environment (Vercel)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // If running on non-localhost domain (e.g., Vercel), use the API from Render
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'https://english-learning-app-w7lk.onrender.com/api';
  }
  
  // Development environment (localhost)
  return 'http://localhost:5000/api';
};

const baseURL = getBaseURL();

const api = axios.create({
  baseURL,
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

/**
 * Helper function to get the full API URL for a given endpoint
 * @param {string} endpoint - The API endpoint (e.g., 'blogs/1', 'exams/123')
 * @returns {string} The full API URL
 */
export const getApiUrl = (endpoint) => {
  return `${baseURL}/${endpoint}`;
};

/**
 * Helper function to get the base server URL (without /api)
 * @returns {string} The base server URL
 */
export const getBaseUrl = () => {
  return baseURL.replace('/api', '');
};

export default api;
// src/utils/api.js
import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
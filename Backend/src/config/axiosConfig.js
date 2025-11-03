// Create this file as src/config/axiosConfig.js or similar

import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

// Set the base URL for server-side axios from env (no hardcoded localhost)
// Prefer INTERNAL_API_BASE_URL, fallback to BACKEND_URL, else leave default
axios.defaults.baseURL = process.env.INTERNAL_API_BASE_URL || process.env.BACKEND_URL || axios.defaults.baseURL;

// Enable credentials for session-based authentication
axios.defaults.withCredentials = true;

// Add request interceptor to include auth token (only in browser environments)
axios.interceptors.request.use(
  (config) => {
    const token = (typeof window !== 'undefined') ? localStorage.getItem('token') : undefined;
    
    // Add authorization header if token exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log requests for debugging (remove in production)
    if (process.env.NODE_ENV !== 'production') {
      console.log('Making request to:', config.url);
    }
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle authentication errors (browser-only redirects)
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Response error:', error);
    
    // Handle authentication errors globally (only if window is available)
    if (typeof window !== 'undefined') {
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('userInfo');
        localStorage.removeItem('token');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default axios;
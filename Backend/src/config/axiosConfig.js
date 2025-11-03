// Create this file as src/config/axiosConfig.js or similar

import axios from 'axios';

// Set the base URL for your backend
axios.defaults.baseURL = 'http://localhost:8000';

// Enable credentials for session-based authentication
axios.defaults.withCredentials = true;

// Add request interceptor to include auth token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const userInfo = localStorage.getItem('userInfo');
    
    // Add authorization header if token exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log requests for debugging (remove in production)
    console.log('Making request to:', config.url);
    
    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor to handle authentication errors
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('Response error:', error);
    
    // Handle authentication errors globally
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Clear user data
      localStorage.removeItem('userInfo');
      localStorage.removeItem('token');
      
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default axios;
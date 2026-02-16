import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

/**
 * API Service - Base HTTP Client
 *
 * This file creates a configured axios instance that:
 * 1. Sets the base URL for all API calls
 * 2. Automatically attaches JWT tokens to requests
 * 3. Handles errors globally
 * 4. Provides a centralized place for HTTP configuration
 */

/**
 * BASE_URL - Backend API server address
 *
 * ⚠️ IMPORTANT: ALWAYS use environment variables, NEVER hardcode URLs
 *
 * Vite Environment Variables:
 * - Must be prefixed with VITE_ to be accessible in client code
 * - Defined in .env file at project root
 * - Different .env files for different environments:
 *   - .env.development (used during npm run dev)
 *   - .env.production (used during npm run build)
 *   - .env.local (local overrides, not committed to git)
 *
 * How it works:
 * - import.meta.env.VITE_API_BASE_URL reads from .env file
 * - Fallback to localhost if not defined (for development safety)
 *
 * Example .env:
 * VITE_API_BASE_URL=http://localhost:3000
 */
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

/**
 * Create Axios Instance
 *
 * Think of this as a "customized fetch" that has default settings.
 * Instead of writing the full URL every time, we just write the path.
 *
 * Example:
 * - Without instance: axios.post('http://localhost:3000/auth/admin/login', data)
 * - With instance: api.post('/auth/admin/login', data)
 */
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 seconds - request fails if takes longer
  headers: {
    'Content-Type': 'application/json', // Tell server we're sending JSON
  },
});

/**
 * REQUEST INTERCEPTOR
 *
 * What is an interceptor?
 * - It's a function that runs BEFORE every request
 * - Like a checkpoint that modifies the request before sending
 *
 * Why do we need it?
 * - To automatically attach JWT token to every API call
 * - Without this, you'd have to manually add token to each request
 *
 * How it works:
 * 1. Get token from localStorage
 * 2. If token exists, add it to Authorization header
 * 3. Send the modified request
 *
 * Authorization Header Format:
 * "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get access token from localStorage
    const token = localStorage.getItem('accessToken');

    // If token exists, attach it to request headers
    if (token) {
      // The "Bearer" prefix is a standard for JWT tokens
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Return modified config
    return config;
  },
  (error: AxiosError) => {
    // If request setup fails (rare), reject with error
    return Promise.reject(error);
  }
);

/**
 * RESPONSE INTERCEPTOR
 *
 * What is a response interceptor?
 * - It's a function that runs AFTER every response
 * - Like a checkpoint that processes the response before your code sees it
 *
 * Why do we need it?
 * - To handle errors in one centralized place
 * - To automatically refresh expired tokens (future enhancement)
 * - To log errors for debugging
 *
 * How it works:
 * 1. If response is successful (200-299), just return the data
 * 2. If response is an error (400+), format error message nicely
 */
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Success response (status 200-299)
    // Just return the response as-is
    return response;
  },
  (error: AxiosError) => {
    /**
     * ERROR HANDLING
     *
     * Different types of errors:
     * 1. Network error (no internet, server down) - error.response is undefined
     * 2. Server error (400, 401, 500, etc.) - error.response exists
     */

    if (error.response) {
      // Server responded with an error status
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - invalid/expired token
          console.error('Unauthorized. Please login again.');

          // Clear tokens from localStorage
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');

          // Redirect to login page
          // Note: We'll handle this better with Redux later
          window.location.href = '/';
          break;

        case 403:
          // Forbidden - you don't have permission
          console.error('Access forbidden.');
          break;

        case 404:
          // Not found
          console.error('Resource not found.');
          break;

        case 500:
          // Server error
          console.error('Server error. Please try again later.');
          break;

        default:
          console.error(`Error ${status}:`, data);
      }
    } else if (error.request) {
      // Request was made but no response received
      // (server is down, no internet connection, etc.)
      console.error('No response from server. Check your internet connection.');
    } else {
      // Something else happened
      console.error('Request error:', error.message);
    }

    // Reject the promise so calling code can handle error too
    return Promise.reject(error);
  }
);

/**
 * Export the configured axios instance
 *
 * Other files will import this and use it like:
 * import api from './api';
 * api.post('/auth/admin/login', { email, password });
 */
export default api;

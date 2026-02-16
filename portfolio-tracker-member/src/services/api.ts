import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

/**
 * API Service - Base HTTP Client for Member Portal
 *
 * This file creates a configured axios instance that:
 * 1. Sets the base URL for all API calls
 * 2. Automatically attaches JWT tokens to requests
 * 3. Handles errors globally
 * 4. Provides a centralized place for HTTP configuration
 */

/**
 * BASE_URL - Backend API server address
 */
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

/**
 * Create Axios Instance
 */
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * REQUEST INTERCEPTOR
 *
 * Automatically attach JWT token to every request
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get access token from localStorage
    const token = localStorage.getItem('memberAccessToken');

    // If token exists, attach it to request headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * RESPONSE INTERCEPTOR
 *
 * Handle errors globally
 */
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Success response (status 200-299)
    return response;
  },
  (error: AxiosError) => {
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          // Unauthorized - invalid/expired token
          console.error('Unauthorized. Please login again.');

          // Clear tokens from localStorage
          localStorage.removeItem('memberAccessToken');
          localStorage.removeItem('memberRefreshToken');

          // Redirect to login page
          window.location.href = '/';
          break;

        case 403:
          console.error('Access forbidden.');
          break;

        case 404:
          console.error('Resource not found.');
          break;

        case 500:
          console.error('Server error. Please try again later.');
          break;

        default:
          console.error(`Error ${status}:`, data);
      }
    } else if (error.request) {
      console.error('No response from server. Check your internet connection.');
    } else {
      console.error('Request error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default api;

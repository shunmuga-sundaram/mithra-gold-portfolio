import api from './api';

/**
 * Authentication Service
 *
 * This file contains all API calls related to authentication:
 * - Login
 * - Logout
 * - Get admin profile
 * - Refresh token
 *
 * Why separate this from api.ts?
 * - Organization: All auth-related API calls in one place
 * - Reusability: Can call these functions from Redux actions, components, etc.
 * - Type safety: Define request/response types
 */

/**
 * TYPE DEFINITIONS
 *
 * TypeScript interfaces that define the shape of data
 * This helps catch errors at compile-time instead of runtime
 */

/**
 * LoginCredentials - What we send to login API
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Admin - Admin user data returned from backend
 */
export interface Admin {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'moderator';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * LoginResponse - What backend returns after successful login
 */
export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    admin: Admin;
    accessToken: string;
    refreshToken: string;
    expiresIn: number; // Token validity in seconds (30 days = 2592000)
  };
}

/**
 * ProfileResponse - What backend returns when fetching admin profile
 */
export interface ProfileResponse {
  success: boolean;
  data: {
    admin: Admin;
  };
}

/**
 * RefreshTokenResponse - What backend returns after token refresh
 */
export interface RefreshTokenResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    expiresIn: number;
  };
}

/**
 * AUTH SERVICE METHODS
 */

const authService = {
  /**
   * LOGIN
   *
   * Calls: POST /auth/admin/login
   *
   * What it does:
   * 1. Sends email and password to backend
   * 2. Backend validates credentials
   * 3. Backend returns JWT tokens and admin data
   * 4. We return this data to Redux (who will store it)
   *
   * @param credentials - Email and password
   * @returns LoginResponse with admin data and tokens
   *
   * Example usage:
   * const response = await authService.login({ email: 'admin@mithra.com', password: 'Admin@123' });
   * console.log(response.data.admin); // { id, name, email, role }
   * console.log(response.data.accessToken); // "eyJ..."
   */
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      // POST request to backend login endpoint
      const response = await api.post<LoginResponse>('/auth/admin/login', credentials);

      // Return the response data
      // The calling code (Redux action) will handle storing tokens
      return response.data;
    } catch (error: any) {
      // If login fails, extract error message
      const errorMessage =
        error.response?.data?.message || 'Login failed. Please try again.';

      // Throw error so calling code knows login failed
      throw new Error(errorMessage);
    }
  },

  /**
   * GET PROFILE
   *
   * Calls: GET /auth/admin/me
   *
   * What it does:
   * 1. Sends request with Authorization header (token attached by interceptor)
   * 2. Backend verifies token
   * 3. Backend returns admin profile data
   *
   * Note: Token is automatically attached by the request interceptor in api.ts
   *
   * @returns ProfileResponse with admin data
   *
   * Example usage:
   * const response = await authService.getProfile();
   * console.log(response.data.admin); // { id, name, email, role }
   */
  getProfile: async (): Promise<ProfileResponse> => {
    try {
      // GET request to profile endpoint
      // Token is automatically attached by interceptor
      const response = await api.get<ProfileResponse>('/auth/admin/me');

      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Failed to fetch profile.';

      throw new Error(errorMessage);
    }
  },

  /**
   * REFRESH TOKEN
   *
   * Calls: POST /auth/admin/refresh
   *
   * What it does:
   * 1. Sends refresh token to backend
   * 2. Backend validates refresh token
   * 3. Backend generates new access token
   * 4. We get new access token (refresh token stays the same)
   *
   * When to use:
   * - When access token expires (after 30 days)
   * - Automatically triggered by interceptor (future enhancement)
   *
   * @param refreshToken - The refresh token from login
   * @returns RefreshTokenResponse with new access token
   *
   * Example usage:
   * const refreshToken = localStorage.getItem('refreshToken');
   * const response = await authService.refreshToken(refreshToken);
   * localStorage.setItem('accessToken', response.data.accessToken);
   */
  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    try {
      // POST request with refresh token in body
      const response = await api.post<RefreshTokenResponse>('/auth/admin/refresh', {
        refreshToken,
      });

      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Failed to refresh token.';

      // If refresh fails, user needs to login again
      throw new Error(errorMessage);
    }
  },

  /**
   * LOGOUT
   *
   * Calls: POST /auth/admin/logout
   *
   * What it does:
   * 1. Optionally calls backend logout endpoint (for audit logging)
   * 2. Clears tokens from localStorage
   * 3. Clears Redux state (done by Redux action)
   *
   * Note: With JWT, logout is mainly client-side
   * - Remove tokens from localStorage
   * - Clear Redux state
   * - Redirect to login
   *
   * Backend logout is optional (for logging/audit trail)
   *
   * @returns void
   *
   * Example usage:
   * await authService.logout();
   * // User is logged out, tokens cleared
   */
  logout: async (): Promise<void> => {
    try {
      // Optional: Call backend logout endpoint for audit logging
      await api.post('/auth/admin/logout');

      // Clear tokens from localStorage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');

      // Redux will handle clearing admin data from state
    } catch (error: any) {
      // Even if backend call fails, still clear tokens locally
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');

      console.error('Logout error:', error);
    }
  },
};

/**
 * Export the service object
 *
 * Usage in Redux actions:
 * import authService from '@/services/authService';
 * const response = await authService.login({ email, password });
 */
export default authService;

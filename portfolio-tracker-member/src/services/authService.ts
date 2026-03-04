import api from './api';

/**
 * Member Auth Service
 *
 * Handles all authentication-related API calls for members
 */

/**
 * Member Interface
 */
export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
  goldHoldings: number;
}

/**
 * Login Credentials Interface
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Login Response Interface
 */
export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    member: Member;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

/**
 * Refresh Token Response Interface
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
 * Member Profile Response Interface
 */
export interface ProfileResponse {
  success: boolean;
  data: {
    member: Member;
  };
}

const authService = {
  /**
   * Login member
   *
   * @param credentials - Email and password
   * @returns Login response with member data and tokens
   */
  login: async (credentials: LoginCredentials, rememberMe: boolean = true): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/member/login', credentials);

    if (response.data.success) {
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('memberAccessToken', response.data.data.accessToken);
      storage.setItem('memberRefreshToken', response.data.data.refreshToken);
      storage.setItem('memberData', JSON.stringify(response.data.data.member));
      if (rememberMe) {
        localStorage.setItem('memberRememberMe', 'true');
      } else {
        localStorage.removeItem('memberRememberMe');
      }
    }

    return response.data;
  },

  /**
   * Refresh access token
   *
   * @param refreshToken - Refresh token
   * @returns New access token
   */
  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    const response = await api.post<RefreshTokenResponse>('/auth/member/refresh', { refreshToken });

    // Update access token in localStorage
    if (response.data.success) {
      localStorage.setItem('memberAccessToken', response.data.data.accessToken);
    }

    return response.data;
  },

  /**
   * Get current member profile
   *
   * @returns Member profile data
   */
  getProfile: async (): Promise<ProfileResponse> => {
    const response = await api.get<ProfileResponse>('/auth/member/me');
    return response.data;
  },

  /**
   * Request password reset
   *
   * Sends password reset email to member
   *
   * @param email - Member's email address
   * @returns Success message
   */
  forgotPassword: async (email: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post<{ success: boolean; message: string }>(
      '/auth/member/forgot-password',
      { email }
    );
    return response.data;
  },

  /**
   * Reset password with token
   *
   * Resets member's password using reset token from email
   *
   * @param token - Reset token from email
   * @param newPassword - New password
   * @returns Success message
   */
  resetPassword: async (token: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.post<{ success: boolean; message: string }>(
      '/auth/member/reset-password',
      { token, newPassword }
    );
    return response.data;
  },

  /**
   * Logout member
   *
   * Clears tokens from localStorage and calls logout endpoint
   */
  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/member/logout');
    } finally {
      // Clear tokens from both storages
      localStorage.removeItem('memberAccessToken');
      localStorage.removeItem('memberRefreshToken');
      localStorage.removeItem('memberData');
      localStorage.removeItem('memberRememberMe');
      sessionStorage.removeItem('memberAccessToken');
      sessionStorage.removeItem('memberRefreshToken');
      sessionStorage.removeItem('memberData');
    }
  },

  isAuthenticated: (): boolean => {
    return !!(localStorage.getItem('memberAccessToken') || sessionStorage.getItem('memberAccessToken'));
  },

  getMemberData: (): Member | null => {
    const memberData = localStorage.getItem('memberData') || sessionStorage.getItem('memberData');
    return memberData ? JSON.parse(memberData) : null;
  },
};

export default authService;

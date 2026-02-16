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
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/auth/member/login', credentials);

    // Store tokens in localStorage
    if (response.data.success) {
      localStorage.setItem('memberAccessToken', response.data.data.accessToken);
      localStorage.setItem('memberRefreshToken', response.data.data.refreshToken);
      localStorage.setItem('memberData', JSON.stringify(response.data.data.member));
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
   * Logout member
   *
   * Clears tokens from localStorage and calls logout endpoint
   */
  logout: async (): Promise<void> => {
    try {
      await api.post('/auth/member/logout');
    } finally {
      // Clear tokens even if API call fails
      localStorage.removeItem('memberAccessToken');
      localStorage.removeItem('memberRefreshToken');
      localStorage.removeItem('memberData');
    }
  },

  /**
   * Check if member is authenticated
   *
   * @returns True if access token exists
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('memberAccessToken');
  },

  /**
   * Get stored member data
   *
   * @returns Member data from localStorage
   */
  getMemberData: (): Member | null => {
    const memberData = localStorage.getItem('memberData');
    return memberData ? JSON.parse(memberData) : null;
  },
};

export default authService;

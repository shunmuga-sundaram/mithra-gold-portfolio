import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import authService, { Admin, LoginCredentials } from '../../services/authService';

/**
 * AUTH SLICE - Redux state management for authentication
 *
 * This file contains:
 * 1. State shape - What data we store
 * 2. Async thunks - Async operations (API calls)
 * 3. Reducers - How state changes
 * 4. Actions - What triggers state changes
 *
 * Redux Toolkit Concepts:
 * - Slice: A piece of your Redux state (auth, goldRate, members, etc.)
 * - Thunk: Async function that dispatches actions
 * - Reducer: Pure function that updates state
 * - Action: Plain object describing what happened
 */

/**
 * AUTH STATE INTERFACE
 *
 * This defines what data the auth slice stores
 */
interface AuthState {
  /**
   * admin - Currently logged-in admin data
   * null when not logged in
   */
  admin: Admin | null;

  /**
   * accessToken - JWT token for API calls
   * Stored in Redux AND localStorage
   */
  accessToken: string | null;

  /**
   * refreshToken - JWT token to get new access tokens
   * Stored in Redux AND localStorage
   */
  refreshToken: string | null;

  /**
   * isAuthenticated - Quick check if user is logged in
   * true = logged in, false = logged out
   */
  isAuthenticated: boolean;

  /**
   * loading - Is an async operation in progress?
   * true = API call in progress (show spinner)
   * false = idle (hide spinner)
   */
  loading: boolean;

  /**
   * error - Error message from last operation
   * null = no error
   * string = error message to display
   */
  error: string | null;
}

/**
 * INITIAL STATE
 *
 * What the state looks like when app first loads
 *
 * We check localStorage to see if user was previously logged in:
 * - If tokens exist in localStorage → restore them
 * - If no tokens → user is logged out
 */
const initialState: AuthState = {
  admin: null, // Will be fetched from backend after loading tokens
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: !!localStorage.getItem('accessToken'), // !! converts to boolean
  loading: false,
  error: null,
};

/**
 * ASYNC THUNKS
 *
 * What is a thunk?
 * - A function that does async work (API calls)
 * - Dispatches actions based on success/failure
 * - Created with createAsyncThunk
 *
 * How it works:
 * 1. Component dispatches thunk: dispatch(loginAdmin({ email, password }))
 * 2. Thunk calls API: authService.login()
 * 3. Thunk dispatches pending action (loading = true)
 * 4. When API responds:
 *    - Success: dispatches fulfilled action (store data, loading = false)
 *    - Error: dispatches rejected action (store error, loading = false)
 */

/**
 * LOGIN THUNK
 *
 * Handles admin login flow:
 * 1. Call backend login API
 * 2. Store tokens in localStorage
 * 3. Store admin data in Redux
 * 4. Set isAuthenticated = true
 *
 * Usage in component:
 * dispatch(loginAdmin({ email: 'admin@mithra.com', password: 'Admin@123' }))
 *   .unwrap()
 *   .then(() => navigate('/admin'))
 *   .catch((error) => toast.error(error.message))
 */
export const loginAdmin = createAsyncThunk(
  'auth/login', // Action type prefix
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      // Call authService.login (from Step 1)
      const response = await authService.login(credentials);

      // Extract data from response
      const { admin, accessToken, refreshToken } = response.data;

      // Store tokens in localStorage (persist across page refreshes)
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      // Return data to be stored in Redux state
      return {
        admin,
        accessToken,
        refreshToken,
      };
    } catch (error: any) {
      // If login fails, return error message
      // rejectWithValue sends this to the rejected case in reducers
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

/**
 * LOGOUT THUNK
 *
 * Handles admin logout flow:
 * 1. Call backend logout API (optional, for audit logging)
 * 2. Clear tokens from localStorage
 * 3. Clear admin data from Redux
 * 4. Set isAuthenticated = false
 *
 * Usage in component:
 * dispatch(logoutAdmin())
 *   .unwrap()
 *   .then(() => navigate('/'))
 */
export const logoutAdmin = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      // Call authService.logout (clears tokens from localStorage)
      await authService.logout();

      // Return void (no data needed)
      return;
    } catch (error: any) {
      // Even if API call fails, we still log out locally
      return rejectWithValue(error.message || 'Logout failed');
    }
  }
);

/**
 * GET PROFILE THUNK
 *
 * Fetches current admin profile from backend
 * Used to restore admin data after page refresh
 *
 * Flow:
 * 1. App loads, finds token in localStorage
 * 2. Dispatch getAdminProfile() to fetch admin data
 * 3. Backend verifies token and returns admin data
 * 4. Store admin data in Redux
 *
 * Usage in component (typically in App.tsx on mount):
 * useEffect(() => {
 *   if (accessToken) {
 *     dispatch(getAdminProfile());
 *   }
 * }, []);
 */
export const getAdminProfile = createAsyncThunk(
  'auth/getProfile',
  async (_, { rejectWithValue }) => {
    try {
      // Call authService.getProfile (token auto-attached by interceptor)
      const response = await authService.getProfile();

      // Return admin data to be stored in Redux
      return response.data.admin;
    } catch (error: any) {
      // If token invalid/expired, clear everything
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      return rejectWithValue(error.message || 'Failed to fetch profile');
    }
  }
);

/**
 * REFRESH TOKEN THUNK
 *
 * Gets new access token using refresh token
 * Called automatically when access token expires
 *
 * Flow:
 * 1. Access token expires (after 30 days)
 * 2. API returns 401
 * 3. Interceptor catches 401, dispatches refreshAccessToken
 * 4. Get new access token
 * 5. Retry original request
 *
 * Usage:
 * dispatch(refreshAccessToken())
 */
export const refreshAccessToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { getState, rejectWithValue }) => {
    try {
      // Get refresh token from Redux state
      const state = getState() as { auth: AuthState };
      const { refreshToken } = state.auth;

      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      // Call authService.refreshToken
      const response = await authService.refreshToken(refreshToken);

      // Store new access token
      const newAccessToken = response.data.accessToken;
      localStorage.setItem('accessToken', newAccessToken);

      return newAccessToken;
    } catch (error: any) {
      // If refresh fails, user must login again
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      return rejectWithValue(error.message || 'Token refresh failed');
    }
  }
);

/**
 * AUTH SLICE
 *
 * createSlice automatically generates:
 * - Action creators
 * - Reducer function
 * - Action types
 *
 * Old Redux (manual):
 * - Write action types: const LOGIN_SUCCESS = 'LOGIN_SUCCESS'
 * - Write action creators: function loginSuccess(data) { return { type: LOGIN_SUCCESS, payload: data } }
 * - Write reducer: switch(action.type) { case LOGIN_SUCCESS: return { ...state, admin: action.payload } }
 *
 * Redux Toolkit (automatic):
 * - Just write reducers, everything else is generated!
 */
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * CLEAR ERROR
     *
     * Manually clear error message
     * Usage: dispatch(clearError())
     */
    clearError: (state) => {
      state.error = null;
    },

    /**
     * CLEAR AUTH
     *
     * Force clear all auth data (used when token is invalid)
     * Usage: dispatch(clearAuth())
     */
    clearAuth: (state) => {
      state.admin = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.error = null;
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
  },
  extraReducers: (builder) => {
    /**
     * EXTRA REDUCERS
     *
     * Handle async thunk actions (pending, fulfilled, rejected)
     *
     * Why "extra"?
     * - Regular reducers handle sync actions
     * - Extra reducers handle async thunk actions
     *
     * Three states for each thunk:
     * 1. pending - API call in progress
     * 2. fulfilled - API call succeeded
     * 3. rejected - API call failed
     */

    /**
     * LOGIN THUNK HANDLERS
     */
    builder
      .addCase(loginAdmin.pending, (state) => {
        // When login starts
        state.loading = true;
        state.error = null;
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        // When login succeeds
        state.loading = false;
        state.admin = action.payload.admin;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        // When login fails
        state.loading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })

    /**
     * LOGOUT THUNK HANDLERS
     */
      .addCase(logoutAdmin.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutAdmin.fulfilled, (state) => {
        // Clear all auth data
        state.loading = false;
        state.admin = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutAdmin.rejected, (state) => {
        // Even if logout API fails, still clear locally
        state.loading = false;
        state.admin = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      })

    /**
     * GET PROFILE THUNK HANDLERS
     */
      .addCase(getAdminProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAdminProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.admin = action.payload;
        state.error = null;
      })
      .addCase(getAdminProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        // Clear auth data if profile fetch fails (invalid token)
        state.admin = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      })

    /**
     * REFRESH TOKEN THUNK HANDLERS
     */
      .addCase(refreshAccessToken.pending, (state) => {
        state.loading = true;
      })
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.loading = false;
        state.accessToken = action.payload;
        state.error = null;
      })
      .addCase(refreshAccessToken.rejected, (state) => {
        // Refresh failed - user must login again
        state.loading = false;
        state.admin = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.isAuthenticated = false;
      });
  },
});

/**
 * EXPORT ACTIONS
 *
 * These are used in components to update state
 * Example: dispatch(clearError())
 */
export const { clearError, clearAuth } = authSlice.actions;

/**
 * EXPORT REDUCER
 *
 * This is registered in the Redux store
 */
export default authSlice.reducer;

/**
 * SELECTORS
 *
 * Helper functions to read specific parts of state
 * Instead of: useSelector(state => state.auth.admin)
 * Use: useSelector(selectAdmin)
 *
 * Benefits:
 * - Reusable
 * - Type-safe
 * - Easy to refactor
 */
export const selectAdmin = (state: { auth: AuthState }) => state.auth.admin;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.loading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectAccessToken = (state: { auth: AuthState }) => state.auth.accessToken;

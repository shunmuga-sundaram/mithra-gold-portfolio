import { useEffect } from "react";
import { RouterProvider } from "react-router";
import { Toaster } from "sonner";
import { router } from "./routes";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { getAdminProfile, selectAccessToken } from "../store/slices/authSlice";

/**
 * APP COMPONENT
 *
 * Root component of the application
 *
 * Responsibilities:
 * 1. Provide routing (React Router)
 * 2. Display toast notifications (Sonner)
 * 3. Restore user session on app load
 *
 * Session Restoration:
 * - When app loads, check if access token exists in Redux
 * - If yes, fetch admin profile from backend
 * - This restores the session after page refresh
 * - If token is invalid, backend returns 401 and user is logged out
 */
export default function App() {
  const dispatch = useAppDispatch();
  const accessToken = useAppSelector(selectAccessToken);

  /**
   * RESTORE SESSION ON APP LOAD
   *
   * Why do we need this?
   * - When user refreshes page, Redux state is reset
   * - But localStorage still has the token (from login)
   * - Redux initializes with token from localStorage (see authSlice initialState)
   * - But admin data is lost (admin = null)
   * - So we fetch admin profile using the token
   *
   * Flow:
   * 1. App loads
   * 2. Redux initializes:
   *    - accessToken from localStorage ✓
   *    - admin = null (lost on refresh) ✗
   * 3. useEffect runs
   * 4. If accessToken exists, dispatch getAdminProfile()
   * 5. Backend verifies token and returns admin data
   * 6. Redux stores admin data
   * 7. Session restored! User stays logged in
   *
   * What if token is invalid/expired?
   * - Backend returns 401
   * - Interceptor catches it, clears tokens, redirects to login
   * - User must login again
   */
  useEffect(() => {
    /**
     * Only fetch profile if:
     * 1. Access token exists (user was logged in before refresh)
     * 2. We haven't fetched it yet (avoid redundant API calls)
     */
    if (accessToken) {
      // Fetch admin profile to restore session
      dispatch(getAdminProfile());
    }

    /**
     * Why no else clause to clear state?
     * - If no token, user is already logged out
     * - Redux state is already clear (initial state)
     * - No need to do anything
     */
  }, [dispatch]); // Run once on mount
  // Note: We don't include accessToken in deps because we only want this to run on mount

  return (
    <>
      {/* Router Provider - handles all page navigation */}
      <RouterProvider router={router} />

      {/* Toaster - displays toast notifications */}
      <Toaster richColors position="top-center" />
    </>
  );
}

/**
 * COMPLETE APP LIFECYCLE:
 *
 * FIRST VISIT (No Login):
 * 1. User visits app
 * 2. Redux initializes with no token
 * 3. accessToken = null
 * 4. useEffect runs, does nothing (no token)
 * 5. User sees login page
 *
 * AFTER LOGIN:
 * 1. User logs in successfully
 * 2. Redux stores token + admin data
 * 3. User navigates around app
 * 4. All working fine
 *
 * PAGE REFRESH (After Login):
 * 1. User refreshes page (F5)
 * 2. Redux state reset (all data lost)
 * 3. Redux initializes:
 *    - accessToken from localStorage: "eyJ..." ✓
 *    - admin: null (lost) ✗
 *    - isAuthenticated: true (because token exists)
 * 4. useEffect runs
 * 5. Detects accessToken exists
 * 6. dispatch(getAdminProfile())
 * 7. GET /auth/admin/me (token auto-attached by interceptor)
 * 8. Backend verifies token, returns admin data
 * 9. Redux stores admin data
 * 10. Session restored! User still logged in
 *
 * PAGE REFRESH (Token Expired):
 * 1. User refreshes page after 30 days (token expired)
 * 2. Redux initializes with expired token
 * 3. useEffect runs
 * 4. dispatch(getAdminProfile())
 * 5. GET /auth/admin/me
 * 6. Backend returns 401 (token expired)
 * 7. Response interceptor catches 401
 * 8. Clears tokens from localStorage
 * 9. Redirects to login page
 * 10. User must login again
 */

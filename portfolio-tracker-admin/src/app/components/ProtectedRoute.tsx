import { Navigate } from "react-router";
import { useAppSelector } from "../../store/hooks";
import { selectIsAuthenticated, selectAuthLoading, selectAdmin } from "../../store/slices/authSlice";

/**
 * PROTECTED ROUTE COMPONENT
 *
 * This component protects routes that require authentication.
 * It wraps admin pages and checks if user is logged in before rendering.
 *
 * Flow:
 * 1. Check if user is authenticated
 * 2. If yes → Render the protected page
 * 3. If no → Redirect to login page
 *
 * Usage in routes.tsx:
 * {
 *   path: "/admin",
 *   element: <ProtectedRoute><AdminDashboard /></ProtectedRoute>
 * }
 *
 * Why do we need this?
 * - Without protection, anyone can access /admin by typing URL
 * - With protection, must login first
 * - Security: Prevents unauthorized access
 */

interface ProtectedRouteProps {
  /**
   * children - The component to render if authenticated
   * Example: <AdminDashboard />, <GoldRate />, etc.
   */
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  /**
   * REDUX STATE
   */
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const loading = useAppSelector(selectAuthLoading);
  const admin = useAppSelector(selectAdmin);

  /**
   * LOADING STATE
   *
   * Why check loading?
   * - When app loads, it fetches admin profile (App.tsx useEffect)
   * - During fetch, we don't know if user is logged in yet
   * - Don't redirect to login while loading
   * - Show loading spinner instead
   *
   * Flow on page refresh:
   * 1. App loads → dispatch(getAdminProfile())
   * 2. loading = true
   * 3. Show loading spinner
   * 4. Backend responds
   * 5. loading = false
   * 6. Either render page (if auth) or redirect (if not auth)
   */
  if (loading && !admin) {
    // Still fetching profile, show loading state
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          {/* Loading Spinner */}
          <svg
            className="animate-spin h-12 w-12 text-yellow-500 mx-auto mb-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  /**
   * AUTHENTICATION CHECK
   *
   * If user is not authenticated:
   * - Redirect to login page
   * - Replace in history (can't go back to protected page)
   *
   * Navigate component (React Router v7):
   * - to="/" → Where to redirect
   * - replace → Replace current history entry (can't use back button)
   *
   * Why replace instead of push?
   * - User clicks /admin URL directly
   * - Not logged in → redirect to login
   * - Without replace: /admin stays in history
   * - After login, back button goes to /admin → infinite loop
   * - With replace: /admin not in history, back button works normally
   */
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  /**
   * AUTHENTICATED - RENDER PROTECTED CONTENT
   *
   * User is logged in and has valid token
   * Render the protected page component
   */
  return <>{children}</>;
}

/**
 * COMPLETE FLOW EXAMPLES:
 *
 * SCENARIO 1: User Not Logged In, Tries to Access /admin
 * ──────────────────────────────────────────────────────
 * 1. User types /admin in browser
 * 2. ProtectedRoute component renders
 * 3. isAuthenticated = false (no token)
 * 4. loading = false (no API call in progress)
 * 5. <Navigate to="/" replace />
 * 6. User redirected to login page
 *
 * SCENARIO 2: User Logged In, Accessing /admin
 * ──────────────────────────────────────────────
 * 1. User already logged in (has token)
 * 2. User clicks link to /admin
 * 3. ProtectedRoute component renders
 * 4. isAuthenticated = true
 * 5. admin = { id, name, email, ... }
 * 6. loading = false
 * 7. Render children (AdminDashboard component)
 * 8. User sees dashboard
 *
 * SCENARIO 3: Page Refresh While on /admin
 * ──────────────────────────────────────────
 * 1. User on /admin dashboard
 * 2. User presses F5 (refresh)
 * 3. Redux state reset
 * 4. App.tsx useEffect runs → dispatch(getAdminProfile())
 * 5. loading = true
 * 6. ProtectedRoute shows loading spinner
 * 7. Backend returns admin data
 * 8. loading = false
 * 9. isAuthenticated = true
 * 10. admin = { ... }
 * 11. Render children (AdminDashboard)
 * 12. User still sees dashboard (session restored!)
 *
 * SCENARIO 4: Token Expired, Page Refresh
 * ────────────────────────────────────────
 * 1. User on /admin, token expired (30+ days old)
 * 2. User presses F5
 * 3. App.tsx useEffect runs → dispatch(getAdminProfile())
 * 4. loading = true
 * 5. Backend returns 401 (invalid token)
 * 6. Interceptor catches 401:
 *    - Clears localStorage
 *    - Redirects to /
 * 7. Redux state cleared
 * 8. isAuthenticated = false
 * 9. ProtectedRoute redirects to login
 * 10. User must login again
 *
 * SCENARIO 5: User Logs Out
 * ──────────────────────────
 * 1. User on /admin dashboard
 * 2. User clicks logout button
 * 3. dispatch(logoutAdmin())
 * 4. Redux clears state:
 *    - isAuthenticated = false
 *    - admin = null
 * 5. Component re-renders
 * 6. ProtectedRoute detects !isAuthenticated
 * 7. <Navigate to="/" replace />
 * 8. User redirected to login
 */

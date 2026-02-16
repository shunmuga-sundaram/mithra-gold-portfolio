import { createBrowserRouter } from "react-router";
import { Login } from "./pages/Login";
import { AdminDashboard } from "./pages/admin/Dashboard";
import { AdminGoldRate } from "./pages/admin/GoldRate";
import { AdminMembers } from "./pages/admin/Members";
import { AdminTrades } from "./pages/admin/Trades";
import { ProtectedRoute } from "./components/ProtectedRoute";

/**
 * ROUTER CONFIGURATION
 *
 * Defines all routes in the application
 *
 * Route Structure:
 * / (public)          → Login page
 * /admin (protected)  → Admin dashboard
 * /admin/gold-rate    → Gold rate management (protected)
 * /admin/members      → Member management (protected)
 * /admin/trades       → Trade management (protected)
 *
 * Protected Routes:
 * - Wrapped with <ProtectedRoute>
 * - Requires authentication to access
 * - Redirects to login if not authenticated
 *
 * Public Routes:
 * - No wrapper needed
 * - Anyone can access
 */
export const router = createBrowserRouter([
  /**
   * PUBLIC ROUTE - Login Page
   *
   * Path: /
   * No authentication required
   * If already logged in, Login component redirects to /admin
   */
  {
    path: "/",
    Component: Login,
  },

  /**
   * PROTECTED ROUTES - Admin Pages
   *
   * All routes under /admin require authentication
   * Each route wrapped with ProtectedRoute component
   *
   * How it works:
   * 1. User navigates to /admin/gold-rate
   * 2. Router matches route
   * 3. Renders: <ProtectedRoute><AdminGoldRate /></ProtectedRoute>
   * 4. ProtectedRoute checks if user is authenticated
   * 5. If yes: render AdminGoldRate
   * 6. If no: redirect to login
   */
  {
    path: "/admin",
    children: [
      /**
       * Admin Dashboard
       * Path: /admin
       */
      {
        index: true,
        element: (
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },

      /**
       * Gold Rate Management
       * Path: /admin/gold-rate
       */
      {
        path: "gold-rate",
        element: (
          <ProtectedRoute>
            <AdminGoldRate />
          </ProtectedRoute>
        ),
      },

      /**
       * Member Management
       * Path: /admin/members
       */
      {
        path: "members",
        element: (
          <ProtectedRoute>
            <AdminMembers />
          </ProtectedRoute>
        ),
      },

      /**
       * Trade Management (Buy/Sell)
       * Path: /admin/trades
       */
      {
        path: "trades",
        element: (
          <ProtectedRoute>
            <AdminTrades />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);

/**
 * ROUTE PROTECTION FLOW:
 *
 * SCENARIO 1: Unauthorized Access Attempt
 * ────────────────────────────────────────
 * 1. User not logged in
 * 2. User types /admin/gold-rate in browser
 * 3. Router matches /admin/gold-rate route
 * 4. Renders <ProtectedRoute><AdminGoldRate /></ProtectedRoute>
 * 5. ProtectedRoute checks: isAuthenticated = false
 * 6. ProtectedRoute renders: <Navigate to="/" replace />
 * 7. User redirected to login page
 *
 * SCENARIO 2: Authorized Access
 * ──────────────────────────────
 * 1. User logged in (isAuthenticated = true)
 * 2. User clicks link to /admin/members
 * 3. Router matches /admin/members route
 * 4. Renders <ProtectedRoute><AdminMembers /></ProtectedRoute>
 * 5. ProtectedRoute checks: isAuthenticated = true
 * 6. ProtectedRoute renders: <AdminMembers />
 * 7. User sees members page
 *
 * SCENARIO 3: Direct URL Access After Login
 * ──────────────────────────────────────────
 * 1. User logged in
 * 2. User bookmarked /admin/trades
 * 3. User visits bookmark
 * 4. Router matches /admin/trades
 * 5. ProtectedRoute checks authentication
 * 6. Token exists in localStorage
 * 7. App.tsx fetched admin profile (session restored)
 * 8. isAuthenticated = true
 * 9. Renders AdminTrades component
 * 10. User sees trades page
 *
 * SCENARIO 4: Session Expired
 * ────────────────────────────
 * 1. User logged in 31 days ago (token expired)
 * 2. User visits /admin
 * 3. ProtectedRoute shows loading spinner
 * 4. App.tsx tries to fetch profile
 * 5. Backend returns 401 (token expired)
 * 6. Interceptor clears tokens, redirects to /
 * 7. User sees login page
 * 8. Must login again
 */

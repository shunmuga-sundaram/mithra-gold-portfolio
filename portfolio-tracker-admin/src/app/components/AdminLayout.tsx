import { Link, useLocation, useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { LayoutDashboard, Receipt, TrendingUp, Users, LogOut, User } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { logoutAdmin, selectAdmin, selectAuthLoading } from "../../store/slices/authSlice";
import { toast } from "sonner";

/**
 * ADMIN LAYOUT COMPONENT
 *
 * Layout wrapper for all admin pages
 * Provides:
 * - Header with app title, admin name, logout button
 * - Sidebar navigation
 * - Main content area
 *
 * Features:
 * - Display logged-in admin name
 * - Functional logout button (clears session)
 * - Active route highlighting
 */

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  /**
   * HOOKS
   */
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  /**
   * REDUX STATE
   */
  const admin = useAppSelector(selectAdmin);
  const loading = useAppSelector(selectAuthLoading);

  /**
   * NAVIGATION ITEMS
   *
   * Sidebar menu items with paths, labels, and icons
   */
  const navItems = [
    { path: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { path: "/admin/gold-rate", label: "Gold Rate", icon: TrendingUp },
    { path: "/admin/members", label: "Members", icon: Users },
    { path: "/admin/trades", label: "Trades", icon: Receipt },
  ];

  /**
   * HANDLE LOGOUT
   *
   * What happens when user clicks logout:
   * 1. Dispatch logoutAdmin Redux action
   * 2. Backend logout API called (optional, for audit logging)
   * 3. Tokens cleared from localStorage
   * 4. Redux state cleared
   * 5. Navigate to login page
   *
   * Flow:
   * Click Logout
   *   ↓
   * dispatch(logoutAdmin())
   *   ↓
   * authService.logout() - calls backend, clears localStorage
   *   ↓
   * Redux reducer clears state:
   *   - admin = null
   *   - accessToken = null
   *   - isAuthenticated = false
   *   ↓
   * navigate("/") - redirect to login
   *   ↓
   * Success toast shown
   */
  const handleLogout = async () => {
    try {
      /**
       * DISPATCH LOGOUT ACTION
       *
       * This will:
       * 1. Call backend POST /auth/admin/logout
       * 2. Clear tokens from localStorage
       * 3. Clear Redux state
       */
      await dispatch(logoutAdmin()).unwrap();

      /**
       * NAVIGATE TO LOGIN
       *
       * User is now logged out, redirect to login page
       * ProtectedRoute will also redirect automatically when it detects !isAuthenticated
       * But we do it here for immediate feedback
       */
      navigate("/");

      /**
       * SUCCESS TOAST
       *
       * Show confirmation that logout was successful
       */
      toast.success("Logged out successfully", {
        duration: 2000,
        position: "top-center",
      });
    } catch (error: any) {
      /**
       * ERROR HANDLING
       *
       * Even if backend call fails, we still:
       * - Cleared localStorage
       * - Cleared Redux state
       * - User is logged out locally
       *
       * So we still navigate to login and show success
       * (The authService.logout already handles local cleanup in catch block)
       */
      console.error("Logout error:", error);

      // Still navigate to login (user is logged out locally)
      navigate("/");

      toast.success("Logged out successfully", {
        duration: 2000,
        position: "top-center",
      });
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* HEADER */}
      <header className="bg-gradient-to-r from-yellow-400 to-yellow-500 border-b-4 border-yellow-600 shadow-lg">
        <div className="px-8 py-4 flex justify-between items-center">
          {/* App Title */}
          <h2 className="text-2xl font-bold text-white">
            Mithra Gold Portfolio Tracker - Admin Portal
          </h2>

          {/* Right Section: Admin Info + Logout */}
          <div className="flex items-center gap-4">
            {/* Admin Name/Email Display */}
            {admin && (
              <div className="flex items-center gap-2 text-white bg-white/20 px-4 py-2 rounded-lg">
                <User className="w-4 h-4" />
                <div className="text-sm">
                  <div className="font-semibold">{admin.name}</div>
                  <div className="text-xs opacity-90">{admin.email}</div>
                </div>
              </div>
            )}

            {/* Logout Button */}
            <Button
              variant="outline"
              onClick={handleLogout}
              disabled={loading}
              className="bg-white hover:bg-gray-100 border-2 text-gray-700 font-semibold"
            >
              {loading ? (
                /**
                 * LOADING STATE
                 *
                 * Show spinner while logout in progress
                 * Prevents multiple clicks
                 */
                <>
                  <svg
                    className="animate-spin h-4 w-4 mr-2"
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
                  Logging out...
                </>
              ) : (
                /**
                 * DEFAULT STATE
                 *
                 * Show logout icon and text
                 */
                <>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* LEFT SIDEBAR */}
        <aside className="w-64 bg-white border-r-2 border-gray-200 shadow-lg flex flex-col">
          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-lg font-semibold transition-colors ${
                    isActive
                      ? "bg-yellow-500 text-white"
                      : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Footer - Show Admin Role */}
          {admin && (
            <div className="p-4 border-t-2 border-gray-200 bg-gray-50">
              <div className="text-sm text-gray-600">
                <div className="font-semibold text-yellow-600 uppercase text-xs mb-1">
                  Role
                </div>
                <div className="font-medium">
                  {admin.role === "super_admin"
                    ? "Super Admin"
                    : admin.role === "admin"
                    ? "Admin"
                    : "Moderator"}
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 px-8 py-8 overflow-auto">{children}</main>
      </div>
    </div>
  );
}

/**
 * LOGOUT FLOW EXPLANATION:
 *
 * USER CLICKS LOGOUT BUTTON
 * ──────────────────────────
 * 1. handleLogout() called
 * 2. dispatch(logoutAdmin())
 * 3. Redux sets loading = true
 * 4. Button shows "Logging out..." with spinner
 *
 * REDUX THUNK (logoutAdmin)
 * ─────────────────────────
 * 5. authService.logout() called
 * 6. POST /auth/admin/logout (backend)
 * 7. localStorage.removeItem('accessToken')
 * 8. localStorage.removeItem('refreshToken')
 * 9. Returns success
 *
 * REDUX REDUCER
 * ─────────────
 * 10. Reducer handles "logoutAdmin/fulfilled"
 * 11. State cleared:
 *     - admin = null
 *     - accessToken = null
 *     - refreshToken = null
 *     - isAuthenticated = false
 *     - loading = false
 *
 * COMPONENT
 * ─────────
 * 12. navigate("/") - redirect to login
 * 13. toast.success("Logged out successfully")
 * 14. ProtectedRoute detects !isAuthenticated
 * 15. All admin pages now redirect to login
 *
 * RESULT
 * ──────
 * 16. User on login page
 * 17. No tokens in localStorage
 * 18. No admin data in Redux
 * 19. Cannot access /admin pages
 * 20. Must login again
 */

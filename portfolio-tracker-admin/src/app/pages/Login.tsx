import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { loginAdmin, selectIsAuthenticated, selectAuthLoading, selectAuthError, clearError } from "../../store/slices/authSlice";

/**
 * LOGIN PAGE - Admin Authentication
 *
 * This component handles admin login with real backend authentication.
 *
 * Flow:
 * 1. User enters email and password
 * 2. Clicks "Sign In" → handleLogin called
 * 3. Dispatches loginAdmin Redux thunk
 * 4. Shows loading spinner while API call in progress
 * 5. On success: Redirect to /admin dashboard
 * 6. On error: Show error toast message
 *
 * Redux Integration:
 * - dispatch(loginAdmin()) - Calls backend API
 * - useAppSelector(selectIsAuthenticated) - Check if logged in
 * - useAppSelector(selectAuthLoading) - Show/hide loading spinner
 * - useAppSelector(selectAuthError) - Display error messages
 */
export function Login() {
  /**
   * HOOKS
   */
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  /**
   * LOCAL STATE (Form Inputs)
   *
   * Why local state and not Redux?
   * - Form inputs are temporary, don't need global state
   * - Only store in Redux after successful login
   * - Simpler and more performant
   */
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  /**
   * REDUX STATE (Global State)
   *
   * Read from Redux store using useAppSelector
   */
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const loading = useAppSelector(selectAuthLoading);
  const error = useAppSelector(selectAuthError);

  /**
   * REDIRECT IF ALREADY AUTHENTICATED
   *
   * If user is already logged in (token in localStorage from previous session),
   * redirect to dashboard immediately
   *
   * useEffect runs after component renders
   */
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/admin");
    }
  }, [isAuthenticated, navigate]);

  /**
   * DISPLAY ERROR TOAST
   *
   * When error exists in Redux state, show toast notification
   * Then clear the error so it doesn't show again
   *
   * Why useEffect?
   * - Separate concern of displaying errors from form submission
   * - Errors could come from other sources (token refresh, etc.)
   */
  useEffect(() => {
    if (error) {
      // Show error toast
      toast.error(error, {
        duration: 4000, // Show for 4 seconds
        position: "top-center",
      });

      // Clear error from Redux after showing
      dispatch(clearError());
    }
  }, [error, dispatch]);

  /**
   * HANDLE LOGIN FORM SUBMISSION
   *
   * What happens when user clicks "Sign In":
   * 1. Prevent default form submission (page refresh)
   * 2. Dispatch loginAdmin Redux thunk with email/password
   * 3. Thunk calls backend API (authService.login)
   * 4. On success: Redux updates state, navigate to dashboard
   * 5. On error: Redux stores error, useEffect shows toast
   *
   * unwrap():
   * - Converts Redux thunk promise to regular promise
   * - Allows us to use .then() and .catch()
   * - Throws error if thunk rejected
   */
  const handleLogin = async (e: React.FormEvent) => {
    // Prevent default form submission (which would refresh page)
    e.preventDefault();

    try {
      /**
       * DISPATCH LOGIN ACTION
       *
       * dispatch(loginAdmin({ email, password })) does:
       * 1. Sets loading = true (we show spinner)
       * 2. Calls authService.login()
       * 3. On success:
       *    - Stores admin data in Redux
       *    - Stores tokens in localStorage + Redux
       *    - Sets isAuthenticated = true
       *    - Sets loading = false
       * 4. On error:
       *    - Stores error message in Redux
       *    - Sets loading = false
       *
       * .unwrap() converts to regular promise so we can await
       */
      await dispatch(loginAdmin({ email, password })).unwrap();

      /**
       * SUCCESS! Login completed successfully
       *
       * What happens now:
       * - Redux state updated with admin data
       * - isAuthenticated = true
       * - useEffect (above) will trigger navigation to /admin
       *
       * We could also show success toast:
       */
      toast.success("Login successful! Redirecting...", {
        duration: 2000,
        position: "top-center",
      });

      /**
       * Navigation happens in useEffect (line 55)
       * Why not navigate here?
       * - Cleaner separation of concerns
       * - Handles all auth state changes in one place
       * - Works for both login and session restore
       */
    } catch (err: any) {
      /**
       * ERROR HANDLING
       *
       * If login fails:
       * - Redux already stored error message
       * - useEffect (above) will show error toast
       * - loading is already set to false by Redux
       *
       * We don't need to do anything here!
       * The catch block is just to prevent unhandled promise rejection
       *
       * Error format from backend:
       * - "Invalid email or password"
       * - "Account is disabled"
       * - "Network error"
       */
      console.error("Login error:", err);
    }
  };

  /**
   * RENDER
   */
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-2 border-yellow-200">
        {/* HEADER */}
        <CardHeader className="text-center bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-t-lg py-8">
          <CardTitle className="text-4xl text-white font-bold">
            Mithra Gold Portfolio Tracker
          </CardTitle>
          <CardDescription className="text-white text-lg mt-2">
            Admin Portal - Sign in to your account
          </CardDescription>
        </CardHeader>

        {/* FORM */}
        <CardContent className="mt-6">
          <form onSubmit={handleLogin} className="space-y-5">
            {/* EMAIL INPUT */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-semibold">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@mithra.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 border-2 border-yellow-300 focus:border-yellow-400"
                required
                disabled={loading} // Disable input while loading
              />
            </div>

            {/* PASSWORD INPUT */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-base font-semibold">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 border-2 border-yellow-300 focus:border-yellow-400"
                required
                disabled={loading} // Disable input while loading
              />
            </div>

            {/* SUBMIT BUTTON */}
            <Button
              type="submit"
              className="w-full h-14 text-xl bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 font-bold shadow-lg text-white"
              disabled={loading} // Disable button while loading
            >
              {loading ? (
                /**
                 * LOADING STATE
                 *
                 * Show spinner and "Signing in..." text while API call in progress
                 * This gives user feedback that something is happening
                 */
                <span className="flex items-center justify-center gap-2">
                  {/* Spinner SVG */}
                  <svg
                    className="animate-spin h-5 w-5 text-white"
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
                  Signing in...
                </span>
              ) : (
                /**
                 * DEFAULT STATE
                 *
                 * Show normal button text when not loading
                 */
                "Sign In as Admin"
              )}
            </Button>
          </form>

        </CardContent>
      </Card>
    </div>
  );
}

/**
 * COMPLETE FLOW EXPLANATION:
 *
 * 1. User opens login page
 *    → Component renders
 *    → useEffect checks if already authenticated
 *    → If yes: redirect to /admin
 *    → If no: show login form
 *
 * 2. User enters email and password
 *    → Local state updates (email, password)
 *
 * 3. User clicks "Sign In"
 *    → handleLogin called
 *    → dispatch(loginAdmin({ email, password }))
 *    → Redux sets loading = true
 *    → Button shows spinner: "Signing in..."
 *
 * 4. Backend API call in progress
 *    → authService.login() called
 *    → POST http://localhost:3000/auth/admin/login
 *
 * 5a. SUCCESS PATH:
 *     → Backend returns { admin, accessToken, refreshToken }
 *     → Redux thunk stores tokens in localStorage
 *     → Redux updates state:
 *       - admin = {...}
 *       - accessToken = "eyJ..."
 *       - isAuthenticated = true
 *       - loading = false
 *     → Success toast shown
 *     → useEffect detects isAuthenticated = true
 *     → navigate("/admin") → Redirect to dashboard
 *
 * 5b. ERROR PATH:
 *     → Backend returns error (401, 400, etc.)
 *     → Redux updates state:
 *       - error = "Invalid email or password"
 *       - loading = false
 *     → useEffect detects error
 *     → Error toast shown: "Invalid email or password"
 *     → dispatch(clearError()) clears error
 *     → User can try again
 *
 * 6. After successful login:
 *    → User is on /admin dashboard
 *    → Can access all protected pages
 *    → Token sent with every API request (interceptor)
 *
 * 7. Page refresh:
 *    → Redux initializes with token from localStorage
 *    → isAuthenticated = true
 *    → User stays logged in
 */

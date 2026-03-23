import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import authService from "../../services/authService";

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('expired') === '1') {
      setError('Your session has expired. Please log in again.');
      window.history.replaceState({}, '', '/');
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await authService.login({ email, password }, rememberMe);

      if (response.success) {
        // Navigate to member dashboard on successful login
        navigate("/member");
      }
    } catch (err: any) {
      console.error('Login error:', err);
      // Extract error message from response
      const errorMessage = err.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-2 border-orange-200">
        <CardHeader className="text-center bg-gradient-to-r from-orange-500 to-orange-600 rounded-t-lg py-8">
          <CardTitle className="text-4xl text-white font-bold">Mithra Gold Portfolio</CardTitle>
          <CardDescription className="text-white text-lg mt-2">Member Portal - Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent className="mt-6">
          <form onSubmit={handleLogin} className="space-y-5">
            {error && (
              <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-base font-semibold">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="member@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 border-2 border-orange-300 focus:border-orange-400"
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-base font-semibold">Password</Label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 border-2 border-orange-300 focus:border-orange-400 pr-12"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* REMEMBER ME */}
            <div className="flex items-center gap-2">
              <input
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 accent-orange-500 cursor-pointer"
              />
              <label htmlFor="rememberMe" className="text-sm text-gray-600 cursor-pointer select-none">
                Remember me
              </label>
            </div>

            <Button
              type="submit"
              className="w-full h-14 text-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 font-bold shadow-lg text-white"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                  Signing In...
                </>
              ) : (
                'Sign In as Member'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Terms & Privacy links */}
      <p className="text-center text-xs text-gray-400 mt-4">
        By signing in, you agree to our{" "}
        <Link to="/terms" className="text-orange-500 hover:underline font-medium">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link to="/privacy" className="text-orange-500 hover:underline font-medium">
          Privacy Policy
        </Link>
      </p>
    </div>
  );
}

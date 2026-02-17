import { useState } from "react";
import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Loader2, AlertCircle, CheckCircle2, ArrowLeft } from "lucide-react";
import authService from "../../services/authService";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      await authService.forgotPassword(email);
      setSuccess(true);
      setEmail(""); // Clear the email field
    } catch (err: any) {
      console.error('Forgot password error:', err);
      const errorMessage = err.response?.data?.message || 'Failed to send reset link. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-2 border-orange-200">
        <CardHeader className="text-center bg-gradient-to-r from-orange-500 to-orange-600 rounded-t-lg py-8">
          <CardTitle className="text-4xl text-white font-bold">Forgot Password</CardTitle>
          <CardDescription className="text-white text-lg mt-2">
            Enter your email to receive a password reset link
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-6">
          {success ? (
            <div className="space-y-6">
              <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-green-800 font-semibold">Reset link sent!</p>
                  <p className="text-sm text-green-700 mt-1">
                    If an account with that email exists, you will receive a password reset link shortly.
                    The link will expire in 15 minutes.
                  </p>
                </div>
              </div>
              <Link to="/">
                <Button
                  variant="outline"
                  className="w-full h-12 border-2 border-orange-300 hover:bg-orange-50"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 bg-red-50 border-2 border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-base font-semibold">Email Address</Label>
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

              <Button
                type="submit"
                className="w-full h-14 text-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 font-bold shadow-lg text-white"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                    Sending Reset Link...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </Button>

              <Link to="/">
                <Button
                  variant="outline"
                  className="w-full h-12 border-2 border-orange-300 hover:bg-orange-50"
                  type="button"
                  disabled={loading}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Button>
              </Link>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

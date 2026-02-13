import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

export function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/member");
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-2 border-orange-200">
        <CardHeader className="text-center bg-gradient-to-r from-orange-500 to-orange-600 rounded-t-lg py-8">
          <CardTitle className="text-4xl text-white font-bold">Mithra Gold Portfolio</CardTitle>
          <CardDescription className="text-white text-lg mt-2">Member Portal - Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent className="mt-6">
          <form onSubmit={handleLogin} className="space-y-5">
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
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-base font-semibold">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 border-2 border-orange-300 focus:border-orange-400"
                required
              />
            </div>
            <Button type="submit" className="w-full h-14 text-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 font-bold shadow-lg text-white">
              Sign In as Member
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isLogin) {
        // Login logic - query backend API
        if (!email || !password) {
          setError("Email and password are required");
          setIsLoading(false);
          return;
        }

        const loginResponse = await fetch("/api/admin/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!loginResponse.ok) {
          const data = await loginResponse.json();
          setError(data.error || "Login failed");
          setIsLoading(false);
          return;
        }

        const data = await loginResponse.json();
        const user = data.user;

        // Store UUID and user info in localStorage
        localStorage.setItem("userId", user.id); // Store UUID!
        localStorage.setItem("userEmail", user.email);
        localStorage.setItem("displayName", user.displayName || "");
        localStorage.setItem("userRole", "admin");
        localStorage.setItem("isAuthenticated", "true");

        console.log("✅ Login successful. Stored UUID:", user.id);

        // Redirect to admin dashboard
        setTimeout(() => {
          router.push("/dashboard/admin");
        }, 500);
      } else {
        // Register logic - call backend API
        if (!email || !displayName) {
          setError("Email and display name are required");
          setIsLoading(false);
          return;
        }

        const registerResponse = await fetch("/api/admin/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, displayName }),
        });

        if (!registerResponse.ok) {
          const data = await registerResponse.json();
          setError(data.error || "Registration failed");
          setIsLoading(false);
          return;
        }

        const data = await registerResponse.json();
        const user = data.user;

        // Store UUID and user info in localStorage
        localStorage.setItem("userId", user.id); // Store UUID!
        localStorage.setItem("userEmail", user.email);
        localStorage.setItem("displayName", user.displayName || "");
        localStorage.setItem("userRole", "admin");
        localStorage.setItem("isAuthenticated", "true");

        console.log("✅ Registration successful. Stored UUID:", user.id);

        // Redirect to admin dashboard
        setTimeout(() => {
          router.push("/dashboard/admin");
        }, 500);
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed");
      setIsLoading(false);
    }
  };

  // Generate stable pseudo-random values for background animations (prevents hydration mismatch)
  const getStableRandom = (seed: number, min: number, max: number) => {
    const x = Math.sin(seed) * 10000;
    return min + (x - Math.floor(x)) * (max - min);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#03045E] via-[#0077B6] to-[#0096C7] flex items-center justify-center p-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => {
          const width = Math.round(getStableRandom(i * 1, 50, 150));
          const height = Math.round(getStableRandom(i * 2, 50, 150));
          const left = getStableRandom(i * 3, 0, 100).toFixed(2);
          const top = getStableRandom(i * 4, 0, 100).toFixed(2);
          const duration = getStableRandom(i * 5, 2, 5);
          const delay = getStableRandom(i * 6, 0, 2);

          return (
            <motion.div
              key={i}
              className="absolute bg-white/5 rounded-full"
              style={{
                width: `${width}px`,
                height: `${height}px`,
                left: `${left}%`,
                top: `${top}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration,
                repeat: Infinity,
                delay,
              }}
            />
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-2xl relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br bg-white flex items-center justify-center">
              <Image
                src="/favicon.svg"
                alt="Mythra Logo"
                width={100}
                height={100}
                className="h-10 w-10 rounded-lg bg-white"
              />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Mythra
            </h1>
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="h-6 w-6 text-[#48CAE4]" />
            <h2 className="text-xl font-bold text-white">Admin Portal</h2>
          </div>
          <p className="text-[#90E0EF]">Secure admin access</p>
        </div>

        {/* Admin Login Card */}
        <Card className="bg-white/20 backdrop-blur-lg border-white/30 text-white">
          <CardHeader className="text-center pb-4">
            <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-[#48CAE4] to-[#90E0EF] flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-[#03045E]" />
            </div>
            <CardTitle className="text-2xl mb-2">
              Administrator Access
            </CardTitle>
            <CardDescription className="text-[#CAF0F8]">
              Platform management and oversight
            </CardDescription>
          </CardHeader>
          <CardContent>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Login/Register Form */}
              <form
                onSubmit={handleSubmit}
                className="space-y-4 max-w-md mx-auto text-left"
              >
                {/* Toggle Login/Register */}
                <div className="flex gap-2 p-1 bg-white/10 rounded-lg mb-4">
                  <button
                    type="button"
                    onClick={() => setIsLogin(true)}
                    className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                      isLogin
                        ? "bg-white text-[#0077B6] font-semibold"
                        : "text-white hover:bg-white/10"
                    }`}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsLogin(false)}
                    className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                      !isLogin
                        ? "bg-white text-[#0077B6] font-semibold"
                        : "text-white hover:bg-white/10"
                    }`}
                  >
                    Register
                  </button>
                </div>

                {/* Display Name Field (Register Only) */}
                {!isLogin && (
                  <div>
                    <Label
                      htmlFor="displayName"
                      className="text-white mb-2 block"
                    >
                      Display Name
                    </Label>
                    <Input
                      id="displayName"
                      type="text"
                      placeholder="Admin Name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                      required={!isLogin}
                    />
                  </div>
                )}

                {/* Email Field */}
                <div>
                  <Label htmlFor="email" className="text-white mb-2 block">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@mythra.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/50"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <Label htmlFor="password" className="text-white mb-2 block">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 bg-white/20 border-white/30 text-white placeholder:text-white/50"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-red-500/20 border border-red-400/30 rounded-lg text-red-300 text-sm">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-white text-[#0077B6] hover:bg-[#CAF0F8] font-semibold py-3 rounded-md transition-colors"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 border-2 border-[#0077B6] border-t-transparent rounded-full animate-spin" />
                      {isLogin ? "Signing in..." : "Creating account..."}
                    </span>
                  ) : isLogin ? (
                    "Sign In"
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>
            </motion.div>
          </CardContent>
        </Card>

        {/* Back to Main Login */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center mt-6"
        >
          <Link
            href="/login"
            className="text-[#90E0EF] hover:text-white transition-colors text-sm underline"
          >
            ← Back to main login
          </Link>
        </motion.div>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-6 p-4 bg-white/10 backdrop-blur-md rounded-lg border border-white/20"
        >
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-[#48CAE4] mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-[#CAF0F8] font-medium mb-1">
                Security Notice
              </p>
              <p className="text-xs text-[#90E0EF]">
                Admin access is logged and monitored. Only authorized personnel
                should access this portal.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-[#90E0EF] text-sm mt-6"
        >
          Secure • Fast • Reliable
        </motion.p>
      </motion.div>
    </div>
  );
}

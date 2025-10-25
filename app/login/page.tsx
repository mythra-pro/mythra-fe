"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, Zap, Users, Mail, Lock, Eye, EyeOff } from "lucide-react";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string>("organizer");
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
        if (!email) {
          setError("Email is required");
          setIsLoading(false);
          return;
        }

        const loginResponse = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, role: selectedRole }),
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
        localStorage.setItem("userRole", selectedRole);
        localStorage.setItem("isAuthenticated", "true");

        console.log("✅ Login successful. Stored UUID:", user.id);

        // Redirect to dashboard
        setTimeout(() => {
          router.push(`/dashboard/${selectedRole}`);
        }, 500);
      } else {
        // Register logic - call backend API
        if (!email || !displayName) {
          setError("Email and display name are required");
          setIsLoading(false);
          return;
        }

        const registerResponse = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, displayName, role: selectedRole }),
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
        localStorage.setItem("userRole", selectedRole);
        localStorage.setItem("isAuthenticated", "true");

        console.log("✅ Registration successful. Stored UUID:", user.id);

        // Redirect to dashboard
        setTimeout(() => {
          router.push(`/dashboard/${selectedRole}`);
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

  const roleCards = [
    {
      role: "organizer",
      title: "Organizer",
      description: "Create and manage events, sell tickets",
      icon: Users,
      color: "from-[#0077B6] to-[#0096C7]",
    },
    {
      role: "customer",
      title: "Customer",
      description: "Buy tickets, attend events",
      icon: Mail,
      color: "from-[#0096C7] to-[#48CAE4]",
    },
    {
      role: "investor",
      title: "Investor",
      description: "Fund campaigns, earn rewards, vote on proposals",
      icon: Zap,
      color: "from-[#48CAE4] to-[#90E0EF]",
    },
    {
      role: "staff",
      title: "Staff",
      description: "Check-in attendees, manage event operations",
      icon: Shield,
      color: "from-[#0077B6] to-[#48CAE4]",
    },
  ];

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
          <p className="text-lg text-[#CAF0F8] mb-2">
            Event Ticketing & Management Platform
          </p>
          <p className="text-[#90E0EF]">Sign in to get started</p>
        </div>

        {/* Main Login Card with Tabs */}
        <Card className="bg-white/20 backdrop-blur-lg border-white/30 text-white">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl mb-2">Choose Your Role</CardTitle>
            <CardDescription className="text-[#CAF0F8]">
              Select how you want to access the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              defaultValue="organizer"
              className="w-full"
              onValueChange={(value) => setSelectedRole(value)}
            >
              <TabsList className="grid w-full grid-cols-4 bg-white/30 backdrop-blur-md border border-white/20">
                {roleCards.map((card) => (
                  <TabsTrigger
                    key={card.role}
                    value={card.role}
                    className="text-blue-500 data-[state=active]:bg-white/40 data-[state=active]:text-white cursor-pointer"
                  >
                    {card.title.split(" ")[0]}
                  </TabsTrigger>
                ))}
              </TabsList>

              {roleCards.map((card) => {
                const Icon = card.icon;
                const isCurrentRole = selectedRole === card.role;

                return (
                  <TabsContent
                    key={card.role}
                    value={card.role}
                    className="mt-6"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-center"
                    >
                      <div
                        className={`h-16 w-16 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center mx-auto mb-4`}
                      >
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">
                        {card.title}
                      </h3>
                      <p className="text-[#CAF0F8] mb-6 max-w-md mx-auto">
                        {card.description}
                      </p>

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
                              placeholder="John Doe"
                              value={displayName}
                              onChange={(e) => setDisplayName(e.target.value)}
                              className="bg-white/20 border-white/30 text-white placeholder:text-white/50"
                              required={!isLogin}
                            />
                          </div>
                        )}

                        {/* Email Field */}
                        <div>
                          <Label
                            htmlFor="email"
                            className="text-white mb-2 block"
                          >
                            Email
                          </Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-white/50" />
                            <Input
                              id="email"
                              type="email"
                              placeholder="you@example.com"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="pl-10 bg-white/20 border-white/30 text-white placeholder:text-white/50"
                              required
                            />
                          </div>
                        </div>

                        {/* Password Field */}
                        <div>
                          <Label
                            htmlFor="password"
                            className="text-white mb-2 block"
                          >
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
                              {isLogin
                                ? "Signing in..."
                                : "Creating account..."}
                            </span>
                          ) : isLogin ? (
                            "Sign In"
                          ) : (
                            "Create Account"
                          )}
                        </Button>
                      </form>
                    </motion.div>
                  </TabsContent>
                );
              })}
            </Tabs>
          </CardContent>
        </Card>

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

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, Lock, Key, CheckCircle2 } from "lucide-react";
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
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { shortenAddress } from "@/lib/program";

export default function AdminLoginPage() {
  const router = useRouter();
  const { publicKey, connected, connecting } = useWallet();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });

  // Redirect when wallet is connected
  useEffect(() => {
    if (connected && publicKey && !isRedirecting) {
      setIsRedirecting(true);
      // Store admin wallet address
      localStorage.setItem("adminWalletAddress", publicKey.toString());
      localStorage.setItem("userRole", "admin");

      setTimeout(() => {
        router.push("/dashboard/admin");
      }, 800);
    }
  }, [connected, publicKey, router, isRedirecting]);

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsRedirecting(true);

    // Simulate admin authentication
    setTimeout(() => {
      // In a real app, you would validate credentials here
      localStorage.setItem("userRole", "admin");
      router.push("/dashboard/admin");
    }, 1500);
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
        {[...Array(15)].map((_, i) => {
          const width = Math.round(getStableRandom(i * 1, 40, 120));
          const height = Math.round(getStableRandom(i * 2, 40, 120));
          const left = getStableRandom(i * 3, 0, 100).toFixed(2);
          const top = getStableRandom(i * 4, 0, 100).toFixed(2);
          const duration = getStableRandom(i * 5, 3, 7);
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
                y: [0, -25, 0],
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
        className="w-full max-w-md relative z-10"
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
            <h1 className="text-4xl font-bold text-white">Mythra</h1>
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="h-6 w-6 text-[#48CAE4]" />
            <h2 className="text-2xl font-bold text-white">Admin Portal</h2>
          </div>
          <p className="text-[#CAF0F8]">Platform management and oversight</p>
        </div>

        {/* Admin Login Card */}
        <Card className="bg-white/20 backdrop-blur-lg border-white/30 text-white">
          <CardHeader className="text-center">
            <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-[#48CAE4] to-[#90E0EF] flex items-center justify-center mx-auto mb-4">
              <Lock className="h-8 w-8 text-[#03045E]" />
            </div>
            <CardTitle className="text-xl">Secure Access</CardTitle>
            <CardDescription className="text-[#CAF0F8]">
              Choose your preferred authentication method
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Wallet Connection Option */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Key className="h-5 w-5 text-[#48CAE4]" />
                <span className="font-medium">Web3 Authentication</span>
              </div>

              {connected && publicKey ? (
                <div className="p-4 bg-green-500/20 border border-green-400/30 rounded-lg">
                  <div className="flex items-center justify-center gap-2 text-green-300 mb-2">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="text-sm font-medium">
                      Connected: {shortenAddress(publicKey)}
                    </span>
                  </div>
                  {isRedirecting && (
                    <p className="text-xs text-green-200 text-center">
                      Redirecting to admin dashboard...
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <WalletMultiButton className="!w-full !bg-gradient-to-r !from-[#48CAE4] !to-[#90E0EF] !text-[#03045E] hover:!from-[#90E0EF] hover:!to-[#CAF0F8] !font-semibold !py-3 !rounded-md" />
                  {connecting && (
                    <p className="text-xs text-[#90E0EF] text-center mt-2">
                      Opening wallet...
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/20" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-transparent px-2 text-[#90E0EF]">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Traditional Login Form */}
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-[#CAF0F8]">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter admin username"
                  value={credentials.username}
                  onChange={(e) =>
                    setCredentials({ ...credentials, username: e.target.value })
                  }
                  className="bg-white/10 border-white/20 text-white placeholder:text-[#90E0EF] focus:border-[#48CAE4]"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#CAF0F8]">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter admin password"
                  value={credentials.password}
                  onChange={(e) =>
                    setCredentials({ ...credentials, password: e.target.value })
                  }
                  className="bg-white/10 border-white/20 text-white placeholder:text-[#90E0EF] focus:border-[#48CAE4]"
                  required
                />
              </div>
              <Button
                type="submit"
                disabled={isRedirecting}
                className="w-full bg-white text-[#0077B6] hover:bg-[#CAF0F8] font-semibold py-3"
              >
                {isRedirecting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-[#0077B6] border-t-transparent rounded-full animate-spin" />
                    Authenticating...
                  </span>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>
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
          transition={{ delay: 0.9 }}
          className="text-center text-[#90E0EF] text-xs mt-6"
        >
          Powered by Web3 • Secure • Transparent • Decentralized
        </motion.p>
      </motion.div>
    </div>
  );
}

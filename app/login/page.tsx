"use client";

import { motion } from "framer-motion";
import { Wallet, Shield, Zap, Users, Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { WalletAuth } from "@/components/auth/WalletAuth";
import { SolanaProvider } from "@/lib/providers";

export default function LoginPage() {

  // Generate stable random for animations
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
          <p className="text-lg text-[#CAF0F8] mb-2">
            Event Ticketing & Management Platform
          </p>
          <p className="text-[#90E0EF]">Sign in to get started</p>
        </div>

        {/* Main Login Card */}
        <Card className="bg-white/20 backdrop-blur-lg border-white/30 text-white">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                <Wallet className="h-6 w-6" />
              </div>
              <CardTitle className="text-3xl">Web3 Login</CardTitle>
            </div>
            <CardDescription className="text-[#CAF0F8] text-base">
              Connect your Phantom or OKX wallet to continue
            </CardDescription>
          </CardHeader>
          <CardContent className="px-8 pb-8">
            <SolanaProvider>
              <WalletAuth />
            </SolanaProvider>

            {/* Features */}
            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="bg-white/10 rounded-lg p-4 text-center">
                <Shield className="h-6 w-6 text-white mx-auto mb-2" />
                <p className="text-xs text-white/80">Secure</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4 text-center">
                <Zap className="h-6 w-6 text-white mx-auto mb-2" />
                <p className="text-xs text-white/80">Fast</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4 text-center">
                <Users className="h-6 w-6 text-white mx-auto mb-2" />
                <p className="text-xs text-white/80">Decentralized</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4 text-center">
                <Sparkles className="h-6 w-6 text-white mx-auto mb-2" />
                <p className="text-xs text-white/80">Web3</p>
              </div>
            </div>
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

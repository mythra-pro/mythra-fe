"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@solana/wallet-adapter-react";
import { motion } from "framer-motion";
import { Wallet } from "lucide-react";

interface WalletGuardProps {
  children: React.ReactNode;
  requiredRole?: string;
}

/**
 * WalletGuard Component
 * Protects routes by checking if wallet is connected
 * Redirects to login page if not connected
 */
export function WalletGuard({ children, requiredRole }: WalletGuardProps) {
  const { connected, connecting, publicKey } = useWallet();
  const router = useRouter();

  useEffect(() => {
    // If not connecting and not connected, redirect to login
    if (!connecting && !connected) {
      const timeout = setTimeout(() => {
        router.push("/login");
      }, 2000);

      return () => clearTimeout(timeout);
    }

    // Optional: Check if user has the required role
    if (connected && requiredRole) {
      const userRole = localStorage.getItem("userRole");
      if (userRole !== requiredRole) {
        console.warn(`Access denied. Required role: ${requiredRole}`);
        // Could redirect to unauthorized page or login
        // router.push("/unauthorized");
      }
    }
  }, [connected, connecting, router, requiredRole]);

  // Show loading state while checking wallet connection
  if (connecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#03045E] via-[#0077B6] to-[#0096C7] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="h-16 w-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white text-lg font-medium">
            Connecting to wallet...
          </p>
        </motion.div>
      </div>
    );
  }

  // Show message if wallet is not connected
  if (!connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#03045E] via-[#0077B6] to-[#0096C7] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="h-20 w-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-6">
            <Wallet className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Wallet Not Connected
          </h2>
          <p className="text-[#CAF0F8] mb-6">
            Please connect your wallet to access this page. Redirecting to
            login...
          </p>
          <div className="flex items-center justify-center gap-2">
            <span className="h-2 w-2 bg-white rounded-full animate-bounce" />
            <span className="h-2 w-2 bg-white rounded-full animate-bounce [animation-delay:0.2s]" />
            <span className="h-2 w-2 bg-white rounded-full animate-bounce [animation-delay:0.4s]" />
          </div>
        </motion.div>
      </div>
    );
  }

  // Wallet is connected, render children
  return <>{children}</>;
}

/**
 * Usage in protected pages:
 *
 * export default function DashboardPage() {
 *   return (
 *     <WalletGuard requiredRole="organizer">
 *       <YourDashboardContent />
 *     </WalletGuard>
 *   );
 * }
 */

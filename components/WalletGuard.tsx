"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";

interface WalletGuardProps {
  children: React.ReactNode;
  requiredRole?: string;
}

/**
 * AuthGuard Component (formerly WalletGuard)
 * Protects routes by checking if user is authenticated
 * Redirects to login page if not authenticated
 */
export function WalletGuard({ children, requiredRole }: WalletGuardProps) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated via localStorage
    const checkAuth = () => {
      const authStatus = localStorage.getItem("isAuthenticated");
      const userEmail = localStorage.getItem("userEmail");

      if (authStatus === "true" && userEmail) {
        setIsAuthenticated(true);

        // Optional: Check if user has the required role
        if (requiredRole) {
          const userRole = localStorage.getItem("userRole");
          if (userRole !== requiredRole) {
            console.warn(`Access denied. Required role: ${requiredRole}`);
            // Could redirect to unauthorized page
            // router.push("/unauthorized");
          }
        }
      } else {
        // Not authenticated, redirect to login
        setTimeout(() => {
          router.push("/login");
        }, 1000);
      }

      setIsChecking(false);
    };

    checkAuth();
  }, [router, requiredRole]);

  // Show loading state while checking authentication
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#03045E] via-[#0077B6] to-[#0096C7] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="h-16 w-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white text-lg font-medium">
            Checking authentication...
          </p>
        </motion.div>
      </div>
    );
  }

  // Show message if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#03045E] via-[#0077B6] to-[#0096C7] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="h-20 w-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mx-auto mb-6">
            <Lock className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">
            Not Authenticated
          </h2>
          <p className="text-[#CAF0F8] mb-6">
            Please sign in to access this page. Redirecting to login...
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

  // User is authenticated, render children
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

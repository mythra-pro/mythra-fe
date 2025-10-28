"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

// User roles for redirection
export type UserRole = "customer" | "investor" | "organizer" | "staff" | "admin";

export interface DashboardUser {
  id: string;
  name: string; // Required by User type
  email: string;
  displayName: string;
  walletAddress?: string;
  avatar?: string; // Required by User type
  role: UserRole;
  createdAt: Date; // Required by User type
  isWalletAuth: boolean;
}

/**
 * Hook to get current user and verify dashboard access
 * Supports both wallet-based and email-based authentication
 */
export const useDashboardUser = (expectedRole: UserRole) => {
  const router = useRouter();
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  
  useEffect(() => {
    // Reset loading state on each check
    setIsLoading(true);
    setUser(null);

    // Small delay to ensure localStorage is updated
    const timeoutId = setTimeout(() => {
      // Get user from localStorage
      const userId = localStorage.getItem("userId");
      const userEmail = localStorage.getItem("userEmail");
      const displayName = localStorage.getItem("displayName");
      const walletAddress = localStorage.getItem("walletAddress");
      const userRole = localStorage.getItem("userRole");
      const isAuthenticated = localStorage.getItem("isAuthenticated");

      console.log("🔐 useDashboardUser check:", {
        expectedRole,
        userRole,
        isAuthenticated,
        userId,
      });

      if (isAuthenticated !== "true" || !userId || !userEmail) {
        // Not authenticated - redirect to login
        console.log("❌ Not authenticated - redirecting to login");
        router.push("/login");
        return;
      }

      // Note: We don't check wallet mismatch here because dashboard pages
      // don't have WalletProvider. Wallet mismatch is checked in login flow.

      if (!userRole || userRole !== expectedRole) {
        // Wrong role - redirect to correct dashboard
        console.log("🔄 Wrong role - redirecting to", userRole);
        router.push(`/dashboard/${userRole || "customer"}`);
        return;
      }

      // Authenticated and correct role
      console.log("✅ Authenticated with correct role");
      const isWalletAuth = !!walletAddress;
      setUser({
        id: userId,
        name: displayName || "Unknown User", // Map displayName to name
        email: userEmail,
        displayName: displayName || "Unknown User",
        walletAddress: walletAddress || undefined,
        avatar: undefined, // Optional field
        role: userRole as UserRole,
        createdAt: new Date(), // Set to current date (could be fetched from DB)
        isWalletAuth,
      });
      setIsLoading(false);
    }, 100); // 100ms delay to ensure localStorage is synced

    return () => clearTimeout(timeoutId);
  }, [expectedRole, router, refreshKey]);

  // Listen for storage events (role switches in other tabs)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "userRole") {
        console.log("🔄 Storage change detected - refreshing user");
        setRefreshKey((prev) => prev + 1);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return { user, isLoading };
}

/**
 * Component that protects dashboard routes and provides user data
 */
interface DashboardGuardProps {
  role: UserRole;
  children: (user: DashboardUser) => React.ReactNode;
  fallback?: React.ReactNode;
}

export function DashboardGuard({
  role,
  children,
  fallback,
}: DashboardGuardProps) {
  // Check authentication first
  const isAuthenticated =
    typeof window !== "undefined" &&
    localStorage.getItem("isAuthenticated") === "true" &&
    localStorage.getItem("userEmail");

  if (!isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Authentication Required
            </h2>
            <p className="text-gray-600 mb-4">
              You must be signed in to access the {role} dashboard.
            </p>
          </div>
          <a
            href="/login"
            className="inline-block w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  // Get user data
  const { user, isLoading } = useDashboardUser(role);
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }
  
  if (!user) {
    return null; // Will redirect via hook
  }
  
  return <>{children(user)}</>;
}

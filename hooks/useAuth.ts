"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  walletAddress: string;
  role: string;
  isAuthenticated: boolean;
}

export interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
}

/**
 * Unified authentication hook
 * Supports both wallet-based and email-based authentication
 */
export function useAuth(): AuthState {
  const { disconnect, connected, publicKey } = useWallet();
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication status from localStorage
    const userId = localStorage.getItem("userId");
    const userEmail = localStorage.getItem("userEmail");
    const displayName = localStorage.getItem("displayName");
    const walletAddress = localStorage.getItem("walletAddress");
    const userRole = localStorage.getItem("userRole");
    const isAuthenticated = localStorage.getItem("isAuthenticated");

    if (isAuthenticated === "true" && userId && userEmail) {
      // Verify wallet match if wallet auth
      if (walletAddress && connected && publicKey) {
        const connectedWallet = publicKey.toString();
        if (walletAddress !== connectedWallet) {
          // Wallet mismatch - logout
          console.warn("⚠️ Wallet mismatch. Logging out.");
          handleLogout();
          setIsLoading(false);
          return;
        }
      }

      setUser({
        id: userId,
        email: userEmail,
        displayName: displayName || "Unknown",
        walletAddress: walletAddress || "",
        role: userRole || "customer",
        isAuthenticated: true,
      });
    } else {
      setUser(null);
    }

    setIsLoading(false);
  }, [connected, publicKey]);

  const handleLogout = useCallback(() => {
    // Clear localStorage
    localStorage.removeItem("userId");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("displayName");
    localStorage.removeItem("walletAddress");
    localStorage.removeItem("userRole");
    localStorage.removeItem("isAuthenticated");

    // Disconnect wallet if connected
    if (connected) {
      disconnect();
    }

    // Update state
    setUser(null);

    // Redirect to login
    router.push("/login");
  }, [connected, disconnect, router]);

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    logout: handleLogout,
  };
}

/**
 * Check if user has a specific role
 */
export function useHasRole(requiredRole: string): boolean {
  const { user } = useAuth();
  return user?.role === requiredRole;
}

/**
 * Require authentication - redirect to login if not authenticated
 */
export function useRequireAuth(redirectTo: string = "/login") {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  return { isAuthenticated, isLoading };
}

"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useMemo, useEffect, useState } from "react";

export interface WalletUser {
  id: string;
  walletAddress: string;
  email: string;
  displayName: string;
  role: string;
  roles: string[];
  hasProfile: boolean;
}

/**
 * Hook to get user information from the connected Solana wallet
 * Fetches real user data from localStorage after authentication
 */
export const useWalletUser = (): WalletUser | null => {
  const { publicKey, connected, disconnect } = useWallet();
  const [user, setUser] = useState<WalletUser | null>(null);

  useEffect(() => {
    if (!connected || !publicKey) {
      setUser(null);
      return;
    }

    // Get user data from localStorage (set after authentication)
    const userId = localStorage.getItem("userId");
    const userEmail = localStorage.getItem("userEmail");
    const displayName = localStorage.getItem("displayName");
    const walletAddress = localStorage.getItem("walletAddress");
    const userRole = localStorage.getItem("userRole");
    const isAuthenticated = localStorage.getItem("isAuthenticated");

    // Verify wallet address matches
    const connectedWallet = publicKey.toString();
    
    if (
      isAuthenticated === "true" &&
      userId &&
      userEmail &&
      walletAddress === connectedWallet
    ) {
      setUser({
        id: userId,
        walletAddress: connectedWallet,
        email: userEmail,
        displayName: displayName || "Unknown",
        role: userRole || "customer",
        roles: [userRole || "customer"],
        hasProfile: true,
      });
    } else if (walletAddress && walletAddress !== connectedWallet) {
      // Wallet mismatch - clear localStorage and disconnect
      console.warn("⚠️ Wallet mismatch detected. Clearing session.");
      localStorage.removeItem("userId");
      localStorage.removeItem("userEmail");
      localStorage.removeItem("displayName");
      localStorage.removeItem("walletAddress");
      localStorage.removeItem("userRole");
      localStorage.removeItem("isAuthenticated");
      disconnect();
      setUser(null);
    } else {
      // Not authenticated yet
      setUser(null);
    }
  }, [connected, publicKey, disconnect]);

  return user;
};

/**
 * Get truncated wallet address for display
 */
export function useTruncatedAddress(length: number = 4): string | null {
  const { publicKey, connected } = useWallet();

  if (!connected || !publicKey) {
    return null;
  }

  const address = publicKey.toString();
  return `${address.slice(0, length)}...${address.slice(-length)}`;
}

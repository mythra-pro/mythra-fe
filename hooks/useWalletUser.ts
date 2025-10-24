"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useMemo } from "react";
import { User, UserRole } from "@/app/types/user";

/**
 * Custom hook to get user data from connected wallet
 * STRICT: No fallback, must have wallet connected
 */
export function useWalletUser(role: UserRole): User {
  const { publicKey, connected } = useWallet();

  if (!connected || !publicKey) {
    throw new Error("Wallet must be connected to access user data");
  }

  const user = useMemo(() => {
    const walletAddress = publicKey.toString();

    // Generate user data from wallet address
    const user: User = {
      id: walletAddress, // Use wallet address as user ID
      name: generateNameFromAddress(walletAddress),
      email: generateEmailFromAddress(walletAddress),
      role: role,
      walletAddress: walletAddress,
      avatar: generateAvatarUrl(walletAddress),
      createdAt: new Date(),
    };

    return user;
  }, [publicKey, role]);

  return user;
}
/**
 * Generate a readable name from wallet address
 */
function generateNameFromAddress(address: string): string {
  // Use first 4 and last 4 characters of address
  const prefix = address.slice(0, 4);
  const suffix = address.slice(-4);
  return `User ${prefix}...${suffix}`;
}

/**
 * Generate email from wallet address
 */
function generateEmailFromAddress(address: string): string {
  const prefix = address.slice(0, 8);
  return `${prefix}@mythra.tix`;
}

/**
 * Generate avatar URL using DiceBear API or similar
 * This creates consistent avatars based on wallet address
 */
function generateAvatarUrl(address: string): string {
  // Using DiceBear API for consistent avatar generation
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${address}`;
}

/**
 * Hook to check if user has specific role
 */
export function useHasRole(
  expectedRole: UserRole,
  userRole: UserRole
): boolean {
  const user = useWalletUser(userRole);
  return user.role === expectedRole;
}

/**
 * Hook to get wallet balance (optional - requires additional RPC call)
 */
export function useWalletBalance() {
  const { publicKey } = useWallet();
  // You can implement balance fetching here if needed
  // import { useConnection } from "@solana/wallet-adapter-react";
  // const { connection } = useConnection();
  // const [balance, setBalance] = useState(0);
  // useEffect to fetch balance from connection.getBalance(publicKey)
  return 0; // Placeholder
}

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

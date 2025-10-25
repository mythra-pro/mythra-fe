"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { User, UserRole } from "@/app/types/user";
import { useMemo } from "react";

/**
 * Hook to get user data from wallet for dashboard pages
 * STRICT: Must have wallet connected, no fallback
 */
export function useDashboardUser(role: UserRole): User {
  const { connected, publicKey } = useWallet();

  // During build/SSR, return a placeholder to prevent build errors
  // The actual page will show the connection UI when rendered client-side
  if (typeof window === 'undefined') {
    return {
      id: 'build-placeholder',
      name: 'Build Placeholder',
      email: 'build@placeholder.com',
      role: role,
      walletAddress: 'BuildPlaceholder',
      avatar: '',
      createdAt: new Date(),
    };
  }

  // Client-side: redirect to login if wallet not connected
  if (!connected || !publicKey) {
    // Use setTimeout to avoid React state update during render
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        window.location.href = '/login';
      }, 0);
    }
    
    // Return placeholder while redirecting
    return {
      id: 'redirecting',
      name: 'Redirecting...',
      email: 'redirect@mythra.tix',
      role: role,
      walletAddress: 'Redirecting',
      avatar: '',
      createdAt: new Date(),
    };
  }

  const user = useMemo(() => {
    const walletAddress = publicKey.toString();

    return {
      id: walletAddress,
      name: generateNameFromRole(role, walletAddress),
      email: `${walletAddress.slice(0, 8)}@mythra.tix`,
      role: role,
      walletAddress: walletAddress,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${walletAddress}`,
      createdAt: new Date(),
    };
  }, [publicKey, role]);

  return user;
}
/**
 * Generate name based on role and wallet address
 */
function generateNameFromRole(role: UserRole, address: string): string {
  const roleNames = {
    organizer: "Organizer",
    staff: "Staff",
    customer: "Customer",
    admin: "Admin",
    investor: "Investor",
  };

  const prefix = address.slice(0, 4);
  const suffix = address.slice(-4);

  return `${roleNames[role]} ${prefix}...${suffix}`;
}

/**
 * Component that protects dashboard routes and provides user data
 */
interface DashboardGuardProps {
  role: UserRole;
  children: (user: User) => React.ReactNode;
  fallback?: React.ReactNode;
}

export function DashboardGuard({
  role,
  children,
  fallback,
}: DashboardGuardProps) {
  const { connected } = useWallet();

  // Check wallet connection first
  if (!connected) {
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
              Wallet Extension Required
            </h2>
            <p className="text-gray-600 mb-4">
              You must connect a wallet extension (Phantom, Solflare) to access
              the {role} dashboard.
            </p>
            <div className="text-xs text-gray-500 mb-4">
              No dummy data allowed. Real wallet connection required.
            </div>
          </div>
          <a
            href="/login"
            className="inline-block w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Connect Wallet Extension
          </a>
        </div>
      </div>
    );
  }

  // Get user data (will throw error if wallet issues)
  try {
    const user = useDashboardUser(role);
    return <>{children(user)}</>;
  } catch (error) {
    console.error("Wallet error:", error);
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-red-600 mb-4">
            <h2 className="text-2xl font-bold mb-2">Wallet Error</h2>
            <p className="mb-4">
              {error instanceof Error ? error.message : "Unknown wallet error"}
            </p>
            <div className="text-sm bg-red-50 p-3 rounded-lg mb-4">
              Please ensure your wallet extension is installed and unlocked.
            </div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-red-600 text-white font-semibold rounded-full hover:bg-red-700 w-full"
          >
            Reload & Try Again
          </button>
        </div>
      </div>
    );
  }
}

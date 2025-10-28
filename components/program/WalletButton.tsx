/**
 * Auth Button Component (formerly Wallet Button)
 *
 * Simple logout button with themed styling
 */

"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut, User, Mail } from "lucide-react";
import { useState } from "react";

export function WalletButton() {
  const router = useRouter();

  const handleLogout = () => {
    // Clear authentication from localStorage
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("displayName");
    localStorage.removeItem("userRole");

    // Redirect to login
    router.push("/login");
  };

  return (
    <Button
      onClick={handleLogout}
      variant="outline"
      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full px-6 py-3 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
    >
      <LogOut className="h-4 w-4 mr-2" />
      Logout
    </Button>
  );
}

/**
 * Custom auth button with user info and logout functionality
 * Supports both wallet and email authentication
 */
export function CustomWalletButton() {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);

  const userEmail =
    typeof window !== "undefined" ? localStorage.getItem("userEmail") : null;
  const displayName =
    typeof window !== "undefined" ? localStorage.getItem("displayName") : null;
  const walletAddress =
    typeof window !== "undefined" ? localStorage.getItem("walletAddress") : null;
  const userId =
    typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  // Check if this is wallet auth
  const isWalletAuth = !!walletAddress;

  // Truncate wallet address for display
  const truncateAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const handleLogout = () => {
    setShowMenu(false);

    // Clear all authentication from localStorage
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("displayName");
    localStorage.removeItem("userRole");
    localStorage.removeItem("walletAddress");
    localStorage.removeItem("userId");

    // Redirect to login
    router.push("/login");
  };

  const handleSwitchWallet = () => {
    setShowMenu(false);
    
    // Clear session but keep them on login page to connect new wallet
    localStorage.clear();
    
    // Redirect to login
    router.push("/login");
  };

  if (!userEmail) {
    // Show login button if not authenticated
    return (
      <Button
        onClick={() => router.push("/login")}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full px-6 py-3 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
      >
        Sign In
      </Button>
    );
  }

  return (
    <div className="relative flex items-center gap-2">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-4 py-3 bg-blue-500 text-white font-semibold rounded-full hover:bg-blue-700 transition-all duration-300 border-2 border-blue-400 shadow-lg"
      >
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <User className="h-4 w-4" />
        <span className="text-sm">
          {displayName || userEmail.split("@")[0]}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${
            showMenu ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {showMenu && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowMenu(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-2xl border border-blue-200 z-50 overflow-hidden">
            <div className="p-4 bg-blue-50 border-b border-blue-200">
              <p className="text-xs text-gray-500 mb-1">Signed in as</p>
              <p className="text-sm font-medium text-gray-900 mb-1">
                {displayName || "User"}
              </p>
              <p className="text-xs text-gray-600 break-all flex items-center gap-1 mb-2">
                <Mail className="h-3 w-3" />
                {userEmail}
              </p>
              
              {/* Show wallet address if wallet auth */}
              {isWalletAuth && walletAddress && (
                <div className="mt-2 pt-2 border-t border-blue-200">
                  <p className="text-xs text-gray-500 mb-1">Wallet Address</p>
                  <div className="flex items-center justify-between">
                    <code className="text-xs font-mono bg-blue-100 px-2 py-1 rounded text-blue-700">
                      {truncateAddress(walletAddress)}
                    </code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(walletAddress);
                        alert("Wallet address copied!");
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <div className="py-1">
              {/* Switch Wallet Button - Only show for wallet auth */}
              {isWalletAuth && (
                <button
                  onClick={handleSwitchWallet}
                  className="w-full px-4 py-3 text-left text-blue-600 hover:bg-blue-50 transition-colors font-medium flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  Switch Wallet
                </button>
              )}
              
              {/* Sign Out Button */}
              <button
                onClick={handleLogout}
                className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors font-semibold flex items-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

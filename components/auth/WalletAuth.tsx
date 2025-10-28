"use client";

import { useState, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useRouter } from "next/navigation";
import { EmailModal } from "./EmailModal";
import bs58 from "bs58";
import { motion } from "framer-motion";

interface WalletAuthProps {
  onSuccess?: (user: any) => void;
  onError?: (error: string) => void;
}

export function WalletAuth({ onSuccess, onError }: WalletAuthProps) {
  const { publicKey, signMessage, connected, disconnect } = useWallet();
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [authData, setAuthData] = useState<{
    message: string;
    signature: string;
    walletAddress: string;
  } | null>(null);

  /**
   * Step 1: Check if wallet is already registered
   */
  const checkWalletExists = useCallback(
    async (walletAddress: string) => {
      try {
        const response = await fetch("/api/auth/wallet/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ walletAddress }),
        });

        if (!response.ok) {
          throw new Error("Failed to check wallet");
        }

        const data = await response.json();
        return data;
      } catch (err: any) {
        console.error("Wallet check error:", err);
        throw err;
      }
    },
    []
  );

  /**
   * Step 2: Get nonce and message for signing
   */
  const getNonce = useCallback(async (walletAddress: string) => {
    try {
      const response = await fetch("/api/auth/wallet/nonce", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress }),
      });

      if (!response.ok) {
        throw new Error("Failed to get nonce");
      }

      const data = await response.json();
      return data;
    } catch (err: any) {
      console.error("Nonce generation error:", err);
      throw err;
    }
  }, []);

  /**
   * Step 3: Sign message with wallet
   */
  const signAuthMessage = useCallback(
    async (message: string) => {
      if (!signMessage) {
        throw new Error("Wallet does not support message signing");
      }

      try {
        const messageBytes = new TextEncoder().encode(message);
        const signature = await signMessage(messageBytes);
        return bs58.encode(signature);
      } catch (err: any) {
        console.error("Signature error:", err);
        if (err.message?.includes("User rejected")) {
          throw new Error("You declined the signature request");
        }
        throw new Error("Failed to sign message");
      }
    },
    [signMessage]
  );

  /**
   * Step 4: Verify signature and register/login
   */
  const verifyAndAuth = useCallback(
    async (data: {
      walletAddress: string;
      signature: string;
      message: string;
      email?: string;
      displayName?: string;
      role?: string;
    }) => {
      try {
        const response = await fetch("/api/auth/wallet/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Authentication failed");
        }

        return result;
      } catch (err: any) {
        console.error("Verification error:", err);
        throw err;
      }
    },
    []
  );

  /**
   * Complete authentication flow
   */
  const handleAuthenticate = useCallback(async () => {
    if (!publicKey || !connected) {
      setError("Please connect your wallet first");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const walletAddress = publicKey.toString();
      console.log("🔐 Starting authentication for:", walletAddress);

      // Step 1: Check if wallet exists
      console.log("📋 Checking if wallet is registered...");
      const checkResult = await checkWalletExists(walletAddress);

      if (checkResult.exists) {
        // Existing user - auto-login flow
        console.log("✅ Wallet found! Logging in...");

        // Get nonce and message
        const { message } = await getNonce(walletAddress);

        // Sign message
        const signature = await signAuthMessage(message);

        // Verify and login
        const authResult = await verifyAndAuth({
          walletAddress,
          signature,
          message,
        });

        // Store session
        localStorage.setItem("userId", authResult.user.id);
        localStorage.setItem("userEmail", authResult.user.email);
        localStorage.setItem("displayName", authResult.user.displayName);
        localStorage.setItem("walletAddress", walletAddress);
        localStorage.setItem("userRole", authResult.user.role);
        localStorage.setItem("isAuthenticated", "true");

        console.log("✅ Login successful!");

        if (onSuccess) {
          onSuccess(authResult.user);
        }

        // Redirect to dashboard
        setTimeout(() => {
          router.push(`/dashboard/${authResult.user.role}`);
        }, 500);
      } else {
        // New user - registration flow
        console.log("📝 New wallet! Registration required...");

        // Get nonce and message
        const { message } = await getNonce(walletAddress);

        // Sign message
        const signature = await signAuthMessage(message);

        // Store auth data and show email modal
        setAuthData({
          message,
          signature,
          walletAddress,
        });

        setShowEmailModal(true);
        setIsLoading(false);
      }
    } catch (err: any) {
      console.error("❌ Authentication error:", err);
      const errorMessage = err.message || "Authentication failed";
      setError(errorMessage);
      
      if (onError) {
        onError(errorMessage);
      }
      
      setIsLoading(false);
    }
  }, [
    publicKey,
    connected,
    checkWalletExists,
    getNonce,
    signAuthMessage,
    verifyAndAuth,
    router,
    onSuccess,
    onError,
  ]);

  /**
   * Handle email modal submission
   */
  const handleEmailSubmit = useCallback(
    async (data: { email: string; displayName: string; role: string }) => {
      if (!authData) {
        setError("Authentication data missing");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        console.log("📧 Completing registration with email...");

        const authResult = await verifyAndAuth({
          ...authData,
          ...data,
        });

        // Store session
        localStorage.setItem("userId", authResult.user.id);
        localStorage.setItem("userEmail", authResult.user.email);
        localStorage.setItem("displayName", authResult.user.displayName);
        localStorage.setItem("walletAddress", authData.walletAddress);
        localStorage.setItem("userRole", authResult.user.role);
        localStorage.setItem("isAuthenticated", "true");

        console.log("✅ Registration successful!");

        setShowEmailModal(false);

        if (onSuccess) {
          onSuccess(authResult.user);
        }

        // Redirect to dashboard
        setTimeout(() => {
          router.push(`/dashboard/${authResult.user.role}`);
        }, 500);
      } catch (err: any) {
        console.error("❌ Registration error:", err);
        const errorMessage = err.message || "Registration failed";
        setError(errorMessage);
        
        if (onError) {
          onError(errorMessage);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [authData, verifyAndAuth, router, onSuccess, onError]
  );

  /**
   * Handle wallet disconnect
   */
  const handleDisconnect = useCallback(async () => {
    await disconnect();
    setAuthData(null);
    setShowEmailModal(false);
    setError(null);
  }, [disconnect]);

  return (
    <div className="space-y-4">
      {/* Wallet Connect Button */}
      <div className="flex flex-col items-center gap-4">
        <WalletMultiButton className="!bg-gradient-to-r !from-[#0077B6] !to-[#0096C7] hover:!from-[#005f8f] hover:!to-[#007ba8] !text-white !font-semibold !py-3 !px-6 !rounded-full !transition-all !duration-300 !shadow-lg hover:!shadow-xl !transform hover:!scale-105" />

        {/* Authenticate Button (shown when wallet is connected) */}
        {connected && publicKey && !showEmailModal && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={handleAuthenticate}
            disabled={isLoading}
            className="bg-white text-[#0077B6] border-2 border-[#0077B6] hover:bg-[#0077B6] hover:text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-[#0077B6] border-t-transparent rounded-full animate-spin" />
                Authenticating...
              </span>
            ) : (
              "🔐 Sign In with Wallet"
            )}
          </motion.button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 border border-red-200 rounded-lg"
        >
          <p className="text-red-700 text-sm text-center">{error}</p>
        </motion.div>
      )}

      {/* Email Modal for New Users */}
      {authData && (
        <EmailModal
          isOpen={showEmailModal}
          onClose={() => {
            setShowEmailModal(false);
            setAuthData(null);
            handleDisconnect();
          }}
          onSubmit={handleEmailSubmit}
          walletAddress={authData.walletAddress}
          isLoading={isLoading}
          error={error}
        />
      )}

      {/* Info Text */}
      {!connected && (
        <p className="text-center text-sm text-gray-600">
          Connect your Phantom or OKX wallet to continue
        </p>
      )}
    </div>
  );
}

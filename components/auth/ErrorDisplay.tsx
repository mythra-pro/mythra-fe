/**
 * Enhanced Error Display Component
 * Shows user-friendly error messages with retry options
 */

"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, RefreshCw, X, Wifi, WalletIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorDisplayProps {
  error: string | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

interface ErrorConfig {
  title: string;
  message: string;
  icon: React.ReactNode;
  action?: string | null;
  canRetry: boolean;
}

// Error message patterns and their user-friendly versions
const errorConfigs: Record<string, ErrorConfig> = {
  "wallet_not_installed": {
    title: "Wallet Not Found",
    message: "Please install Phantom or another Solana wallet to continue.",
    icon: <WalletIcon className="h-6 w-6" />,
    action: "Install Wallet",
    canRetry: false,
  },
  "user_rejected": {
    title: "Signature Declined",
    message: "You declined the signature request. Please try again and approve the message.",
    icon: <AlertCircle className="h-6 w-6" />,
    action: "Try Again",
    canRetry: true,
  },
  "expired": {
    title: "Session Expired",
    message: "Your authentication session has expired. Please sign in again.",
    icon: <RefreshCw className="h-6 w-6" />,
    action: "Sign In Again",
    canRetry: true,
  },
  "network": {
    title: "Network Error",
    message: "Unable to connect to the server. Please check your internet connection.",
    icon: <Wifi className="h-6 w-6" />,
    action: "Retry",
    canRetry: true,
  },
  "rate_limit": {
    title: "Too Many Attempts",
    message: "You've made too many authentication attempts. Please wait 15-30 minutes and try again.",
    icon: <AlertCircle className="h-6 w-6" />,
    action: null,
    canRetry: false,
  },
  "duplicate_email": {
    title: "Email Already Registered",
    message: "This email is already linked to another wallet. Please use a different email or connect the original wallet.",
    icon: <AlertCircle className="h-6 w-6" />,
    action: null,
    canRetry: false,
  },
  "generic": {
    title: "Authentication Error",
    message: "Something went wrong during authentication. Please try again.",
    icon: <AlertCircle className="h-6 w-6" />,
    action: "Try Again",
    canRetry: true,
  },
};

function detectErrorType(error: string): string {
  const errorLower = error.toLowerCase();

  if (errorLower.includes("not installed") || errorLower.includes("wallet not detected")) {
    return "wallet_not_installed";
  }
  if (errorLower.includes("rejected") || errorLower.includes("declined")) {
    return "user_rejected";
  }
  if (errorLower.includes("expired")) {
    return "expired";
  }
  if (errorLower.includes("network") || errorLower.includes("fetch") || errorLower.includes("offline")) {
    return "network";
  }
  if (errorLower.includes("too many") || errorLower.includes("rate limit") || error.includes("429")) {
    return "rate_limit";
  }
  if (errorLower.includes("email") && errorLower.includes("registered")) {
    return "duplicate_email";
  }

  return "generic";
}

export function ErrorDisplay({ error, onRetry, onDismiss, className = "" }: ErrorDisplayProps) {
  if (!error) return null;

  const errorType = detectErrorType(error);
  const config = errorConfigs[errorType];

  const handleAction = () => {
    if (errorType === "wallet_not_installed") {
      window.open("https://phantom.app/", "_blank");
    } else if (config.canRetry && onRetry) {
      onRetry();
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.95 }}
        transition={{ type: "spring", duration: 0.5 }}
        className={`relative bg-red-50 border-2 border-red-200 rounded-xl p-4 shadow-lg ${className}`}
      >
        {/* Dismiss Button */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="absolute top-3 right-3 text-red-400 hover:text-red-600 transition-colors"
            aria-label="Dismiss error"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Error Content */}
        <div className="flex gap-4">
          {/* Icon */}
          <div className="flex-shrink-0">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center text-red-600">
              {config.icon}
            </div>
          </div>

          {/* Message */}
          <div className="flex-1 pt-1">
            <h3 className="font-semibold text-red-900 mb-1">{config.title}</h3>
            <p className="text-sm text-red-700 mb-3">{config.message}</p>

            {/* Original Error (collapsed) */}
            <details className="text-xs text-red-600 mb-3">
              <summary className="cursor-pointer hover:underline">
                Technical details
              </summary>
              <code className="block mt-2 p-2 bg-red-100 rounded text-red-800">
                {error}
              </code>
            </details>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {config.action && (
                <Button
                  onClick={handleAction}
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {errorType === "wallet_not_installed" ? (
                    <WalletIcon className="h-4 w-4 mr-2" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  {config.action}
                </Button>
              )}

              {!config.canRetry && errorType === "rate_limit" && (
                <div className="text-xs text-red-600 bg-red-100 px-3 py-2 rounded">
                  ⏰ Please wait 15-30 minutes
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pulsing Border Animation */}
        <motion.div
          className="absolute inset-0 border-2 border-red-300 rounded-xl pointer-events-none"
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        />
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Compact Error Toast (alternative)
 */
export function ErrorToast({ error, onDismiss }: { error: string | null; onDismiss?: () => void }) {
  if (!error) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        className="fixed top-4 right-4 z-50 bg-red-600 text-white px-6 py-4 rounded-lg shadow-2xl max-w-md"
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold mb-1">Error</p>
            <p className="text-sm opacity-90">{error}</p>
          </div>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="flex-shrink-0 text-white/80 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

"use client";

import { User, UserRole } from "@/app/types/user";
import { useMemo } from "react";

/**
 * Hook to get user data from localStorage for dashboard pages
 * STRICT: Must be authenticated, no fallback
 */
export function useDashboardUser(role: UserRole): User {
  // During build/SSR, return a placeholder to prevent build errors
  if (typeof window === "undefined") {
    return {
      id: "build-placeholder",
      name: "Build Placeholder",
      email: "build@placeholder.com",
      role: role,
      walletAddress: "BuildPlaceholder",
      avatar: "",
      createdAt: new Date(),
    };
  }

  // Get user data from localStorage
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const userEmail = localStorage.getItem("userEmail");
  const displayName = localStorage.getItem("displayName");

  // Client-side: redirect to login if not authenticated
  if (!isAuthenticated || !userEmail) {
    // Use setTimeout to avoid React state update during render
    if (typeof window !== "undefined") {
      setTimeout(() => {
        window.location.href = "/login";
      }, 0);
    }

    // Return placeholder while redirecting
    return {
      id: "redirecting",
      name: "Redirecting...",
      email: "redirect@mythra.tix",
      role: role,
      walletAddress: "Redirecting",
      avatar: "",
      createdAt: new Date(),
    };
  }

  const user = useMemo(() => {
    // Get UUID from localStorage (stored during login)
    const userId = localStorage.getItem("userId");

    console.log("🔍 useDashboardUser - userId from localStorage:", userId);
    console.log(
      "🔍 useDashboardUser - userEmail from localStorage:",
      userEmail
    );

    if (!userId) {
      // DO NOT fallback to email-based ID - require valid UUID
      console.error("❌ No userId (UUID) found in localStorage!");
      throw new Error(
        "User ID (UUID) not found in localStorage. Please log in again."
      );
    }

    const userName = displayName || userEmail?.split("@")[0] || "User";

    return {
      id: userId, // Use UUID from localStorage!
      name: userName,
      email: userEmail || "",
      role: role,
      walletAddress: userEmail || "",
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userEmail}`,
      createdAt: new Date(),
    };
  }, [userEmail, displayName, role]);

  return user;
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
  try {
    const user = useDashboardUser(role);
    return <>{children(user)}</>;
  } catch (error) {
    console.error("Authentication error:", error);
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
          <div className="text-red-600 mb-4">
            <h2 className="text-2xl font-bold mb-2">Authentication Error</h2>
            <p className="mb-4">
              {error instanceof Error ? error.message : "Unknown error"}
            </p>
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

"use client";

import React from "react";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: (error: Error) => React.ReactNode;
}

export class WalletErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Wallet Error Boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error);
      }

      const isWalletError =
        this.state.error.message.includes("Wallet") ||
        this.state.error.message.includes("wallet") ||
        this.state.error.message.includes("connect");

      return (
        <div className="min-h-screen bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
            <div className="mb-6">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-red-900 mb-2">
                {isWalletError
                  ? "Wallet Connection Error"
                  : "Application Error"}
              </h2>
              <p className="text-red-700 mb-4">{this.state.error.message}</p>

              {isWalletError && (
                <div className="bg-red-50 p-4 rounded-lg mb-4 text-left">
                  <h3 className="font-semibold text-red-800 mb-2">Required:</h3>
                  <ul className="text-sm text-red-700 space-y-1">
                    <li>• Install Phantom or Solflare wallet extension</li>
                    <li>• Unlock your wallet</li>
                    <li>• Connect to this website</li>
                    <li>• No dummy/mock data allowed</li>
                  </ul>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <button
                onClick={() => (window.location.href = "/login")}
                className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-all"
              >
                Go to Login & Connect Wallet
              </button>

              <button
                onClick={() => window.location.reload()}
                className="w-full px-6 py-3 bg-gray-600 text-white font-semibold rounded-full hover:bg-gray-700 transition-all"
              >
                Reload Page
              </button>
            </div>

            {process.env.NODE_ENV === "development" && (
              <details className="mt-4 text-left">
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  Error Details (Dev Mode)
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto text-red-600">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * HOC for wrapping components with wallet error boundary
 */
export function withWalletErrorBoundary<T extends object>(
  Component: React.ComponentType<T>
) {
  return function WrappedComponent(props: T) {
    return (
      <WalletErrorBoundary>
        <Component {...props} />
      </WalletErrorBoundary>
    );
  };
}

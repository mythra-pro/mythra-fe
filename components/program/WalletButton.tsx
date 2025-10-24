/**
 * Wallet Connect Button Component
 *
 * Custom wallet button with disconnect functionality and themed styling
 */

"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { useState } from "react";

export function WalletButton() {
  return (
    <div className="flex items-center gap-4">
      <WalletMultiButton className="!bg-blue-600 hover:!bg-blue-700 !text-white !font-semibold !rounded-full !px-6 !py-3 transition-all duration-300 !shadow-lg hover:!shadow-xl !transform hover:!scale-105" />
    </div>
  );
}

/**
 * Custom wallet button with more control and disconnect functionality
 */
export function CustomWalletButton() {
  const { publicKey, connected, disconnect, disconnecting } = useWallet();
  const [showMenu, setShowMenu] = useState(false);

  const handleDisconnect = async () => {
    try {
      setShowMenu(false);
      await disconnect();
    } catch (error) {
      console.error("Error disconnecting wallet:", error);
      throw error; // Re-throw error instead of silent fail
    }
  };

  if (!connected || !publicKey) {
    // Use WalletMultiButton for proper wallet extension triggering
    return (
      <WalletMultiButton className="!bg-blue-600 hover:!bg-blue-700 !text-white !font-semibold !rounded-full !px-6 !py-3 transition-all duration-300 !shadow-lg hover:!shadow-xl !transform hover:!scale-105" />
    );
  }

  return (
    <div className="relative flex items-center gap-2">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 px-4 py-3 bg-blue-500 text-white font-semibold rounded-full hover:bg-blue-700 transition-all duration-300 border-2 border-blue-400 shadow-lg"
      >
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <span className="text-sm font-mono">
          {publicKey?.toString().slice(0, 4)}...
          {publicKey?.toString().slice(-4)}
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
          <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl border border-blue-200 z-50 overflow-hidden">
            <div className="p-4 bg-blue-50 border-b border-blue-200">
              <p className="text-xs text-gray-500 mb-1">Connected Wallet</p>
              <p className="text-sm font-mono text-gray-900 break-all">
                {publicKey?.toString()}
              </p>
            </div>
            <button
              onClick={handleDisconnect}
              disabled={disconnecting}
              className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              {disconnecting ? "Disconnecting..." : "Disconnect Wallet"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

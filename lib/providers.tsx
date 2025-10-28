"use client";

import { FC, ReactNode, useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import { clusterApiUrl } from "@solana/web3.js";
import { getRpcEndpoint } from "./program";

// Import wallet adapter CSS in Next.js 15 compatible way
import "@solana/wallet-adapter-react-ui/styles.css";

interface SolanaProviderProps {
  children: ReactNode;
}

export const SolanaProvider: FC<SolanaProviderProps> = ({ children }) => {
  // Connect to devnet
  // You can change this to mainnet-beta for production
  const endpoint = useMemo(() => {
    // Use custom RPC or default devnet with environment variable override
    return getRpcEndpoint();
  }, []);

  // Configure supported wallets
  // NOTE: OKX Wallet will be auto-detected by the wallet adapter if the browser extension is installed
  // No specific adapter needed - it implements the Solana Wallet Standard
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      // OKX Wallet auto-detected via Wallet Standard (no adapter needed)
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

/**
 * Usage in app/layout.tsx:
 *
 * import { SolanaProvider } from '@/lib/providers';
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html lang="en">
 *       <body>
 *         <SolanaProvider>
 *           {children}
 *         </SolanaProvider>
 *       </body>
 *     </html>
 *   );
 * }
 */

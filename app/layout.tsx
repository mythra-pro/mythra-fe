import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SolanaProvider } from '@/lib/providers';
import '@solana/wallet-adapter-react-ui/styles.css';

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Mythra Tix",
  description: "Event funding and ticketing platform",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased font-sans`}
        suppressHydrationWarning
      >
        <SolanaProvider>
          {children}
        </SolanaProvider>
        <Analytics />
      </body>
    </html>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Wallet, Shield, Zap, Users, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Image from "next/image";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { shortenAddress } from "@/lib/program";

export default function LoginPage() {
  const router = useRouter();
  const { publicKey, connected, connecting, wallet } = useWallet();
  const [selectedRole, setSelectedRole] = useState<string>("organizer");
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Redirect to dashboard when wallet is connected and role is selected
  useEffect(() => {
    if (connected && publicKey && !isRedirecting) {
      setIsRedirecting(true);
      // Store wallet address in localStorage for session management
      localStorage.setItem("walletAddress", publicKey.toString());
      localStorage.setItem("userRole", selectedRole);

      // Short delay for better UX
      setTimeout(() => {
        router.push(`/dashboard/${selectedRole}`);
      }, 800);
    }
  }, [connected, publicKey, selectedRole, router, isRedirecting]);

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
  };

  // Generate stable pseudo-random values for background animations (prevents hydration mismatch)
  const getStableRandom = (seed: number, min: number, max: number) => {
    const x = Math.sin(seed) * 10000;
    return min + (x - Math.floor(x)) * (max - min);
  };

  const roleCards = [
    {
      role: "organizer",
      title: "Organizer",
      description: "Create and manage events, sell NFT tickets",
      icon: Users,
      color: "from-[#0077B6] to-[#0096C7]",
    },
    {
      role: "customer",
      title: "Customer",
      description: "Buy tickets, collect NFTs, attend events",
      icon: Wallet,
      color: "from-[#0096C7] to-[#48CAE4]",
    },
    {
      role: "investor",
      title: "Investor",
      description: "Fund campaigns, earn rewards, vote on proposals",
      icon: Zap,
      color: "from-[#48CAE4] to-[#90E0EF]",
    },
    {
      role: "staff",
      title: "Staff",
      description: "Check-in attendees, manage event operations",
      icon: Shield,
      color: "from-[#0077B6] to-[#48CAE4]",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#03045E] via-[#0077B6] to-[#0096C7] flex items-center justify-center p-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => {
          const width = Math.round(getStableRandom(i * 1, 50, 150));
          const height = Math.round(getStableRandom(i * 2, 50, 150));
          const left = getStableRandom(i * 3, 0, 100).toFixed(2);
          const top = getStableRandom(i * 4, 0, 100).toFixed(2);
          const duration = getStableRandom(i * 5, 2, 5);
          const delay = getStableRandom(i * 6, 0, 2);
          
          return (
            <motion.div
              key={i}
              className="absolute bg-white/5 rounded-full"
              style={{
                width: `${width}px`,
                height: `${height}px`,
                left: `${left}%`,
                top: `${top}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration,
                repeat: Infinity,
                delay,
              }}
            />
          );
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-2xl relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br bg-white flex items-center justify-center">
              <Image
                src="/favicon.svg"
                alt="Mythra Logo"
                width={100}
                height={100}
                className="h-10 w-10 rounded-lg bg-white"
              />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Mythra
            </h1>
          </div>
          <p className="text-lg text-[#CAF0F8] mb-2">
            Next-Generation Web3 Event Ticketing Platform
          </p>
          <p className="text-[#90E0EF]">Connect your wallet to get started</p>
        </div>

        {/* Main Login Card with Tabs */}
        <Card className="bg-white/20 backdrop-blur-lg border-white/30 text-white">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl mb-2">Choose Your Role</CardTitle>
            <CardDescription className="text-[#CAF0F8]">
              Select how you want to access the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="organizer" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-white/30 backdrop-blur-md border border-white/20">
                {roleCards.map((card) => (
                  <TabsTrigger
                    key={card.role}
                    value={card.role}
                    className="text-white data-[state=active]:bg-white/40 data-[state=active]:text-white cursor-pointer"
                  >
                    {card.title.split(" ")[0]}
                  </TabsTrigger>
                ))}
              </TabsList>

              {roleCards.map((card) => {
                const Icon = card.icon;
                const isCurrentRole = selectedRole === card.role;

                return (
                  <TabsContent
                    key={card.role}
                    value={card.role}
                    className="mt-6"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-center"
                    >
                      <div
                        className={`h-16 w-16 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center mx-auto mb-4`}
                      >
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">
                        {card.title}
                      </h3>
                      <p className="text-[#CAF0F8] mb-6 max-w-md mx-auto">
                        {card.description}
                      </p>

                      {/* Wallet Connection Status */}
                      {connected && publicKey ? (
                        <div className="mb-4 p-3 bg-green-500/20 border border-green-400/30 rounded-lg">
                          <div className="flex items-center justify-center gap-2 text-green-300">
                            <CheckCircle2 className="h-5 w-5" />
                            <span className="text-sm font-medium">
                              Connected: {shortenAddress(publicKey)}
                            </span>
                          </div>
                          {isRedirecting && (
                            <p className="text-xs text-green-200 mt-2">
                              Redirecting to dashboard...
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="mb-4">
                          <div className="wallet-adapter-button-wrapper max-w-xs mx-auto">
                            <WalletMultiButton
                              className="!w-full !bg-white !text-[#0077B6] hover:!bg-[#CAF0F8] !font-semibold !py-3 !rounded-md !transition-colors"
                              onClick={() => handleRoleSelect(card.role)}
                            />
                          </div>
                          {connecting && (
                            <p className="text-xs text-[#90E0EF] mt-2">
                              Opening wallet...
                            </p>
                          )}
                        </div>
                      )}

                      {/* Instructions */}
                      <div className="mt-6 p-3 bg-white/10 rounded-lg text-left">
                        <p className="text-xs text-[#CAF0F8] mb-2 font-medium">
                          📝 Instructions:
                        </p>
                        <ol className="text-xs text-[#90E0EF] space-y-1 list-decimal list-inside">
                          <li>Click "Select Wallet" to choose your wallet</li>
                          <li>Approve the connection in your wallet</li>
                          <li>You'll be redirected to your dashboard</li>
                        </ol>
                      </div>
                    </motion.div>
                  </TabsContent>
                );
              })}
            </Tabs>
          </CardContent>
        </Card>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-[#90E0EF] text-sm mt-6"
        >
          Powered by Web3 • Secure • Transparent • Decentralized
        </motion.p>
      </motion.div>
    </div>
  );
}

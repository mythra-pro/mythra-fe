"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Wallet, Shield, Zap, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { dummyUsers } from "@/lib/dummy-data";

export default function LoginPage() {
  const router = useRouter();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = (role: string) => {
    setIsConnecting(true);
    // Simulate wallet connection
    setTimeout(() => {
      router.push(`/dashboard/${role}`);
    }, 1500);
  };

  const roleCards = [
    {
      role: "organizer",
      title: "Event Organizer",
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
      title: "Event Staff",
      description: "Check-in attendees, manage event operations",
      icon: Shield,
      color: "from-[#0077B6] to-[#48CAE4]",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#03045E] via-[#0077B6] to-[#0096C7] flex items-center justify-center p-4">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-white/5 rounded-full"
            style={{
              width: Math.random() * 100 + 50,
              height: Math.random() * 100 + 50,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-6xl relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#48CAE4] to-[#90E0EF] flex items-center justify-center">
              <Wallet className="h-8 w-8 text-[#03045E]" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-white">
              Mythra
            </h1>
          </div>
          <p className="text-xl text-[#CAF0F8] max-w-2xl mx-auto">
            Next-Generation Web3 Event Ticketing Platform
          </p>
          <p className="text-[#90E0EF] mt-2">
            Connect your wallet to get started
          </p>
        </motion.div>

        {/* Role Selection Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {roleCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.role}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -10, scale: 1.02 }}
              >
                <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white hover:bg-white/15 transition-all cursor-pointer h-full">
                  <CardHeader>
                    <div
                      className={`h-12 w-12 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center mb-3`}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <CardTitle className="text-xl">{card.title}</CardTitle>
                    <CardDescription className="text-[#CAF0F8]">
                      {card.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      onClick={() => handleConnect(card.role)}
                      disabled={isConnecting}
                      className="w-full bg-white text-[#0077B6] hover:bg-[#CAF0F8] font-semibold"
                    >
                      {isConnecting ? (
                        <span className="flex items-center gap-2">
                          <span className="h-4 w-4 border-2 border-[#0077B6] border-t-transparent rounded-full animate-spin" />
                          Connecting...
                        </span>
                      ) : (
                        "Connect Wallet"
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Admin Access */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-gradient-to-r from-[#03045E]/80 to-[#0077B6]/80 backdrop-blur-lg border-[#48CAE4] text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-[#48CAE4] to-[#90E0EF] flex items-center justify-center">
                    <Shield className="h-6 w-6 text-[#03045E]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">Admin Portal</h3>
                    <p className="text-sm text-[#CAF0F8]">
                      Platform management and oversight
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => handleConnect("admin")}
                  disabled={isConnecting}
                  variant="secondary"
                  className="bg-white text-[#0077B6] hover:bg-[#CAF0F8] font-semibold"
                >
                  {isConnecting ? "Connecting..." : "Admin Login"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 grid gap-4 md:grid-cols-3 text-center"
        >
          <div className="p-4">
            <div className="text-[#48CAE4] text-3xl font-bold mb-2">
              NFT Tickets
            </div>
            <p className="text-[#CAF0F8] text-sm">
              Blockchain-verified event tickets
            </p>
          </div>
          <div className="p-4">
            <div className="text-[#48CAE4] text-3xl font-bold mb-2">
              Crowdfunding
            </div>
            <p className="text-[#CAF0F8] text-sm">B2B campaign financing</p>
          </div>
          <div className="p-4">
            <div className="text-[#48CAE4] text-3xl font-bold mb-2">
              DAO Governance
            </div>
            <p className="text-[#CAF0F8] text-sm">Community-driven decisions</p>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-[#90E0EF] text-sm mt-8"
        >
          Powered by Web3 • Secure • Transparent • Decentralized
        </motion.p>
      </div>
    </div>
  );
}

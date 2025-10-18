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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Image from "next/image";
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
                      <Button
                        onClick={() => handleConnect(card.role)}
                        disabled={isConnecting}
                        className="w-full max-w-xs bg-white text-[#0077B6] hover:bg-[#CAF0F8] font-semibold py-3 cursor-pointer"
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

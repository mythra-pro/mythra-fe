"use client";

import { useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { getMenuSectionsForRole } from "@/app/utils/dashboardMenus";
import { useDashboardUser } from "@/hooks/useDashboardUser";
import { StatCard } from "@/components/stat-card";
import { dummyInvestments, dummyCampaigns } from "@/lib/dummy-data";
import { Target, DollarSign, TrendingUp, Award, Vote } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import Link from "next/link";

// Force dynamic rendering - required for wallet-connected pages
export const dynamic = "force-dynamic";

export default function InvestorDashboard() {
  const user = useDashboardUser("investor");

  useEffect(() => {
    fetch("/api/users/upsert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        walletAddress: user.walletAddress,
        displayName: user.name,
        email: user.email,
      }),
    }).catch((e) => console.error("Failed to upsert user:", e));
  }, [user.walletAddress, user.name, user.email]);
  const myInvestments = dummyInvestments.filter(
    (i) => i.investorId === user.id
  );
  const activeCampaigns = dummyCampaigns.filter((c) => c.status === "active");

  const totalInvested = myInvestments.reduce((sum, i) => sum + i.amount, 0);
  const totalDaoTokens = myInvestments.reduce((sum, i) => sum + i.daoTokens, 0);
  const portfolioValue = totalInvested * 1.15; // Mock 15% return

  // Get menu sections with dynamic voting count
  const pendingVotes = 2; // This could be calculated from actual data
  const menuSections = getMenuSectionsWithCounts("investor", {
    pendingVotes: pendingVotes,
  });

  return (
    <DashboardLayout user={user} menuSections={menuSections}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-[#03045E]">
              Investor Portal
            </h1>
            <p className="text-gray-600 mt-2">
              Support events, earn rewards, and grow your portfolio.
            </p>
          </div>
          <Link href="/dashboard/investor/campaigns">
            <Button className="mt-4 md:mt-0 bg-[#0077B6] hover:bg-[#0096C7] text-white">
              <Target className="mr-2 h-4 w-4" />
              Explore Campaigns
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Invested"
            value={`$${totalInvested.toLocaleString()}`}
            description="Across all campaigns"
            icon={DollarSign}
            delay={0}
          />
          <StatCard
            title="Portfolio Value"
            value={`$${portfolioValue.toLocaleString()}`}
            description="+15% ROI"
            icon={TrendingUp}
            trend={{ value: 15, isPositive: true }}
            delay={0.1}
          />
          <StatCard
            title="DAO Tokens"
            value={totalDaoTokens.toLocaleString()}
            description="Governance power"
            icon={Vote}
            delay={0.2}
          />
          <StatCard
            title="Active Investments"
            value={myInvestments.length}
            description="Campaigns supported"
            icon={Target}
            delay={0.3}
          />
        </div>

        {/* My Investments */}
        <Card className="bg-white/90 border-[#48CAE4] shadow-xl">
          <CardHeader>
            <CardTitle className="text-[#03045E]">My Investments</CardTitle>
            <CardDescription>Your active campaign investments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myInvestments.map((investment, idx) => {
                const campaign = dummyCampaigns.find(
                  (c) => c.id === investment.campaignId
                )!;
                const reward = campaign.rewards.find(
                  (r) => r.id === investment.rewardId
                );

                return (
                  <motion.div
                    key={investment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="bg-gradient-to-r from-white to-[#CAF0F8] border-[#48CAE4]">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-[#03045E] mb-1">
                              {campaign.eventName}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {campaign.title}
                            </p>
                          </div>
                          <Badge className="bg-green-500 text-white">
                            {investment.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="p-2 bg-white rounded-lg">
                            <p className="text-xs text-gray-600">Invested</p>
                            <p className="text-lg font-bold text-[#0077B6]">
                              ${investment.amount}
                            </p>
                          </div>
                          <div className="p-2 bg-white rounded-lg">
                            <p className="text-xs text-gray-600">DAO Tokens</p>
                            <p className="text-lg font-bold text-[#0077B6]">
                              {investment.daoTokens}
                            </p>
                          </div>
                          <div className="p-2 bg-white rounded-lg">
                            <p className="text-xs text-gray-600">Reward Tier</p>
                            <p className="text-sm font-semibold text-[#03045E] truncate">
                              {reward?.title || "N/A"}
                            </p>
                          </div>
                          <div className="p-2 bg-white rounded-lg">
                            <p className="text-xs text-gray-600">Date</p>
                            <p className="text-sm font-semibold text-[#03045E]">
                              {new Date(
                                investment.investedAt
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>

                        {reward && (
                          <div className="mt-3 p-3 bg-gradient-to-r from-[#48CAE4]/20 to-[#90E0EF]/20 rounded-lg border border-[#48CAE4]">
                            <p className="text-xs font-semibold text-[#03045E] mb-1">
                              Reward Benefits:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {reward.benefits.map((benefit, i) => (
                                <Badge
                                  key={i}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {benefit}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Active Campaigns */}
        <Card className="bg-white/80 border-[#48CAE4]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-[#03045E]">
                  Active Campaigns
                </CardTitle>
                <CardDescription>
                  Discover new investment opportunities
                </CardDescription>
              </div>
              <Link href="/dashboard/investor/campaigns">
                <Button
                  variant="outline"
                  className="border-[#0077B6] text-[#0077B6] hover:bg-[#0077B6] hover:text-white"
                >
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
              {activeCampaigns.slice(0, 2).map((campaign, idx) => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  delay={idx * 0.1}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Rewards & Benefits */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-gradient-to-br from-[#0077B6] to-[#0096C7] border-0 text-white">
            <CardContent className="p-6">
              <Award className="h-10 w-10 mb-3" />
              <h3 className="text-2xl font-bold mb-1">
                {myInvestments.length}
              </h3>
              <p className="text-white/90">Rewards Claimed</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#48CAE4] to-[#90E0EF] border-0 text-white">
            <CardContent className="p-6">
              <Vote className="h-10 w-10 mb-3" />
              <h3 className="text-2xl font-bold mb-1">{totalDaoTokens}</h3>
              <p className="text-white/90">Voting Power</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#0096C7] to-[#48CAE4] border-0 text-white">
            <CardContent className="p-6">
              <TrendingUp className="h-10 w-10 mb-3" />
              <h3 className="text-2xl font-bold mb-1">15%</h3>
              <p className="text-white/90">Average ROI</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-white/80 border-[#48CAE4]">
          <CardHeader>
            <CardTitle className="text-[#03045E]">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <Link href="/dashboard/investor/campaigns">
              <Button
                variant="outline"
                className="w-full h-20 border-[#0077B6] hover:bg-[#0077B6] hover:text-white"
              >
                <div className="text-center">
                  <Target className="h-6 w-6 mx-auto mb-2" />
                  <span>Browse Campaigns</span>
                </div>
              </Button>
            </Link>
            <Link href="/dashboard/investor/voting">
              <Button
                variant="outline"
                className="w-full h-20 border-[#0077B6] hover:bg-[#0077B6] hover:text-white"
              >
                <div className="text-center">
                  <Vote className="h-6 w-6 mx-auto mb-2" />
                  <span>Vote on Proposals</span>
                </div>
              </Button>
            </Link>
            <Link href="/dashboard/investor/portfolio">
              <Button
                variant="outline"
                className="w-full h-20 border-[#0077B6] hover:bg-[#0077B6] hover:text-white"
              >
                <div className="text-center">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2" />
                  <span>View Portfolio</span>
                </div>
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

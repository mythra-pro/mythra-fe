"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { getMenuSectionsForRole } from "@/app/utils/dashboardMenus";
import { CampaignCard } from "@/components/campaign-card";
import { useDashboardUser } from "@/hooks/useDashboardUser";
import { Target, DollarSign, TrendingUp, Award } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

// Force dynamic rendering - required for wallet-connected pages
export const dynamic = "force-dynamic";

export default function CustomerInvestmentsPage() {
  const { user, isLoading: userLoading } = useDashboardUser("customer");
  const [investments, setInvestments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userLoading || !user) return;
    fetchInvestments();
  }, [userLoading, user]);

  const fetchInvestments = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/investments?investorId=${user?.id}`);
      const data = await res.json();
      setInvestments(data.investments || []);
    } catch (err) {
      console.error("Error fetching investments:", err);
    } finally {
      setLoading(false);
    }
  };
  
  // Loading state - render AFTER all hooks
  if (userLoading || !user || loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  // Compute values after user is loaded
  const myInvestments = investments;
  const availableCampaigns: any[] = []; // No campaigns feature yet

  const totalInvested = myInvestments.reduce((sum, i) => sum + parseFloat(i.amount_sol || 0), 0);
  const totalDaoTokens = 0; // TODO: Calculate from investments

  // Get menu sections for customer role
  const menuSections = getMenuSectionsForRole("customer");

  return (
    <DashboardLayout user={user} menuSections={menuSections}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-[#03045E]">
            Investment Opportunities 💰
          </h1>
          <p className="text-gray-600 mt-2">
            Support upcoming events and earn rewards through our crowdfunding
            campaigns.
          </p>
        </div>

        {/* Investment Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-gradient-to-r from-[#0077B6] to-[#0096C7] text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Invested</p>
                  <p className="text-3xl font-bold">${totalInvested}</p>
                </div>
                <DollarSign className="h-10 w-10 opacity-75" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-[#48CAE4] to-[#90E0EF] text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">DAO Tokens</p>
                  <p className="text-3xl font-bold">{totalDaoTokens}</p>
                </div>
                <Award className="h-10 w-10 opacity-75" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Active Investments</p>
                  <p className="text-3xl font-bold">{myInvestments.length}</p>
                </div>
                <Target className="h-10 w-10 opacity-75" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Avg. ROI</p>
                  <p className="text-3xl font-bold">15%</p>
                </div>
                <TrendingUp className="h-10 w-10 opacity-75" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* My Investments */}
        {myInvestments.length > 0 && (
          <Card className="bg-white/90 border-[#48CAE4] shadow-xl">
            <CardHeader>
              <CardTitle className="text-[#03045E]">My Investments</CardTitle>
              <CardDescription>
                Your current investment portfolio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {myInvestments.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Target className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-semibold">No Investments Yet</p>
                    <p className="text-sm">Start investing to support events</p>
                  </div>
                ) : (
                  myInvestments.map((investment, idx) => (
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
                                Investment #{investment.id.slice(0, 8)}
                              </h3>
                              <p className="text-sm text-gray-600">
                                Event Investment
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
                                {investment.amount_sol} SOL
                              </p>
                            </div>
                            <div className="p-2 bg-white rounded-lg">
                              <p className="text-xs text-gray-600">
                                DAO Tokens
                              </p>
                              <p className="text-lg font-bold text-[#0077B6]">
                                {investment.daoTokens}
                              </p>
                            </div>
                            <div className="p-2 bg-white rounded-lg">
                              <p className="text-xs text-gray-600">
                                Status
                              </p>
                              <p className="text-sm font-semibold text-[#03045E] truncate">
                                {investment.status}
                              </p>
                            </div>
                            <div className="p-2 bg-white rounded-lg">
                              <p className="text-xs text-gray-600">Date</p>
                              <p className="text-sm font-semibold text-[#03045E]">
                                {new Date(
                                  investment.investment_date
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Available Campaigns */}
        <Card className="bg-white/80 border-[#48CAE4]">
          <CardHeader>
            <CardTitle className="text-[#03045E]">
              Available Investment Campaigns
            </CardTitle>
            <CardDescription>
              Support these events and earn rewards
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              {availableCampaigns.slice(0, 4).map((campaign, idx) => (
                <CampaignCard
                  key={campaign.id}
                  campaign={campaign}
                  delay={idx * 0.1}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Investment Guide */}
        <Card className="bg-gradient-to-r from-[#90E0EF] to-[#CAF0F8] border-[#48CAE4]">
          <CardHeader>
            <CardTitle className="text-[#03045E]">
              💡 Investment Guide
            </CardTitle>
            <CardDescription>
              How to get started with event investments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-8 w-8 rounded-full bg-[#0077B6] text-white flex items-center justify-center text-sm font-bold">
                    1
                  </div>
                  <h4 className="font-semibold text-[#03045E]">
                    Choose Campaign
                  </h4>
                </div>
                <p className="text-sm text-gray-700">
                  Browse active campaigns and research event organizers, past
                  performance, and projected returns.
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-8 w-8 rounded-full bg-[#0077B6] text-white flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  <h4 className="font-semibold text-[#03045E]">
                    Select Reward Tier
                  </h4>
                </div>
                <p className="text-sm text-gray-700">
                  Choose investment amount and reward tier. Higher tiers offer
                  better benefits and more DAO tokens.
                </p>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-8 w-8 rounded-full bg-[#0077B6] text-white flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  <h4 className="font-semibold text-[#03045E]">Earn Rewards</h4>
                </div>
                <p className="text-sm text-gray-700">
                  Receive DAO tokens, event access, and profit sharing when
                  campaigns succeed.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

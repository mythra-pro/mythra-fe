"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { RoleSidebar } from "@/components/role-sidebar";
import { StatCard } from "@/components/stat-card";
import { dummyUsers, dummyInvestments, dummyCampaigns } from "@/lib/dummy-data";
import {
  TrendingUp,
  DollarSign,
  Target,
  Award,
  PieChart,
  BarChart3,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

export default function InvestorPortfolioPage() {
  const user = dummyUsers.find((u) => u.role === "investor")!;
  const myInvestments = dummyInvestments.filter(
    (i) => i.investorId === user.id
  );

  const totalInvested = myInvestments.reduce((sum, i) => sum + i.amount, 0);
  const portfolioValue = totalInvested * 1.15; // Mock 15% return
  const totalProfit = portfolioValue - totalInvested;
  const profitPercentage = ((totalProfit / totalInvested) * 100).toFixed(1);

  // Group investments by status
  const activeInvestments = myInvestments.filter((i) => i.status === "active");
  const completedInvestments = myInvestments.filter(
    (i) => i.status === "refunded"
  );

  // Mock portfolio allocation data
  const portfolioAllocation = [
    {
      category: "Technology",
      amount: 3500,
      percentage: 35,
      color: "bg-blue-500",
    },
    {
      category: "Entertainment",
      amount: 2800,
      percentage: 28,
      color: "bg-purple-500",
    },
    {
      category: "Education",
      amount: 2200,
      percentage: 22,
      color: "bg-green-500",
    },
    {
      category: "Sports",
      amount: 1500,
      percentage: 15,
      color: "bg-orange-500",
    },
  ];

  return (
    <DashboardLayout user={user} sidebar={<RoleSidebar role="investor" />}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-[#03045E]">
            Investment Portfolio 📈
          </h1>
          <p className="text-gray-600 mt-2">
            Track your investment performance and portfolio allocation.
          </p>
        </div>

        {/* Portfolio Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Invested"
            value={`$${totalInvested.toLocaleString()}`}
            description="Principal amount"
            icon={DollarSign}
            delay={0}
          />
          <StatCard
            title="Portfolio Value"
            value={`$${portfolioValue.toLocaleString()}`}
            description="Current worth"
            icon={TrendingUp}
            trend={{ value: 15, isPositive: true }}
            delay={0.1}
          />
          <StatCard
            title="Total Profit"
            value={`$${totalProfit.toLocaleString()}`}
            description={`+${profitPercentage}% ROI`}
            icon={Award}
            trend={{ value: parseFloat(profitPercentage), isPositive: true }}
            delay={0.2}
          />
          <StatCard
            title="Active Investments"
            value={activeInvestments.length}
            description="Ongoing campaigns"
            icon={Target}
            delay={0.3}
          />
        </div>

        {/* Portfolio Performance Chart */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-white/90 border-[#48CAE4] shadow-xl">
            <CardHeader>
              <CardTitle className="text-[#03045E] flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Portfolio Performance
              </CardTitle>
              <CardDescription>Investment value over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gradient-to-br from-[#CAF0F8] to-white rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-16 w-16 mx-auto text-[#0077B6] mb-4" />
                  <p className="text-lg font-semibold text-[#03045E] mb-2">
                    Performance Chart
                  </p>
                  <p className="text-gray-600">
                    Interactive chart showing portfolio growth
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 border-[#48CAE4] shadow-xl">
            <CardHeader>
              <CardTitle className="text-[#03045E] flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Asset Allocation
              </CardTitle>
              <CardDescription>
                Investment distribution by category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {portfolioAllocation.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className={`w-4 h-4 rounded-full ${item.color}`} />
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-[#03045E]">
                          {item.category}
                        </span>
                        <span className="text-gray-600">
                          ${item.amount.toLocaleString()}
                        </span>
                      </div>
                      <Progress value={item.percentage} className="h-2" />
                    </div>
                    <span className="text-sm font-semibold text-[#0077B6] w-12 text-right">
                      {item.percentage}%
                    </span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Investment Details */}
        <Card className="bg-white/90 border-[#48CAE4] shadow-xl">
          <CardHeader>
            <CardTitle className="text-[#03045E]">Investment Details</CardTitle>
            <CardDescription>
              Breakdown of your investment portfolio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myInvestments.map((investment, idx) => {
                const campaign = dummyCampaigns.find(
                  (c) => c.id === investment.campaignId
                )!;
                const currentValue = investment.amount * 1.15; // Mock 15% growth
                const profit = currentValue - investment.amount;
                const profitPercent = (
                  (profit / investment.amount) *
                  100
                ).toFixed(1);

                return (
                  <motion.div
                    key={investment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="bg-gradient-to-r from-white to-[#CAF0F8] border-[#48CAE4]">
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="text-lg font-bold text-[#03045E]">
                                {campaign.eventName}
                              </h3>
                              <Badge
                                className={
                                  investment.status === "active"
                                    ? "bg-blue-500 text-white"
                                    : investment.status === "refunded"
                                    ? "bg-green-500 text-white"
                                    : "bg-gray-500 text-white"
                                }
                              >
                                {investment.status}
                              </Badge>
                            </div>
                            <p className="text-gray-600 mb-3">
                              {campaign.title}
                            </p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              <div className="p-3 bg-white rounded-lg">
                                <p className="text-xs text-gray-600">
                                  Invested
                                </p>
                                <p className="text-lg font-bold text-[#0077B6]">
                                  ${investment.amount}
                                </p>
                              </div>
                              <div className="p-3 bg-white rounded-lg">
                                <p className="text-xs text-gray-600">
                                  Current Value
                                </p>
                                <p className="text-lg font-bold text-[#0077B6]">
                                  ${currentValue.toFixed(0)}
                                </p>
                              </div>
                              <div className="p-3 bg-white rounded-lg">
                                <p className="text-xs text-gray-600">
                                  Profit/Loss
                                </p>
                                <p
                                  className={`text-lg font-bold ${
                                    profit >= 0
                                      ? "text-green-500"
                                      : "text-red-500"
                                  }`}
                                >
                                  ${profit.toFixed(0)}
                                </p>
                              </div>
                              <div className="p-3 bg-white rounded-lg">
                                <p className="text-xs text-gray-600">ROI</p>
                                <p
                                  className={`text-lg font-bold ${
                                    profit >= 0
                                      ? "text-green-500"
                                      : "text-red-500"
                                  }`}
                                >
                                  {profitPercent}%
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="lg:w-32 text-right">
                            <p className="text-sm text-gray-600 mb-1">
                              DAO Tokens
                            </p>
                            <p className="text-2xl font-bold text-[#0077B6]">
                              {investment.daoTokens}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(
                                investment.investedAt
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Investment Insights */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-gradient-to-br from-[#0077B6] to-[#0096C7] text-white">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Best Performing</h3>
              <p className="text-2xl font-bold">Technology</p>
              <p className="text-sm opacity-90 mt-2">+22.5% average return</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-[#48CAE4] to-[#90E0EF] text-white">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">
                Portfolio Diversity
              </h3>
              <p className="text-2xl font-bold">8.5/10</p>
              <p className="text-sm opacity-90 mt-2">Well diversified</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-[#0096C7] to-[#48CAE4] text-white">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Risk Score</h3>
              <p className="text-2xl font-bold">Medium</p>
              <p className="text-sm opacity-90 mt-2">Balanced risk profile</p>
            </CardContent>
          </Card>
        </div>

        {/* Investment Tips */}
        <Card className="bg-gradient-to-r from-[#90E0EF] to-[#CAF0F8] border-[#48CAE4]">
          <CardHeader>
            <CardTitle className="text-[#03045E]">
              💡 Portfolio Optimization Tips
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="font-semibold text-[#03045E] mb-2">
                  Diversification
                </h4>
                <p className="text-sm text-gray-700">
                  Consider investing in more entertainment and sports events to
                  balance your tech-heavy portfolio.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-[#03045E] mb-2">Timing</h4>
                <p className="text-sm text-gray-700">
                  Q4 historically shows higher returns. Consider increasing
                  investments during this period.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-[#03045E] mb-2">
                  Risk Management
                </h4>
                <p className="text-sm text-gray-700">
                  Your current portfolio has moderate risk. Consider some
                  low-risk educational events for stability.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-[#03045E] mb-2">
                  Growth Opportunity
                </h4>
                <p className="text-sm text-gray-700">
                  Gaming events are emerging as high-growth opportunities with
                  potential for significant returns.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

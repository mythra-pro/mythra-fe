"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { getMenuSectionsForRole } from "@/app/utils/dashboardMenus";
import { StatCard } from "@/components/stat-card";
import { useDashboardUser } from "@/hooks/useDashboardUser";
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

// Force dynamic rendering - required for wallet-connected pages
export const dynamic = "force-dynamic";

export default function InvestorPortfolioPage() {
  const { user, isLoading: userLoading } = useDashboardUser("investor");
  const [investments, setInvestments] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userLoading || !user) return;
    fetchPortfolioData();
  }, [userLoading, user]);

  const fetchPortfolioData = async () => {
    try {
      setLoading(true);
      
      // Fetch user's investments
      const investmentsRes = await fetch(`/api/investments?investorId=${user?.id}`);
      const investmentsData = await investmentsRes.json();
      setInvestments(investmentsData.investments || []);
      
      // Fetch events for those investments
      if (investmentsData.investments && investmentsData.investments.length > 0) {
        const eventIds = [...new Set(investmentsData.investments.map((inv: any) => inv.event_id))];
        const eventsPromises = eventIds.map(id => fetch(`/api/events/${id}`).then(r => r.json()));
        const eventsData = await Promise.all(eventsPromises);
        setEvents(eventsData.map(d => d.event).filter(Boolean));
      }
      
    } catch (err) {
      console.error("Error fetching portfolio data:", err);
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
  const totalInvested = myInvestments.reduce((sum, i) => sum + parseFloat(i.amount_sol || 0), 0);
  const portfolioValue = totalInvested; // Real value from blockchain
  const totalProfit = 0; // TODO: Calculate from event outcomes
  const profitPercentage = "0.0";

  // Group investments by status
  const activeInvestments = myInvestments.filter((i) => i.status === "confirmed");
  const completedInvestments = myInvestments.filter((i) => i.status === "completed");

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

  // Get menu sections for investor role

  const menuSections = getMenuSectionsForRole("investor");

  return (
    <DashboardLayout user={user} menuSections={menuSections}>
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
              {myInvestments.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Target className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-semibold">No Investments Yet</p>
                  <p className="text-sm">Start investing in events to build your portfolio</p>
                </div>
              ) : (
                myInvestments.map((investment, idx) => {
                const event = events.find((e) => e.id === investment.event_id);
                const currentValue = parseFloat(investment.amount_sol || 0); // Real value
                const profit = 0; // TODO: Calculate from event outcomes
                const profitPercent = "0.0";

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
                                {event?.name || "Event"}
                              </h3>
                              <Badge
                                className={
                                  investment.status === "confirmed"
                                    ? "bg-blue-500 text-white"
                                    : investment.status === "completed"
                                    ? "bg-green-500 text-white"
                                    : "bg-gray-500 text-white"
                                }
                              >
                                {investment.status}
                              </Badge>
                            </div>
                            <p className="text-gray-600 mb-3">
                              {event?.description || "Investment in event"}
                            </p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              <div className="p-3 bg-white rounded-lg">
                                <p className="text-xs text-gray-600">
                                  Invested
                                </p>
                                <p className="text-lg font-bold text-[#0077B6]">
                                  {investment.amount_sol} SOL
                                </p>
                              </div>
                              <div className="p-3 bg-white rounded-lg">
                                <p className="text-xs text-gray-600">
                                  Current Value
                                </p>
                                <p className="text-lg font-bold text-[#0077B6]">
                                  {currentValue.toFixed(2)} SOL
                                </p>
                              </div>
                              <div className="p-3 bg-white rounded-lg">
                                <p className="text-xs text-gray-600">
                                  Profit/Loss
                                </p>
                                <p className="text-lg font-bold text-gray-500">
                                  {profit.toFixed(2)} SOL
                                </p>
                              </div>
                              <div className="p-3 bg-white rounded-lg">
                                <p className="text-xs text-gray-600">ROI</p>
                                <p className="text-lg font-bold text-gray-500">
                                  {profitPercent}%
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="lg:w-32 text-right">
                            <p className="text-sm text-gray-600 mb-1">
                              Status
                            </p>
                            <p className="text-2xl font-bold text-[#0077B6]">
                              {investment.status}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(
                                investment.investment_date
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
              )}
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

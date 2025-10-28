"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { getMenuSectionsForRole } from "@/app/utils/dashboardMenus";
import { useDashboardUser } from "@/hooks/useDashboardUser";
import {
  TrendingUp,
  BarChart3,
  Users,
  DollarSign,
  Calendar,
  PieChart,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatCard } from "@/components/stat-card";

// Force dynamic rendering - required for wallet-connected pages
export const dynamic = "force-dynamic";

export default function AdminAnalyticsPage() {
  const { user, isLoading } = useDashboardUser("admin");
  
  // Show loading state
  if (isLoading || !user) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  // Mock analytics data
  const analyticsData = {
    totalUsers: 15420,
    totalEvents: 1847,
    totalRevenue: 2450000,
    userGrowth: 18.2,
    eventGrowth: 23.4,
    revenueGrowth: 31.5,
    categoryBreakdown: [
      { name: "Technology", value: 35, amount: 857500 },
      { name: "Entertainment", value: 28, amount: 686000 },
      { name: "Education", value: 22, amount: 539000 },
      { name: "Sports", value: 15, amount: 367500 },
    ],
    monthlyStats: [
      { month: "Jan", users: 1200, events: 145, revenue: 185000 },
      { month: "Feb", users: 1350, events: 162, revenue: 208000 },
      { month: "Mar", users: 1480, events: 178, revenue: 230000 },
      { month: "Apr", users: 1620, events: 195, revenue: 251000 },
      { month: "May", users: 1750, events: 212, revenue: 275000 },
      { month: "Jun", users: 1890, events: 228, revenue: 298000 },
    ],
  };

  // Get menu sections for admin role
  const menuSections = getMenuSectionsForRole("admin");

  return (
    <DashboardLayout user={user} menuSections={menuSections}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-[#03045E]">
            Platform Analytics
          </h1>
          <p className="text-gray-600 mt-2">
            Comprehensive insights and performance metrics for the entire
            platform.
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Total Users"
            value={analyticsData.totalUsers.toLocaleString()}
            description="Platform-wide"
            icon={Users}
            trend={{ value: analyticsData.userGrowth, isPositive: true }}
            delay={0}
          />
          <StatCard
            title="Total Events"
            value={analyticsData.totalEvents.toLocaleString()}
            description="All time"
            icon={Calendar}
            trend={{ value: analyticsData.eventGrowth, isPositive: true }}
            delay={0.1}
          />
          <StatCard
            title="Total Revenue"
            value={`$${(analyticsData.totalRevenue / 1000000).toFixed(1)}M`}
            description="Total platform revenue"
            icon={DollarSign}
            trend={{ value: analyticsData.revenueGrowth, isPositive: true }}
            delay={0.2}
          />
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Revenue Trends */}
          <Card className="bg-white/90 border-[#48CAE4] shadow-xl">
            <CardHeader>
              <CardTitle className="text-[#03045E] flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Revenue Trends
              </CardTitle>
              <CardDescription>
                Monthly revenue growth over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center bg-gradient-to-br from-[#CAF0F8] to-white rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-16 w-16 mx-auto text-[#0077B6] mb-4" />
                  <p className="text-lg font-semibold text-[#03045E] mb-2">
                    Revenue Chart
                  </p>
                  <p className="text-gray-600 mb-4">
                    Interactive chart showing monthly revenue
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {analyticsData.monthlyStats.slice(-3).map((stat, idx) => (
                      <div
                        key={idx}
                        className="p-2 bg-[#0077B6] text-white rounded"
                      >
                        <p className="font-semibold">{stat.month}</p>
                        <p>${(stat.revenue / 1000).toFixed(0)}K</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Growth */}
          <Card className="bg-white/90 border-[#48CAE4] shadow-xl">
            <CardHeader>
              <CardTitle className="text-[#03045E] flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Growth
              </CardTitle>
              <CardDescription>
                User acquisition and retention metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80 flex items-center justify-center bg-gradient-to-br from-[#90E0EF] to-white rounded-lg">
                <div className="text-center">
                  <Users className="h-16 w-16 mx-auto text-[#0077B6] mb-4" />
                  <p className="text-lg font-semibold text-[#03045E] mb-2">
                    User Growth Chart
                  </p>
                  <p className="text-gray-600 mb-4">
                    Monthly user acquisition trends
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    {analyticsData.monthlyStats.slice(-3).map((stat, idx) => (
                      <div
                        key={idx}
                        className="p-2 bg-[#48CAE4] text-white rounded"
                      >
                        <p className="font-semibold">{stat.month}</p>
                        <p>{stat.users.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Performance */}
        <Card className="bg-white/90 border-[#48CAE4] shadow-xl">
          <CardHeader>
            <CardTitle className="text-[#03045E] flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Category Performance
            </CardTitle>
            <CardDescription>
              Revenue breakdown by event category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-4">
                {analyticsData.categoryBreakdown.map((category, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-white to-[#CAF0F8] rounded-lg border border-[#48CAE4]"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full bg-[#0077B6]`}
                        style={{ opacity: 1 - idx * 0.2 }}
                      />
                      <div>
                        <p className="font-semibold text-[#03045E]">
                          {category.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {category.value}% of total
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-[#0077B6]">
                        ${(category.amount / 1000).toFixed(0)}K
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <PieChart className="h-24 w-24 mx-auto text-[#0077B6] mb-4" />
                  <p className="text-lg font-semibold text-[#03045E] mb-2">
                    Category Distribution
                  </p>
                  <p className="text-gray-600">
                    Visual representation of revenue by category
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Platform Health Metrics */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-gradient-to-br from-[#0077B6] to-[#0096C7] text-white">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Active Users (30d)</h3>
              <p className="text-3xl font-bold">12,847</p>
              <p className="text-sm opacity-90 mt-2">83% of total users</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-[#48CAE4] to-[#90E0EF] text-white">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Event Success Rate</h3>
              <p className="text-3xl font-bold">94.5%</p>
              <p className="text-sm opacity-90 mt-2">
                Events completed successfully
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-[#0096C7] to-[#48CAE4] text-white">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Average Event Size</h3>
              <p className="text-3xl font-bold">147</p>
              <p className="text-sm opacity-90 mt-2">Attendees per event</p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Analytics Table */}
        <Card className="bg-white/90 border-[#48CAE4] shadow-xl">
          <CardHeader>
            <CardTitle className="text-[#03045E]">
              Monthly Performance
            </CardTitle>
            <CardDescription>
              Detailed breakdown of key metrics by month
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left p-3 font-semibold text-[#03045E]">
                      Month
                    </th>
                    <th className="text-left p-3 font-semibold text-[#03045E]">
                      New Users
                    </th>
                    <th className="text-left p-3 font-semibold text-[#03045E]">
                      Events
                    </th>
                    <th className="text-left p-3 font-semibold text-[#03045E]">
                      Revenue
                    </th>
                    <th className="text-left p-3 font-semibold text-[#03045E]">
                      Growth
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.monthlyStats.map((stat, idx) => {
                    const prevRevenue =
                      idx > 0
                        ? analyticsData.monthlyStats[idx - 1].revenue
                        : stat.revenue;
                    const growth = (
                      ((stat.revenue - prevRevenue) / prevRevenue) *
                      100
                    ).toFixed(1);

                    return (
                      <tr
                        key={idx}
                        className="border-b border-gray-100 hover:bg-[#CAF0F8]/30"
                      >
                        <td className="p-3 font-medium text-[#03045E]">
                          {stat.month} 2024
                        </td>
                        <td className="p-3 text-gray-700">
                          {stat.users.toLocaleString()}
                        </td>
                        <td className="p-3 text-gray-700">{stat.events}</td>
                        <td className="p-3 text-gray-700">
                          ${stat.revenue.toLocaleString()}
                        </td>
                        <td className="p-3">
                          <span
                            className={`font-semibold ${
                              idx > 0 && parseFloat(growth) > 0
                                ? "text-green-500"
                                : "text-gray-500"
                            }`}
                          >
                            {idx > 0 ? `+${growth}%` : "-"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Key Insights */}
        <Card className="bg-gradient-to-r from-[#90E0EF] to-[#CAF0F8] border-[#48CAE4]">
          <CardHeader>
            <CardTitle className="text-[#03045E]">💡 Key Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="font-semibold text-[#03045E] mb-2">
                  Growth Trends
                </h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>
                    • User growth accelerating with 18.2% month-over-month
                    increase
                  </li>
                  <li>
                    • Technology events driving the highest revenue per category
                  </li>
                  <li>
                    • Platform adoption rate increased by 34% in the last
                    quarter
                  </li>
                  <li>
                    • Mobile user engagement up 42% compared to last period
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-[#03045E] mb-2">
                  Optimization Opportunities
                </h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>
                    • Sports category shows potential for growth (only 15%
                    share)
                  </li>
                  <li>• Consider reducing platform fees for new organizers</li>
                  <li>
                    • International expansion could drive 25%+ revenue growth
                  </li>
                  <li>
                    • Enhanced mobile features could improve retention by 15%
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

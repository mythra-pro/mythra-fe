"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { getMenuSectionsForRole } from "@/app/utils/dashboardMenus";
import { useDashboardUser } from "@/hooks/useDashboardUser";
import { StatCard } from "@/components/stat-card";
import {
  Calendar,
  Users,
  DollarSign,
  ShieldCheck,
  TrendingUp,
  Database,
  Ticket,
} from "lucide-react";
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

export default function AdminDashboard() {
  const { user, isLoading: userLoading } = useDashboardUser("admin");
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Upsert user
  useEffect(() => {
    if (!user) return;
    
    fetch("/api/users/upsert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        walletAddress: user.walletAddress,
        displayName: user.displayName,
        email: user.email,
      }),
    }).catch((e) => console.error("Failed to upsert user:", e));
  }, [user]);

  // Fetch admin stats
  useEffect(() => {
    setLoading(true);
    fetch('/api/stats/admin')
      .then((res) => res.json())
      .then((data) => {
        setStats(data.stats);
      })
      .catch((e) => console.error("Failed to fetch stats:", e))
      .finally(() => setLoading(false));
  }, []);

  // Get menu sections
  const menuSections = getMenuSectionsForRole("admin");

  // Loading state - render AFTER all hooks
  if (userLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  // Compute values after user is loaded
  const pendingApprovals = stats?.pendingApprovals || 0;
  const totalRevenue = stats?.totalRevenue || 0;
  const totalPoolBalance = 0; // TODO: Add pool balance to stats API

  return (
    <DashboardLayout user={user} menuSections={menuSections}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-[#03045E]">
            Admin Control Panel
          </h1>
          <p className="text-gray-600 mt-2">
            Manage platform operations, events, and users.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 auto-rows-fr">
          <StatCard
            title="Total Events"
            value={stats?.totalEvents || 0}
            description="Platform-wide"
            icon={Calendar}
            delay={0}
          />
          <StatCard
            title="Total Users"
            value={stats?.totalUsers || 0}
            description="Registered users"
            icon={Users}
            trend={{ value: 18.2, isPositive: true }}
            delay={0.1}
          />
          <StatCard
            title="Platform Revenue"
            value={`${totalRevenue.toFixed(2)} SOL`}
            description="Total platform revenue"
            icon={DollarSign}
            trend={{ value: 25.4, isPositive: true }}
            delay={0.2}
          />
          <StatCard
            title="Pending Approvals"
            value={pendingApprovals}
            description="Events awaiting review"
            icon={ShieldCheck}
            delay={0.3}
          />
        </div>

        {/* Pending Approvals */}
        <Card className="bg-white/90 border-[#48CAE4] shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-[#03045E] flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5" />
                  Pending Event Approvals
                </CardTitle>
                <CardDescription>
                  Events waiting for admin review
                </CardDescription>
              </div>
              <Link href="/dashboard/admin/approvals">
                <Button className="bg-[#0077B6] hover:bg-[#0096C7] text-white">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingApprovals > 0 ? (
                <div className="p-8 text-center">
                  <Badge className="bg-yellow-500 text-white mb-4">
                    {pendingApprovals} Pending
                  </Badge>
                  <p className="text-gray-600">
                    You have {pendingApprovals} event{pendingApprovals !== 1 ? 's' : ''} awaiting approval.
                  </p>
                  <Link href="/dashboard/admin/approvals">
                    <Button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">
                      Review Now
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="p-8 text-center">
                  <ShieldCheck className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No pending approvals</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Platform Analytics */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="bg-white/80 border-[#48CAE4]">
            <CardHeader>
              <CardTitle className="text-[#03045E] flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Revenue Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-[#CAF0F8] to-white rounded-lg">
                  <span className="font-medium text-[#03045E]">
                    Total Revenue
                  </span>
                  <span className="text-xl font-bold text-[#0077B6]">
                    {totalRevenue.toFixed(2)} SOL
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-[#48CAE4] to-white rounded-lg">
                  <span className="font-medium text-[#03045E]">
                    Organizer Share
                  </span>
                  <span className="text-xl font-bold text-[#0077B6]">
                    {totalRevenue.toFixed(2)} SOL
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 border-[#48CAE4]">
            <CardHeader>
              <CardTitle className="text-[#03045E] flex items-center gap-2">
                <Database className="h-5 w-5" />
                Pool Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-br from-[#0077B6] to-[#0096C7] rounded-lg text-white">
                  <p className="text-sm opacity-90 mb-1">Total Pool Balance</p>
                  <p className="text-3xl font-bold">
                    {totalPoolBalance.toFixed(2)} SOL
                  </p>
                  <p className="text-xs opacity-75 mt-2">
                    Across {stats?.totalEvents || 0} events
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gradient-to-br from-[#CAF0F8] to-white rounded-lg border border-[#48CAE4]">
                    <p className="text-xs text-gray-600 mb-1">Locked Funds</p>
                    <p className="text-lg font-bold text-[#03045E]">
                      {(totalPoolBalance * 0.7).toFixed(2)} SOL
                      ${(totalPoolBalance * 0.7).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-[#90E0EF] to-white rounded-lg border border-[#48CAE4]">
                    <p className="text-xs text-gray-600 mb-1">Available</p>
                    <p className="text-lg font-bold text-[#03045E]">
                      ${(totalPoolBalance * 0.3).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-white/80 border-[#48CAE4]">
          <CardHeader>
            <CardTitle className="text-[#03045E]">Admin Actions</CardTitle>
            <CardDescription>
              Quick access to administrative functions
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-4">
            <Link href="/dashboard/admin/enable-selling">
              <Button
                variant="outline"
                className="w-full h-20 border-green-600 hover:bg-green-600 hover:text-white transition-all"
              >
                <div className="text-center">
                  <Ticket className="h-6 w-6 mx-auto mb-2" />
                  <span className="font-semibold">Enable Ticket Selling</span>
                </div>
              </Button>
            </Link>
            <Link href="/dashboard/admin/events">
              <Button
                variant="outline"
                className="w-full h-20 border-[#0077B6] hover:bg-[#0077B6] hover:text-white"
              >
                <div className="text-center">
                  <Calendar className="h-6 w-6 mx-auto mb-2" />
                  <span>Manage Events</span>
                </div>
              </Button>
            </Link>
            <Link href="/dashboard/admin/users">
              <Button
                variant="outline"
                className="w-full h-20 border-[#0077B6] hover:bg-[#0077B6] hover:text-white"
              >
                <div className="text-center">
                  <Users className="h-6 w-6 mx-auto mb-2" />
                  <span>User Management</span>
                </div>
              </Button>
            </Link>
            <Link href="/dashboard/admin/transactions">
              <Button
                variant="outline"
                className="w-full h-20 border-[#0077B6] hover:bg-[#0077B6] hover:text-white"
              >
                <div className="text-center">
                  <DollarSign className="h-6 w-6 mx-auto mb-2" />
                  <span>Transactions</span>
                </div>
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

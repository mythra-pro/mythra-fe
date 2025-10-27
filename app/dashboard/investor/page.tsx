"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { getMenuSectionsForRole } from "@/app/utils/dashboardMenus";
import { useDashboardUser } from "@/hooks/useDashboardUser";
import { StatCard } from "@/components/stat-card";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import Link from "next/link";

// Force dynamic rendering - required for wallet-connected pages
export const dynamic = "force-dynamic";

interface Event {
  id: string;
  title: string;
  description: string;
  category: string;
  start_date: string;
  end_date: string;
  location: string;
  min_ticket_price: number;
  event_image: string;
  status: string;
  target_investment: number;
  current_investment: number;
  target_roi: number;
  token_name: string;
  token_symbol: string;
  organizer: {
    id: string;
    display_name: string;
    wallet_address: string;
  };
}

export default function InvestorDashboard() {
  const user = useDashboardUser("investor");
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [investingEventId, setInvestingEventId] = useState<string | null>(null);
  const [investAmount, setInvestAmount] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  // Get menu sections
  const menuSections = getMenuSectionsForRole("investor");

  // Fetch publishable events
  useEffect(() => {
    console.log("📋 Fetching publishable events for investor...");
    setLoading(true);
    fetch("/api/investor/events")
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ Events fetched:", data.events?.length || 0);
        setEvents(data.events || []);
      })
      .catch((e) => {
        console.error("❌ Failed to fetch events:", e);
        alert("Failed to load events: " + e.message);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleInvest = async (eventId: string) => {
    if (!investAmount || parseFloat(investAmount) <= 0) {
      alert("Please enter a valid investment amount");
      return;
    }

    const amountInSOL = parseFloat(investAmount);
    setSubmitting(true);

    try {
      console.log("💰 Submitting investment...");
      console.log("   Event ID:", eventId);
      console.log("   Investor ID:", user.id);
      console.log("   Amount:", amountInSOL, "SOL");

      const response = await fetch("/api/investor/invest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          investorId: user.id,
          amountInSOL,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Investment failed");
      }

      console.log("✅ Investment successful:", data.investment);

      alert(
        `✅ Investment Successful!\n\n` +
          `Amount: ${amountInSOL} SOL\n` +
          `USD Value: $${data.investment.amountInUSD}\n` +
          `Status: ${data.investment.status}\n\n` +
          `Investment ID: ${data.investment.id}`
      );

      // Reset form
      setInvestAmount("");
      setInvestingEventId(null);

      // Refresh events list
      fetch("/api/investor/events")
        .then((res) => res.json())
        .then((data) => setEvents(data.events || []));
    } catch (e: any) {
      console.error("❌ Investment error:", e);
      alert("Investment failed: " + e.message);
    } finally {
      setSubmitting(false);
    }
  };

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
            title="Available Events"
            value={events.length.toString()}
            description="Published events"
            icon={Target}
            delay={0}
          />
          <StatCard
            title="Total Investment Pool"
            value={`${events
              .reduce((sum, e) => sum + (e.target_investment || 0), 0)
              .toLocaleString()} SOL`}
            description="Across all events"
            icon={DollarSign}
            delay={0.1}
          />
          <StatCard
            title="Active Opportunities"
            value={events
              .filter(
                (e) => (e.current_investment || 0) < (e.target_investment || 0)
              )
              .length.toString()}
            description="Not fully funded"
            icon={TrendingUp}
            delay={0.2}
          />
          <StatCard
            title="My Investments"
            value="0"
            description="Coming soon"
            icon={Vote}
            delay={0.3}
          />
        </div>

        {/* Available Events for Investment */}
        <Card className="bg-white/90 border-[#48CAE4] shadow-xl">
          <CardHeader>
            <CardTitle className="text-[#03045E]">
              Available Investment Opportunities
            </CardTitle>
            <CardDescription>
              Browse and invest in published events with SOL
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {events.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  No published events available for investment at this time.
                </p>
              ) : (
                events.map((event, idx) => {
                  const fundingProgress = event.target_investment
                    ? ((event.current_investment || 0) /
                        event.target_investment) *
                      100
                    : 0;

                  return (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Card className="bg-gradient-to-r from-white to-[#CAF0F8] border-[#48CAE4]">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-[#03045E] mb-2">
                                {event.title}
                              </h3>
                              <p className="text-sm text-gray-600 mb-2">
                                {event.description || "No description provided"}
                              </p>
                              <p className="text-xs text-gray-500">
                                Organized by:{" "}
                                {event.organizer?.display_name || "Unknown"}
                              </p>
                            </div>
                            <Badge className="bg-green-500 text-white ml-4">
                              Published
                            </Badge>
                          </div>

                          {/* Investment Stats */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                            <div className="p-3 bg-white rounded-lg">
                              <p className="text-xs text-gray-600">Target</p>
                              <p className="text-lg font-bold text-[#0077B6]">
                                {event.target_investment || 0} SOL
                              </p>
                            </div>
                            <div className="p-3 bg-white rounded-lg">
                              <p className="text-xs text-gray-600">Current</p>
                              <p className="text-lg font-bold text-[#0077B6]">
                                {event.current_investment || 0} SOL
                              </p>
                            </div>
                            <div className="p-3 bg-white rounded-lg">
                              <p className="text-xs text-gray-600">Progress</p>
                              <p className="text-lg font-bold text-[#0077B6]">
                                {fundingProgress.toFixed(1)}%
                              </p>
                            </div>
                            <div className="p-3 bg-white rounded-lg">
                              <p className="text-xs text-gray-600">
                                Token Symbol
                              </p>
                              <p className="text-sm font-semibold text-[#03045E]">
                                {event.token_symbol || "N/A"}
                              </p>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="mb-4">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                              <div
                                className="bg-gradient-to-r from-[#0077B6] to-[#48CAE4] h-2.5 rounded-full transition-all"
                                style={{
                                  width: `${Math.min(fundingProgress, 100)}%`,
                                }}
                              />
                            </div>
                          </div>

                          {/* Investment Form */}
                          <div className="mt-4 p-4 bg-gradient-to-r from-[#48CAE4]/20 to-[#90E0EF]/20 rounded-lg border border-[#48CAE4]">
                            <p className="text-sm font-semibold text-[#03045E] mb-3">
                              Invest in this event:
                            </p>
                            <div className="flex gap-2">
                              <input
                                type="number"
                                min="0.1"
                                step="0.1"
                                placeholder="Amount in SOL"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0077B6]"
                                value={
                                  investingEventId === event.id
                                    ? investAmount
                                    : ""
                                }
                                onChange={(e) => {
                                  setInvestingEventId(event.id);
                                  setInvestAmount(e.target.value);
                                }}
                                disabled={submitting}
                              />
                              <Button
                                onClick={() => handleInvest(event.id)}
                                disabled={
                                  submitting ||
                                  !investAmount ||
                                  investingEventId !== event.id
                                }
                                className="bg-[#0077B6] hover:bg-[#0096C7] text-white px-6"
                              >
                                {submitting && investingEventId === event.id
                                  ? "Investing..."
                                  : "Invest"}
                              </Button>
                            </div>
                            <p className="text-xs text-gray-600 mt-2">
                              Estimated USD: $
                              {investAmount
                                ? (parseFloat(investAmount) * 150).toFixed(2)
                                : "0.00"}{" "}
                              (1 SOL ≈ $150)
                            </p>
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

"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { getMenuSectionsForRole } from "@/app/utils/dashboardMenus";
import { useDashboardUser } from "@/hooks/useDashboardUser";
import { StatCard } from "@/components/stat-card";
import { EventCard } from "@/components/event-card";
import { Calendar, DollarSign, Ticket, TrendingUp, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DashboardGuard } from "@/hooks/useDashboardUser";
import { WalletErrorBoundary } from "@/components/WalletErrorBoundary";

// Force dynamic rendering - required for wallet-connected pages
export const dynamic = "force-dynamic";

export default function OrganizerDashboard() {
  const user = useDashboardUser("organizer");
  const [userId, setUserId] = useState<string | null>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Upsert user and get user ID
  useEffect(() => {
    fetch("/api/users/upsert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        walletAddress: user.walletAddress,
        displayName: user.name,
        email: user.email,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.user?.id) {
          setUserId(data.user.id);
        }
      })
      .catch((e) => console.error("Failed to upsert user:", e));
  }, [user.walletAddress, user.name, user.email]);

  // Fetch events and stats when userId is available
  useEffect(() => {
    if (!userId) return;

    setLoading(true);

    // Fetch events
    fetch(`/api/events?organizerId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setEvents(data.events || []);
      })
      .catch((e) => console.error("Failed to fetch events:", e));

    // Fetch stats
    fetch(`/api/stats/organizer?organizerId=${userId}`)
      .then((res) => res.json())
      .then((data) => {
        setStats(data.stats);
      })
      .catch((e) => console.error("Failed to fetch stats:", e))
      .finally(() => setLoading(false));
  }, [userId]);

  const menuSections = getMenuSectionsForRole("organizer");

  return (
    <WalletErrorBoundary>
      <DashboardGuard role="organizer">
        {(user) => {
          // Use real data from API
          const myEvents = events;
          const totalRevenue = stats?.totalRevenue || 0;
          const totalTicketsSold = stats?.totalTicketsSold || 0;
          const activeEvents = stats?.publishedEvents || 0;

          if (loading) {
            return (
              <DashboardLayout user={user} menuSections={menuSections}>
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your dashboard...</p>
                  </div>
                </div>
              </DashboardLayout>
            );
          }

          return (
            <DashboardLayout user={user} menuSections={menuSections}>
              <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h1 className="text-4xl font-bold text-gray-900">
                      Welcome back, {user.name.split(" ")[0]}!
                    </h1>
                    <p className="text-gray-600 mt-2">
                      Here's what's happening with your events today.
                    </p>
                  </div>
                  <Link href="/dashboard/organizer/create">
                    <Button className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white">
                      <Calendar className="mr-2 h-4 w-4" />
                      Create New Event
                    </Button>
                  </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <StatCard
                    title="Total Events"
                    value={stats?.totalEvents || 0}
                    description="All time events"
                    icon={Calendar}
                    delay={0}
                  />
                  <StatCard
                    title="Active Events"
                    value={activeEvents}
                    description="Currently running"
                    icon={TrendingUp}
                    trend={{ value: 12.5, isPositive: true }}
                    delay={0.1}
                  />
                  <StatCard
                    title="Total Revenue"
                    value={`${totalRevenue.toFixed(2)} SOL`}
                    description="Across all events"
                    icon={DollarSign}
                    trend={{ value: 8.2, isPositive: true }}
                    delay={0.2}
                  />
                  <StatCard
                    title="Tickets Sold"
                    value={totalTicketsSold}
                    description="Total tickets"
                    icon={Ticket}
                    trend={{ value: 15.3, isPositive: true }}
                    delay={0.3}
                  />
                </div>

                {/* Events Overview */}
                <Tabs defaultValue="active" className="w-full">
                  <TabsList className="grid w-full max-w-md grid-cols-3 bg-white border border-gray-200">
                    <TabsTrigger
                      value="active"
                      className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                    >
                      Active
                    </TabsTrigger>
                    <TabsTrigger
                      value="draft"
                      className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                    >
                      Draft
                    </TabsTrigger>
                    <TabsTrigger
                      value="all"
                      className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                    >
                      All Events
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="active" className="mt-6">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {myEvents
                        .filter((e) => e.status === "published")
                        .map((event, idx) => (
                          <EventCard
                            key={event.id}
                            event={event}
                            delay={idx * 0.1}
                            showActions
                          />
                        ))}
                    </div>
                    {myEvents.filter((e) => e.status === "published").length ===
                      0 && (
                      <Card className="bg-white border border-gray-200">
                        <CardContent className="p-12 text-center">
                          <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                          <h3 className="text-lg font-semibold text-gray-700 mb-2">
                            No active events
                          </h3>
                          <p className="text-gray-500">
                            Create your first event to get started!
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="draft" className="mt-6">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {myEvents
                        .filter((e) => e.status === "draft")
                        .map((event, idx) => (
                          <EventCard
                            key={event.id}
                            event={event}
                            delay={idx * 0.1}
                            showActions
                          />
                        ))}
                    </div>
                    {myEvents.filter((e) => e.status === "draft").length ===
                      0 && (
                      <Card className="bg-white border border-gray-200">
                        <CardContent className="p-12 text-center">
                          <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                          <h3 className="text-lg font-semibold text-gray-700 mb-2">
                            No draft events
                          </h3>
                          <p className="text-gray-500">
                            All your events are published!
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="all" className="mt-6">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {myEvents.map((event, idx) => (
                        <EventCard
                          key={event.id}
                          event={event}
                          delay={idx * 0.1}
                          showActions
                        />
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Quick Actions */}
                <Card className="bg-white border border-gray-200">
                  <CardHeader>
                    <CardTitle className="text-gray-900">
                      Quick Actions
                    </CardTitle>
                    <CardDescription>
                      Manage your events and campaigns
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="grid gap-4 md:grid-cols-3">
                    <Link href="/dashboard/organizer/analytics">
                      <Button
                        variant="outline"
                        className="w-full h-20 border-gray-200 hover:bg-blue-600 hover:text-white hover:border-blue-600"
                      >
                        <div className="text-center">
                          <TrendingUp className="h-6 w-6 mx-auto mb-2" />
                          <span>View Analytics</span>
                        </div>
                      </Button>
                    </Link>
                    <Link href="/dashboard/organizer/staff">
                      <Button
                        variant="outline"
                        className="w-full h-20 border-gray-200 hover:bg-blue-600 hover:text-white hover:border-blue-600"
                      >
                        <div className="text-center">
                          <Users className="h-6 w-6 mx-auto mb-2" />
                          <span>Manage Staff</span>
                        </div>
                      </Button>
                    </Link>
                    <Link href="/dashboard/organizer/payouts">
                      <Button
                        variant="outline"
                        className="w-full h-20 border-gray-200 hover:bg-blue-600 hover:text-white hover:border-blue-600"
                      >
                        <div className="text-center">
                          <DollarSign className="h-6 w-6 mx-auto mb-2" />
                          <span>View Payouts</span>
                        </div>
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </DashboardLayout>
          );
        }}
      </DashboardGuard>
    </WalletErrorBoundary>
  );
}

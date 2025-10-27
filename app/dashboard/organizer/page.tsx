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
  const [events, setEvents] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [startingSellingEventId, setStartingSellingEventId] = useState<string | null>(null);

  // Ensure user exists in DB (non-blocking)
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
        console.log("✅ User upserted:", data.user?.id);
      })
      .catch((e) => console.error("Failed to upsert user:", e));
  }, [user.walletAddress, user.name, user.email]);

  // Fetch events and stats using user.id from useDashboardUser
  useEffect(() => {
    // user.id is already available from localStorage via useDashboardUser
    if (!user.id) {
      console.error("❌ No user.id available");
      setLoading(false);
      return;
    }

    setLoading(true);

    // Fetch events
    fetch(`/api/events?organizerId=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("📊 Fetched events:", data.events);
        console.log("🔍 Events with live status:", data.events?.filter((e: any) => e.status === "live"));
        console.log("✅ Events with verified:", data.events?.filter((e: any) => e.verified));
        console.log("⛓️ Events with chain_verified:", data.events?.filter((e: any) => e.chain_verified));
        setEvents(data.events || []);
      })
      .catch((e) => console.error("Failed to fetch events:", e));

    // Fetch stats
    fetch(`/api/stats/organizer?organizerId=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        setStats(data.stats);
      })
      .catch((e) => console.error("Failed to fetch stats:", e))
      .finally(() => setLoading(false));
  }, [user.id]);

  const handleStartSelling = async (eventId: string) => {
    if (!user.id) {
      alert("User not authenticated");
      return;
    }

    const confirmed = confirm(
      "Are you sure you want to start selling tickets for this event? This will make the event live and enable ticket sales. Make sure all investors have completed voting on DAO questions."
    );

    if (!confirmed) return;

    setStartingSellingEventId(eventId);

    try {
      const res = await fetch(`/api/events/${eventId}/start-selling`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizerId: user.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Failed to start selling tickets");
        if (data.details) {
          console.log("Validation details:", data.details);
          alert(
            `Validation failed:\n` +
            `- Total Questions: ${data.details.totalQuestions}\n` +
            `- Total Investors: ${data.details.totalInvestors}\n` +
            `- Votes Received: ${data.details.votesReceived}\n` +
            `- Votes Required: ${data.details.votesRequired}\n\n` +
            `All investors must complete voting on all questions before ticket sales can begin.`
          );
        }
        return;
      }

      alert("✅ Success! Ticket sales have been enabled for this event.");
      
      // Refresh events
      fetch(`/api/events?organizerId=${user.id}`)
        .then((res) => res.json())
        .then((data) => {
          setEvents(data.events || []);
        });
    } catch (e: any) {
      console.error("Error starting ticket sales:", e);
      alert("Failed to start selling tickets. Please try again.");
    } finally {
      setStartingSellingEventId(null);
    }
  };

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
                  <TabsList className="grid w-full max-w-2xl grid-cols-5 bg-white border border-gray-200">
                    <TabsTrigger
                      value="pending"
                      className="data-[state=active]:bg-yellow-600 data-[state=active]:text-white"
                    >
                      Pending
                    </TabsTrigger>
                    <TabsTrigger
                      value="active"
                      className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                    >
                      Active
                    </TabsTrigger>
                    <TabsTrigger
                      value="approved"
                      className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
                    >
                      Approved
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

                  <TabsContent value="pending" className="mt-6">
                    <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-900">
                        <strong>⏳ Awaiting Admin Approval:</strong> These events are pending review by admin. 
                        You'll be notified once they are approved or if any changes are needed.
                      </p>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {myEvents
                        .filter((e) => e.status === "pending_approval")
                        .map((event, idx) => (
                          <EventCard
                            key={event.id}
                            event={event}
                            delay={idx * 0.1}
                            showActions
                            onStartSelling={handleStartSelling}
                          />
                        ))}
                    </div>
                    {myEvents.filter((e) => e.status === "pending_approval").length === 0 && (
                      <Card className="bg-white border border-gray-200">
                        <CardContent className="p-12 text-center">
                          <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                          <h3 className="text-lg font-semibold text-gray-700 mb-2">
                            No pending events
                          </h3>
                          <p className="text-gray-500">
                            Events awaiting admin approval will appear here.
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="active" className="mt-6">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {myEvents
                        .filter((e) => e.status === "live" && e.verified && e.chain_verified)
                        .map((event, idx) => (
                          <EventCard
                            key={event.id}
                            event={event}
                            delay={idx * 0.1}
                            showActions
                            onStartSelling={handleStartSelling}
                          />
                        ))}
                    </div>
                    {myEvents.filter((e) => e.status === "live" && e.verified && e.chain_verified).length ===
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

                  <TabsContent value="approved" className="mt-6">
                    <div className="mb-4 p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <p className="text-sm text-purple-900">
                        <strong>⚡ Action Required:</strong> These events are approved by admin. 
                        Click "DAO Questions" to set up investor voting questions before you can start selling tickets.
                      </p>
                    </div>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {myEvents
                        .filter((e) => e.status === "approved" || e.status === "dao_voting")
                        .map((event, idx) => (
                          <EventCard
                            key={event.id}
                            event={event}
                            delay={idx * 0.1}
                            showActions
                            onStartSelling={handleStartSelling}
                          />
                        ))}
                    </div>
                    {myEvents.filter((e) => e.status === "approved" || e.status === "dao_voting").length ===
                      0 && (
                      <Card className="bg-white border border-gray-200">
                        <CardContent className="p-12 text-center">
                          <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                          <h3 className="text-lg font-semibold text-gray-700 mb-2">
                            No approved events
                          </h3>
                          <p className="text-gray-500">
                            Events approved by admin will appear here.
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
                            onStartSelling={handleStartSelling}
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
                          onStartSelling={handleStartSelling}
                        />
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </DashboardLayout>
          );
        }}
      </DashboardGuard>
    </WalletErrorBoundary>
  );
}

"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { RoleSidebar } from "@/components/role-sidebar";
import { StatCard } from "@/components/stat-card";
import { EventCard } from "@/components/event-card";
import { dummyUsers, dummyEvents } from "@/lib/dummy-data";
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

export default function OrganizerDashboard() {
  const user = dummyUsers.find((u) => u.role === "organizer")!;
  const myEvents = dummyEvents.filter((e) => e.organizerId === user.id);

  const totalRevenue = myEvents.reduce((sum, e) => sum + (e.revenue || 0), 0);
  const totalTicketsSold = myEvents.reduce(
    (sum, e) => sum + (e.soldTickets || 0),
    0
  );
  const activeEvents = myEvents.filter((e) => e.status === "published").length;

  return (
    <DashboardLayout user={user} sidebar={<RoleSidebar role="organizer" />}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">
              Welcome back, {user.name.split(" ")[0]}! 👋
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
            value={myEvents.length}
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
            value={`$${totalRevenue.toLocaleString()}`}
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
            {myEvents.filter((e) => e.status === "published").length === 0 && (
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
            {myEvents.filter((e) => e.status === "draft").length === 0 && (
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
            <CardTitle className="text-gray-900">Quick Actions</CardTitle>
            <CardDescription>Manage your events and campaigns</CardDescription>
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
}

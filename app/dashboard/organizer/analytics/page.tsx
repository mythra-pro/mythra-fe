"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { getMenuSectionsForRole } from "@/app/utils/dashboardMenus";
import { StatCard } from "@/components/stat-card";
import { dummyUsers, dummyEvents } from "@/lib/dummy-data";
import {
  TrendingUp,
  BarChart3,
  PieChart,
  Calendar,
  DollarSign,
  Users,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function OrganizerAnalyticsPage() {
  const user = dummyUsers.find((u) => u.role === "organizer")!;
  const myEvents = dummyEvents.filter((e) => e.organizerId === user.id);
  const totalRevenue = myEvents.reduce((sum, e) => sum + (e.revenue || 0), 0);
  const totalAttendees = myEvents.reduce(
    (sum, e) => sum + (e.soldTickets || 0),
    0
  );

  // Get menu sections for organizer role


  const menuSections = getMenuSectionsForRole('organizer');



  return (
    <DashboardLayout user={user} menuSections={menuSections}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-[#03045E]">
            Analytics Dashboard 📊
          </h1>
          <p className="text-gray-600 mt-2">
            Detailed insights and performance metrics for your events.
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Revenue"
            value={`$${totalRevenue.toLocaleString()}`}
            description="All events combined"
            icon={DollarSign}
            trend={{ value: 23.4, isPositive: true }}
            delay={0}
          />
          <StatCard
            title="Total Attendees"
            value={totalAttendees}
            description="Across all events"
            icon={Users}
            trend={{ value: 12.8, isPositive: true }}
            delay={0.1}
          />
          <StatCard
            title="Events Created"
            value={myEvents.length}
            description="Lifetime events"
            icon={Calendar}
            delay={0.2}
          />
          <StatCard
            title="Avg. Revenue/Event"
            value={`$${Math.round(
              totalRevenue / myEvents.length || 0
            ).toLocaleString()}`}
            description="Performance metric"
            icon={TrendingUp}
            trend={{ value: 8.2, isPositive: true }}
            delay={0.3}
          />
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Revenue Chart */}
          <Card className="bg-white/90 border-[#48CAE4] shadow-xl">
            <CardHeader>
              <CardTitle className="text-[#03045E] flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Revenue Trends
              </CardTitle>
              <CardDescription>
                Monthly revenue over the past year
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gradient-to-br from-[#CAF0F8] to-white rounded-lg">
                <div className="text-center">
                  <BarChart3 className="h-16 w-16 mx-auto text-[#0077B6] mb-4" />
                  <p className="text-lg font-semibold text-[#03045E] mb-2">
                    Revenue Chart
                  </p>
                  <p className="text-gray-600">
                    Interactive chart would be displayed here
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ticket Sales Chart */}
          <Card className="bg-white/90 border-[#48CAE4] shadow-xl">
            <CardHeader>
              <CardTitle className="text-[#03045E] flex items-center gap-2">
                <PieChart className="h-5 w-5" />
                Ticket Categories
              </CardTitle>
              <CardDescription>
                Distribution of ticket sales by type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gradient-to-br from-[#90E0EF] to-white rounded-lg">
                <div className="text-center">
                  <PieChart className="h-16 w-16 mx-auto text-[#0077B6] mb-4" />
                  <p className="text-lg font-semibold text-[#03045E] mb-2">
                    Ticket Distribution
                  </p>
                  <p className="text-gray-600">
                    Pie chart would be displayed here
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Event Performance */}
        <Card className="bg-white/90 border-[#48CAE4] shadow-xl">
          <CardHeader>
            <CardTitle className="text-[#03045E]">Event Performance</CardTitle>
            <CardDescription>Individual event metrics and KPIs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myEvents.map((event, idx) => (
                <Card
                  key={event.id}
                  className="bg-gradient-to-r from-white to-[#CAF0F8] border-[#48CAE4]"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-bold text-[#03045E]">
                        {event.name}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {new Date(event.date).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="p-3 bg-white rounded-lg">
                        <p className="text-xs text-gray-600">Revenue</p>
                        <p className="text-lg font-bold text-[#0077B6]">
                          ${event.revenue?.toLocaleString() || "0"}
                        </p>
                      </div>
                      <div className="p-3 bg-white rounded-lg">
                        <p className="text-xs text-gray-600">Tickets Sold</p>
                        <p className="text-lg font-bold text-[#0077B6]">
                          {event.soldTickets || 0}
                        </p>
                      </div>
                      <div className="p-3 bg-white rounded-lg">
                        <p className="text-xs text-gray-600">Capacity</p>
                        <p className="text-lg font-bold text-[#0077B6]">
                          {event.totalTickets}
                        </p>
                      </div>
                      <div className="p-3 bg-white rounded-lg">
                        <p className="text-xs text-gray-600">Fill Rate</p>
                        <p className="text-lg font-bold text-[#0077B6]">
                          {Math.round(
                            ((event.soldTickets || 0) /
                              (event.totalTickets || 1)) *
                              100
                          )}
                          %
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Key Insights */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-gradient-to-br from-[#0077B6] to-[#0096C7] text-white">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">
                Best Performing Category
              </h3>
              <p className="text-2xl font-bold">Technology</p>
              <p className="text-sm opacity-90 mt-2">45% of total revenue</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-[#48CAE4] to-[#90E0EF] text-white">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Peak Season</h3>
              <p className="text-2xl font-bold">Q4 2024</p>
              <p className="text-sm opacity-90 mt-2">
                Highest attendance rates
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-[#0096C7] to-[#48CAE4] text-white">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Growth Rate</h3>
              <p className="text-2xl font-bold">+127%</p>
              <p className="text-sm opacity-90 mt-2">Year over year</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

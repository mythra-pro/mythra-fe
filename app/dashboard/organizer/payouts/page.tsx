"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { getMenuSectionsForRole } from "@/app/utils/dashboardMenus";
import PayoutManagement from "@/app/_components/dashboard/PayoutManagement";
import { useDashboardUser } from "@/hooks/useDashboardUser";
import { DollarSign, TrendingUp, Calendar, CreditCard } from "lucide-react";
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

export default function OrganizerPayoutsPage() {
  const { user, isLoading: userLoading } = useDashboardUser("organizer");
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userLoading || !user) return;
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/events?organizerId=${user?.id}`);
        const data = await res.json();
        setEvents(data.events || []);
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, [userLoading, user]);
  
  // Loading state - render AFTER all hooks
  if (userLoading || !user || loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  // Compute values after user is loaded
  const myEvents = events;
  const totalRevenue = myEvents.reduce((sum: number, e: any) => sum + (e.revenue || 0), 0);

  // Get menu sections for organizer role

  const menuSections = getMenuSectionsForRole("organizer");

  return (
    <DashboardLayout user={user} menuSections={menuSections}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-[#03045E]">
            Payouts & Revenue
          </h1>
          <p className="text-gray-600 mt-2">
            Manage your earnings and request payouts from your events.
          </p>
        </div>

        {/* Revenue Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Total Revenue"
            value={`$${totalRevenue.toLocaleString()}`}
            description="Total earnings"
            icon={DollarSign}
            delay={0}
          />
          <StatCard
            title="Your Revenue"
            value={`$${totalRevenue.toLocaleString()}`}
            description="Available earnings"
            icon={TrendingUp}
            trend={{ value: 23.4, isPositive: true }}
            delay={0.1}
          />
          <StatCard
            title="Events"
            value={myEvents.length}
            description="Revenue generating"
            icon={Calendar}
            delay={0.2}
          />
        </div>

        {/* Payout Management Component */}
        <Card className="bg-white/90 border-[#48CAE4] shadow-xl">
          <CardHeader>
            <CardTitle className="text-[#03045E] flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Payout Management
            </CardTitle>
            <CardDescription>
              Request withdrawals and manage your payout preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PayoutManagement
              eventId="all-events"
              eventName="All Events"
              totalRevenue={totalRevenue}
              organizerWallet={user.walletAddress || ""}
              payouts={[]}
            />
          </CardContent>
        </Card>

        {/* Revenue Breakdown */}
        <Card className="bg-white/80 border-[#48CAE4]">
          <CardHeader>
            <CardTitle className="text-[#03045E]">
              Revenue Breakdown by Event
            </CardTitle>
            <CardDescription>
              Detailed earnings from each of your events
            </CardDescription>
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
                      <div>
                        <h3 className="text-lg font-bold text-[#03045E]">
                          {event.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {new Date(event.start_time).toLocaleDateString()} •{" "}
                          {event.soldTickets} tickets sold
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-[#0077B6]">
                          ${event.revenue?.toLocaleString() || "0"}
                        </p>
                        <p className="text-xs text-gray-500">Gross Revenue</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-white rounded-lg">
                        <p className="text-xs text-gray-600">Total Revenue</p>
                        <p className="text-lg font-bold text-[#0077B6]">
                          ${event.revenue?.toLocaleString() || "0"}
                        </p>
                      </div>
                      <div className="p-3 bg-white rounded-lg">
                        <p className="text-xs text-gray-600">Your Earnings</p>
                        <p className="text-lg font-bold text-green-500">
                          ${event.revenue?.toLocaleString() || "0"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {myEvents.length === 0 && (
                <div className="p-12 text-center">
                  <DollarSign className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No Revenue Yet
                  </h3>
                  <p className="text-gray-500">
                    Create and publish your first event to start earning
                    revenue.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payout Information */}
        <Card className="bg-gradient-to-r from-[#90E0EF] to-[#CAF0F8] border-[#48CAE4]">
          <CardHeader>
            <CardTitle className="text-[#03045E]">
              💡 Payout Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="font-semibold text-[#03045E] mb-2">
                  Payout Schedule
                </h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Payouts are processed within 3-5 business days</li>
                  <li>• Minimum payout amount is $100</li>
                  <li>• Funds are held for 7 days after event completion</li>
                  <li>• Automatic payouts can be enabled in settings</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-[#03045E] mb-2">
                  Payout Details
                </h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• 100% of revenue goes to organizers</li>
                  <li>• No platform fees or commissions</li>
                  <li>• No additional withdrawal fees</li>
                  <li>
                    • Instant payouts available for all organizers
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

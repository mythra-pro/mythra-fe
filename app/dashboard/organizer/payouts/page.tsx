"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { getMenuSectionsForRole } from "@/app/utils/dashboardMenus";
import PayoutManagement from "@/app/_components/dashboard/PayoutManagement";
import { useDashboardUser } from "@/hooks/useDashboardUser";
import { dummyUsers, dummyEvents } from "@/lib/dummy-data";
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
  const user = useDashboardUser("organizer");
  const myEvents = dummyEvents.filter((e) => e.organizerId === user.id);
  const totalRevenue = myEvents.reduce((sum, e) => sum + (e.revenue || 0), 0);
  const platformFee = totalRevenue * 0.05; // 5% platform fee
  const netRevenue = totalRevenue - platformFee;

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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Revenue"
            value={`$${totalRevenue.toLocaleString()}`}
            description="Gross earnings"
            icon={DollarSign}
            delay={0}
          />
          <StatCard
            title="Platform Fees"
            value={`$${platformFee.toLocaleString()}`}
            description="5% commission"
            icon={CreditCard}
            delay={0.1}
          />
          <StatCard
            title="Net Revenue"
            value={`$${netRevenue.toLocaleString()}`}
            description="After platform fees"
            icon={TrendingUp}
            trend={{ value: 23.4, isPositive: true }}
            delay={0.2}
          />
          <StatCard
            title="Events"
            value={myEvents.length}
            description="Revenue generating"
            icon={Calendar}
            delay={0.3}
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
              totalRevenue={netRevenue}
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

                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 bg-white rounded-lg">
                        <p className="text-xs text-gray-600">Gross Revenue</p>
                        <p className="text-lg font-bold text-[#0077B6]">
                          ${event.revenue?.toLocaleString() || "0"}
                        </p>
                      </div>
                      <div className="p-3 bg-white rounded-lg">
                        <p className="text-xs text-gray-600">
                          Platform Fee (5%)
                        </p>
                        <p className="text-lg font-bold text-red-500">
                          -${((event.revenue || 0) * 0.05).toLocaleString()}
                        </p>
                      </div>
                      <div className="p-3 bg-white rounded-lg">
                        <p className="text-xs text-gray-600">Net Revenue</p>
                        <p className="text-lg font-bold text-green-500">
                          ${((event.revenue || 0) * 0.95).toLocaleString()}
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
                  Fee Structure
                </h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Platform fee: 5% of gross revenue</li>
                  <li>• Payment processing: 2.9% + $0.30 per transaction</li>
                  <li>• No additional withdrawal fees</li>
                  <li>
                    • Volume discounts available for high-revenue organizers
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

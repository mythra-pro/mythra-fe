"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { getMenuSectionsForRole } from "@/app/utils/dashboardMenus";
import { useDashboardUser } from "@/hooks/useDashboardUser";
import { StatCard } from "@/components/stat-card";
import { NFTTicketCard } from "@/components/nft-ticket-card";
import { Ticket, ShoppingBag, Wallet, TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

// Force dynamic rendering - required for wallet-connected pages
export const dynamic = "force-dynamic";

export default function CustomerDashboard() {
  const user = useDashboardUser("customer");
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Upsert user
  useEffect(() => {
    fetch("/api/users/upsert", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        walletAddress: user.walletAddress,
        displayName: user.name,
        email: user.email,
      }),
    }).catch((e) => console.error("Failed to upsert user:", e));
  }, [user.walletAddress, user.name, user.email]);

  // Fetch tickets
  useEffect(() => {
    setLoading(true);
    fetch(`/api/tickets?owner=${user.walletAddress}`)
      .then((res) => res.json())
      .then((data) => {
        setTickets(data.tickets || []);
      })
      .catch((e) => console.error("Failed to fetch tickets:", e))
      .finally(() => setLoading(false));
  }, [user.walletAddress]);

  const myTickets = tickets;
  const activeTickets = myTickets.filter((t) => t.status === "active").length;
  const totalSpent = myTickets.reduce((sum, t) => {
    return sum + (t.ticket_tier?.price || 0);
  }, 0);

  // Get menu sections for customer role
  const menuSections = getMenuSectionsForRole("customer");

  return (
    <DashboardLayout user={user} menuSections={menuSections}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-[#03045E]">
              Welcome, {user.name.split(" ")[0]}!
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your NFT tickets and explore upcoming events.
            </p>
          </div>
          <Link href="/events">
            <Button className="mt-4 md:mt-0 bg-[#0077B6] hover:bg-[#0096C7] text-white">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Browse Events
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Tickets"
            value={myTickets.length}
            description="NFT tickets owned"
            icon={Ticket}
            delay={0}
          />
          <StatCard
            title="Active Tickets"
            value={activeTickets}
            description="Ready to use"
            icon={TrendingUp}
            delay={0.1}
          />
          <StatCard
            title="Total Spent"
            value={`${totalSpent.toFixed(2)} SOL`}
            description="On tickets"
            icon={Wallet}
            delay={0.2}
          />
          <StatCard
            title="Wallet Balance"
            value="2.45 SOL"
            description="≈ $520.50"
            icon={Wallet}
            delay={0.3}
          />
        </div>

        {/* My NFT Tickets */}
        <Card className="bg-white/80 border-[#48CAE4]">
          <CardHeader>
            <CardTitle className="text-[#03045E]">My NFT Tickets</CardTitle>
            <CardDescription>Your collection of event tickets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {myTickets.map((ticket, idx) => (
                <NFTTicketCard
                  key={ticket.id}
                  ticket={ticket}
                  delay={idx * 0.1}
                />
              ))}
            </div>
            {myTickets.length === 0 && (
              <div className="p-12 text-center">
                <Ticket className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  No tickets yet
                </h3>
                <p className="text-gray-500 mb-4">
                  Browse events and purchase your first NFT ticket!
                </p>
                <Link href="/events">
                  <Button className="bg-[#0077B6] hover:bg-[#0096C7] text-white">
                    Explore Events
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="bg-gradient-to-br from-[#0077B6] to-[#0096C7] border-0 text-white">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-2">Explore Events</h3>
              <p className="text-white/90 mb-4">
                Discover amazing events and buy NFT tickets
              </p>
              <Link href="/events">
                <Button
                  variant="secondary"
                  className="bg-white text-[#0077B6] hover:bg-gray-100"
                >
                  Browse Events
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-[#48CAE4] to-[#90E0EF] border-0 text-white">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-2">Support Campaigns</h3>
              <p className="text-white/90 mb-4">
                Invest in events and earn rewards
              </p>
              <Link href="/dashboard/customer/investments">
                <Button
                  variant="secondary"
                  className="bg-white text-[#0077B6] hover:bg-gray-100"
                >
                  View Campaigns
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

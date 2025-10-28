"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { getMenuSectionsForRole } from "@/app/utils/dashboardMenus";
import { useDashboardUser } from "@/hooks/useDashboardUser";
import { StatCard } from "@/components/stat-card";
import { QrCode, Users, CheckCircle, Calendar } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { motion } from "framer-motion";

// Force dynamic rendering - required for wallet-connected pages
export const dynamic = "force-dynamic";

export default function StaffDashboard() {
  const { user, isLoading: userLoading } = useDashboardUser("staff");
  
  // IMPORTANT: All hooks must be called BEFORE any conditional returns (Rules of Hooks)
  const [checkins, setCheckins] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanInput, setScanInput] = useState("");

  // Ensure user exists in DB (non-blocking)
  useEffect(() => {
    if (userLoading || !user) return;
    
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
  }, [userLoading, user]);

  // Fetch check-ins using user.id from useDashboardUser
  useEffect(() => {
    if (userLoading || !user || !user.id) {
      console.error("❌ No user.id available");
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`/api/checkins?staffId=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        setCheckins(data.checkins || []);
        // Extract unique events from check-ins
        const uniqueEvents = new Map();
        (data.checkins || []).forEach((checkin: any) => {
          if (checkin.event && !uniqueEvents.has(checkin.event_id)) {
            uniqueEvents.set(checkin.event_id, checkin.event);
          }
        });
        setEvents(Array.from(uniqueEvents.values()));
      })
      .catch((e) => console.error("Failed to fetch check-ins:", e))
      .finally(() => setLoading(false));
  }, [user?.id]);

  // Get menu sections for staff role
  const menuSections = getMenuSectionsForRole("staff");

  const handleScan = () => {
    // Mock scan functionality
    alert("Scanning QR Code: " + scanInput);
    setScanInput("");
  };

  // Loading state - render AFTER all hooks
  if (userLoading || !user) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  const myEvents = events;
  const upcomingEvents = events.filter((e: any) => new Date(e.start_time) > new Date());
  const totalCheckins = checkins.length

  return (
    <DashboardLayout user={user} menuSections={menuSections}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-[#03045E]">Staff Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Manage check-ins and attendees for your assigned events.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="My Events"
            value={myEvents.length}
            description="Assigned events"
            icon={Calendar}
            delay={0}
          />
          <StatCard
            title="Upcoming"
            value={upcomingEvents.length}
            description="Events scheduled"
            icon={Calendar}
            delay={0.1}
          />
          <StatCard
            title="Total Check-ins"
            value={totalCheckins}
            description="All time"
            icon={CheckCircle}
            trend={{ value: 23.1, isPositive: true }}
            delay={0.2}
          />
          <StatCard
            title="Today's Check-ins"
            value={42}
            description="Scanned today"
            icon={Users}
            delay={0.3}
          />
        </div>

        {/* Quick Check-in Scanner */}
        <Card className="bg-white/90 border-[#48CAE4] shadow-xl">
          <CardHeader>
            <CardTitle className="text-[#03045E] flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Quick Check-In Scanner
            </CardTitle>
            <CardDescription>
              Scan ticket QR codes to check-in attendees
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                placeholder="Enter ticket ID or scan QR code..."
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleScan()}
                className="flex-1"
              />
              <Button
                onClick={handleScan}
                className="bg-[#0077B6] hover:bg-[#0096C7] text-white"
              >
                <QrCode className="h-4 w-4 mr-2" />
                Scan
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              💡 Tip: Use a QR scanner device or enter the ticket ID manually
            </p>
          </CardContent>
        </Card>

        {/* Assigned Events */}
        <Card className="bg-white/80 border-[#48CAE4]">
          <CardHeader>
            <CardTitle className="text-[#03045E]">My Assigned Events</CardTitle>
            <CardDescription>Events you're staffing</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myEvents.map((event, idx) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="bg-gradient-to-r from-white to-[#CAF0F8] border-[#48CAE4]">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-[#03045E]">
                              {event.name}
                            </h3>
                            <Badge className="bg-[#0077B6] text-white">
                              {event.category}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(event.start_time).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {event.soldTickets} attendees
                            </div>
                          </div>
                        </div>
                        <Link
                          href={`/dashboard/staff/checkin?event=${event.id}`}
                        >
                          <Button className="bg-[#0077B6] hover:bg-[#0096C7] text-white">
                            <QrCode className="h-4 w-4 mr-2" />
                            Check-In
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
              {myEvents.length === 0 && (
                <div className="p-12 text-center">
                  <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    No events assigned
                  </h3>
                  <p className="text-gray-500">
                    Contact event organizers to get assigned to events.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Check-ins */}
        <Card className="bg-white/80 border-[#48CAE4]">
          <CardHeader>
            <CardTitle className="text-[#03045E]">Recent Check-ins</CardTitle>
            <CardDescription>Latest attendee check-ins</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((_, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center justify-between p-3 bg-gradient-to-r from-[#CAF0F8] to-white rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#0077B6] flex items-center justify-center text-white font-bold">
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <div>
                      <p className="font-medium text-[#03045E]">
                        Attendee #{1234 + idx}
                      </p>
                      <p className="text-sm text-gray-500">
                        VIP Pass • Web3 Summit 2025
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-green-500 text-white">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Checked In
                    </Badge>
                    <p className="text-xs text-gray-500 mt-1">
                      {idx + 1} min ago
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

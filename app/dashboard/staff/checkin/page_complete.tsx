"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { getMenuSectionsForRole } from "@/app/utils/dashboardMenus";
import { useDashboardUser } from "@/hooks/useDashboardUser";
import CheckInScannerV2 from "@/app/_components/dashboard/CheckInScannerV2";
import { QrCode, Calendar, Users, CheckCircle, Clock, TrendingUp, Keyboard, WifiOff } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function StaffCheckinPageComplete() {
  const user = useDashboardUser("staff");
  const menuSections = getMenuSectionsForRole("staff");

  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTickets: 0,
    checkedIn: 0,
    remaining: 0,
  });
  const [recentCheckins, setRecentCheckins] = useState<any[]>([]);

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  // Ensure user exists in DB on mount
  useEffect(() => {
    const upsertUser = async () => {
      try {
        await fetch("/api/users/upsert", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            walletAddress: user.walletAddress,
            displayName: user.name,
            email: user.email,
          }),
        });
      } catch (e) {
        console.error("Failed to upsert user:", e);
      }
    };
    upsertUser();
  }, [user.walletAddress, user.name, user.email]);

  // Fetch live events where user is staff
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/events?status=live");
        const data = await res.json();
        if (data.events) {
          // TODO: Filter by staff assignment when that's implemented
          // For now, show all live events
          setEvents(data.events);
          if (data.events.length > 0 && !selectedEventId) {
            setSelectedEventId(data.events[0].id);
          }
        }
      } catch (e) {
        console.error("Failed to fetch events:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [selectedEventId]);

  // Fetch stats for selected event
  useEffect(() => {
    const fetchStats = async () => {
      if (!selectedEventId) return;

      try {
        // Get total tickets
        const ticketsRes = await fetch(`/api/tickets?eventId=${selectedEventId}`);
        const ticketsData = await ticketsRes.json();
        const totalTickets = ticketsData.tickets?.length || 0;

        // Get check-ins
        const checkinsRes = await fetch(`/api/checkins?eventId=${selectedEventId}`);
        const checkinsData = await checkinsRes.json();
        const checkedIn = checkinsData.checkins?.length || 0;

        setStats({
          totalTickets,
          checkedIn,
          remaining: totalTickets - checkedIn,
        });

        // Set recent check-ins
        if (checkinsData.checkins) {
          setRecentCheckins(checkinsData.checkins.slice(0, 10));
        }
      } catch (e) {
        console.error("Failed to fetch stats:", e);
      }
    };

    fetchStats();

    // Refresh stats every 10 seconds
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, [selectedEventId]);

  return (
    <DashboardLayout user={user} menuSections={menuSections}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-[#03045E]">Check-In Scanner 📱</h1>
          <p className="text-gray-600 mt-2">
            Scan QR codes to check-in attendees for your assigned events.
          </p>
        </div>

        {/* Event Selection */}
        <Card className="bg-white/90 border-[#48CAE4] shadow-xl">
          <CardHeader>
            <CardTitle className="text-[#03045E] flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Select Event
            </CardTitle>
            <CardDescription>
              Choose the event you want to manage check-ins for
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-600 mt-2">Loading events...</p>
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-8">
                <QrCode className="h-12 w-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-600">No live events available</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Event</label>
                  <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                    <SelectTrigger className="border-gray-200">
                      <SelectValue placeholder="Select an event" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {events.map((event) => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.name} - {new Date(event.start_time).toLocaleDateString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedEvent && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-gradient-to-r from-[#CAF0F8] to-white rounded-lg">
                        <p className="text-xs text-gray-600">Event Date</p>
                        <p className="font-semibold text-[#03045E]">
                          {new Date(selectedEvent.start_time).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="p-3 bg-gradient-to-r from-[#90E0EF] to-white rounded-lg">
                        <p className="text-xs text-gray-600">Venue</p>
                        <p className="font-semibold text-[#03045E] truncate">
                          {selectedEvent.venue}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        {selectedEvent && (
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-gradient-to-r from-[#0077B6] to-[#0096C7] text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Total Tickets</p>
                    <p className="text-3xl font-bold">{stats.totalTickets}</p>
                  </div>
                  <Users className="h-10 w-10 opacity-75" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Checked In</p>
                    <p className="text-3xl font-bold">{stats.checkedIn}</p>
                  </div>
                  <CheckCircle className="h-10 w-10 opacity-75" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-r from-[#48CAE4] to-[#90E0EF] text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Remaining</p>
                    <p className="text-3xl font-bold">{stats.remaining}</p>
                  </div>
                  <QrCode className="h-10 w-10 opacity-75" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Check-in Scanner */}
        {selectedEvent ? (
          <Card className="bg-white/90 border-[#48CAE4] shadow-xl">
            <CardHeader>
              <CardTitle className="text-[#03045E] flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                QR Code Scanner
              </CardTitle>
              <CardDescription>
                Scan attendee tickets to check them in for {selectedEvent.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CheckInScannerV2
                eventId={selectedEvent.id}
                eventName={selectedEvent.name}
                onCheckIn={async (data) => {
                  try {
                    const res = await fetch("/api/checkins", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        "x-wallet-address": user.walletAddress || "",
                      },
                      body: JSON.stringify({
                        ticketId: data.ticketId,
                        eventId: data.eventId,
                        checkInDate: new Date(data.checkInDate).toISOString(),
                        walletSignature: data.walletSignature,
                        location: data.location || null,
                      }),
                    });
                    const json = await res.json();
                    if (!res.ok || !json.ok) {
                      console.error("Check-in failed:", json.reason);
                      return false;
                    }

                    // Refresh stats
                    setStats((prev) => ({
                      ...prev,
                      checkedIn: prev.checkedIn + 1,
                      remaining: prev.remaining - 1,
                    }));

                    return true;
                  } catch (e: any) {
                    console.error("Error processing check-in:", e);
                    return false;
                  }
                }}
              />
            </CardContent>
          </Card>
        ) : (
          !loading && (
            <Card className="bg-white/90 border-[#48CAE4] shadow-xl">
              <CardContent className="p-12 text-center">
                <QrCode className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Events Available</h3>
                <p className="text-gray-500">
                  No live events are currently available for check-in.
                </p>
              </CardContent>
            </Card>
          )
        )}

        {/* Recent Check-ins List */}
        {selectedEvent && recentCheckins.length > 0 && (
          <Card className="bg-white/90 border-[#48CAE4] shadow-xl">
            <CardHeader>
              <CardTitle className="text-[#03045E] flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Check-ins
              </CardTitle>
              <CardDescription>Latest check-ins for this event</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentCheckins.map((checkin, index) => (
                  <div
                    key={checkin.id || index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          Ticket #{checkin.ticket_id?.substring(0, 8)}...
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(checkin.checked_in_at || checkin.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-700">
                        {checkin.staff?.display_name || "Staff"}
                      </p>
                      <p className="text-xs text-gray-500">{checkin.location || "Main entrance"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="bg-gradient-to-r from-[#90E0EF] to-[#CAF0F8] border-[#48CAE4]">
          <CardHeader>
            <CardTitle className="text-[#03045E]">📋 Check-In Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <h4 className="font-semibold text-[#03045E] mb-2 flex items-center gap-2">
                  <QrCode className="h-4 w-4" />
                  QR Scanner
                </h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Click "Start Camera"</li>
                  <li>• Point at attendee's QR code</li>
                  <li>• Auto-detects and checks in</li>
                  <li>• Hear confirmation beep</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-[#03045E] mb-2 flex items-center gap-2">
                  <Keyboard className="h-4 w-4" />
                  Manual Entry
                </h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Switch to Manual mode</li>
                  <li>• Ask for ticket ID</li>
                  <li>• Type and press Enter</li>
                  <li>• Verify confirmation</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-[#03045E] mb-2 flex items-center gap-2">
                  <WifiOff className="h-4 w-4" />
                  Offline Mode
                </h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Works without internet</li>
                  <li>• Queues check-ins locally</li>
                  <li>• Syncs when online</li>
                  <li>• No data loss</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

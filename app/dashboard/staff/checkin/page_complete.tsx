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
  const { user, isLoading: userLoading } = useDashboardUser("staff");
  const menuSections = getMenuSectionsForRole("staff");
  const selectedEventId = "";
  const setSelectedEventId = (_value: string) => {};
  const loading = false;
  const events: any[] = [];
  const selectedEvent: any = null;
  const stats: any = { total: 0, checkedIn: 0, pending: 0 };
  const setStats = (_value: any) => {};
  const recentCheckins: any[] = [];
  
  if (userLoading || !user) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

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
                    setStats((prev: any) => ({
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

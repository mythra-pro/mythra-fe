"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { getMenuSectionsForRole } from "@/app/utils/dashboardMenus";
import CheckInScanner from "@/app/_components/dashboard/CheckInScanner";
import { dummyUsers, dummyEvents } from "@/lib/dummy-data";
import { QrCode, Calendar, Users, CheckCircle } from "lucide-react";
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

// Force dynamic rendering - required for wallet-connected pages
export const dynamic = "force-dynamic";

export default function StaffCheckinPage() {
  const user = dummyUsers.find((u) => u.role === "staff")!;
  const myEvents = dummyEvents.filter((e) => e.staffIds?.includes(user.id));
  const [selectedEventId, setSelectedEventId] = useState(myEvents[0]?.id || "");

  const selectedEvent = myEvents.find((e) => e.id === selectedEventId);

  // Get menu sections for staff role

  const menuSections = getMenuSectionsForRole("staff");

  return (
    <DashboardLayout user={user} menuSections={menuSections}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-[#03045E]">
            Check-In Scanner 📱
          </h1>
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
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Event
                </label>
                <Select
                  value={selectedEventId}
                  onValueChange={setSelectedEventId}
                >
                  <SelectTrigger className="border-gray-200">
                    <SelectValue placeholder="Select an event" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {myEvents.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.name} -{" "}
                        {new Date(event.date).toLocaleDateString()}
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
                        {new Date(selectedEvent.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="p-3 bg-gradient-to-r from-[#90E0EF] to-white rounded-lg">
                      <p className="text-xs text-gray-600">Total Attendees</p>
                      <p className="font-semibold text-[#03045E]">
                        {selectedEvent.soldTickets}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

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
              <CheckInScanner
                eventId={selectedEvent.id}
                eventName={selectedEvent.name}
                onCheckIn={async (data) => {
                  alert(
                    `Checked in ticket: ${data.ticketId} for ${selectedEvent.name}`
                  );
                  return true;
                }}
              />
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white/90 border-[#48CAE4] shadow-xl">
            <CardContent className="p-12 text-center">
              <QrCode className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No Events Available
              </h3>
              <p className="text-gray-500">
                You are not assigned to any events yet. Contact the event
                organizer to get access.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Quick Stats */}
        {selectedEvent && (
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="bg-gradient-to-r from-[#0077B6] to-[#0096C7] text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-90">Total Tickets</p>
                    <p className="text-3xl font-bold">
                      {selectedEvent.soldTickets}
                    </p>
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
                    <p className="text-3xl font-bold">87</p>
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
                    <p className="text-3xl font-bold">
                      {(selectedEvent.soldTickets || 0) - 87}
                    </p>
                  </div>
                  <QrCode className="h-10 w-10 opacity-75" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Instructions */}
        <Card className="bg-gradient-to-r from-[#90E0EF] to-[#CAF0F8] border-[#48CAE4]">
          <CardHeader>
            <CardTitle className="text-[#03045E]">
              📋 Check-In Instructions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="font-semibold text-[#03045E] mb-2">
                  Using QR Scanner
                </h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Point camera at attendee's QR code</li>
                  <li>• Wait for automatic detection</li>
                  <li>• Confirm successful check-in</li>
                  <li>• Direct attendee to event entrance</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-[#03045E] mb-2">
                  Manual Entry
                </h4>
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>• Ask for ticket ID or wallet address</li>
                  <li>• Type in the manual input field</li>
                  <li>• Press Enter or click Check-In</li>
                  <li>• Verify attendee identity if needed</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

"use client";

import { useState } from "react";
import { EventOrganizerSidebar } from "@/components/event-organizer-sidebar";
import { EventHeader } from "@/components/event-header";
import { EventMetricsCards } from "@/components/event-metrics-cards";
import { EventCharts } from "@/components/event-charts";
import { AttendeeDataTable } from "@/components/attendee-data-table";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { mockEvents, mockTickets, mockAnalytics } from "@/app/data/mockData";
import { Calendar, MapPin, DollarSign, Ticket } from "lucide-react";
import EventCreationWizard from "@/app/_components/dashboard/EventCreationWizard";
import CheckInScanner from "@/app/_components/dashboard/CheckInScanner";
import PayoutManagement from "@/app/_components/dashboard/PayoutManagement";
import QRCodeDisplay from "@/app/_components/dashboard/QRCodeDisplay";
import {
  CheckInData,
  CreateEventFormData,
  TicketData,
} from "@/app/types/event";

export default function Page() {
  const [selectedEventId, setSelectedEventId] = useState(mockEvents[0].id);
  const [activeTab, setActiveTab] = useState("overview");
  const [showWizard, setShowWizard] = useState(false);
  const [selectedTicketForQR, setSelectedTicketForQR] =
    useState<TicketData | null>(null);

  const selectedEvent =
    mockEvents.find((e) => e.id === selectedEventId) || mockEvents[0];
  const eventTickets = mockTickets.filter((t) => t.eventId === selectedEventId);
  const eventAnalytics = mockAnalytics[selectedEventId];

  const handleCreateEvent = (data: CreateEventFormData) => {
    console.log("Creating event:", data);
    setShowWizard(false);
  };

  const handleCheckIn = async (data: CheckInData): Promise<boolean> => {
    console.log("Check-in data:", data);
    return Math.random() > 0.3;
  };

  const handleRequestPayout = async (): Promise<boolean> => {
    console.log("Requesting payout...");
    return true;
  };

  const handleViewQR = (ticketId: string) => {
    const ticket = eventTickets.find((t) => t.id === ticketId);
    if (ticket) setSelectedTicketForQR(ticket);
  };

  return (
    <SidebarProvider>
      <EventOrganizerSidebar
        selectedEventId={selectedEventId}
        onEventSelect={setSelectedEventId}
      />
      <SidebarInset>
        <EventHeader
          eventName={selectedEvent.name}
          onCreateEvent={() => setShowWizard(true)}
        />

        <div className="flex flex-1 flex-col p-4 md:p-6 gap-4">
          {showWizard ? (
            <EventCreationWizard
              onSubmit={handleCreateEvent}
              onCancel={() => setShowWizard(false)}
            />
          ) : (
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="space-y-4"
            >
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
                <TabsTrigger value="attendees">Attendees</TabsTrigger>
                <TabsTrigger value="checkin">Check-in</TabsTrigger>
                <TabsTrigger value="payout">Payout</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                {/* Event Info Card */}
                <Card>
                  <CardHeader>
                    <CardTitle>{selectedEvent.name}</CardTitle>
                    <CardDescription>
                      {selectedEvent.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Date</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedEvent.date.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Location</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedEvent.location}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Price</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedEvent.priceInSOL} SOL
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Ticket className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Tickets</p>
                          <p className="text-sm text-muted-foreground">
                            {selectedEvent.ticketsSold} /{" "}
                            {selectedEvent.maxTickets}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {eventAnalytics && (
                  <>
                    <EventMetricsCards
                      analytics={eventAnalytics}
                      priceInSOL={selectedEvent.priceInSOL}
                    />
                    <EventCharts analytics={eventAnalytics} />
                  </>
                )}
              </TabsContent>

              <TabsContent value="analytics" className="space-y-4">
                {eventAnalytics && (
                  <>
                    <EventMetricsCards
                      analytics={eventAnalytics}
                      priceInSOL={selectedEvent.priceInSOL}
                    />
                    <EventCharts analytics={eventAnalytics} />
                  </>
                )}
              </TabsContent>

              <TabsContent value="attendees">
                <AttendeeDataTable
                  tickets={eventTickets}
                  onViewQR={handleViewQR}
                  onCheckIn={(ticketId) =>
                    console.log("Manual check-in:", ticketId)
                  }
                />
              </TabsContent>

              <TabsContent value="checkin">
                <CheckInScanner
                  eventId={selectedEvent.id}
                  eventName={selectedEvent.name}
                  onCheckIn={handleCheckIn}
                  onLookupTicket={async (ticketId) =>
                    eventTickets.find((t) => t.id === ticketId) || null
                  }
                />
              </TabsContent>

              <TabsContent value="payout">
                {eventAnalytics && (
                  <PayoutManagement
                    eventId={selectedEvent.id}
                    eventName={selectedEvent.name}
                    totalRevenue={eventAnalytics.totalRevenue}
                    organizerWallet={selectedEvent.creatorWallet}
                    payouts={[]}
                    onRequestPayout={handleRequestPayout}
                  />
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </SidebarInset>

      {/* QR Code Modal */}
      {selectedTicketForQR && (
        <QRCodeDisplay
          ticket={selectedTicketForQR}
          eventName={selectedEvent.name}
          onClose={() => setSelectedTicketForQR(null)}
        />
      )}
    </SidebarProvider>
  );
}

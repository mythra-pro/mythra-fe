"use client";

import { useState } from "react";
import {
  EventData,
  TicketData,
  CreateEventFormData,
  CheckInData,
  TicketStatus,
} from "@/app/types/event";
import {
  mockEvents,
  mockTickets,
  mockAnalytics,
  mockPayouts,
  generateMockTickets,
} from "@/app/data/mockData";
import EventCreationWizard from "./EventCreationWizard";
import AnalyticsDashboard from "./AnalyticsDashboard";
import AttendeeList from "./AttendeeList";
import QRCodeDisplay from "./QRCodeDisplay";
import CheckInScanner from "./CheckInScanner";
import PayoutManagement from "./PayoutManagement";
import {
  Plus,
  BarChart3,
  Users,
  QrCode,
  Wallet,
  Calendar,
  Menu,
  X,
} from "lucide-react";

type TabType =
  | "overview"
  | "analytics"
  | "attendees"
  | "checkin"
  | "payout"
  | "create";

export default function EventOrganizerDashboard() {
  const [selectedEvent, setSelectedEvent] = useState<EventData>(mockEvents[0]);
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [showWizard, setShowWizard] = useState(false);
  const [selectedTicketForQR, setSelectedTicketForQR] =
    useState<TicketData | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Get tickets for selected event
  const eventTickets = mockTickets.filter(
    (t) => t.eventId === selectedEvent.id
  );

  // Get analytics for selected event
  const eventAnalytics = mockAnalytics[selectedEvent.id];

  // Get payouts for selected event
  const eventPayouts = mockPayouts.filter(
    (p) => p.eventId === selectedEvent.id
  );

  const handleCreateEvent = (data: CreateEventFormData) => {
    console.log("Creating event:", data);
    // In production, this would call Solana smart contract to mint NFTs
    // and create event on blockchain
    setShowWizard(false);
    setActiveTab("overview");
  };

  const handleCheckIn = async (data: CheckInData): Promise<boolean> => {
    console.log("Check-in data:", data);
    // In production, this would verify wallet signature on Solana
    // and update NFT metadata
    return Math.random() > 0.3; // 70% success rate for demo
  };

  const handleLookupTicket = async (
    ticketId: string
  ): Promise<TicketData | null> => {
    return eventTickets.find((t) => t.id === ticketId) || null;
  };

  const handleRequestPayout = async (): Promise<boolean> => {
    console.log("Requesting payout...");
    // In production, this would create Solana transaction
    // to transfer SOL from escrow to organizer wallet
    return true;
  };

  const handleViewQR = (ticketId: string) => {
    const ticket = eventTickets.find((t) => t.id === ticketId);
    if (ticket) {
      setSelectedTicketForQR(ticket);
    }
  };

  const handleManualCheckIn = (ticketId: string) => {
    console.log("Manual check-in for ticket:", ticketId);
    // Update ticket status in production
  };

  const tabs = [
    { id: "overview" as TabType, label: "Overview", icon: Calendar },
    { id: "analytics" as TabType, label: "Analytics", icon: BarChart3 },
    { id: "attendees" as TabType, label: "Attendees", icon: Users },
    { id: "checkin" as TabType, label: "Check-in", icon: QrCode },
    { id: "payout" as TabType, label: "Payout", icon: Wallet },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-40 border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden text-gray-600 hover:text-gray-900"
              >
                {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                Event Organizer Dashboard
              </h1>
            </div>
            <button
              onClick={() => {
                setShowWizard(true);
                setActiveTab("create");
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 hover:shadow-md transition-all font-medium"
            >
              <Plus />
              <span className="hidden sm:inline">Create Event</span>
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Event Selector */}
          <aside
            className={`lg:w-80 ${
              sidebarOpen ? "block" : "hidden lg:block"
            } space-y-6`}
          >
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4">
                Your Events
              </h2>
              <div className="space-y-3">
                {mockEvents.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => {
                      setSelectedEvent(event);
                      setSidebarOpen(false);
                    }}
                    className={`w-full text-left p-4 rounded-lg transition-all ${
                      selectedEvent.id === event.id
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-gray-50 hover:bg-gray-100 text-gray-900"
                    }`}
                  >
                    <p className="font-bold text-sm mb-1">{event.name}</p>
                    <p
                      className={`text-xs ${
                        selectedEvent.id === event.id
                          ? "text-blue-100"
                          : "text-gray-500"
                      }`}
                    >
                      {event.date.toLocaleDateString()}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          selectedEvent.id === event.id
                            ? "bg-white bg-opacity-20"
                            : "bg-gray-200"
                        }`}
                      >
                        {event.ticketsSold}/{event.maxTickets} sold
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                Quick Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Events</span>
                  <span className="font-bold text-gray-900">
                    {mockEvents.length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Active Events</span>
                  <span className="font-bold text-blue-600">2</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total Revenue</span>
                  <span className="font-bold text-blue-600">858 SOL</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Tabs */}
            {!showWizard && (
              <div className="bg-white rounded-xl shadow-sm mb-6 overflow-x-auto border border-gray-200">
                <div className="flex border-b border-gray-200">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                        activeTab === tab.id
                          ? "border-b-2 border-blue-600 text-blue-600"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      <tab.icon />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Content Area */}
            <div className="space-y-6">
              {showWizard && activeTab === "create" && (
                <EventCreationWizard
                  onSubmit={handleCreateEvent}
                  onCancel={() => {
                    setShowWizard(false);
                    setActiveTab("overview");
                  }}
                />
              )}

              {!showWizard && activeTab === "overview" && (
                <div className="space-y-6">
                  {/* Event Header Card */}
                  <div className="bg-blue-600 rounded-2xl p-8 text-white">
                    <h2 className="text-3xl font-bold mb-2">
                      {selectedEvent.name}
                    </h2>
                    <p className="text-blue-100 mb-4">
                      {selectedEvent.description}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-blue-100 text-sm">Date</p>
                        <p className="font-bold">
                          {selectedEvent.date.toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-blue-100 text-sm">Location</p>
                        <p className="font-bold">{selectedEvent.location}</p>
                      </div>
                      <div>
                        <p className="text-blue-100 text-sm">Tickets Sold</p>
                        <p className="font-bold">
                          {selectedEvent.ticketsSold}/{selectedEvent.maxTickets}
                        </p>
                      </div>
                      <div>
                        <p className="text-blue-100 text-sm">Price</p>
                        <p className="font-bold">
                          {selectedEvent.priceInSOL} SOL
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <button
                      onClick={() => setActiveTab("analytics")}
                      className="bg-white rounded-xl shadow-sm p-6 text-left hover:shadow-md transition-all border border-gray-200"
                    >
                      <BarChart3 className="text-3xl text-blue-600 mb-3" />
                      <h3 className="font-bold text-gray-900 mb-2">
                        View Analytics
                      </h3>
                      <p className="text-sm text-gray-600">
                        Track sales and revenue
                      </p>
                    </button>

                    <button
                      onClick={() => setActiveTab("attendees")}
                      className="bg-white rounded-xl shadow-sm p-6 text-left hover:shadow-md transition-all border border-gray-200"
                    >
                      <Users className="text-3xl text-blue-600 mb-3" />
                      <h3 className="font-bold text-gray-900 mb-2">
                        Manage Attendees
                      </h3>
                      <p className="text-sm text-gray-600">
                        View and manage tickets
                      </p>
                    </button>

                    <button
                      onClick={() => setActiveTab("checkin")}
                      className="bg-white rounded-xl shadow-sm p-6 text-left hover:shadow-md transition-all border border-gray-200"
                    >
                      <QrCode className="text-3xl text-blue-600 mb-3" />
                      <h3 className="font-bold text-gray-900 mb-2">
                        Check-in Scanner
                      </h3>
                      <p className="text-sm text-gray-600">
                        Scan QR codes at entrance
                      </p>
                    </button>
                  </div>
                </div>
              )}

              {!showWizard && activeTab === "analytics" && eventAnalytics && (
                <AnalyticsDashboard
                  analytics={eventAnalytics}
                  eventName={selectedEvent.name}
                />
              )}

              {!showWizard && activeTab === "attendees" && (
                <AttendeeList
                  tickets={eventTickets}
                  eventName={selectedEvent.name}
                  onCheckIn={handleManualCheckIn}
                  onViewQR={handleViewQR}
                />
              )}

              {!showWizard && activeTab === "checkin" && (
                <CheckInScanner
                  eventId={selectedEvent.id}
                  eventName={selectedEvent.name}
                  onCheckIn={handleCheckIn}
                  onLookupTicket={handleLookupTicket}
                />
              )}

              {!showWizard && activeTab === "payout" && eventAnalytics && (
                <PayoutManagement
                  eventId={selectedEvent.id}
                  eventName={selectedEvent.name}
                  totalRevenue={eventAnalytics.totalRevenue}
                  organizerWallet={selectedEvent.creatorWallet}
                  payouts={eventPayouts}
                  onRequestPayout={handleRequestPayout}
                />
              )}
            </div>
          </main>
        </div>
      </div>

      {/* QR Code Modal */}
      {selectedTicketForQR && (
        <QRCodeDisplay
          ticket={selectedTicketForQR}
          eventName={selectedEvent.name}
          onClose={() => setSelectedTicketForQR(null)}
        />
      )}
    </div>
  );
}

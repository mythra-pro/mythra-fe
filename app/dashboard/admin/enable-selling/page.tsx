"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DashboardLayout } from "@/components/dashboard-layout";
import { getMenuSectionsForRole } from "@/app/utils/dashboardMenus";
import { useDashboardUser } from "@/hooks/useDashboardUser";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { 
  Ticket, 
  CheckCircle, 
  XCircle, 
  Calendar,
  MapPin,
  Sparkles,
  Loader2
} from "lucide-react";

// Force dynamic rendering
export const dynamic = "force-dynamic";

export default function EnableSellingPage() {
  const { user, isLoading: userLoading } = useDashboardUser("admin");
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    // Fetch all events
    fetch("/api/events")
      .then((res) => res.json())
      .then((data) => {
        setEvents(data.events || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching events:", err);
        setLoading(false);
      });
  }, []);

  const quickEnableForEvent = async (eventId: string) => {
    setProcessingId(eventId);
    
    try {
      // Direct database update via a simple API call
      const res = await fetch("/api/admin/events/enable-selling", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(`❌ Error: ${data.error || "Failed to enable ticket selling"}`);
        return;
      }

      // Show success message
      alert("🎉 SUCCESS! Ticket selling enabled!\n\n" +
            "The event is now:\n" +
            "✅ can_sell_tickets = true\n" +
            "✅ status = selling_tickets\n" +
            "✅ verified = true\n" +
            "✅ Ready for customers!");
      
      // Refresh events list
      const refreshRes = await fetch("/api/events");
      const refreshData = await refreshRes.json();
      setEvents(refreshData.events || []);
    } catch (err: any) {
      alert(`❌ Error: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  // Get menu sections
  const menuSections = getMenuSectionsForRole("admin");

  if (userLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const enabledEvents = events.filter(e => e.can_sell_tickets);
  const disabledEvents = events.filter(e => !e.can_sell_tickets);

  return (
    <DashboardLayout user={user} menuSections={menuSections}>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg">
              <Ticket className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-[#03045E]">
                Enable Ticket Selling
              </h1>
            </div>
          </div>
          <p className="text-gray-600 mt-2 text-lg">
            Manage ticket selling permissions for events. Enable ticket sales to make events visible to customers.
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Total Events</p>
                    <p className="text-3xl font-bold text-blue-600">{events.length}</p>
                  </div>
                  <Calendar className="h-12 w-12 text-blue-400 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-green-50 to-white border-green-200 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Selling Enabled</p>
                    <p className="text-3xl font-bold text-green-600">{enabledEvents.length}</p>
                  </div>
                  <CheckCircle className="h-12 w-12 text-green-400 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-gradient-to-br from-orange-50 to-white border-orange-200 shadow-md hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Needs Enabling</p>
                    <p className="text-3xl font-bold text-orange-600">{disabledEvents.length}</p>
                  </div>
                  <XCircle className="h-12 w-12 text-orange-400 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {loading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading events...</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {events.map((event, idx) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <Card className={`overflow-hidden transition-all hover:shadow-lg ${
                  event.can_sell_tickets 
                    ? "border-green-300 bg-gradient-to-br from-green-50/50 to-white" 
                    : "border-orange-200 bg-gradient-to-br from-orange-50/30 to-white"
                }`}>
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-2xl text-[#03045E]">{event.name}</CardTitle>
                          {event.can_sell_tickets ? (
                            <Badge className="bg-green-600 text-white border-0 px-3 py-1">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Enabled
                            </Badge>
                          ) : (
                            <Badge className="bg-orange-600 text-white border-0 px-3 py-1">
                              <XCircle className="h-3 w-3 mr-1" />
                              Disabled
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="text-xs font-mono text-gray-400">
                          {event.id}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Event Details */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500 font-medium">Status</p>
                        <Badge variant="outline" className="text-xs">
                          {event.status}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500 font-medium">Ticket Sales</p>
                        <p className={`text-sm font-bold ${
                          event.can_sell_tickets ? "text-green-600" : "text-orange-600"
                        }`}>
                          {event.can_sell_tickets ? "Enabled" : "Disabled"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500 font-medium">Max Tickets</p>
                        <p className="text-sm font-bold text-[#03045E]">
                          {event.max_tickets || "N/A"}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-gray-500 font-medium">Verified</p>
                        <p className={`text-sm font-bold ${
                          event.verified ? "text-green-600" : "text-gray-400"
                        }`}>
                          {event.verified ? "Yes" : "No"}
                        </p>
                      </div>
                    </div>

                    {/* Event Info */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600 pt-2 border-t">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-blue-600" />
                        <span>
                          {new Date(event.start_time || event.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      {event.venue && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-purple-600" />
                          <span className="truncate max-w-[200px]">{event.venue}</span>
                        </div>
                      )}
                      {event.category && (
                        <Badge variant="outline" className="text-xs">
                          {event.category}
                        </Badge>
                      )}
                    </div>

                    {/* Action Button */}
                    {!event.can_sell_tickets && (
                      <Button
                        onClick={() => quickEnableForEvent(event.id)}
                        disabled={processingId === event.id}
                        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold h-12 text-base shadow-lg hover:shadow-xl transition-all"
                      >
                        {processingId === event.id ? (
                          <>
                            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                            Enabling...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-5 w-5 mr-2" />
                            Enable Ticket Selling NOW
                          </>
                        )}
                      </Button>
                    )}

                    {event.can_sell_tickets && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 text-green-800">
                          <CheckCircle className="h-5 w-5" />
                          <p className="font-semibold">Ticket selling is active for this event</p>
                        </div>
                        <p className="text-xs text-green-600 mt-1">
                          Customers can now purchase tickets from the marketplace
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

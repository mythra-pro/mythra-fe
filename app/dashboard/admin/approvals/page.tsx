"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { getMenuSectionsForRole } from "@/app/utils/dashboardMenus";
import { useDashboardUser } from "@/hooks/useDashboardUser";
import {
  ShieldCheck,
  Calendar,
  MapPin,
  Users,
  Eye,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

// Force dynamic rendering - required for wallet-connected pages
export const dynamic = "force-dynamic";

export default function AdminApprovalsPage() {
  const { user, isLoading: userLoading } = useDashboardUser("admin");
  const [pendingEvents, setPendingEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvedToday, setApprovedToday] = useState(0);
  const [rejectedToday, setRejectedToday] = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const menuSections = getMenuSectionsForRole("admin");

  // Fetch pending events and stats
  useEffect(() => {
    if (userLoading) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        console.log("🔍 Fetching pending events for approval...");
        
        // Fetch pending events
        const response = await fetch("/api/admin/events/pending");
        const data = await response.json();
        
        console.log("📊 Pending events fetched:", data.events?.length || 0);
        
        if (data.events) {
          setPendingEvents(data.events);
        }

        // Fetch today's stats
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const allEventsRes = await fetch("/api/events");
        const allEventsData = await allEventsRes.json();
        
        if (allEventsData.success && allEventsData.events) {
          const todayApproved = allEventsData.events.filter((e: any) => {
            const approvedDate = e.approved_at ? new Date(e.approved_at) : null;
            return approvedDate && approvedDate >= today && (
              e.status === 'investment_window' || 
              // Legacy status
              e.status === 'approved'
            );
          });
          const todayRejected = allEventsData.events.filter((e: any) => {
            const rejectedDate = e.updated_at ? new Date(e.updated_at) : null;
            return rejectedDate && rejectedDate >= today && e.status === 'rejected';
          });
          
          setApprovedToday(todayApproved.length);
          setRejectedToday(todayRejected.length);
        }
      } catch (err) {
        console.error("❌ Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userLoading]);

  const handleApprove = async (eventId: string) => {
    try {
      console.log("✅ Approving event:", eventId);
      
      const response = await fetch(`/api/admin/events/${eventId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: user?.id })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        console.log("✅ Event approved successfully");
        // Remove from pending list
        setPendingEvents(prev => prev.filter(e => e.id !== eventId));
        setApprovedToday(prev => prev + 1);
        alert("Event approved successfully!");
      } else {
        console.error("❌ Error approving event:", data.error);
        alert(`Error: ${data.error || 'Failed to approve event'}`);
      }
    } catch (err) {
      console.error("❌ Error approving event:", err);
      alert("Failed to approve event. Please try again.");
    }
  };

  const handleReject = async (eventId: string) => {
    const reason = prompt("Please enter rejection reason:");
    if (!reason) return;
    
    try {
      console.log("❌ Rejecting event:", eventId);
      
      const response = await fetch(`/api/admin/events/${eventId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          adminId: user?.id,
          reason 
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        console.log("✅ Event rejected successfully");
        // Remove from pending list
        setPendingEvents(prev => prev.filter(e => e.id !== eventId));
        setRejectedToday(prev => prev + 1);
        alert("Event rejected successfully.");
      } else {
        console.error("❌ Error rejecting event:", data.error);
        alert(`Error: ${data.error || 'Failed to reject event'}`);
      }
    } catch (err) {
      console.error("❌ Error rejecting event:", err);
      alert("Failed to reject event. Please try again.");
    }
  };

  if (userLoading || !user) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <DashboardLayout user={user} menuSections={menuSections}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-[#03045E]">Event Approvals</h1>
          <p className="text-gray-600 mt-2">
            Review and approve pending event submissions.
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Pending</p>
                  <p className="text-3xl font-bold">{pendingEvents.length}</p>
                </div>
                <ShieldCheck className="h-10 w-10 opacity-75" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Approved Today</p>
                  <p className="text-3xl font-bold">{approvedToday}</p>
                </div>
                <CheckCircle className="h-10 w-10 opacity-75" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Rejected Today</p>
                  <p className="text-3xl font-bold">{rejectedToday}</p>
                </div>
                <XCircle className="h-10 w-10 opacity-75" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Pending Events */}
        <Card className="bg-white/90 border-[#48CAE4] shadow-xl">
          <CardHeader>
            <CardTitle className="text-[#03045E] flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              Pending Event Approvals
            </CardTitle>
            <CardDescription>
              Events waiting for administrative review and approval
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading pending events...</p>
              </div>
            ) : pendingEvents.length === 0 ? (
              <div className="p-12 text-center">
                <ShieldCheck className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No Pending Approvals
                </h3>
                <p className="text-gray-500">
                  All events have been reviewed. Check back later for new
                  submissions.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingEvents.map((event, idx) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="bg-gradient-to-r from-white to-[#CAF0F8] border-[#48CAE4]">
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                          {/* Event Info */}
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3">
                              <h3 className="text-xl font-bold text-[#03045E]">
                                {event.name}
                              </h3>
                              <Badge className="bg-yellow-500 text-white">
                                Pending Review
                              </Badge>
                              <Badge className="bg-[#0077B6] text-white">
                                {event.category}
                              </Badge>
                            </div>

                            <p className="text-gray-700 leading-relaxed">
                              {event.description}
                            </p>

                            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Users className="h-4 w-4" />
                                <span className="font-medium">Organizer:</span>
                                <span>{event.organizer?.display_name || 'Unknown'}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Calendar className="h-4 w-4" />
                                <span className="font-medium">Date:</span>
                                <span>
                                  {new Date(
                                    event.start_time
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin className="h-4 w-4" />
                                <span className="font-medium">Location:</span>
                                <span>{event.venue}</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <Users className="h-4 w-4" />
                                <span className="font-medium">Capacity:</span>
                                <span>{event.totalTickets}</span>
                              </div>
                            </div>

                            {/* Ticket Types Preview */}
                            {event.ticketTypes &&
                              event.ticketTypes.length > 0 && (
                                <div className="mt-4">
                                  <h4 className="text-sm font-semibold text-[#03045E] mb-2">
                                    Ticket Types:
                                  </h4>
                                  <div className="flex flex-wrap gap-2">
                                    {event.ticketTypes.map((ticket: any) => (
                                      <Badge
                                        key={ticket.id}
                                        variant="outline"
                                        className="border-[#0077B6] text-[#0077B6]"
                                      >
                                        {ticket.name} - ${ticket.price}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col gap-3 lg:w-40">
                            <Button
                              onClick={() => {
                                setSelectedEvent(event);
                                setShowDetailsModal(true);
                              }}
                              variant="outline"
                              className="w-full border-[#0077B6] text-[#0077B6] hover:bg-[#0077B6] hover:text-white"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </Button>
                            <Button
                              onClick={() => handleApprove(event.id)}
                              className="w-full bg-green-500 hover:bg-green-600 text-white"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              onClick={() => handleReject(event.id)}
                              variant="outline"
                              className="w-full border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

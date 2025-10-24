"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { getMenuSectionsForRole } from "@/app/utils/dashboardMenus";
import { dummyUsers, dummyEvents } from "@/lib/dummy-data";
import {
  Calendar,
  Users,
  MapPin,
  DollarSign,
  Eye,
  Edit,
  Trash2,
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { motion } from "framer-motion";

// Force dynamic rendering - required for wallet-connected pages
export const dynamic = "force-dynamic";

export default function AdminEventsPage() {
  const user = dummyUsers.find((u) => u.role === "admin")!;
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [events, setEvents] = useState(dummyEvents);

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || event.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDeleteEvent = (eventId: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      setEvents(events.filter((e) => e.id !== eventId));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-500";
      case "draft":
        return "bg-yellow-500";
      case "cancelled":
        return "bg-red-500";
      case "completed":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  // Get menu sections for admin role

  const menuSections = getMenuSectionsForRole("admin");

  return (
    <DashboardLayout user={user} menuSections={menuSections}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-[#03045E]">
            Event Management
          </h1>
          <p className="text-gray-600 mt-2">
            Manage all events across the platform.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Published</p>
                  <p className="text-3xl font-bold">
                    {events.filter((e) => e.status === "published").length}
                  </p>
                </div>
                <Calendar className="h-10 w-10 opacity-75" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Pending</p>
                  <p className="text-3xl font-bold">
                    {events.filter((e) => e.status === "draft").length}
                  </p>
                </div>
                <Calendar className="h-10 w-10 opacity-75" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Completed</p>
                  <p className="text-3xl font-bold">
                    {events.filter((e) => e.status === "completed").length}
                  </p>
                </div>
                <Calendar className="h-10 w-10 opacity-75" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Cancelled</p>
                  <p className="text-3xl font-bold">
                    {events.filter((e) => e.status === "cancelled").length}
                  </p>
                </div>
                <Calendar className="h-10 w-10 opacity-75" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 shadow-lg">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search events..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 border-0 bg-gray-50 rounded-xl text-lg placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-[#0077B6]/20 transition-all"
              />
            </div>
            <div className="sm:w-56">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-12 border-0 bg-gray-50 rounded-xl text-lg focus:bg-white focus:ring-2 focus:ring-[#0077B6]/20 transition-all">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-0 shadow-xl bg-white">
                  <SelectItem value="all" className="rounded-lg">
                    All Status
                  </SelectItem>
                  <SelectItem value="published" className="rounded-lg">
                    Published
                  </SelectItem>
                  <SelectItem value="draft" className="rounded-lg">
                    Draft
                  </SelectItem>
                  <SelectItem value="completed" className="rounded-lg">
                    Completed
                  </SelectItem>
                  <SelectItem value="cancelled" className="rounded-lg">
                    Cancelled
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Events List */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-[#03045E] flex items-center gap-3">
                <Calendar className="h-6 w-6" />
                All Events
              </h2>
              <p className="text-gray-500 mt-1">
                {filteredEvents.length} events found
              </p>
            </div>
          </div>

          <div className="grid gap-6">
            {filteredEvents.map((event, idx) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="group"
              >
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                  <div className="p-8">
                    {/* Header */}
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                      <div className="flex-1 space-y-6">
                        {/* Title & Badges */}
                        <div className="space-y-3">
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-2xl font-bold text-[#03045E] group-hover:text-[#0077B6] transition-colors">
                              {event.name}
                            </h3>
                            <Badge
                              className={`${getStatusColor(
                                event.status
                              )} text-white rounded-full px-3 py-1 text-xs font-medium`}
                            >
                              {event.status}
                            </Badge>
                          </div>
                          <Badge className="bg-[#0077B6]/10 text-[#0077B6] rounded-full px-3 py-1 text-xs font-medium w-fit">
                            {event.category}
                          </Badge>
                        </div>

                        {/* Description */}
                        <p className="text-gray-600 text-lg leading-relaxed line-clamp-2">
                          {event.description}
                        </p>

                        {/* Event Details */}
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#0077B6]/10 rounded-xl flex items-center justify-center">
                              <Users className="h-5 w-5 text-[#0077B6]" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Organizer</p>
                              <p className="font-medium text-gray-900">
                                {event.organizerName}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center">
                              <Calendar className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Date</p>
                              <p className="font-medium text-gray-900">
                                {new Date(event.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-500/10 rounded-xl flex items-center justify-center">
                              <MapPin className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Location</p>
                              <p className="font-medium text-gray-900">
                                {event.location}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center">
                              <DollarSign className="h-5 w-5 text-yellow-600" />
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Revenue</p>
                              <p className="font-medium text-gray-900">
                                ${event.revenue?.toLocaleString() || "0"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 text-center">
                            <p className="text-sm text-blue-600 font-medium mb-1">
                              Tickets Sold
                            </p>
                            <p className="text-2xl font-bold text-blue-700">
                              {event.soldTickets || 0}
                            </p>
                          </div>
                          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 text-center">
                            <p className="text-sm text-green-600 font-medium mb-1">
                              Total Capacity
                            </p>
                            <p className="text-2xl font-bold text-green-700">
                              {event.totalTickets}
                            </p>
                          </div>
                          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 text-center">
                            <p className="text-sm text-purple-600 font-medium mb-1">
                              Fill Rate
                            </p>
                            <p className="text-2xl font-bold text-purple-700">
                              {Math.round(
                                ((event.soldTickets || 0) /
                                  (event.totalTickets || 1)) *
                                  100
                              )}
                              %
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-row lg:flex-col gap-3 lg:w-36">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 lg:w-full h-11 border-[#0077B6] text-[#0077B6] hover:bg-[#0077B6] hover:text-white rounded-xl font-medium transition-all cursor-pointer"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 lg:w-full h-11 border-green-500 text-green-600 hover:bg-green-500 hover:text-white rounded-xl font-medium transition-all cursor-pointer"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDeleteEvent(event.id)}
                          variant="outline"
                          size="sm"
                          className="flex-1 lg:w-full h-11 border-red-500 text-red-600 hover:bg-red-500 hover:text-white rounded-xl font-medium transition-all cursor-pointer"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {filteredEvents.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Calendar className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No events found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

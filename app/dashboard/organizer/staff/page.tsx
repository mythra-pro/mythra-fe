"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { getMenuSectionsForRole } from "@/app/utils/dashboardMenus";
import { dummyUsers, dummyEvents } from "@/lib/dummy-data";
import { Users, UserPlus, Shield, Calendar, DollarSign } from "lucide-react";
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

export default function OrganizerStaffPage() {
  const user = dummyUsers.find((u) => u.role === "organizer")!;
  const myEvents = dummyEvents.filter((e) => e.organizerId === user.id);
  const myStaff = dummyUsers.filter((u) => u.role === "staff");

  // Get menu sections for organizer role


  const menuSections = getMenuSectionsForRole('organizer');

  return (
    <DashboardLayout user={user} menuSections={menuSections}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-[#03045E]">
              Staff Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your event staff and assign them to events.
            </p>
          </div>
          <Button className="mt-4 md:mt-0 bg-[#0077B6] hover:bg-[#0096C7] text-white">
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Staff
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-gradient-to-r from-[#0077B6] to-[#0096C7] text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Staff</p>
                  <p className="text-3xl font-bold">{myStaff.length}</p>
                </div>
                <Users className="h-10 w-10 opacity-75" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Active Staff</p>
                  <p className="text-3xl font-bold">{myStaff.length}</p>
                </div>
                <Shield className="h-10 w-10 opacity-75" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-[#48CAE4] to-[#90E0EF] text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Events Staffed</p>
                  <p className="text-3xl font-bold">{myEvents.length}</p>
                </div>
                <Calendar className="h-10 w-10 opacity-75" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Staff Payroll</p>
                  <p className="text-3xl font-bold">$12.5K</p>
                </div>
                <DollarSign className="h-10 w-10 opacity-75" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Staff List */}
        <Card className="bg-white/90 border-[#48CAE4] shadow-xl">
          <CardHeader>
            <CardTitle className="text-[#03045E] flex items-center gap-2">
              <Users className="h-5 w-5" />
              Your Staff Members
            </CardTitle>
            <CardDescription>
              Manage your event staff and their assignments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myStaff.map((staff, idx) => (
                <motion.div
                  key={staff.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="bg-gradient-to-r from-white to-[#CAF0F8] border-[#48CAE4]">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#0077B6] to-[#0096C7] flex items-center justify-center text-white font-bold text-xl">
                            {staff.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-[#03045E] mb-1">
                              {staff.name}
                            </h3>
                            <p className="text-gray-600 mb-2">{staff.email}</p>
                            <div className="flex items-center gap-2">
                              <Badge className="bg-green-500 text-white">
                                active
                              </Badge>
                              <Badge className="bg-[#0077B6] text-white">
                                Staff
                              </Badge>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="flex gap-2 mb-3">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-[#0077B6] text-[#0077B6] hover:bg-[#0077B6] hover:text-white"
                            >
                              Assign Events
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                            >
                              View Profile
                            </Button>
                          </div>
                          <p className="text-xs text-gray-500">
                            Joined:{" "}
                            {new Date(
                              staff.createdAt || "2024-01-01"
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Assigned Events */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <h4 className="text-sm font-semibold text-[#03045E] mb-2">
                          Assigned Events:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {myEvents
                            .filter((e) => e.staffIds?.includes(staff.id))
                            .map((event) => (
                              <Badge
                                key={event.id}
                                variant="outline"
                                className="text-xs border-[#48CAE4] text-[#0077B6]"
                              >
                                {event.name}
                              </Badge>
                            ))}
                          {myEvents.filter((e) =>
                            e.staffIds?.includes(staff.id)
                          ).length === 0 && (
                            <span className="text-sm text-gray-500">
                              No events assigned
                            </span>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}

              {myStaff.length === 0 && (
                <div className="p-12 text-center">
                  <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No Staff Members Yet
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Invite team members to help manage your events.
                  </p>
                  <Button className="bg-[#0077B6] hover:bg-[#0096C7] text-white">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Invite Your First Staff Member
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Event Assignments */}
        <Card className="bg-white/80 border-[#48CAE4]">
          <CardHeader>
            <CardTitle className="text-[#03045E]">
              Event Staff Assignments
            </CardTitle>
            <CardDescription>
              Overview of staff assignments across your events
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myEvents.map((event, idx) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="bg-gradient-to-r from-[#F8F9FA] to-white border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-[#03045E] mb-1">
                            {event.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            {new Date(event.date).toLocaleDateString()} •{" "}
                            {event.location}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600 mb-1">
                            Staff Assigned: {event.staffIds?.length || 0}
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="border-[#0077B6] text-[#0077B6] hover:bg-[#0077B6] hover:text-white"
                          >
                            Manage Staff
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Staff Management Guide */}
        <Card className="bg-gradient-to-r from-[#90E0EF] to-[#CAF0F8] border-[#48CAE4]">
          <CardHeader>
            <CardTitle className="text-[#03045E]">
              📋 Staff Management Guide
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <h4 className="font-semibold text-[#03045E] mb-2">
                  Invite Staff
                </h4>
                <p className="text-sm text-gray-700">
                  Send invitations to team members via email. They'll receive
                  credentials to access their staff dashboard.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-[#03045E] mb-2">
                  Assign Events
                </h4>
                <p className="text-sm text-gray-700">
                  Assign staff members to specific events. They'll gain access
                  to check-in tools and attendee management.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-[#03045E] mb-2">
                  Monitor Performance
                </h4>
                <p className="text-sm text-gray-700">
                  Track staff performance, check-in rates, and event management
                  effectiveness through analytics.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

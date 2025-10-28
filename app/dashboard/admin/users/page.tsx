"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { getMenuSectionsForRole } from "@/app/utils/dashboardMenus";
import { useDashboardUser } from "@/hooks/useDashboardUser";
import {
  Users,
  UserPlus,
  Shield,
  Mail,
  Edit,
  Trash2,
  Search,
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
import { motion } from "framer-motion";

// Force dynamic rendering - required for wallet-connected pages
export const dynamic = "force-dynamic";

export default function AdminUsersPage() {
  const { user, isLoading: userLoading } = useDashboardUser("admin");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const menuSections = getMenuSectionsForRole("admin");

  // Mock role stats
  const roleStats = {
    total: 0,
    admin: 0,
    organizer: 0,
    organizers: 0,
    investor: 0,
    investors: 0,
    staff: 0,
    customer: 0,
    customers: 0,
  };

  const filteredUsers = users.filter((u: any) => {
    const matchesSearch = u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         u.display_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: "bg-red-500",
      organizer: "bg-blue-500",
      investor: "bg-purple-500",
      staff: "bg-green-500",
      customer: "bg-gray-500",
    };
    return colors[role] || "bg-gray-500";
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    alert(`Deleting user ${userId}`);
  };

  if (userLoading || !user) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <DashboardLayout user={user} menuSections={menuSections}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-[#03045E]">
              User Management 👤
            </h1>
            <p className="text-gray-600 mt-2">
              Manage all users across the platform.
            </p>
          </div>
          <Button className="mt-4 md:mt-0 bg-[#0077B6] hover:bg-[#0096C7] text-white">
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-6">
          <Card className="bg-gradient-to-r from-[#0077B6] to-[#0096C7] text-white">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{roleStats.total}</p>
                <p className="text-xs opacity-90">Total Users</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{roleStats.admin}</p>
                <p className="text-xs opacity-90">Admins</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{roleStats.organizer}</p>
                <p className="text-xs opacity-90">Organizers</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{roleStats.customer}</p>
                <p className="text-xs opacity-90">Customers</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{roleStats.investor}</p>
                <p className="text-xs opacity-90">Investors</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold">{roleStats.staff}</p>
                <p className="text-xs opacity-90">Staff</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6 bg-white border border-gray-200 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Search users by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-gray-200"
              />
            </div>
            <div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="border-gray-200">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="organizer">Organizer</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="investor">Investor</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Users List */}
        <Card className="bg-white/90 border-[#48CAE4] shadow-xl">
          <CardHeader>
            <CardTitle className="text-[#03045E] flex items-center gap-2">
              <Users className="h-5 w-5" />
              All Users ({filteredUsers.length})
            </CardTitle>
            <CardDescription>Complete list of platform users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredUsers.map((u, idx) => (
                <motion.div
                  key={u.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="bg-gradient-to-r from-white to-[#CAF0F8] border-[#48CAE4]">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[#0077B6] to-[#0096C7] flex items-center justify-center text-white font-bold text-xl">
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-[#03045E] mb-1">
                              {u.name}
                            </h3>
                            <div className="flex items-center gap-2 mb-2">
                              <Mail className="h-4 w-4 text-gray-500" />
                              <span className="text-gray-600">{u.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                className={`${getRoleColor(u.role)} text-white`}
                              >
                                {u.role}
                              </Badge>
                              <Badge className="bg-green-500 text-white">
                                active
                              </Badge>
                              {u.walletAddress && (
                                <Badge variant="outline" className="text-xs">
                                  Wallet Connected
                                </Badge>
                              )}
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
                              <Shield className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              onClick={() => handleDeleteUser(u.id)}
                              variant="outline"
                              size="sm"
                              className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                          <p className="text-xs text-gray-500">
                            Joined:{" "}
                            {new Date(
                              u.createdAt || "2024-01-01"
                            ).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Additional user info */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <p className="text-gray-600">User ID</p>
                            <p className="font-mono text-xs">{u.id}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Last Active</p>
                            <p className="text-[#03045E]">2 hours ago</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Events Created</p>
                            <p className="text-[#03045E]">
                              {u.role === "organizer" ? "5" : "0"}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Tickets Purchased</p>
                            <p className="text-[#03045E]">
                              {u.role === "customer" ? "12" : "0"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}

              {filteredUsers.length === 0 && (
                <div className="p-12 text-center">
                  <Users className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No users found
                  </h3>
                  <p className="text-gray-500">
                    Try adjusting your search or filter criteria.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* User Management Actions */}
        <Card className="bg-gradient-to-r from-[#90E0EF] to-[#CAF0F8] border-[#48CAE4]">
          <CardHeader>
            <CardTitle className="text-[#03045E]">
              🔧 User Management Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <h4 className="font-semibold text-[#03045E] mb-2">
                  Bulk Operations
                </h4>
                <p className="text-sm text-gray-700 mb-3">
                  Perform actions on multiple users at once.
                </p>
                <Button
                  variant="outline"
                  className="w-full border-[#0077B6] text-[#0077B6] hover:bg-[#0077B6] hover:text-white"
                >
                  Export Users
                </Button>
              </div>
              <div>
                <h4 className="font-semibold text-[#03045E] mb-2">
                  User Verification
                </h4>
                <p className="text-sm text-gray-700 mb-3">
                  Verify user identities and approve accounts.
                </p>
                <Button
                  variant="outline"
                  className="w-full border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                >
                  Pending Verifications
                </Button>
              </div>
              <div>
                <h4 className="font-semibold text-[#03045E] mb-2">
                  Moderation Tools
                </h4>
                <p className="text-sm text-gray-700 mb-3">
                  Suspend or ban users for policy violations.
                </p>
                <Button
                  variant="outline"
                  className="w-full border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                >
                  Moderation Queue
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

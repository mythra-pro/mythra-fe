'use client';

import { DashboardLayout } from '@/components/dashboard-layout';
import { RoleSidebar } from '@/components/role-sidebar';
import { StatCard } from '@/components/stat-card';
import { dummyUsers, dummyEvents } from '@/lib/dummy-data';
import { Calendar, Users, DollarSign, ShieldCheck, TrendingUp, Database } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function AdminDashboard() {
  const user = dummyUsers.find(u => u.role === 'admin')!;
  const allEvents = dummyEvents;
  const allUsers = dummyUsers;
  
  const pendingApprovals = allEvents.filter(e => e.status === 'draft').length;
  const totalRevenue = allEvents.reduce((sum, e) => sum + (e.revenue || 0), 0);
  const platformFee = totalRevenue * 0.05; // 5% platform fee
  const totalPoolBalance = allEvents.reduce((sum, e) => sum + (e.poolBalance || 0), 0);

  return (
    <DashboardLayout user={user} sidebar={<RoleSidebar role="admin" />}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-[#03045E]">
            Admin Control Panel
          </h1> 
          <p className="text-gray-600 mt-2">
            Manage platform operations, events, and users.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Events"
            value={allEvents.length}
            description="Platform-wide"
            icon={Calendar}
            delay={0}
          />
          <StatCard
            title="Total Users"
            value={allUsers.length}
            description="Registered users"
            icon={Users}
            trend={{ value: 18.2, isPositive: true }}
            delay={0.1}
          />
          <StatCard
            title="Platform Revenue"
            value={`$${totalRevenue.toLocaleString()}`}
            description={`Fee: $${platformFee.toLocaleString()}`}
            icon={DollarSign}
            trend={{ value: 25.4, isPositive: true }}
            delay={0.2}
          />
          <StatCard
            title="Pending Approvals"
            value={pendingApprovals}
            description="Events awaiting review"
            icon={ShieldCheck}
            delay={0.3}
          />
        </div>

        {/* Pending Approvals */}
        <Card className="bg-white/90 border-[#48CAE4] shadow-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-[#03045E] flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5" />
                  Pending Event Approvals
                </CardTitle>
                <CardDescription>Events waiting for admin review</CardDescription>
              </div>
              <Link href="/dashboard/admin/approvals">
                <Button className="bg-[#0077B6] hover:bg-[#0096C7] text-white">
                  View All
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {allEvents.filter(e => e.status === 'draft').slice(0, 3).map((event, idx) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="bg-gradient-to-r from-white to-[#CAF0F8] border-[#48CAE4]">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-[#03045E]">
                              {event.name}
                            </h3>
                            <Badge className="bg-yellow-500 text-white">
                              Pending Review
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600">
                            <p>Organizer: {event.organizerName}</p>
                            <p>Date: {new Date(event.date).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            className="bg-green-500 hover:bg-green-600 text-white"
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
              {pendingApprovals === 0 && (
                <div className="p-8 text-center">
                  <ShieldCheck className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No pending approvals</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Platform Analytics */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="bg-white/80 border-[#48CAE4]">
            <CardHeader>
              <CardTitle className="text-[#03045E] flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Revenue Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-[#CAF0F8] to-white rounded-lg">
                  <span className="font-medium text-[#03045E]">Total Revenue</span>
                  <span className="text-xl font-bold text-[#0077B6]">
                    ${totalRevenue.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-[#90E0EF] to-white rounded-lg">
                  <span className="font-medium text-[#03045E]">Platform Fee (5%)</span>
                  <span className="text-xl font-bold text-[#0077B6]">
                    ${platformFee.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gradient-to-r from-[#48CAE4] to-white rounded-lg">
                  <span className="font-medium text-[#03045E]">Organizer Share</span>
                  <span className="text-xl font-bold text-[#0077B6]">
                    ${(totalRevenue - platformFee).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/80 border-[#48CAE4]">
            <CardHeader>
              <CardTitle className="text-[#03045E] flex items-center gap-2">
                <Database className="h-5 w-5" />
                Pool Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-br from-[#0077B6] to-[#0096C7] rounded-lg text-white">
                  <p className="text-sm opacity-90 mb-1">Total Pool Balance</p>
                  <p className="text-3xl font-bold">${totalPoolBalance.toLocaleString()}</p>
                  <p className="text-xs opacity-75 mt-2">Across {allEvents.length} events</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gradient-to-br from-[#CAF0F8] to-white rounded-lg border border-[#48CAE4]">
                    <p className="text-xs text-gray-600 mb-1">Locked Funds</p>
                    <p className="text-lg font-bold text-[#03045E]">
                      ${(totalPoolBalance * 0.7).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 bg-gradient-to-br from-[#90E0EF] to-white rounded-lg border border-[#48CAE4]">
                    <p className="text-xs text-gray-600 mb-1">Available</p>
                    <p className="text-lg font-bold text-[#03045E]">
                      ${(totalPoolBalance * 0.3).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-white/80 border-[#48CAE4]">
          <CardHeader>
            <CardTitle className="text-[#03045E]">Admin Actions</CardTitle>
            <CardDescription>Quick access to administrative functions</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-4">
            <Link href="/dashboard/admin/events">
              <Button variant="outline" className="w-full h-20 border-[#0077B6] hover:bg-[#0077B6] hover:text-white">
                <div className="text-center">
                  <Calendar className="h-6 w-6 mx-auto mb-2" />
                  <span>Manage Events</span>
                </div>
              </Button>
            </Link>
            <Link href="/dashboard/admin/users">
              <Button variant="outline" className="w-full h-20 border-[#0077B6] hover:bg-[#0077B6] hover:text-white">
                <div className="text-center">
                  <Users className="h-6 w-6 mx-auto mb-2" />
                  <span>User Management</span>
                </div>
              </Button>
            </Link>
            <Link href="/dashboard/admin/transactions">
              <Button variant="outline" className="w-full h-20 border-[#0077B6] hover:bg-[#0077B6] hover:text-white">
                <div className="text-center">
                  <DollarSign className="h-6 w-6 mx-auto mb-2" />
                  <span>Transactions</span>
                </div>
              </Button>
            </Link>
            <Link href="/dashboard/admin/analytics">
              <Button variant="outline" className="w-full h-20 border-[#0077B6] hover:bg-[#0077B6] hover:text-white">
                <div className="text-center">
                  <TrendingUp className="h-6 w-6 mx-auto mb-2" />
                  <span>Analytics</span>
                </div>
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

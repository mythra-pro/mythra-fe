"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  Settings,
  Calendar,
  TrendingUp,
} from "lucide-react";

// Force dynamic rendering - required for wallet-connected pages
export const dynamic = "force-dynamic";

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Mythra Dashboard
          </h1>
          <p className="text-xl text-gray-600">
            Welcome to your event management platform
          </p>
        </div>

        {/* Role Selection Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
          <Card className="bg-white border border-gray-200 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-lg bg-blue-600 flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-gray-900">
                Customer Dashboard
              </CardTitle>
              <CardDescription>
                Browse and purchase event tickets
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/dashboard/customer">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  Go to Customer Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-lg bg-blue-600 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-gray-900">
                Organizer Dashboard
              </CardTitle>
              <CardDescription>Create and manage your events</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/dashboard/organizer">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  Go to Organizer Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-lg bg-blue-600 flex items-center justify-center">
                <Settings className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-gray-900">Admin Dashboard</CardTitle>
              <CardDescription>
                Platform administration and oversight
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/dashboard/admin">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  Go to Admin Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-lg bg-blue-600 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-gray-900">
                Investor Dashboard
              </CardTitle>
              <CardDescription>
                Investment opportunities and analytics
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/dashboard/investor">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  Go to Investor Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 hover:shadow-lg transition-shadow">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-12 w-12 rounded-lg bg-blue-600 flex items-center justify-center">
                <LayoutDashboard className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-gray-900">Staff Dashboard</CardTitle>
              <CardDescription>
                Event staff management and operations
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Link href="/dashboard/staff">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                  Go to Staff Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-4">
            <Link href="/events">
              <Button
                variant="outline"
                className="border-gray-200 hover:bg-blue-600 hover:text-white hover:border-blue-600"
              >
                Browse All Events
              </Button>
            </Link>
            <Link href="/login">
              <Button
                variant="outline"
                className="border-gray-200 hover:bg-blue-600 hover:text-white hover:border-blue-600"
              >
                Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

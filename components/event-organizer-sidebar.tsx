"use client";

import * as React from "react";
import {
  Calendar,
  ChartBar,
  Users,
  QrCode,
  Wallet,
  Plus,
  TicketIcon,
  TrendingUp,
} from "lucide-react";

import { NavMainEvent } from "@/components/nav-main-event";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { mockEvents, mockDashboardStats } from "@/app/data/mockData";

const data = {
  user: {
    name: "Event Organizer",
    email: "organizer@mythra.com",
    avatar: "/avatars/organizer.jpg",
  },
  navMain: [
    {
      title: "Overview",
      url: "#overview",
      icon: Calendar,
      isActive: true,
    },
    {
      title: "Analytics",
      url: "#analytics",
      icon: ChartBar,
    },
    {
      title: "Attendees",
      url: "#attendees",
      icon: Users,
    },
    {
      title: "Check-in",
      url: "#checkin",
      icon: QrCode,
    },
    {
      title: "Payout",
      url: "#payout",
      icon: Wallet,
    },
  ],
};

interface EventOrganizerSidebarProps
  extends React.ComponentProps<typeof Sidebar> {
  selectedEventId?: string;
  onEventSelect?: (eventId: string) => void;
}

export function EventOrganizerSidebar({
  selectedEventId,
  onEventSelect,
  ...props
}: EventOrganizerSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-600 to-green-500 text-white">
                  <TicketIcon className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Mythra</span>
                  <span className="truncate text-xs text-muted-foreground">
                    Event Dashboard
                  </span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMainEvent items={data.navMain} />

        {/* Events List */}
        <div className="px-3 py-2">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Your Events
            </h2>
            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-7 w-7">
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-1">
            {mockEvents.map((event) => (
              <button
                key={event.id}
                onClick={() => onEventSelect?.(event.id)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                  selectedEventId === event.id
                    ? "bg-gradient-to-r from-purple-600 to-green-500 text-white"
                    : "hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <div className="font-medium truncate">{event.name}</div>
                <div
                  className={`text-xs ${
                    selectedEventId === event.id
                      ? "text-purple-100"
                      : "text-muted-foreground"
                  }`}
                >
                  {event.date.toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded ${
                      selectedEventId === event.id ? "bg-white/20" : "bg-accent"
                    }`}
                  >
                    {event.ticketsSold}/{event.maxTickets}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="px-3 py-2 mt-4">
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Quick Stats
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Events</span>
              <span className="font-semibold">
                {mockDashboardStats.totalEvents}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Active Events</span>
              <span className="font-semibold text-green-600">
                {mockDashboardStats.activeEvents}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Total Revenue</span>
              <span className="font-semibold text-purple-600">
                {mockDashboardStats.totalRevenue} SOL
              </span>
            </div>
          </div>
        </div>
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

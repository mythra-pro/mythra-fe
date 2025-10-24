"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { getMenuSectionsForRole } from "@/app/utils/dashboardMenus";
import { StatCard } from "@/components/stat-card";
import EventCreationWizard from "@/app/_components/dashboard/EventCreationWizard";
import { dummyUsers } from "@/lib/dummy-data";
import { Plus, Wand2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Force dynamic rendering - required for wallet-connected pages
export const dynamic = "force-dynamic";

export default function CreateEventPage() {
  const user = dummyUsers.find((u) => u.role === "organizer")!;

  // Get menu sections for organizer role

  const menuSections = getMenuSectionsForRole("organizer");

  return (
    <DashboardLayout user={user} menuSections={menuSections}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-blue-900 flex items-center gap-3">
            Create New Event
          </h1>
          <p className="text-gray-600 mt-2">
            Launch your next amazing event with our powerful creation wizard.
          </p>
        </div>

        {/* Event Creation Wizard */}
        <Card className="w-full bg-white/90 border-cyan-400 shadow-xl">
          <CardHeader>
            <CardTitle className="text-blue-900 flex items-center gap-2">
              Event Creation Wizard
            </CardTitle>
            <CardDescription>
              Follow the steps below to create your event and set up NFT ticket
              sales
            </CardDescription>
          </CardHeader>
          <CardContent className="w-full">
            <EventCreationWizard
              onSubmit={(eventData) => {
                console.log("Event created:", eventData);
                alert("Event created successfully!");
              }}
              onCancel={() => {
                console.log("Event creation cancelled");
              }}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

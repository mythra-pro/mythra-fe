"use client";

import { useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { getMenuSectionsForRole } from "@/app/utils/dashboardMenus";
import { useDashboardUser } from "@/hooks/useDashboardUser";
import EventCreationWizard from "@/app/_components/dashboard/EventCreationWizard";
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
  const user = useDashboardUser("organizer");
  const menuSections = getMenuSectionsForRole("organizer");

  // Ensure user exists in DB on mount
  useEffect(() => {
    const upsertUser = async () => {
      try {
        await fetch("/api/users/upsert", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            walletAddress: user.walletAddress,
            displayName: user.name,
            email: user.email,
          }),
        });
      } catch (e) {
        console.error("Failed to upsert user:", e);
      }
    };
    upsertUser();
  }, [user.walletAddress, user.name, user.email]);

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
              onSubmit={async (eventData) => {
                try {
                  const res = await fetch("/api/events", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      "x-wallet-address": user.walletAddress || "",
                    },
                    body: JSON.stringify(eventData),
                  });

                  const json = await res.json();
                  if (!res.ok) {
                    console.error("Create event failed:", json);
                    alert(json.error || "Failed to create event");
                    return;
                  }

                  alert("Event created successfully!");
                } catch (e: any) {
                  console.error(e);
                  alert("Unexpected error creating event");
                }
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

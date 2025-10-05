"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Plus } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface EventHeaderProps {
  eventName?: string;
  onCreateEvent?: () => void;
}

export function EventHeader({ eventName, onCreateEvent }: EventHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-12 shrink-0 items-center gap-2 border-b bg-background px-4">
      <div className="flex flex-1 items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            {eventName && (
              <>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>{eventName}</BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="ml-auto">
        <Button
          onClick={onCreateEvent}
          className="bg-gradient-to-r from-purple-600 to-green-500 hover:from-purple-700 hover:to-green-600"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create Event
        </Button>
      </div>
    </header>
  );
}

"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin, Ticket, TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EventData } from "@/app/types/event";
import { cn } from "@/lib/utils";

interface EventCardProps {
  event: EventData;
  delay?: number;
  showActions?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

const statusColors = {
  draft: "bg-gray-500",
  published: "bg-green-500",
  ongoing: "bg-blue-500",
  completed: "bg-purple-500",
  cancelled: "bg-red-500",
};

export function EventCard({
  event,
  delay = 0,
  showActions = false,
}: EventCardProps) {
  const soldPercentage =
    ((event.soldTickets || 0) / (event.totalTickets || 1)) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ y: -5 }}
    >
      <Card className="overflow-hidden bg-white shadow-lg hover:shadow-xl transition-all border border-gray-200">
        <CardHeader className="p-0">
          <div className="relative h-48 w-full overflow-hidden bg-blue-600">
            {event.coverImage ? (
              <Image
                src={event.coverImage}
                alt={event.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Calendar className="h-16 w-16 text-white opacity-50" />
              </div>
            )}
            <div className="absolute top-3 right-3">
              <Badge
                className={cn(
                  "text-white border-0",
                  statusColors[event.status]
                )}
              >
                {event.status}
              </Badge>
            </div>
            <div className="absolute top-3 left-3">
              <Badge className="bg-gray-900 text-white border-0">
                {event.category}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
            {event.name}
          </h3>

          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {event.description}
          </p>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4 text-blue-600" />
              <span>
                {new Date(event.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin className="h-4 w-4 text-blue-600" />
              <span className="line-clamp-1">{event.location}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Ticket className="h-4 w-4 text-blue-600" />
              <span>
                {event.soldTickets} / {event.totalTickets} tickets sold
              </span>
            </div>

            {event.revenue && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="font-semibold text-blue-600">
                  ${event.revenue.toLocaleString()} revenue
                </span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Tickets Sold</span>
              <span>{soldPercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-blue-600"
                initial={{ width: 0 }}
                animate={{ width: `${soldPercentage}%` }}
                transition={{ duration: 1, delay: delay + 0.2 }}
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0 flex gap-2">
          <Link href={`/events/${event.id}`} className="flex-1">
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
              View Details
            </Button>
          </Link>
          {showActions && (
            <Link href={`/dashboard/organizer/events/${event.id}/edit`}>
              <Button
                variant="outline"
                className="border-gray-200 text-gray-700 hover:bg-blue-600 hover:text-white hover:border-blue-600"
              >
                Edit
              </Button>
            </Link>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}

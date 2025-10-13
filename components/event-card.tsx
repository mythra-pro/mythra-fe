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
      className="group"
    >
      <Card className="overflow-hidden bg-white shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 rounded-2xl">
        <CardHeader className="p-0">
          <div className="relative h-52 w-full overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600">
            {event.coverImage ? (
              <Image
                src={event.coverImage}
                alt={event.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Calendar className="h-16 w-16 text-white opacity-50" />
              </div>
            )}
            <div className="absolute top-4 right-4 flex gap-2">
              <Badge
                className={cn(
                  "text-white border-0 rounded-full px-3 py-1 text-xs font-medium backdrop-blur-sm",
                  statusColors[event.status]
                )}
              >
                {event.status}
              </Badge>
            </div>
            <div className="absolute top-4 left-4">
              <Badge className="bg-white/20 text-white border-0 rounded-full px-3 py-1 text-xs font-medium backdrop-blur-sm">
                {event.category}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-1 group-hover:text-blue-600 transition-colors">
            {event.name}
          </h3>

          <p className="text-gray-600 mb-6 line-clamp-2 leading-relaxed">
            {event.description}
          </p>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-gray-700 font-medium">
                {new Date(event.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                <MapPin className="h-4 w-4 text-purple-600" />
              </div>
              <span className="text-gray-700 font-medium line-clamp-1">
                {event.location}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                <Ticket className="h-4 w-4 text-green-600" />
              </div>
              <span className="text-gray-700 font-medium">
                {event.soldTickets} / {event.totalTickets} tickets sold
              </span>
            </div>

            {event.revenue && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-yellow-50 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-yellow-600" />
                </div>
                <span className="font-semibold text-blue-600">
                  ${event.revenue.toLocaleString()} revenue
                </span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mt-6 bg-gray-50 rounded-xl p-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span className="font-medium">Progress</span>
              <span className="font-bold text-blue-600">
                {soldPercentage.toFixed(1)}%
              </span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${soldPercentage}%` }}
                transition={{ duration: 1, delay: delay + 0.2 }}
              />
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-6 pt-0 flex gap-3">
          <Link href={`/events/${event.id}`} className="flex-1">
            <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all cursor-pointer">
              View Details
            </Button>
          </Link>
          {showActions && (
            <Link href={`/dashboard/organizer/events/${event.id}/edit`}>
              <Button
                variant="outline"
                className="h-12 border-gray-200 text-gray-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 rounded-xl font-medium transition-all px-6 cursor-pointer"
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

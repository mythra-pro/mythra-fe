"use client";

import { use } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Ticket,
  DollarSign,
  Share2,
  Heart,
  ChevronLeft,
  CheckCircle,
  Twitter,
  Facebook,
} from "lucide-react";
import { dummyEvents } from "@/lib/dummy-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const event = dummyEvents.find((e) => e.id === id);

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-12 text-center bg-white border border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Event Not Found
          </h1>
          <Link href="/events">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              Back to Events
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/events"
              className="flex items-center gap-2 text-gray-700 hover:text-blue-600"
            >
              <ChevronLeft className="h-5 w-5" />
              <span>Back to Events</span>
            </Link>
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-blue-600" />
              <span className="text-xl font-bold text-gray-900">Mythra</span>
            </Link>
            <Link href="/login">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                Connect Wallet
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Cover Image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="overflow-hidden bg-white border border-gray-200 p-0">
                <div className="relative h-96 w-full">
                  <Image
                    src={event.coverImage || ""}
                    alt={event.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <Badge className="bg-gray-900 text-white text-sm">
                      {event.category}
                    </Badge>
                    <Badge className="bg-green-500 text-white text-sm">
                      {event.status}
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="rounded-full bg-white hover:bg-gray-100"
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="rounded-full bg-white hover:bg-gray-100"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* Event Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <Card className="bg-white border border-gray-200">
                <CardContent className="p-6">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    {event.name}
                  </h1>

                  <div className="grid gap-4 md:grid-cols-2 mb-6">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-blue-600 flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Date</p>
                        <p className="font-semibold text-gray-900">
                          {new Date(event.date).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-blue-600 flex items-center justify-center">
                        <Clock className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Time</p>
                        <p className="font-semibold text-gray-900">
                          {event.startTime} - {event.endTime}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-blue-600 flex items-center justify-center">
                        <MapPin className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Location</p>
                        <p className="font-semibold text-gray-900">
                          {event.location}
                        </p>
                        {event.venue && (
                          <p className="text-sm text-gray-500">{event.venue}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-lg bg-blue-600 flex items-center justify-center">
                        <Users className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Organizer</p>
                        <p className="font-semibold text-gray-900">
                          {event.organizerName}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-3">
                      About This Event
                    </h2>
                    <p className="text-gray-700 leading-relaxed">
                      {event.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Ticket Types */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <Card className="bg-white border border-gray-200">
                <CardHeader>
                  <CardTitle className="text-gray-900">
                    Available Tickets
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {event.ticketTypes?.map((ticketType, idx) => (
                    <motion.div
                      key={ticketType.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + idx * 0.1 }}
                    >
                      <Card className="bg-gray-50 border border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h3 className="text-lg font-bold text-gray-900">
                                {ticketType.name}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {ticketType.description}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold text-blue-600">
                                ${ticketType.price}
                              </p>
                              <p className="text-sm text-gray-500">
                                {ticketType.available} /{" "}
                                {ticketType.totalSupply} left
                              </p>
                            </div>
                          </div>

                          {/* Benefits */}
                          <div className="mb-4">
                            <p className="text-xs font-semibold text-gray-600 mb-2">
                              BENEFITS:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {ticketType.benefits.map((benefit, i) => (
                                <Badge
                                  key={i}
                                  variant="outline"
                                  className="text-xs border-gray-300"
                                >
                                  <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                                  {benefit}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="mb-3">
                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-600"
                                style={{
                                  width: `${
                                    (ticketType.sold / ticketType.totalSupply) *
                                    100
                                  }%`,
                                }}
                              />
                            </div>
                          </div>

                          <Button
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                            disabled={ticketType.available === 0}
                          >
                            {ticketType.available === 0
                              ? "Sold Out"
                              : "Buy NFT Ticket"}
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <Card className="bg-blue-600 border border-blue-600 text-white">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Event Stats</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Ticket className="h-5 w-5" />
                        <span>Tickets Sold</span>
                      </div>
                      <span className="font-bold">{event.soldTickets}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        <span>Revenue</span>
                      </div>
                      <span className="font-bold">
                        ${event.revenue?.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        <span>Capacity</span>
                      </div>
                      <span className="font-bold">{event.totalTickets}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Share */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <Card className="bg-white border border-gray-200">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Share Event
                  </h3>
                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 border-gray-200 hover:bg-blue-600 hover:text-white hover:border-blue-600"
                    >
                      <Twitter /> Twitter
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-gray-200 hover:bg-blue-600 hover:text-white hover:border-blue-600"
                    >
                      <Facebook/> Facebook
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

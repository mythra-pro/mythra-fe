"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Search, Filter, Calendar, MapPin, DollarSign } from "lucide-react";
import { EventCard } from "@/components/event-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function EventsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch live events (events that can sell tickets)
  useEffect(() => {
    const fetchEventsWithTicketCounts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch live events where ticket sales are enabled
        const eventsRes = await fetch("/api/events?status=live,selling_ticket");
        const eventsData = await eventsRes.json();
        
        if (!eventsData.events) {
          setError("Failed to load events");
          return;
        }
        
        // Filter to only show events with can_sell_tickets = true
        const sellableEvents = eventsData.events.filter((e: any) => e.can_sell_tickets);
        
        // Fetch sold tickets count for each event
        const eventsWithCounts = await Promise.all(
          sellableEvents.map(async (event: any) => {
            try {
              const ticketsRes = await fetch(`/api/tickets?eventId=${event.id}`);
              const ticketsData = await ticketsRes.json();
              const soldCount = ticketsData.tickets?.length || 0;
              
              return {
                ...event,
                soldTickets: soldCount,
                totalTickets: event.max_tickets || 0,
              };
            } catch (err) {
              console.error(`Error fetching tickets for event ${event.id}:`, err);
              return {
                ...event,
                soldTickets: 0,
                totalTickets: event.max_tickets || 0,
              };
            }
          })
        );
        
        // Filter out sold-out events (0 available tickets)
        const availableEvents = eventsWithCounts.filter(
          (event) => (event.totalTickets - event.soldTickets) > 0
        );
        
        setEvents(availableEvents);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError("Error loading events");
      } finally {
        setLoading(false);
      }
    };
    
    fetchEventsWithTicketCounts();
  }, []);

  const filteredEvents = events
    .filter((event) => {
      const matchesSearch =
        (event.name || event.title || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (event.description || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      const matchesCategory = category === "all" || event.category === category;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        return (
          new Date(a.start_time || a.date || 0).getTime() -
          new Date(b.start_time || b.date || 0).getTime()
        );
      } else if (sortBy === "price") {
        return (
          (a.price_in_sol || a.priceInSOL || 0) -
          (b.price_in_sol || b.priceInSOL || 0)
        );
      }
      return 0;
    });

  const categories = [
    "all",
    ...Array.from(new Set(events.map((e) => e.category))),
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/favicon.svg"
                alt="Mythra Logo"
                width={40}
                height={40}
                className="h-10 w-10 rounded-lg bg-white"
              />
              <span className="text-2xl font-bold text-gray-900">Mythra</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/dashboard/customer">
                <Button
                  variant="ghost"
                  className="text-gray-700 hover:bg-gray-100 cursor-pointer"
                >
                  My Tickets
                </Button>
              </Link>
              <Badge variant="outline" className="text-sm px-3 py-1">
                Public Marketplace
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Discover Amazing Events
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Browse and purchase NFT tickets for exclusive events
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-100 shadow-lg">
            <div className="flex gap-4 justify-between items-center">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-12 border-0 bg-gray-50 rounded-xl text-lg placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-600/20 transition-all pl-12"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="flex-1 md:col-sx`pan-3 w-full">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-12 border-0 bg-gray-50 rounded-xl text-lg focus:bg-white focus:ring-2 focus:ring-blue-600/20 transition-all w-full">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-0 shadow-xl bg-white">
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat} className="rounded-lg">
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort */}
              <div className="flex-1 md:col-span-3 w-full">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="h-12 border-0 bg-gray-50 rounded-xl text-lg focus:bg-white focus:ring-2 focus:ring-blue-600/20 transition-all w-full">
                    <Calendar className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-0 shadow-xl bg-white">
                    <SelectItem value="date" className="rounded-lg">
                      Date
                    </SelectItem>
                    <SelectItem value="price" className="rounded-lg">
                      Price
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filter Button (Mobile) */}
              <div className="w-12 md:hidden">
                <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all cursor-pointer">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Results Count */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Calendar className="h-6 w-6 text-blue-600" />
                Upcoming Events
              </h2>
              <p className="text-gray-500 mt-1">
                {filteredEvents.length}{" "}
                {filteredEvents.length === 1 ? "event" : "events"} found
              </p>
            </div>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event, idx) => (
            <EventCard key={event.id} event={event} delay={idx * 0.05} />
          ))}
        </div>

        {/* No Results */}
        {filteredEvents.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl border border-gray-100 p-16 text-center"
          >
            <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Calendar className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">
              No events found
            </h3>
            <p className="text-gray-500 mb-6">
              Try adjusting your search or filters
            </p>
            <Button
              onClick={() => {
                setSearchQuery("");
                setCategory("all");
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all px-6 py-3 cursor-pointer"
            >
              Clear Filters
            </Button>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-20 py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <h3 className="text-xl font-bold mb-4 text-blue-600">Mythra</h3>
              <p className="text-gray-400">
                Next-generation Web3 event ticketing platform powered by
                blockchain.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    href="/events"
                    className="hover:text-blue-400 transition-colors"
                  >
                    Browse Events
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="hover:text-blue-400 transition-colors"
                  >
                    Create Event
                  </Link>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="hover:text-blue-400 transition-colors"
                  >
                    Invest
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link
                    href="#"
                    className="hover:text-blue-400 transition-colors"
                  >
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-blue-400 transition-colors"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link
                    href="#"
                    className="hover:text-blue-400 transition-colors"
                  >
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="hover:text-blue-400 transition-colors cursor-pointer">
                  Twitter
                </li>
                <li className="hover:text-blue-400 transition-colors cursor-pointer">
                  Discord
                </li>
                <li className="hover:text-blue-400 transition-colors cursor-pointer">
                  Telegram
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Mythra. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

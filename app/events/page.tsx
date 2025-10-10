"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Search, Filter, Calendar, MapPin, DollarSign } from "lucide-react";
import { EventCard } from "@/components/event-card";
import { dummyEvents } from "@/lib/dummy-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
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

  const filteredEvents = dummyEvents
    .filter((event) => {
      const matchesSearch =
        event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = category === "all" || event.category === category;
      return matchesSearch && matchesCategory && event.status === "published";
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortBy === "price") {
        return (a.priceInSOL || 0) - (b.priceInSOL || 0);
      }
      return 0;
    });

  const categories = [
    "all",
    ...Array.from(new Set(dummyEvents.map((e) => e.category))),
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#CAF0F8] via-[#90E0EF] to-[#48CAE4]">
      {/* Header */}
      <header className="bg-[#03045E] shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#0077B6] to-[#48CAE4]" />
              <span className="text-2xl font-bold text-white">Mythra</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button
                  variant="ghost"
                  className="text-white hover:bg-[#0077B6]"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/login">
                <Button className="bg-[#0077B6] hover:bg-[#0096C7] text-white">
                  Connect Wallet
                </Button>
              </Link>
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
          <h1 className="text-5xl md:text-6xl font-bold text-[#03045E] mb-4">
            Discover Amazing Events 🎉
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            Browse and purchase NFT tickets for exclusive events
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <Card className="p-6 mb-8 bg-white/90 backdrop-blur border-[#48CAE4] shadow-lg">
            <div className="grid gap-4 md:grid-cols-12">
              {/* Search */}
              <div className="md:col-span-5">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Search events..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-[#48CAE4]"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="md:col-span-3">
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="border-[#48CAE4]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort */}
              <div className="md:col-span-3">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="border-[#48CAE4]">
                    <Calendar className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="price">Price</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filter Button (Mobile) */}
              <div className="md:col-span-1">
                <Button className="w-full bg-[#0077B6] hover:bg-[#0096C7] text-white">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-lg text-[#03045E] font-semibold">
            {filteredEvents.length}{" "}
            {filteredEvents.length === 1 ? "event" : "events"} found
          </p>
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
            className="text-center py-20"
          >
            <Calendar className="h-20 w-20 mx-auto text-gray-400 mb-4" />
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
              className="bg-[#0077B6] hover:bg-[#0096C7] text-white"
            >
              Clear Filters
            </Button>
          </motion.div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-[#03045E] text-white mt-20 py-12">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <h3 className="text-xl font-bold mb-4">Mythra</h3>
              <p className="text-[#CAF0F8]">
                Next-generation Web3 event ticketing platform powered by
                blockchain.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-[#CAF0F8]">
                <li>
                  <Link href="/events">Browse Events</Link>
                </li>
                <li>
                  <Link href="/login">Create Event</Link>
                </li>
                <li>
                  <Link href="/login">Invest</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-[#CAF0F8]">
                <li>
                  <Link href="#">Help Center</Link>
                </li>
                <li>
                  <Link href="#">Terms of Service</Link>
                </li>
                <li>
                  <Link href="#">Privacy Policy</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-[#CAF0F8]">
                <li>Twitter</li>
                <li>Discord</li>
                <li>Telegram</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#0077B6] mt-8 pt-8 text-center text-[#CAF0F8]">
            <p>&copy; 2025 Mythra. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

"use client";

import { use, useEffect, useState } from "react";
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
  X,
  Loader2,
  Plus,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [soldTickets, setSoldTickets] = useState(0);
  const [availableTickets, setAvailableTickets] = useState(0);
  
  // Purchase modal state
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [purchasing, setPurchasing] = useState(false);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);
  
  // User info for ticket purchase
  const [ownerWallet, setOwnerWallet] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");

  useEffect(() => {
    const fetchEventData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch event details
        const eventRes = await fetch(`/api/events/${id}`);
        if (!eventRes.ok) throw new Error("Event not found");
        const eventData = await eventRes.json();
        
        if (!eventData.event) {
          setError("Event not found");
          return;
        }
        
        setEvent(eventData.event);
        
        // Fetch sold tickets count
        const ticketsRes = await fetch(`/api/tickets?eventId=${id}`);
        const ticketsData = await ticketsRes.json();
        const sold = ticketsData.tickets?.length || 0;
        
        setSoldTickets(sold);
        
        // Calculate available tickets
        const maxTickets = eventData.event.max_tickets || eventData.event.maxTickets || 0;
        const available = Math.max(0, maxTickets - sold);
        setAvailableTickets(available);
        
        console.log(`📊 Tickets: ${sold} sold, ${available} available out of ${maxTickets} max`);
        
      } catch (err: any) {
        console.error("Error fetching event:", err);
        setError(err.message || "Error loading event");
      } finally {
        setLoading(false);
      }
    };
    
    fetchEventData();
  }, [id]);

  const handlePurchaseTicket = async () => {
    if (!ownerWallet.trim()) {
      setPurchaseError("Please enter a wallet address or email");
      return;
    }

    // Check if tickets are available
    if (availableTickets <= 0) {
      setPurchaseError("Sorry, this event is sold out!");
      return;
    }

    // Check if quantity exceeds available tickets
    if (quantity > availableTickets) {
      setPurchaseError(`Only ${availableTickets} ticket(s) available. Please reduce your quantity.`);
      return;
    }

    setPurchasing(true);
    setPurchaseError(null);

    try {
      const priceInSOL = selectedTier?.price || event.ticket_tiers?.[0]?.price || 0;
      
      const purchaseData = {
        eventId: id,
        tierId: selectedTier?.id || null,
        buyerWallet: ownerWallet.trim(),  // Changed from ownerWallet to buyerWallet
        quantity: quantity,
      };

      console.log("🎫 Purchasing ticket with data:", purchaseData);
      
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(purchaseData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to purchase ticket");
      }

      setPurchaseSuccess(true);
      setTimeout(() => {
        setShowPurchaseModal(false);
        // Optionally reload event data to show updated ticket count
        window.location.reload();
      }, 2000);
    } catch (e: any) {
      console.error("Purchase error:", e);
      setPurchaseError(e.message || "Failed to purchase ticket");
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading event details...</p>
        </div>
      </div>
    );
  }

  if (!event || error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Card className="p-12 text-center bg-white border border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Event Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            {error || "Event does not exist"}
          </p>
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
    <div className="min-h-screen bg-white">
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
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm">
                Public Event
              </Badge>
            </div>
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
                <div className="relative h-96 w-full bg-gradient-to-br from-blue-500 to-blue-600">
                  {event.coverImage && event.coverImage.trim() !== "" ? (
                    <Image
                      src={event.coverImage}
                      alt={event.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Calendar className="h-24 w-24 text-white opacity-50" />
                    </div>
                  )}
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
                          {new Date(
                            event.start_time || event.date || ""
                          ).toLocaleDateString("en-US", {
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
                          {event.start_time
                            ? new Date(event.start_time).toLocaleTimeString(
                                "en-US",
                                { hour: "2-digit", minute: "2-digit" }
                              )
                            : event.startTime}{" "}
                          -{" "}
                          {event.end_time
                            ? new Date(event.end_time).toLocaleTimeString(
                                "en-US",
                                { hour: "2-digit", minute: "2-digit" }
                              )
                            : event.endTime}
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
                          {event.venue || event.location}
                        </p>
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
                  {event.ticketTypes && event.ticketTypes.length > 0 ? (
                    event.ticketTypes.map((ticketType: any, idx: number) => (
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
                              {ticketType.benefits.map(
                                (benefit: string, i: number) => (
                                  <Badge
                                    key={i}
                                    variant="outline"
                                    className="text-xs border-gray-300"
                                  >
                                    <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                                    {benefit}
                                  </Badge>
                                )
                              )}
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
                            onClick={() => {
                              setSelectedTier(ticketType);
                              setQuantity(1);
                              setShowPurchaseModal(true);
                              setPurchaseError(null);
                              setPurchaseSuccess(false);
                            }}
                          >
                            {ticketType.available === 0
                              ? "Sold Out"
                              : "Buy NFT Ticket"}
                          </Button>
                        </CardContent>
                      </Card>
                    </motion.div>
                    ))
                  ) : (
                    <Card className="bg-gray-50 border border-gray-200">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-gray-900">
                              General Admission
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Standard event ticket
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-3xl font-bold text-blue-600">
                              {event.ticket_tiers?.[0]?.price || 0} SOL
                            </p>
                            <p className="text-sm text-gray-500">
                              {availableTickets} available ({soldTickets} sold)
                            </p>
                          </div>
                        </div>
                        <Button
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12"
                          onClick={() => {
                            setSelectedTier(null);
                            setQuantity(1);
                            setShowPurchaseModal(true);
                            setPurchaseError(null);
                            setPurchaseSuccess(false);
                          }}
                          disabled={availableTickets <= 0}
                        >
                          {availableTickets <= 0 ? "Sold Out" : "Buy Ticket"}
                        </Button>
                      </CardContent>
                    </Card>
                  )}
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
                      <Facebook /> Facebook
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Purchase Modal */}
      <Dialog open={showPurchaseModal} onOpenChange={setShowPurchaseModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Purchase Ticket</DialogTitle>
            <DialogDescription>
              {selectedTier ? selectedTier.name : event?.name}
            </DialogDescription>
          </DialogHeader>
          
          {!purchaseSuccess ? (
            <div className="space-y-4">
              {/* Quantity Selector */}
              <div className="space-y-2">
                <Label>Quantity (Max: {availableTickets})</Label>
                <div className="flex items-center gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={purchasing}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-2xl font-bold w-12 text-center">{quantity}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.min(availableTickets, quantity + 1))}
                    disabled={purchasing || quantity >= availableTickets}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Wallet Address */}
              <div className="space-y-2">
                <Label htmlFor="wallet">Wallet Address or Email *</Label>
                <Input
                  id="wallet"
                  placeholder="0x... or your@email.com"
                  value={ownerWallet}
                  onChange={(e) => setOwnerWallet(e.target.value)}
                  disabled={purchasing}
                />
              </div>

              {/* Name (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="name">Name (Optional)</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  disabled={purchasing}
                />
              </div>

              {/* Email (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john@example.com"
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  disabled={purchasing}
                />
              </div>

              {/* Price Summary */}
              <div className="border-t pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Price per ticket:</span>
                  <span className="font-semibold">
                    {selectedTier?.price || event?.ticket_tiers?.[0]?.price || 0} SOL
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span className="text-blue-600">
                    {((selectedTier?.price || event?.ticket_tiers?.[0]?.price || 0) * quantity).toFixed(2)} SOL
                  </span>
                </div>
              </div>

              {/* Error Message */}
              {purchaseError && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {purchaseError}
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Purchase Successful!
              </h3>
              <p className="text-gray-600">
                Your {quantity} ticket(s) have been purchased.
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Redirecting...
              </p>
            </div>
          )}

          {!purchaseSuccess && (
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowPurchaseModal(false)}
                disabled={purchasing}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={handlePurchaseTicket}
                disabled={purchasing}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {purchasing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Purchase ${quantity} Ticket${quantity > 1 ? 's' : ''}`
                )}
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

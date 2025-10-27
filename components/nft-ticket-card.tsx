"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import QRCode from "qrcode";
import {
  ExternalLink,
  Calendar,
  MapPin,
  CheckCircle2,
  XCircle,
  Clock,
  QrCode,
  Info,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { NFTTicket } from "@/app/types/ticket";
import { cn } from "@/lib/utils";

interface NFTTicketCardProps {
  ticket: NFTTicket;
  delay?: number;
  showQR?: boolean;
}

const statusConfig = {
  unused: {
    color: "bg-green-500",
    icon: CheckCircle2,
    label: "Ready to Use",
  },
  active: {
    color: "bg-green-500",
    icon: CheckCircle2,
    label: "Active",
  },
  used: {
    color: "bg-blue-500",
    icon: CheckCircle2,
    label: "Used",
  },
  refunded: {
    color: "bg-yellow-500",
    icon: XCircle,
    label: "Refunded",
  },
  expired: {
    color: "bg-red-500",
    icon: Clock,
    label: "Expired",
  },
};

export function NFTTicketCard({
  ticket,
  delay = 0,
  showQR = false,
}: NFTTicketCardProps) {
  const config = statusConfig[ticket.status] || statusConfig.unused;
  const StatusIcon = config.icon;
  
  // QR Code state
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrTimestamp, setQrTimestamp] = useState(Date.now());
  const [qrImageUrl, setQrImageUrl] = useState<string>("");
  const [eventData, setEventData] = useState<any>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [loadingEvent, setLoadingEvent] = useState(false);
  
  // Generate unique QR data with timestamp
  const qrData = JSON.stringify({
    ticketId: ticket.id,
    mintPubkey: (ticket as any).mint_pubkey,
    eventId: ticket.eventId,
    timestamp: qrTimestamp,
    status: ticket.status,
  });
  
  // Generate QR code image
  useEffect(() => {
    const generateQR = async () => {
      try {
        const url = await QRCode.toDataURL(qrData, {
          width: 400,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        setQrImageUrl(url);
      } catch (err) {
        console.error('Failed to generate QR code:', err);
      }
    };
    
    if (showQRModal) {
      generateQR();
    }
  }, [qrData, showQRModal]);
  
  // Auto-refresh QR every minute
  useEffect(() => {
    if (showQRModal) {
      const interval = setInterval(() => {
        setQrTimestamp(Date.now());
      }, 60000); // 60 seconds
      
      return () => clearInterval(interval);
    }
  }, [showQRModal]);
  
  // Fetch event data
  const fetchEventData = async () => {
    if (!ticket.eventId) return;
    
    setLoadingEvent(true);
    try {
      const res = await fetch(`/api/events/${ticket.eventId}`);
      const data = await res.json();
      setEventData(data.event);
      setShowEventModal(true);
    } catch (e) {
      console.error("Failed to fetch event:", e);
    } finally {
      setLoadingEvent(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -8, scale: 1.02 }}
    >
      <Card className="overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-all border-2 border-[#48CAE4] relative group">
        {/* NFT Shimmer Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

        <CardHeader className="p-0">
          <div className="relative h-56 w-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
            {ticket.nftMetadata?.image ? (
              <Image
                src={ticket.nftMetadata.image}
                alt={ticket.nftMetadata?.name || "Ticket"}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <CheckCircle2 className="h-24 w-24 text-white opacity-50" />
              </div>
            )}
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

            {/* Status Badge */}
            <div className="absolute top-3 right-3">
              <Badge
                className={cn(
                  "text-white border-0 flex items-center gap-1",
                  config.color
                )}
              >
                <StatusIcon className="h-3 w-3" />
                {config.label}
              </Badge>
            </div>

            {/* Ticket Type Badge */}
            {ticket.ticketType && (
              <div className="absolute top-3 left-3">
                <Badge className="bg-[#03045E]/90 text-white border-0">
                  {ticket.ticketType}
                </Badge>
              </div>
            )}

            {/* Price Tag */}
            {ticket.price !== undefined && (
              <div className="absolute bottom-3 left-3">
                <div className="bg-white/90 backdrop-blur rounded-lg px-3 py-1">
                  <span className="text-lg font-bold text-[#0077B6]">
                    ${ticket.price}
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-4">
          <h3 className="text-lg font-bold text-[#03045E] mb-1 line-clamp-1">
            {ticket.nftMetadata?.name || (ticket as any).mint_pubkey || "Event Ticket"}
          </h3>

          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {ticket.nftMetadata?.description || "Your ticket to an amazing event"}
          </p>

          <div className="space-y-2 text-sm">
            {ticket.eventName && (
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4 text-[#0077B6]" />
                <span className="font-medium">{ticket.eventName}</span>
              </div>
            )}

            {(ticket.purchasedAt || (ticket as any).created_at) && (
              <div className="flex items-center gap-2 text-gray-600">
                <Clock className="h-4 w-4 text-[#0077B6]" />
                <span>
                  Purchased: {new Date(ticket.purchasedAt || (ticket as any).created_at).toLocaleDateString()}
                </span>
              </div>
            )}

            {(ticket.usedAt || (ticket as any).used_at) && (
              <div className="flex items-center gap-2 text-gray-600">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>
                  Used: {new Date(ticket.usedAt || (ticket as any).used_at).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {/* NFT Attributes */}
          {ticket.nftMetadata?.attributes && ticket.nftMetadata.attributes.length > 0 && (
            <div className="mt-4">
              <p className="text-xs font-semibold text-gray-500 mb-2">
                ATTRIBUTES
              </p>
              <div className="grid grid-cols-2 gap-2">
                {ticket.nftMetadata.attributes.slice(0, 4).map((attr, idx) => (
                  <div
                    key={idx}
                    className="bg-gradient-to-br from-[#CAF0F8] to-[#90E0EF] rounded-lg p-2"
                  >
                    <p className="text-xs text-gray-600">{attr.trait_type}</p>
                    <p className="text-sm font-semibold text-[#03045E] truncate">
                      {attr.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="p-4 pt-0 flex gap-2">
          <Button
            variant="outline"
            className="flex-1 border-[#0077B6] text-[#0077B6] hover:bg-[#0077B6] hover:text-white"
            onClick={fetchEventData}
            disabled={loadingEvent}
          >
            <Info className="h-4 w-4 mr-1" />
            {loadingEvent ? "Loading..." : "View Event"}
          </Button>
          <Button
            variant="default"
            className="flex-1 bg-[#0077B6] hover:bg-[#0096C7] text-white"
            onClick={() => setShowQRModal(true)}
          >
            <QrCode className="h-4 w-4 mr-1" />
            Show QR
          </Button>
        </CardFooter>
      </Card>
      
      {/* QR Code Modal */}
      <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ticket QR Code</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg border-2 border-gray-200 flex items-center justify-center">
              <div className="text-center">
                {qrImageUrl ? (
                  <div className="p-4 bg-white rounded-xl border-2 border-gray-300">
                    <img 
                      src={qrImageUrl} 
                      alt="Ticket QR Code" 
                      className="w-80 h-80"
                    />
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-8 rounded-xl">
                    <QrCode className="h-48 w-48 text-white" />
                    <p className="text-white mt-2">Generating...</p>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-4">
                  Refreshes every 60 seconds
                </p>
                <p className="text-xs text-gray-400 mt-1 font-mono">
                  {new Date(qrTimestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-xs font-semibold text-gray-600 mb-2">QR DATA:</p>
              <code className="text-xs bg-white p-2 rounded block overflow-x-auto">
                {qrData}
              </code>
            </div>
            <p className="text-sm text-gray-600 text-center">
              Present this QR code at the event entrance
            </p>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Event Details Modal */}
      <Dialog open={showEventModal} onOpenChange={setShowEventModal}>
        <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Event Details</DialogTitle>
          </DialogHeader>
          {eventData ? (
            <div className="space-y-4">
              {/* Event Banner */}
              {eventData.banner_url && (
                <div className="relative h-48 w-full rounded-lg overflow-hidden">
                  <Image
                    src={eventData.banner_url}
                    alt={eventData.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              
              {/* Event Info */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {eventData.name}
                </h3>
                <Badge className="bg-blue-500 text-white">
                  {eventData.category}
                </Badge>
              </div>
              
              <p className="text-gray-700 leading-relaxed">
                {eventData.description}
              </p>
              
              {/* Event Details Grid */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Date & Time</p>
                    <p className="text-sm text-gray-600">
                      {new Date(eventData.start_time).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(eventData.start_time).toLocaleTimeString()} - 
                      {new Date(eventData.end_time).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Venue</p>
                    <p className="text-sm text-gray-600">{eventData.venue}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Status</p>
                    <Badge className="mt-1">{eventData.status}</Badge>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <ExternalLink className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Max Tickets</p>
                    <p className="text-sm text-gray-600">{eventData.max_tickets}</p>
                  </div>
                </div>
              </div>
              
              {/* Organizer Info */}
              {eventData.organizer && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-semibold text-gray-900 mb-2">Organized by</p>
                  <p className="text-sm text-gray-700">{eventData.organizer.display_name}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Loading event data...</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

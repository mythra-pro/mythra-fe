"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  ExternalLink,
  Calendar,
  MapPin,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NFTTicket } from "@/app/types/ticket";
import { cn } from "@/lib/utils";

interface NFTTicketCardProps {
  ticket: NFTTicket;
  delay?: number;
  showQR?: boolean;
}

const statusConfig = {
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
  const config = statusConfig[ticket.status];
  const StatusIcon = config.icon;

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
          <div className="relative h-56 w-full overflow-hidden">
            <Image
              src={ticket.nftMetadata.image}
              alt={ticket.nftMetadata.name}
              fill
              className="object-cover"
            />
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
            <div className="absolute top-3 left-3">
              <Badge className="bg-[#03045E]/90 text-white border-0">
                {ticket.ticketType}
              </Badge>
            </div>

            {/* Price Tag */}
            <div className="absolute bottom-3 left-3">
              <div className="bg-white/90 backdrop-blur rounded-lg px-3 py-1">
                <span className="text-lg font-bold text-[#0077B6]">
                  ${ticket.price}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          <h3 className="text-lg font-bold text-[#03045E] mb-1 line-clamp-1">
            {ticket.nftMetadata.name}
          </h3>

          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {ticket.nftMetadata.description}
          </p>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="h-4 w-4 text-[#0077B6]" />
              <span className="font-medium">{ticket.eventName}</span>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <Clock className="h-4 w-4 text-[#0077B6]" />
              <span>
                Purchased: {new Date(ticket.purchasedAt).toLocaleDateString()}
              </span>
            </div>

            {ticket.usedAt && (
              <div className="flex items-center gap-2 text-gray-600">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>
                  Used: {new Date(ticket.usedAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>

          {/* NFT Attributes */}
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
        </CardContent>

        <CardFooter className="p-4 pt-0 flex gap-2">
          <Link href={`/events/${ticket.eventId}`} className="flex-1">
            <Button
              variant="outline"
              className="w-full border-[#0077B6] text-[#0077B6] hover:bg-[#0077B6] hover:text-white"
            >
              View Event
            </Button>
          </Link>
          <Button
            variant="default"
            className="flex-1 bg-[#0077B6] hover:bg-[#0096C7] text-white"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View NFT
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

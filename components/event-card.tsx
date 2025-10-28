"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Calendar, MapPin, Ticket, TrendingUp, DollarSign, Vote, CheckCircle } from "lucide-react";
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
  onStartSelling?: (eventId: string) => void;
}

const statusColors = {
  draft: "bg-gray-500",
  pending_approval: "bg-yellow-500",
  rejected: "bg-red-700",
  investment_window: "bg-blue-600",
  dao_process: "bg-purple-600",
  selling_tickets: "bg-green-600",
  waiting_for_event: "bg-orange-500",
  event_running: "bg-red-600",
  calculating_income: "bg-indigo-600",
  roi_distribution: "bg-pink-600",
  completed: "bg-purple-500",
  cancelled: "bg-red-500",
  // Legacy statuses (deprecated but kept for backwards compatibility)
  approved: "bg-green-600",
  dao_voting: "bg-purple-600",
  published: "bg-green-500",
  ongoing: "bg-blue-500",
  live: "bg-red-600",
};

const statusLabels = {
  draft: "📝 Draft",
  pending_approval: "⏳ Pending Approval",
  rejected: "❌ Rejected",
  investment_window: "💰 Investment Window",
  dao_process: "🗳️ DAO Voting",
  selling_tickets: "🎫 Selling Tickets",
  waiting_for_event: "⏰ Awaiting Event",
  event_running: "🔴 Event Live",
  calculating_income: "💵 Calculating Income",
  roi_distribution: "💸 Distributing ROI",
  completed: "✅ Completed",
  cancelled: "🚫 Cancelled",
  // Legacy statuses (deprecated)
  approved: "✅ Approved",
  dao_voting: "🗳️ DAO Voting",
  published: "Published",
  ongoing: "Ongoing",
  live: "🔴 Live",
};

export function EventCard({
  event,
  delay = 0,
  showActions = false,
  onStartSelling,
}: EventCardProps) {
  const [daoStats, setDaoStats] = useState<any>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  const soldPercentage =
    ((event.soldTickets || 0) / (event.totalTickets || 1)) * 100;
  
  // For investment window, show investment progress instead of ticket sales
  const investmentPercentage = event.vault_cap
    ? ((event.current_investment_amount || 0) / event.vault_cap) * 100
    : 0;
  
  // Investment phases: Show investment progress (string comparison for flexibility)
  const statusStr = String(event.status);
  const isInvestmentPhase = 
    statusStr === "investment_window" || 
    statusStr === "dao_process" ||
    statusStr === "approved" ||
    statusStr === "dao_voting";
  
  // For non-investment phases, show ticket sales progress
  const showTicketProgress = !isInvestmentPhase && (event.soldTickets !== undefined || event.totalTickets !== undefined);
  
  // Determine which progress to show
  const progressPercentage = isInvestmentPhase 
    ? investmentPercentage 
    : (showTicketProgress ? soldPercentage : 0);
    
  const progressLabel = isInvestmentPhase 
    ? `${(event.current_investment_amount || 0).toFixed(2)} / ${event.vault_cap || 0} SOL invested`
    : (showTicketProgress 
        ? `${event.soldTickets || 0} / ${event.totalTickets || 0} tickets sold`
        : 'No progress to track');

  // Fetch DAO stats if in investment phase
  useEffect(() => {
    if (isInvestmentPhase && showActions) {
      setLoadingStats(true);
      fetch(`/api/events/${event.id}/dao-stats`)
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          return res.json();
        })
        .then((data) => {
          if (data && !data.error) {
            setDaoStats(data);
            
            // Auto-update status if voting complete
            const currentStatus = String(event.status);
            if (data.dao?.allVoted && !currentStatus.includes("ticket") && !currentStatus.includes("sell")) {
              fetch(`/api/events/${event.id}/check-voting-complete`, {
                method: "POST",
              })
                .then((r) => r.json())
                .then((result) => {
                  if (result.votingComplete && result.statusUpdated) {
                    console.log("✅ Status auto-updated to:", result.newStatus);
                    // Refresh the page to show new status
                    setTimeout(() => window.location.reload(), 1000);
                  }
                })
                .catch((e) => console.error("Auto-status update failed:", e));
            }
          }
        })
        .catch((e) => {
          console.error("Failed to fetch DAO stats:", e);
          setDaoStats(null);
        })
        .finally(() => setLoadingStats(false));
    }
  }, [isInvestmentPhase, showActions, event.id, statusStr]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay }}
      whileHover={{ y: -5 }}
      className="group"
    >
      <Card className="overflow-hidden bg-white shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 rounded-2xl p-0">
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
                {statusLabels[event.status] || event.status}
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
                {new Date(event.start_time || event.date || '').toLocaleDateString("en-US", {
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
                {event.venue || event.location}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                <Ticket className="h-4 w-4 text-green-600" />
              </div>
              <span className="text-gray-700 font-medium">
                {(event.totalTickets || 0) - (event.soldTickets || 0)} tickets available
              </span>
            </div>

            {/* Ticket Price */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                <DollarSign className="h-4 w-4 text-blue-600" />
              </div>
              <span className="font-bold text-blue-600">
                {event.ticket_tiers?.[0]?.price || event.price_in_sol || event.priceInSOL || 0} SOL
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
                {progressPercentage.toFixed(1)}%
              </span>
            </div>
            <div className="text-xs text-gray-500 mb-2">
              {progressLabel}
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 1, delay: delay + 0.2 }}
              />
            </div>
          </div>

          {/* DAO Stats - Show during investment/DAO phase */}
          {isInvestmentPhase && daoStats?.dao && (
            <div className="mt-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-200">
              <div className="flex items-center gap-2 mb-3">
                <Vote className="h-5 w-5 text-purple-600" />
                <span className="font-semibold text-purple-900">DAO Voting Status</span>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-white/60 rounded-lg p-2">
                  <div className="text-gray-600 text-xs">Questions</div>
                  <div className="font-bold text-purple-900">{daoStats.dao?.totalQuestions || 0}</div>
                </div>
                <div className="bg-white/60 rounded-lg p-2">
                  <div className="text-gray-600 text-xs">Investors</div>
                  <div className="font-bold text-purple-900">{daoStats.dao?.totalInvestors || 0}</div>
                </div>
                <div className="bg-white/60 rounded-lg p-2">
                  <div className="text-gray-600 text-xs">Voted</div>
                  <div className="font-bold text-blue-600">{daoStats.dao?.investorsVoted || 0}/{daoStats.dao?.totalInvestors || 0}</div>
                </div>
                <div className="bg-white/60 rounded-lg p-2">
                  <div className="text-gray-600 text-xs">Completion</div>
                  <div className="font-bold text-green-600">{daoStats.dao?.completionPercentage || 0}%</div>
                </div>
              </div>
              {daoStats.dao?.allVoted && (
                <div className="mt-3 flex items-center gap-2 text-green-600 bg-green-50 rounded-lg p-2 text-sm font-semibold">
                  <CheckCircle className="h-4 w-4" />
                  All investors voted! Ready to sell tickets
                </div>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="p-6 pt-0 flex gap-3">
          <Link href={`/events/${event.id}`} className="flex-1">
            <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-all cursor-pointer">
              View Details
            </Button>
          </Link>
          {showActions && (
            <div className="flex-1 flex gap-2 flex-wrap">
              {/* DAO Questions Button OR Start Selling Button - Show during investment window and DAO process */}
              {(event.status === "investment_window" || 
                event.status === "dao_process" ||
                // Legacy statuses
                event.status === "approved" || 
                event.status === "dao_voting") && (
                <>
                  {daoStats?.dao?.allVoted ? (
                    // Show Start Selling button when all investors voted
                    <Button
                      onClick={async () => {
                        // Trigger status update
                        const res = await fetch(`/api/events/${event.id}/check-voting-complete`, {
                          method: "POST",
                        });
                        const result = await res.json();
                        if (result.votingComplete && result.statusUpdated) {
                          alert(`✅ Status updated to ${result.newStatus}! You can now sell tickets.`);
                          window.location.reload();
                        }
                      }}
                      className="h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all px-6 cursor-pointer shadow-lg"
                    >
                      🎫 Start Selling Tickets
                    </Button>
                  ) : (
                    // Show DAO Questions button when voting not complete
                    <Link href={`/dashboard/organizer/dao-questions/${event.id}`}>
                      <Button
                        variant="outline"
                        className="h-12 border-purple-200 text-purple-700 hover:bg-purple-600 hover:text-white hover:border-purple-600 rounded-xl font-medium transition-all px-4 cursor-pointer"
                      >
                        DAO Questions
                      </Button>
                    </Link>
                  )}
                </>
              )}
              
              {/* Edit Button */}
              <Link href={`/dashboard/organizer/events/${event.id}/edit`}>
                <Button
                  variant="outline"
                  className="h-12 border-gray-200 text-gray-700 hover:bg-blue-600 hover:text-white hover:border-blue-600 rounded-xl font-medium transition-all px-4 cursor-pointer"
                >
                  Edit
                </Button>
              </Link>
            </div>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}

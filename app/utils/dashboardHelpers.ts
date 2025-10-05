/**
 * Dashboard Utility Functions
 */

import { EventData, TicketData, TicketStatus } from "../types/event";

/**
 * Format SOL amount with proper decimals
 */
export function formatSOL(amount: number): string {
  return amount.toFixed(2) + " SOL";
}

/**
 * Format wallet address for display
 */
export function formatWalletAddress(
  address: string,
  chars: number = 4
): string {
  if (!address || address.length < chars * 2) return address;
  return `${address.substring(0, chars)}...${address.substring(
    address.length - chars
  )}`;
}

/**
 * Calculate platform fee (5%)
 */
export function calculatePlatformFee(totalAmount: number): number {
  return totalAmount * 0.05;
}

/**
 * Calculate organizer payout (95%)
 */
export function calculateOrganizerPayout(totalAmount: number): number {
  return totalAmount * 0.95;
}

/**
 * Calculate event fill rate percentage
 */
export function calculateFillRate(
  ticketsSold: number,
  maxTickets: number
): number {
  if (maxTickets === 0) return 0;
  return (ticketsSold / maxTickets) * 100;
}

/**
 * Calculate check-in rate percentage
 */
export function calculateCheckInRate(tickets: TicketData[]): number {
  if (tickets.length === 0) return 0;
  const checkedIn = tickets.filter(
    (t) => t.status === TicketStatus.CHECKED_IN
  ).length;
  return (checkedIn / tickets.length) * 100;
}

/**
 * Get event status color
 */
export function getEventStatusColor(status: string): string {
  const colors = {
    draft: "gray",
    published: "blue",
    ongoing: "green",
    completed: "purple",
    cancelled: "red",
  };
  return colors[status as keyof typeof colors] || "gray";
}

/**
 * Check if event is upcoming
 */
export function isEventUpcoming(eventDate: Date): boolean {
  return eventDate.getTime() > Date.now();
}

/**
 * Check if event is currently happening
 */
export function isEventOngoing(startDate: Date, endDate?: Date): boolean {
  const now = Date.now();
  const start = startDate.getTime();
  const end = endDate ? endDate.getTime() : start + 24 * 60 * 60 * 1000; // Default 24h if no end date
  return now >= start && now <= end;
}

/**
 * Check if event is completed
 */
export function isEventCompleted(endDate?: Date, startDate?: Date): boolean {
  const end = endDate || startDate;
  if (!end) return false;
  return end.getTime() < Date.now();
}

/**
 * Format date for display
 */
export function formatEventDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

/**
 * Format date range
 */
export function formatDateRange(startDate: Date, endDate?: Date): string {
  const start = formatEventDate(startDate);
  if (!endDate) return start;

  const end = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(endDate);

  return `${start} - ${end}`;
}

/**
 * Calculate time until event
 */
export function getTimeUntilEvent(eventDate: Date): string {
  const now = Date.now();
  const diff = eventDate.getTime() - now;

  if (diff < 0) return "Event started";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) return `${days} day${days > 1 ? "s" : ""} until event`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} until event`;
  return "Starting soon";
}

/**
 * Generate unique QR code data for ticket
 */
export function generateQRData(ticket: TicketData): string {
  return JSON.stringify({
    ticketId: ticket.id,
    eventId: ticket.eventId,
    ownerWallet: ticket.ownerWallet,
    nftMintAddress: ticket.nftMintAddress,
    ticketNumber: ticket.ticketNumber,
    timestamp: Date.now(),
  });
}

/**
 * Validate wallet address format
 */
export function isValidSolanaAddress(address: string): boolean {
  // Basic Solana address validation (base58, 32-44 characters)
  const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
  return base58Regex.test(address);
}

/**
 * Calculate total revenue for event
 */
export function calculateTotalRevenue(tickets: TicketData[]): number {
  return tickets.reduce((sum, ticket) => {
    if (ticket.status !== TicketStatus.CANCELLED) {
      return sum + ticket.priceInSOL;
    }
    return sum;
  }, 0);
}

/**
 * Get ticket status label
 */
export function getTicketStatusLabel(status: TicketStatus): string {
  const labels = {
    [TicketStatus.AVAILABLE]: "Available",
    [TicketStatus.SOLD]: "Sold",
    [TicketStatus.CHECKED_IN]: "Checked In",
    [TicketStatus.CANCELLED]: "Cancelled",
  };
  return labels[status];
}

/**
 * Sort events by date
 */
export function sortEventsByDate(
  events: EventData[],
  ascending: boolean = true
): EventData[] {
  return [...events].sort((a, b) => {
    const diff = a.date.getTime() - b.date.getTime();
    return ascending ? diff : -diff;
  });
}

/**
 * Filter events by status
 */
export function filterEventsByStatus(
  events: EventData[],
  status: string
): EventData[] {
  if (status === "all") return events;
  return events.filter((event) => event.status === status);
}

/**
 * Search events by query
 */
export function searchEvents(events: EventData[], query: string): EventData[] {
  const lowerQuery = query.toLowerCase();
  return events.filter(
    (event) =>
      event.name.toLowerCase().includes(lowerQuery) ||
      event.description.toLowerCase().includes(lowerQuery) ||
      event.location.toLowerCase().includes(lowerQuery) ||
      event.category.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get performance insight based on metrics
 */
export function getPerformanceInsight(
  ticketsSold: number,
  maxTickets: number,
  checkInRate: number
): {
  salesInsight: string;
  checkInInsight: string;
  salesIcon: string;
  checkInIcon: string;
} {
  const fillRate = calculateFillRate(ticketsSold, maxTickets);

  let salesInsight = "";
  let salesIcon = "";

  if (fillRate >= 75) {
    salesInsight = "🔥 Strong sales! Event is almost sold out";
    salesIcon = "🔥";
  } else if (fillRate >= 50) {
    salesInsight = "✨ Good progress, keep promoting";
    salesIcon = "✨";
  } else {
    salesInsight = "📢 Boost marketing to increase sales";
    salesIcon = "📢";
  }

  let checkInInsight = "";
  let checkInIcon = "";

  if (checkInRate >= 70) {
    checkInInsight = "✅ Excellent attendance rate!";
    checkInIcon = "✅";
  } else if (checkInRate >= 40) {
    checkInInsight = "👥 Moderate attendance";
    checkInIcon = "👥";
  } else {
    checkInInsight = "⚠️ Low check-in rate, follow up with attendees";
    checkInIcon = "⚠️";
  }

  return { salesInsight, checkInInsight, salesIcon, checkInIcon };
}

/**
 * Export data to CSV format
 */
export function exportToCSV(
  headers: string[],
  rows: (string | number)[][]
): string {
  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.join(",")),
  ].join("\n");
  return csvContent;
}

/**
 * Download file in browser
 */
export function downloadFile(
  content: string,
  filename: string,
  type: string = "text/csv"
) {
  const blob = new Blob([content], { type });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

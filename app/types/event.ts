// Event and Ticket Type Definitions

export enum EventStatus {
  DRAFT = "draft",
  PUBLISHED = "published",
  ONGOING = "ongoing",
  LIVE = "live",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export enum TicketStatus {
  AVAILABLE = "available",
  SOLD = "sold",
  CHECKED_IN = "checked_in",
  CANCELLED = "cancelled",
}

export interface EventData {
  id: string;
  name: string;
  description: string;
  organizerId: string;
  organizerName: string;
  // Database uses snake_case
  start_time: string | Date;
  end_time?: string | Date;
  venue: string;
  // Legacy fields (deprecated)
  date?: Date;
  endDate?: Date;
  location?: string;
  startTime?: string;
  endTime?: string;
  priceInSOL: number;
  maxTickets: number;
  ticketsSold: number;
  status: EventStatus;
  verified?: boolean;
  chain_verified?: boolean;
  coverImage?: string;
  category: string;
  createdAt: Date;
  updatedAt: Date;
  // Solana blockchain data
  mintAddress?: string;
  creatorWallet: string;
  // Extended fields for enhanced dashboard
  totalTickets?: number;
  soldTickets?: number;
  revenue?: number;
  poolBalance?: number;
  staffIds?: string[];
  ticketTypes?: Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    totalSupply: number;
    sold: number;
    available: number;
    benefits: string[];
  }>;
}

export interface TicketData {
  id: string;
  eventId: string;
  ticketNumber: number;
  ownerWallet: string;
  ownerName?: string;
  ownerEmail?: string;
  purchaseDate: Date;
  priceInSOL: number;
  status: TicketStatus;
  checkInDate?: Date;
  checkInLocation?: string;
  // NFT data
  nftMintAddress: string;
  metadataUri?: string;
  qrCode: string;
}

export interface EventAnalytics {
  eventId: string;
  totalRevenue: number; // in SOL
  ticketsSold: number;
  maxTickets: number;
  checkInRate: number; // percentage
  checkedInCount: number;
  salesByDay: SalesByDay[];
  revenueByDay: RevenueByDay[];
  checkInTrend: CheckInTrend[];
}

export interface SalesByDay {
  date: string;
  count: number;
}

export interface RevenueByDay {
  date: string;
  amount: number; // in SOL
}

export interface CheckInTrend {
  hour: string;
  count: number;
}

export interface PayoutData {
  id: string;
  eventId: string;
  organizerWallet: string;
  totalAmount: number; // in SOL
  organizerAmount: number; // 95% in SOL
  platformFee: number; // 5% in SOL
  status: "pending" | "processing" | "completed" | "failed";
  transactionSignature?: string;
  processedAt?: Date;
  createdAt: Date;
}

export interface CreateEventFormData {
  name: string;
  description: string;
  date: string;
  endDate?: string;
  location: string;
  priceInSOL: number;
  maxTickets: number;
  category: string;
  coverImage?: File | string;
}

export interface CheckInData {
  ticketId: string;
  eventId: string;
  checkInDate: Date;
  walletSignature: string;
  location?: string;
}

export interface DashboardStats {
  totalEvents: number;
  activeEvents: number;
  totalRevenue: number;
  totalTicketsSold: number;
  upcomingEvents: number;
}

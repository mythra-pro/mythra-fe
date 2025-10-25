// Event and Ticket Type Definitions

export enum EventStatus {
  DRAFT = "draft",
  PENDING_APPROVAL = "pending_approval",
  APPROVED = "approved",
  REJECTED = "rejected",
  DAO_VOTING = "dao_voting",
  PUBLISHED = "published",
  ONGOING = "ongoing",
  LIVE = "live",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
}

export enum ApprovalStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
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
  // Admin approval fields
  approval_status?: ApprovalStatus;
  approved_by?: string;
  approved_at?: Date;
  rejected_reason?: string;
  // DAO and investment fields
  dao_completed?: boolean;
  can_sell_tickets?: boolean;
  selling_started_at?: Date;
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

// DAO Question Types
export interface DAOQuestion {
  id: string;
  eventId: string;
  question: string;
  options: DAOOption[];
  created_by: string; // organizer user ID
  created_at: Date;
  order: number;
}

export interface DAOOption {
  id: string;
  questionId: string;
  option_text: string;
  order: number;
}

export interface DAOVote {
  id: string;
  questionId: string;
  optionId: string;
  investorId: string;
  eventId: string;
  voted_at: Date;
}

export interface DAOResult {
  questionId: string;
  question: string;
  options: {
    id: string;
    option_text: string;
    vote_count: number;
    percentage: number;
  }[];
  total_votes: number;
}

// Investment Types
export interface Investment {
  id: string;
  eventId: string;
  investorId: string;
  investor_wallet: string;
  investor_name?: string;
  amount_sol: number;
  investment_date: Date;
  transaction_signature?: string;
  status: "pending" | "confirmed" | "refunded";
  roi_paid?: boolean;
  roi_amount?: number;
  roi_paid_at?: Date;
}

export interface InvestmentSummary {
  eventId: string;
  total_investments: number;
  total_amount_sol: number;
  investor_count: number;
  investments: Investment[];
}

// ROI Distribution Types
export interface ROIDistribution {
  id: string;
  eventId: string;
  total_revenue: number; // in SOL
  total_costs: number; // in SOL
  net_profit: number; // in SOL
  investor_share_percentage: number; // e.g., 20%
  total_roi_pool: number; // in SOL
  distributed_at?: Date;
  status: "pending" | "processing" | "completed" | "failed";
  transaction_signature?: string;
}

export interface InvestorROI {
  id: string;
  distributionId: string;
  investmentId: string;
  investorId: string;
  investor_wallet: string;
  investment_amount: number; // in SOL
  roi_amount: number; // in SOL
  roi_percentage: number; // based on investment proportion
  paid: boolean;
  paid_at?: Date;
  transaction_signature?: string;
}

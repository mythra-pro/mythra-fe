// Event and Ticket Type Definitions

/**
 * Event Status Flow - Complete 9-Stage Lifecycle:
 *
 * 0. DRAFT - Event created by organizer, still being edited
 *    - Can be saved and edited multiple times before submission
 *
 * 1. PENDING_APPROVAL - Event submitted, waiting for admin review
 *    - Organizer cannot edit after submission
 *    - Admin can approve or reject
 *
 * 2. INVESTMENT_WINDOW - Admin approved, accepting investments
 *    - Investors can contribute SOL to event vault
 *    - Organizer can set up DAO questions
 *    - Vault has a cap (vault_cap field)
 *
 * 3. DAO_PROCESS - Vault full or ready, DAO voting in progress
 *    - All investors vote on DAO questions
 *    - Voting power: 1 wallet = 1 vote (democratic)
 *    - "Start Selling" button HIDDEN during this phase
 *
 * 4. SELLING_TICKETS - DAO complete, tickets available for sale
 *    - Organizer enabled ticket sales
 *    - Customers can purchase tickets
 *    - can_sell_tickets = true
 *
 * 5. WAITING_FOR_EVENT - Ticket sales closed, awaiting event day
 *    - All tickets sold or sales deadline passed
 *    - Waiting for event start date
 *
 * 6. EVENT_RUNNING - Event day, check-ins happening
 *    - Staff scanning QR codes
 *    - Active check-ins tracked
 *
 * 7. CALCULATING_INCOME - Event done, organizer calculating revenue
 *    - Organizer inputs revenue and costs
 *    - Preparing ROI calculations
 *
 * 8. ROI_DISTRIBUTION - Distributing ROI to investors
 *    - ROI calculated and being transferred
 *    - Proportional to investment amounts
 *
 * 9. COMPLETED - Event lifecycle complete
 *    - All ROI distributed
 *    - Event archived
 *
 * REJECTED - Event rejected by admin at approval stage
 * CANCELLED - Event cancelled at any stage
 */
export enum EventStatus {
  // Main lifecycle (9 stages)
  DRAFT = "draft",
  PENDING_APPROVAL = "pending_approval",
  INVESTMENT_WINDOW = "investment_window",
  DAO_PROCESS = "dao_process",
  SELLING_TICKETS = "selling_tickets",
  WAITING_FOR_EVENT = "waiting_for_event",
  EVENT_RUNNING = "event_running",
  CALCULATING_INCOME = "calculating_income",
  ROI_DISTRIBUTION = "roi_distribution",
  COMPLETED = "completed",
  
  // Edge cases
  REJECTED = "rejected",
  CANCELLED = "cancelled",
  
  // Legacy statuses (deprecated - kept for backwards compatibility)
  APPROVED = "approved",        // Use INVESTMENT_WINDOW instead
  DAO_VOTING = "dao_voting",    // Use DAO_PROCESS instead
  PUBLISHED = "published",      // Use SELLING_TICKETS instead
  ONGOING = "ongoing",          // Use EVENT_RUNNING instead
  LIVE = "live",                // Use SELLING_TICKETS or EVENT_RUNNING instead
}

/**
 * Approval Status (removed - using 'status' field instead)
 * All approval tracking is done via the main 'status' field
 */
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
  // Admin approval and DAO voting tracking
  approved_by?: string;
  approved_at?: Date;
  rejected_reason?: string;
  rejected_by?: string;
  rejected_at?: Date;
  // DAO voting fields
  dao_completed?: boolean;
  dao_voting_started_at?: Date;
  dao_voting_completed_at?: Date;
  dao_total_votes?: number;
  dao_approval_votes?: number;
  dao_rejection_reason?: string;
  published_at?: Date;
  // Ticket selling control
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
  // Investment tracking
  vault_cap?: number;
  current_investment_amount?: number;
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
  // Ticket tiers from database
  ticket_tiers?: Array<{
    id: string;
    event_id: string;
    name: string;
    description?: string;
    price: number;
    supply_max: number;
    supply_available?: number;
    created_at?: Date;
  }>;
  price_in_sol?: number;
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
  vaultCap: number; // Max investment amount in SOL (REQUIRED, must be > 0)
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

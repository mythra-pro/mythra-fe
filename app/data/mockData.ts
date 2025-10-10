import {
  EventData,
  TicketData,
  EventStatus,
  TicketStatus,
  EventAnalytics,
  PayoutData,
  DashboardStats,
} from "../types/event";

// Mock Event Data
export const mockEvents: EventData[] = [
  {
    id: "evt_001",
    name: "Web3 Summit 2025",
    description:
      "The biggest Web3 conference of the year featuring top speakers from the blockchain industry",
    organizerId: "org_001",
    organizerName: "Web3 Foundation",
    date: new Date("2025-11-15T09:00:00"),
    endDate: new Date("2025-11-15T18:00:00"),
    location: "Jakarta Convention Center",
    priceInSOL: 0.5,
    maxTickets: 500,
    ticketsSold: 342,
    status: EventStatus.PUBLISHED,
    category: "Conference",
    createdAt: new Date("2025-09-01"),
    updatedAt: new Date("2025-10-01"),
    creatorWallet: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    mintAddress: "9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin",
  },
  {
    id: "evt_002",
    name: "NFT Art Exhibition",
    description:
      "Exclusive NFT art exhibition featuring digital artists from Southeast Asia",
    organizerId: "org_001",
    organizerName: "Solana Foundation",
    date: new Date("2025-10-20T14:00:00"),
    endDate: new Date("2025-10-20T22:00:00"),
    location: "Bali Art Gallery",
    priceInSOL: 0.25,
    maxTickets: 200,
    ticketsSold: 180,
    status: EventStatus.ONGOING,
    category: "Art",
    createdAt: new Date("2025-08-15"),
    updatedAt: new Date("2025-09-20"),
    creatorWallet: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    mintAddress: "5xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin",
  },
  {
    id: "evt_003",
    name: "DeFi Workshop",
    description:
      "Hands-on workshop about DeFi protocols and yield farming strategies",
    organizerId: "org_001",
    organizerName: "Solana Foundation",
    date: new Date("2025-12-05T10:00:00"),
    endDate: new Date("2025-12-05T16:00:00"),
    location: "Online Event",
    priceInSOL: 0.1,
    maxTickets: 100,
    ticketsSold: 45,
    status: EventStatus.PUBLISHED,
    category: "Workshop",
    createdAt: new Date("2025-09-25"),
    updatedAt: new Date("2025-09-30"),
    creatorWallet: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    mintAddress: "3xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin",
  },
  {
    id: "evt_004",
    name: "Crypto Music Festival",
    description:
      "Electronic music festival with crypto-themed performances and NFT merchandise",
    organizerId: "org_001",
    organizerName: "Solana Foundation",
    date: new Date("2025-10-08T18:00:00"),
    endDate: new Date("2025-10-09T02:00:00"),
    location: "Bandung Creative Hub",
    priceInSOL: 0.75,
    maxTickets: 1000,
    ticketsSold: 856,
    status: EventStatus.COMPLETED,
    category: "Music",
    createdAt: new Date("2025-07-01"),
    updatedAt: new Date("2025-10-09"),
    creatorWallet: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    mintAddress: "8xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin",
  },
];

// Mock Ticket Data
export const mockTickets: TicketData[] = [
  {
    id: "tkt_001",
    eventId: "evt_001",
    ticketNumber: 1,
    ownerWallet: "4xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    ownerName: "John Doe",
    ownerEmail: "john@example.com",
    purchaseDate: new Date("2025-09-15"),
    priceInSOL: 0.5,
    status: TicketStatus.CHECKED_IN,
    checkInDate: new Date("2025-11-15T08:45:00"),
    nftMintAddress: "tkt1xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin",
    qrCode: "QR_TKT_001_HASH",
  },
  {
    id: "tkt_002",
    eventId: "evt_001",
    ticketNumber: 2,
    ownerWallet: "5xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    ownerName: "Jane Smith",
    ownerEmail: "jane@example.com",
    purchaseDate: new Date("2025-09-16"),
    priceInSOL: 0.5,
    status: TicketStatus.SOLD,
    nftMintAddress: "tkt2xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin",
    qrCode: "QR_TKT_002_HASH",
  },
  {
    id: "tkt_003",
    eventId: "evt_001",
    ticketNumber: 3,
    ownerWallet: "6xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    ownerName: "Alice Johnson",
    ownerEmail: "alice@example.com",
    purchaseDate: new Date("2025-09-17"),
    priceInSOL: 0.5,
    status: TicketStatus.CHECKED_IN,
    checkInDate: new Date("2025-11-15T09:15:00"),
    nftMintAddress: "tkt3xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin",
    qrCode: "QR_TKT_003_HASH",
  },
  {
    id: "tkt_004",
    eventId: "evt_002",
    ticketNumber: 1,
    ownerWallet: "8xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    ownerName: "Bob Wilson",
    ownerEmail: "bob@example.com",
    purchaseDate: new Date("2025-08-20"),
    priceInSOL: 0.25,
    status: TicketStatus.CHECKED_IN,
    checkInDate: new Date("2025-10-20T14:30:00"),
    nftMintAddress: "tkt4xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin",
    qrCode: "QR_TKT_004_HASH",
  },
];

// Mock Analytics Data
export const mockAnalytics: Record<string, EventAnalytics> = {
  evt_001: {
    eventId: "evt_001",
    totalRevenue: 171, // 342 tickets * 0.5 SOL
    ticketsSold: 342,
    maxTickets: 500,
    checkInRate: 68.5,
    checkedInCount: 234,
    salesByDay: [
      { date: "2025-09-15", count: 45 },
      { date: "2025-09-16", count: 62 },
      { date: "2025-09-17", count: 58 },
      { date: "2025-09-18", count: 71 },
      { date: "2025-09-19", count: 55 },
      { date: "2025-09-20", count: 51 },
    ],
    revenueByDay: [
      { date: "2025-09-15", amount: 22.5 },
      { date: "2025-09-16", amount: 31 },
      { date: "2025-09-17", amount: 29 },
      { date: "2025-09-18", amount: 35.5 },
      { date: "2025-09-19", amount: 27.5 },
      { date: "2025-09-20", amount: 25.5 },
    ],
    checkInTrend: [
      { hour: "08:00", count: 23 },
      { hour: "09:00", count: 45 },
      { hour: "10:00", count: 67 },
      { hour: "11:00", count: 42 },
      { hour: "12:00", count: 28 },
      { hour: "13:00", count: 29 },
    ],
  },
  evt_002: {
    eventId: "evt_002",
    totalRevenue: 45, // 180 tickets * 0.25 SOL
    ticketsSold: 180,
    maxTickets: 200,
    checkInRate: 75,
    checkedInCount: 135,
    salesByDay: [
      { date: "2025-08-20", count: 30 },
      { date: "2025-08-21", count: 40 },
      { date: "2025-08-22", count: 35 },
      { date: "2025-08-23", count: 45 },
      { date: "2025-08-24", count: 30 },
    ],
    revenueByDay: [
      { date: "2025-08-20", amount: 7.5 },
      { date: "2025-08-21", amount: 10 },
      { date: "2025-08-22", amount: 8.75 },
      { date: "2025-08-23", amount: 11.25 },
      { date: "2025-08-24", amount: 7.5 },
    ],
    checkInTrend: [
      { hour: "14:00", count: 25 },
      { hour: "15:00", count: 35 },
      { hour: "16:00", count: 30 },
      { hour: "17:00", count: 25 },
      { hour: "18:00", count: 20 },
    ],
  },
};

// Mock Payout Data
export const mockPayouts: PayoutData[] = [
  {
    id: "pyt_001",
    eventId: "evt_004",
    organizerWallet: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    totalAmount: 642, // 856 tickets * 0.75 SOL
    organizerAmount: 609.9, // 95%
    platformFee: 32.1, // 5%
    status: "completed",
    transactionSignature: "5xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsTxHash",
    processedAt: new Date("2025-10-10"),
    createdAt: new Date("2025-10-09"),
  },
  {
    id: "pyt_002",
    eventId: "evt_001",
    organizerWallet: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
    totalAmount: 171,
    organizerAmount: 162.45, // 95%
    platformFee: 8.55, // 5%
    status: "pending",
    createdAt: new Date("2025-10-05"),
  },
];

// Mock Dashboard Stats
export const mockDashboardStats: DashboardStats = {
  totalEvents: 4,
  activeEvents: 2,
  totalRevenue: 858, // Sum of all revenues
  totalTicketsSold: 1423,
  upcomingEvents: 2,
};

// Helper function to generate more tickets
export function generateMockTickets(
  eventId: string,
  count: number,
  priceInSOL: number
): TicketData[] {
  const tickets: TicketData[] = [];
  const statuses = [TicketStatus.SOLD, TicketStatus.CHECKED_IN];

  for (let i = 1; i <= count; i++) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    tickets.push({
      id: `tkt_${eventId}_${i}`,
      eventId,
      ticketNumber: i,
      ownerWallet: `wallet_${Math.random().toString(36).substring(7)}`,
      ownerName: `Attendee ${i}`,
      ownerEmail: `attendee${i}@example.com`,
      purchaseDate: new Date(
        Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
      ),
      priceInSOL,
      status,
      checkInDate: status === TicketStatus.CHECKED_IN ? new Date() : undefined,
      nftMintAddress: `nft_${Math.random().toString(36).substring(7)}`,
      qrCode: `QR_${eventId}_${i}_${Math.random().toString(36).substring(7)}`,
    });
  }

  return tickets;
}

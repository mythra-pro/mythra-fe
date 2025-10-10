export type TicketStatus = "active" | "used" | "refunded" | "expired";

export interface NFTTicket {
  id: string;
  eventId: string;
  eventName: string;
  ticketType: string;
  price: number;
  owner: string;
  status: TicketStatus;
  nftMetadata: {
    image: string;
    name: string;
    description: string;
    attributes: Array<{ trait_type: string; value: string }>;
  };
  purchasedAt: Date;
  usedAt?: Date;
  checkInStaff?: string;
}

export interface TicketType {
  id: string;
  name: string;
  description: string;
  price: number;
  totalSupply: number;
  sold: number;
  available: number;
  benefits: string[];
}

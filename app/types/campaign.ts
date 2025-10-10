export type CampaignStatus =
  | "draft"
  | "active"
  | "funded"
  | "completed"
  | "cancelled";

export interface Campaign {
  id: string;
  eventId: string;
  eventName: string;
  organizerId: string;
  organizerName: string;
  title: string;
  description: string;
  coverImage: string;
  targetAmount: number;
  currentAmount: number;
  minInvestment: number;
  investors: number;
  status: CampaignStatus;
  startDate: Date;
  endDate: Date;
  rewards: CampaignReward[];
  votes: number;
  votingThreshold: number;
}

export interface CampaignReward {
  id: string;
  title: string;
  description: string;
  minAmount: number;
  benefits: string[];
  claimed: number;
  total: number;
}

export interface Investment {
  id: string;
  campaignId: string;
  investorId: string;
  amount: number;
  rewardId?: string;
  daoTokens: number;
  investedAt: Date;
  status: "active" | "refunded";
}

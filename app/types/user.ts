export type UserRole =
  | "organizer"
  | "staff"
  | "customer"
  | "admin"
  | "investor";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  walletAddress?: string;
  avatar?: string;
  createdAt: Date;
}

export interface WalletInfo {
  address: string;
  balance: number;
  network: string;
  connected: boolean;
}

"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { SystemProgram, Transaction, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useDashboardUser } from "@/hooks/useDashboardUser";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Calendar, 
  MapPin, 
  TrendingUp, 
  Wallet,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  DollarSign,
  Users
} from "lucide-react";

type Event = {
  id: string;
  name: string;
  description: string;
  venue: string;
  start_time: string;
  end_time: string;
  category: string;
  status: string;
  banner_url?: string;
  max_tickets: number;
  organizer: {
    id: string;
    display_name: string;
    wallet_address: string;
  };
};

type Investment = {
  id: string;
  amount_sol: number;
  investor_id: string;
};

export default function InvestPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.eventId as string;
  const user = useDashboardUser("investor");
  const { publicKey, signTransaction, connected } = useWallet();
  const { connection } = useConnection();

  const [event, setEvent] = useState<Event | null>(null);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [investing, setInvesting] = useState(false);
  const [amount, setAmount] = useState("10");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (eventId) {
      fetchEventDetails();
      fetchInvestments();
    }
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/events/${eventId}`);
      const data = await res.json();
      
      if (data.event) {
        setEvent(data.event);
      } else {
        setError("Event not found");
      }
    } catch (e) {
      console.error("Error fetching event:", e);
      setError("Failed to load event details");
    } finally {
      setLoading(false);
    }
  };

  const fetchInvestments = async () => {
    try {
      const res = await fetch(`/api/investments?eventId=${eventId}`);
      const data = await res.json();
      setInvestments(data.investments || []);
    } catch (e) {
      console.error("Error fetching investments:", e);
    }
  };

  const handleInvest = async () => {
    if (!user?.id) {
      setError("User not authenticated");
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    setInvesting(true);
    setError(null);

    try {
      console.log("💰 Recording investment...");
      
      // Generate dummy transaction signature for web2 flow
      const dummySignature = `dummy_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const walletAddress = publicKey?.toString() || user.email || "dummy_wallet";

      // Record investment in database
      const investmentRes = await fetch("/api/investments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          investorId: user.id,
          investorWallet: walletAddress,
          amountSol: amountNum,
          transactionSignature: dummySignature,
        }),
      });

      if (!investmentRes.ok) {
        const errorData = await investmentRes.json();
        throw new Error(errorData.error || "Failed to record investment");
      }

      const investmentData = await investmentRes.json();
      console.log("✅ Investment recorded:", investmentData.investment.id);

      setSuccess(true);

      // Show success message and redirect after 3 seconds
      setTimeout(() => {
        router.push(`/dashboard/investor/vote/${eventId}`);
      }, 3000);

    } catch (e: any) {
      console.error("❌ Investment failed:", e);
      setError(e.message || "Failed to complete investment");
    } finally {
      setInvesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Event not found or you don't have permission to invest.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const totalInvested = investments.reduce((sum, inv) => sum + parseFloat(inv.amount_sol.toString()), 0);
  const investorCount = new Set(investments.map(inv => inv.investor_id)).size;

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Success State */}
      {success && (
        <Alert className="mb-6 border-green-500 bg-green-50">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Investment Successful!</strong> Redirecting you to vote on DAO questions...
          </AlertDescription>
        </Alert>
      )}

      {/* Error State */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Event Details Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{event.name}</CardTitle>
              <CardDescription className="mt-2">
                {event.description}
              </CardDescription>
            </div>
            <Badge variant={event.status === "dao_voting" ? "default" : "secondary"}>
              {event.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{new Date(event.start_time).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{event.venue}</span>
            </div>
          </div>

          {/* Investment Stats */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-2xl font-bold text-primary">
                <TrendingUp className="h-6 w-6" />
                {totalInvested.toFixed(2)} SOL
              </div>
              <p className="text-sm text-muted-foreground mt-1">Total Invested</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 text-2xl font-bold">
                <Users className="h-6 w-6" />
                {investorCount}
              </div>
              <p className="text-sm text-muted-foreground mt-1">Investors</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Investment Form */}
      <Card>
        <CardHeader>
          <CardTitle>Make Your Investment</CardTitle>
          <CardDescription>
            Invest in this event and gain voting rights on DAO decisions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount">Investment Amount (SOL)</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="amount"
                type="number"
                step="0.1"
                min="0.1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-9"
                placeholder="Enter amount in SOL"
                disabled={investing || success}
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Minimum investment: 0.1 SOL
            </p>
          </div>

          {/* Quick Amount Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAmount("5")}
              disabled={investing || success}
            >
              5 SOL
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAmount("10")}
              disabled={investing || success}
            >
              10 SOL
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAmount("25")}
              disabled={investing || success}
            >
              25 SOL
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAmount("50")}
              disabled={investing || success}
            >
              50 SOL
            </Button>
          </div>

          {/* Investment Info */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Demo Mode:</strong> This is a web2 flow with dummy data. 
              After investing, you'll be able to vote on DAO questions for this event.
            </AlertDescription>
          </Alert>

          {/* Optional Wallet Connection */}
          {connected && (
            <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
              <div>
                <p className="text-sm font-medium">Connected Wallet (Optional)</p>
                <p className="text-xs text-muted-foreground font-mono">
                  {publicKey?.toString().slice(0, 8)}...{publicKey?.toString().slice(-8)}
                </p>
              </div>
              <WalletMultiButton className="!bg-secondary hover:!bg-secondary/80" />
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => router.back()}
            disabled={investing}
          >
            Cancel
          </Button>
          <Button
            onClick={handleInvest}
            disabled={investing || success || !amount || parseFloat(amount) <= 0}
            className="gap-2"
          >
            {investing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : success ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Invested!
              </>
            ) : (
              <>
                Invest {amount} SOL
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

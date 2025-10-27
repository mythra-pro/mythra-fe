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
import { Progress } from "@/components/ui/progress";
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
  vault_cap: number; // REQUIRED: 0.01 - 10000 SOL
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
  investment_date: string;
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
  const [hasInvested, setHasInvested] = useState(false);
  const [userInvestment, setUserInvestment] = useState<Investment | null>(null);
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
      const allInvestments = data.investments || [];
      setInvestments(allInvestments);
      
      // Check if current user has already invested
      if (user?.id) {
        const myInvestment = allInvestments.find((inv: Investment) => inv.investor_id === user.id);
        if (myInvestment) {
          setHasInvested(true);
          setUserInvestment(myInvestment);
        }
      }
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

  // Already invested check
  if (hasInvested && userInvestment) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <Card className="border-green-500 bg-green-50 dark:bg-green-950">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              <CardTitle>Already Invested</CardTitle>
            </div>
            <CardDescription>
              You have already invested in this event
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>One investment per event:</strong> Each investor can only invest once per event. You can now vote on DAO questions!
              </AlertDescription>
            </Alert>

            <div className="p-4 bg-white dark:bg-gray-900 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Event:</span>
                <span className="font-semibold">{event.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Your Investment:</span>
                <span className="font-bold text-green-600">{userInvestment.amount_sol} SOL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Investment Date:</span>
                <span className="text-sm">{new Date(userInvestment.investment_date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Voting Power:</span>
                <span className="font-semibold">1 vote per question</span>
              </div>
            </div>

            <Alert className="border-blue-500 bg-blue-50 dark:bg-blue-950">
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 dark:text-blue-200">
                <strong>Equal voting power:</strong> All investors get 1 vote per question, regardless of investment amount.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button 
              onClick={() => router.push(`/dashboard/investor/vote/${eventId}`)}
              className="flex-1"
            >
              Vote on DAO Questions
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
            <Button 
              variant="outline"
              onClick={() => router.push("/dashboard/investor/opportunities")}
            >
              Browse Events
            </Button>
          </CardFooter>
        </Card>
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

          {/* Vault Capacity (ALWAYS SHOWN - Required Field) */}
          {event.vault_cap > 0 && (
            <div className="pt-4 border-t">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Vault Capacity</span>
                <span className="text-sm text-muted-foreground">
                  {totalInvested.toFixed(2)} / {event.vault_cap} SOL
                </span>
              </div>
              <Progress value={(totalInvested / event.vault_cap) * 100} className="h-2" />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-muted-foreground">
                  {((totalInvested / event.vault_cap) * 100).toFixed(1)}% filled
                </span>
                <span className="text-xs font-semibold text-green-600">
                  {(event.vault_cap - totalInvested).toFixed(2)} SOL remaining
                </span>
              </div>
              {(event.vault_cap - totalInvested) <= 0 && (
                <Alert variant="destructive" className="mt-3">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Vault Full:</strong> This event has reached its investment capacity.
                  </AlertDescription>
                </Alert>
              )}
              {(event.vault_cap - totalInvested) > 0 && (event.vault_cap - totalInvested) < 10 && (
                <Alert className="mt-3 border-yellow-500 bg-yellow-50">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800">
                    <strong>Limited Capacity:</strong> Only {(event.vault_cap - totalInvested).toFixed(2)} SOL remaining!
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
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
          {/* Event Status Check */}
          {event.status !== "approved" && event.status !== "dao_voting" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Investment Not Available:</strong> This event is not currently accepting investments. 
                Event status must be 'approved' or 'dao_voting'. Current status: '{event.status}'
              </AlertDescription>
            </Alert>
          )}
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
                disabled={investing || success || (event.status !== "approved" && event.status !== "dao_voting")}
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
            disabled={investing || success || !amount || parseFloat(amount) <= 0 || (event.status !== "approved" && event.status !== "dao_voting")}
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

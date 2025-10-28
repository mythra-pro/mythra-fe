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
  const { user, isLoading: userLoading } = useDashboardUser("investor");
  const { connection } = useConnection();
  const { publicKey, connected } = useWallet();
  
  const [event, setEvent] = useState<Event | null>(null);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [userInvestment, setUserInvestment] = useState<Investment | null>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState("");
  const [investing, setInvesting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userLoading || !user || !eventId) return;
    fetchEventData();
  }, [userLoading, user, eventId]);

  const fetchEventData = async () => {
    try {
      setLoading(true);
      
      // Fetch event details
      const eventRes = await fetch(`/api/events/${eventId}`);
      const eventData = await eventRes.json();
      
      if (!eventData.event) {
        setError("Event not found");
        setLoading(false);
        return;
      }
      
      setEvent(eventData.event);
      
      // Fetch investments
      const investmentsRes = await fetch(`/api/investments?eventId=${eventId}`);
      const investmentsData = await investmentsRes.json();
      setInvestments(investmentsData.investments || []);
      
      // Check if user already invested
      if (investmentsData.investments && user?.id) {
        const userInv = investmentsData.investments.find(
          (inv: Investment) => inv.investor_id === user?.id
        );
        if (userInv) {
          setUserInvestment(userInv);
        }
      }
      
    } catch (err) {
      console.error("Error fetching event data:", err);
      setError("Failed to load event data");
    } finally {
      setLoading(false);
    }
  };

  const handleInvest = async () => {
    if (!amount || parseFloat(amount) < 0.1 || !user || !event) {
      setError("Please enter a valid amount (minimum 0.1 SOL)");
      return;
    }

    try {
      setInvesting(true);
      setError(null);

      const response = await fetch("/api/investments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: eventId,
          investorId: user.id,
          investorWallet: user.walletAddress,
          amountSol: parseFloat(amount),
          transactionSignature: null, // Demo mode
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Check if error is about exceeding vault capacity
        if (data.error?.includes("exceeds vault capacity") && data.remaining) {
          // Auto-set to maximum available amount
          const maxAmount = data.remaining.toFixed(2);
          setAmount(maxAmount);
          setError(`💡 Amount adjusted to maximum available: ${maxAmount} SOL. Click Invest again to proceed.`);
          setInvesting(false);
          return;
        }
        throw new Error(data.error || "Investment failed");
      }

      setSuccess(true);
      
      // Redirect to voting page after 2 seconds
      setTimeout(() => {
        router.push(`/dashboard/investor/vote/${eventId}`);
      }, 2000);
      
    } catch (err: any) {
      console.error("Investment error:", err);
      setError(err.message || "Failed to process investment");
      setInvesting(false);
    }
  };

  if (userLoading || !user) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

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
  if (userInvestment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-2xl max-w-2xl w-full overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="h-24 w-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <CheckCircle2 className="h-16 w-16 text-white drop-shadow-lg" />
              </div>
            </div>
            <CardTitle className="text-4xl font-bold text-white mb-2 drop-shadow-md">
              ✅ Already Invested!
            </CardTitle>
            <CardDescription className="text-emerald-50 text-lg">
              You have already invested in this event
            </CardDescription>
          </div>
          
          <CardContent className="space-y-6 p-8">
            <Alert className="border-2 border-green-200 bg-green-50">
              <AlertCircle className="h-5 w-5 text-green-600" />
              <AlertDescription className="text-green-800 text-base">
                <strong>One investment per event:</strong> Each investor can only invest once per event. You can now vote on DAO questions!
              </AlertDescription>
            </Alert>

            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 space-y-4 border-2 border-blue-100">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-semibold">🎪 Event:</span>
                <span className="font-bold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{event.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-semibold">💰 Your Investment:</span>
                <span className="font-bold text-2xl text-green-600">{userInvestment.amount_sol} SOL</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-semibold">📅 Investment Date:</span>
                <span className="text-sm font-semibold text-gray-700">{new Date(userInvestment.investment_date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-semibold">🗳️ Voting Power:</span>
                <span className="font-bold text-lg text-purple-600">1 vote per question</span>
              </div>
            </div>

            <Alert className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <CheckCircle2 className="h-5 w-5 text-blue-600" />
              <AlertDescription className="text-blue-800 text-base">
                <strong>⚖️ Equal voting power:</strong> All investors get 1 vote per question, regardless of investment amount.
              </AlertDescription>
            </Alert>
          </CardContent>
          
          <CardFooter className="flex gap-4 p-8 pt-0">
            <Button 
              onClick={() => router.push(`/dashboard/investor/vote/${eventId}`)}
              className="flex-1 h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 font-semibold shadow-lg text-base"
            >
              🗳️ Vote on DAO Questions
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button 
              variant="outline"
              onClick={() => router.push("/dashboard/investor/opportunities")}
              className="border-2 border-gray-300 hover:bg-gray-50 font-semibold h-12"
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
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
      <Card className="mb-8 border-2 border-blue-200 shadow-2xl bg-white/90 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b-2 border-blue-100">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                {event.name}
              </CardTitle>
              <CardDescription className="mt-2 text-base text-gray-700">
                {event.description}
              </CardDescription>
            </div>
            <Badge 
              className={
                event.status === "investment_window" || event.status === "approved"
                  ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 px-4 py-2 text-base shadow-lg"
                  : event.status === "dao_process" || event.status === "dao_voting"
                  ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0 px-4 py-2 text-base shadow-lg"
                  : "bg-gray-500 text-white border-0 px-4 py-2 text-base shadow-lg"
              }
            >
              {event.status === "investment_window" || event.status === "approved"
                ? "💰 Open for Investment"
                : event.status === "dao_process" || event.status === "dao_voting"
                ? "🗳️ DAO Voting"
                : event.status}
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
          <div className="grid grid-cols-2 gap-6 pt-6 border-t-2 border-blue-100">
            <div className="bg-gradient-to-br from-orange-500 to-yellow-500 text-white rounded-xl p-6 shadow-lg text-center">
              <div className="flex items-center justify-center gap-2 text-4xl font-bold mb-2">
                <TrendingUp className="h-8 w-8" />
                {totalInvested.toFixed(2)}
              </div>
              <p className="text-sm text-orange-100 font-semibold">SOL Total Invested</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-xl p-6 shadow-lg text-center">
              <div className="flex items-center justify-center gap-2 text-4xl font-bold mb-2">
                <Users className="h-8 w-8" />
                {investorCount}
              </div>
              <p className="text-sm text-purple-100 font-semibold">Active Investors</p>
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
      <Card className="border-2 border-purple-200 shadow-2xl bg-white/90 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b-2 border-purple-100">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Wallet className="h-7 w-7 text-white" />
            </div>
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent font-bold">
              Make Your Investment
            </span>
          </CardTitle>
          <CardDescription className="text-base text-gray-700 mt-2">
            💰 Invest in this event and gain voting rights on DAO decisions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Event Status Check */}
          {event.status !== "investment_window" && event.status !== "dao_process" && 
           event.status !== "approved" && event.status !== "dao_voting" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Investment Not Available:</strong> This event is not currently accepting investments. 
                Event status must be 'investment_window', 'dao_process', 'approved' or 'dao_voting'. Current status: '{event.status}'
              </AlertDescription>
            </Alert>
          )}
          {/* Amount Input */}
          <div className="space-y-3">
            <Label htmlFor="amount" className="text-base font-semibold flex items-center gap-2">
              <span>💵</span> Investment Amount (SOL)
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-4 h-6 w-6 text-purple-400" />
              <Input
                id="amount"
                type="number"
                step="0.1"
                min="0.1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-14 h-14 text-xl font-semibold border-2 border-purple-200 focus:border-purple-400 rounded-xl"
                placeholder="0.0"
                disabled={investing || success || (event.status !== "investment_window" && event.status !== "dao_process" && event.status !== "approved" && event.status !== "dao_voting")}
              />
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                ℹ️ Minimum: 0.1 SOL
              </p>
              {event.vault_cap && (
                <p className="text-sm font-semibold text-blue-600">
                  💎 Max: {(event.vault_cap - totalInvested).toFixed(2)} SOL
                </p>
              )}
            </div>
            {amount && parseFloat(amount) >= 0.1 && parseFloat(amount) <= (event.vault_cap - totalInvested) && (
              <p className="text-sm font-bold text-green-600 text-center">
                ✅ Valid amount!
              </p>
            )}
            {amount && parseFloat(amount) > (event.vault_cap - totalInvested) && (
              <p className="text-sm font-bold text-orange-600 text-center">
                ⚠️ Amount exceeds vault capacity! Max: {(event.vault_cap - totalInvested).toFixed(2)} SOL
              </p>
            )}
          </div>

          {/* Quick Amount Buttons */}
          <div className="grid grid-cols-5 gap-3">
            <Button
              variant="outline"
              className="h-12 font-semibold border-2 border-purple-200 hover:bg-purple-50 hover:border-purple-400 transition-all"
              onClick={() => setAmount("5")}
              disabled={investing || success}
            >
              5 SOL
            </Button>
            <Button
              variant="outline"
              className="h-12 font-semibold border-2 border-purple-200 hover:bg-purple-50 hover:border-purple-400 transition-all"
              onClick={() => setAmount("10")}
              disabled={investing || success}
            >
              10 SOL
            </Button>
            <Button
              variant="outline"
              className="h-12 font-semibold border-2 border-purple-200 hover:bg-purple-50 hover:border-purple-400 transition-all"
              onClick={() => setAmount("25")}
              disabled={investing || success}
            >
              25 SOL
            </Button>
            <Button
              variant="outline"
              className="h-12 font-semibold border-2 border-purple-200 hover:bg-purple-50 hover:border-purple-400 transition-all"
              onClick={() => setAmount("50")}
              disabled={investing || success}
            >
              50 SOL
            </Button>
            <Button
              variant="outline"
              className="h-12 font-bold border-2 border-blue-400 bg-blue-50 hover:bg-blue-100 hover:border-blue-500 text-blue-700 transition-all"
              onClick={() => setAmount((event.vault_cap - totalInvested).toFixed(2))}
              disabled={investing || success}
            >
              💎 MAX
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
        <CardFooter className="flex gap-4 pt-6 border-t-2 border-purple-100 bg-gray-50">
          <Button
            variant="outline"
            onClick={() => router.back()}
            disabled={investing}
            className="h-12 border-2 border-gray-300 hover:bg-gray-100 font-semibold"
          >
            Cancel
          </Button>
          <Button
            onClick={handleInvest}
            disabled={investing || success || !amount || parseFloat(amount) < 0.1 || (event.status !== "investment_window" && event.status !== "dao_process" && event.status !== "approved" && event.status !== "dao_voting")}
            className="flex-1 h-12 text-base font-bold bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl transition-all"
          >
            {investing ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Processing...
              </>
            ) : success ? (
              <>
                <CheckCircle2 className="h-5 w-5 mr-2" />
                Invested! 
              </>
            ) : (
              <>
                Invest {amount || '...'} SOL
                <ArrowRight className="h-5 w-5 ml-2" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
      </div>
    </div>
  );
}

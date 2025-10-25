"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { getMenuSectionsForRole } from "@/app/utils/dashboardMenus";
import { useDashboardUser } from "@/hooks/useDashboardUser";
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Filter,
  Search,
  ExternalLink,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { motion } from "framer-motion";

// Force dynamic rendering - required for wallet-connected pages
export const dynamic = "force-dynamic";

export default function AdminTransactionsPage() {
  const user = useDashboardUser("admin");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch transactions from Supabase
  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch("/api/transactions")
      .then((res) => res.json())
      .then((data) => {
        if (data.transactions) {
          setTransactions(data.transactions);
        } else {
          setError("Failed to load transactions");
        }
      })
      .catch((err) => {
        console.error("Error fetching transactions:", err);
        setError("Error loading transactions");
      })
      .finally(() => setLoading(false));
  }, []);
  const filteredTransactions = transactions.filter((txn) => {
    const matchesSearch =
      (txn.user_name || txn.user || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (txn.event_name || txn.event || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (txn.id || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || txn.status === statusFilter;
    const matchesType = typeFilter === "all" || txn.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "pending":
        return "bg-yellow-500";
      case "failed":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "ticket_purchase":
        return "bg-blue-500";
      case "investment":
        return "bg-purple-500";
      case "payout":
        return "bg-orange-500";
      case "refund":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  // Calculate stats
  const totalVolume = transactions.reduce(
    (sum: number, txn: any) => sum + (txn.amount || 0),
    0
  );
  const totalFees = transactions.reduce(
    (sum: number, txn: any) => sum + (txn.fee || 0),
    0
  );
  const completedTransactions = transactions.filter(
    (txn: any) => txn.status === "completed"
  ).length;
  const pendingTransactions = transactions.filter(
    (txn: any) => txn.status === "pending"
  ).length;

  // Get menu sections for admin role

  const menuSections = getMenuSectionsForRole("admin");

  return (
    <DashboardLayout user={user} menuSections={menuSections}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-[#03045E]">
            Transaction Management 💳
          </h1>
          <p className="text-gray-600 mt-2">
            Monitor and manage all financial transactions on the platform.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-gradient-to-r from-[#0077B6] to-[#0096C7] text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Volume</p>
                  <p className="text-3xl font-bold">
                    ${totalVolume.toLocaleString()}
                  </p>
                </div>
                <DollarSign className="h-10 w-10 opacity-75" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Platform Fees</p>
                  <p className="text-3xl font-bold">
                    ${totalFees.toLocaleString()}
                  </p>
                </div>
                <CreditCard className="h-10 w-10 opacity-75" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Completed</p>
                  <p className="text-3xl font-bold">{completedTransactions}</p>
                </div>
                <TrendingUp className="h-10 w-10 opacity-75" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Pending</p>
                  <p className="text-3xl font-bold">{pendingTransactions}</p>
                </div>
                <CreditCard className="h-10 w-10 opacity-75" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6 bg-white border border-gray-200 shadow-sm">
          <div className="grid gap-4 md:grid-cols-12">
            <div className="md:col-span-5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search by user, event, or transaction ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-gray-200"
                />
              </div>
            </div>
            <div className="md:col-span-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="border-gray-200">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-3">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="border-gray-200">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="ticket_purchase">
                    Ticket Purchase
                  </SelectItem>
                  <SelectItem value="investment">Investment</SelectItem>
                  <SelectItem value="payout">Payout</SelectItem>
                  <SelectItem value="refund">Refund</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-1">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Transactions List */}
        <Card className="bg-white/90 border-[#48CAE4] shadow-xl">
          <CardHeader>
            <CardTitle className="text-[#03045E] flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              All Transactions ({filteredTransactions.length})
            </CardTitle>
            <CardDescription>
              Complete transaction history and details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredTransactions.map((txn, idx) => (
                <motion.div
                  key={txn.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card className="bg-gradient-to-r from-white to-[#CAF0F8] border-[#48CAE4]">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-bold text-[#03045E]">
                              {txn.id}
                            </h3>
                            <Badge
                              className={`${getStatusColor(
                                txn.status
                              )} text-white`}
                            >
                              {txn.status}
                            </Badge>
                            <Badge
                              className={`${getTypeColor(txn.type)} text-white`}
                            >
                              {txn.type.replace("_", " ")}
                            </Badge>
                          </div>

                          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                            <div>
                              <p className="text-xs text-gray-600">User</p>
                              <p className="font-medium text-[#03045E]">
                                {txn.user}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">Event</p>
                              <p className="font-medium text-[#03045E]">
                                {txn.event}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-600">
                                Payment Method
                              </p>
                              <p className="font-medium text-[#03045E]">
                                {txn.paymentMethod}
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="p-3 bg-white rounded-lg">
                              <p className="text-xs text-gray-600">Amount</p>
                              <p className="text-lg font-bold text-[#0077B6]">
                                ${txn.amount.toFixed(2)}
                              </p>
                            </div>
                            <div className="p-3 bg-white rounded-lg">
                              <p className="text-xs text-gray-600">
                                Platform Fee
                              </p>
                              <p className="text-lg font-bold text-[#0077B6]">
                                ${txn.fee.toFixed(2)}
                              </p>
                            </div>
                            <div className="p-3 bg-white rounded-lg">
                              <p className="text-xs text-gray-600">
                                Net Amount
                              </p>
                              <p className="text-lg font-bold text-[#0077B6]">
                                ${(txn.amount - txn.fee).toFixed(2)}
                              </p>
                            </div>
                            <div className="p-3 bg-white rounded-lg">
                              <p className="text-xs text-gray-600">Date</p>
                              <p className="text-sm font-medium text-[#03045E]">
                                {new Date(txn.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          {txn.blockchain && txn.hash && (
                            <div className="mt-3 p-3 bg-gradient-to-r from-[#48CAE4]/20 to-[#90E0EF]/20 rounded-lg border border-[#48CAE4]">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-xs font-semibold text-[#03045E] mb-1">
                                    Blockchain: {txn.blockchain}
                                  </p>
                                  <p className="text-xs text-gray-600 font-mono">
                                    {txn.hash.substring(0, 20)}...
                                    {txn.hash.substring(txn.hash.length - 10)}
                                  </p>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-[#0077B6] text-[#0077B6] hover:bg-[#0077B6] hover:text-white"
                                >
                                  <ExternalLink className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-row lg:flex-col gap-2 lg:w-32">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 lg:w-full border-[#0077B6] text-[#0077B6] hover:bg-[#0077B6] hover:text-white"
                          >
                            View Details
                          </Button>
                          {txn.status === "pending" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 lg:w-full border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                            >
                              Process
                            </Button>
                          )}
                          {txn.status === "failed" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1 lg:w-full border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                            >
                              Retry
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}

              {filteredTransactions.length === 0 && (
                <div className="p-12 text-center">
                  <CreditCard className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-700 mb-2">
                    No transactions found
                  </h3>
                  <p className="text-gray-500">
                    Try adjusting your search or filter criteria.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Transaction Management Tools */}
        <Card className="bg-gradient-to-r from-[#90E0EF] to-[#CAF0F8] border-[#48CAE4]">
          <CardHeader>
            <CardTitle className="text-[#03045E]">
              🔧 Transaction Management Tools
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-4">
              <div>
                <h4 className="font-semibold text-[#03045E] mb-2">
                  Bulk Operations
                </h4>
                <p className="text-sm text-gray-700 mb-3">
                  Process multiple transactions at once.
                </p>
                <Button
                  variant="outline"
                  className="w-full border-[#0077B6] text-[#0077B6] hover:bg-[#0077B6] hover:text-white"
                >
                  Bulk Process
                </Button>
              </div>
              <div>
                <h4 className="font-semibold text-[#03045E] mb-2">
                  Export Data
                </h4>
                <p className="text-sm text-gray-700 mb-3">
                  Download transaction reports for analysis.
                </p>
                <Button
                  variant="outline"
                  className="w-full border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                >
                  Export CSV
                </Button>
              </div>
              <div>
                <h4 className="font-semibold text-[#03045E] mb-2">
                  Dispute Resolution
                </h4>
                <p className="text-sm text-gray-700 mb-3">
                  Handle transaction disputes and chargebacks.
                </p>
                <Button
                  variant="outline"
                  className="w-full border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white"
                >
                  View Disputes
                </Button>
              </div>
              <div>
                <h4 className="font-semibold text-[#03045E] mb-2">
                  Fraud Detection
                </h4>
                <p className="text-sm text-gray-700 mb-3">
                  Monitor suspicious transaction patterns.
                </p>
                <Button
                  variant="outline"
                  className="w-full border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                >
                  Fraud Alerts
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

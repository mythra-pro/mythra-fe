"use client";

import { useState } from "react";
import { PayoutData } from "@/app/types/event";
import {
  Coins,
  Wallet,
  CheckCircle,
  Clock,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";

interface PayoutManagementProps {
  eventId: string;
  eventName: string;
  totalRevenue: number;
  organizerWallet: string;
  payouts: PayoutData[];
  onRequestPayout?: () => Promise<boolean>;
}

export default function PayoutManagement({
  eventId,
  eventName,
  totalRevenue,
  organizerWallet,
  payouts,
  onRequestPayout,
}: PayoutManagementProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const organizerAmount = totalRevenue * 0.95;
  const platformFee = totalRevenue * 0.05;

  const totalPaid = payouts
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + p.organizerAmount, 0);

  const pendingAmount = payouts
    .filter((p) => p.status === "pending" || p.status === "processing")
    .reduce((sum, p) => sum + p.organizerAmount, 0);

  const availableForPayout = organizerAmount - totalPaid - pendingAmount;

  const handleRequestPayout = async () => {
    if (!onRequestPayout || availableForPayout <= 0) return;

    setIsProcessing(true);
    try {
      const success = await onRequestPayout();
      if (success) {
        setShowConfirmation(false);
      }
    } catch (error) {
      console.error("Payout request failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusIcon = (status: PayoutData["status"]) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="text-green-500" />;
      case "processing":
        return <Clock className="text-blue-500 animate-spin" />;
      case "pending":
        return <Clock className="text-yellow-500" />;
      case "failed":
        return <AlertTriangle className="text-red-500" />;
    }
  };

  const getStatusBadge = (status: PayoutData["status"]) => {
    const styles = {
      completed: "bg-green-100 text-green-800",
      processing: "bg-blue-100 text-blue-800",
      pending: "bg-yellow-100 text-yellow-800",
      failed: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}
      >
        {getStatusIcon(status)}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-green-500 rounded-2xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">Payout Management</h2>
        <p className="text-purple-100">{eventName}</p>
      </div>

      {/* Payout Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Coins className="text-2xl text-purple-600" />
            </div>
            <span className="text-xs font-medium text-gray-500">
              TOTAL REVENUE
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {totalRevenue.toFixed(2)}
            <span className="text-lg text-gray-500"> SOL</span>
          </p>
        </div>

        {/* Your Share */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <Wallet className="text-2xl text-green-600" />
            </div>
            <span className="text-xs font-medium text-gray-500">
              YOUR SHARE (95%)
            </span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {organizerAmount.toFixed(2)}
            <span className="text-lg text-gray-500"> SOL</span>
          </p>
        </div>

        {/* Already Paid */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <CheckCircle className="text-2xl text-blue-600" />
            </div>
            <span className="text-xs font-medium text-gray-500">PAID OUT</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {totalPaid.toFixed(2)}
            <span className="text-lg text-gray-500"> SOL</span>
          </p>
        </div>

        {/* Available */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-orange-100 p-3 rounded-lg">
              <Coins className="text-2xl text-orange-600" />
            </div>
            <span className="text-xs font-medium text-gray-500">AVAILABLE</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {availableForPayout.toFixed(2)}
            <span className="text-lg text-gray-500"> SOL</span>
          </p>
        </div>
      </div>

      {/* Payout Breakdown */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">
          Revenue Breakdown
        </h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Your Earnings (95%)</p>
              <p className="text-sm text-gray-600">
                Transferred to: {organizerWallet.substring(0, 8)}...
                {organizerWallet.substring(organizerWallet.length - 6)}
              </p>
            </div>
            <p className="text-2xl font-bold text-green-700">
              {organizerAmount.toFixed(2)} SOL
            </p>
          </div>

          <div className="flex justify-between items-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Platform Fee (5%)</p>
              <p className="text-sm text-gray-600">Mythra service fee</p>
            </div>
            <p className="text-2xl font-bold text-purple-700">
              {platformFee.toFixed(2)} SOL
            </p>
          </div>
        </div>
      </div>

      {/* Request Payout Button */}
      {availableForPayout > 0 && onRequestPayout && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">
                Request Instant Payout
              </h3>
              <p className="text-sm text-gray-600">
                Instantly transfer {availableForPayout.toFixed(2)} SOL to your
                wallet
              </p>
            </div>
            <button
              onClick={() => setShowConfirmation(true)}
              disabled={isProcessing}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-green-500 text-white font-bold rounded-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Request Payout
            </button>
          </div>
        </div>
      )}

      {/* Payout History */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Payout History</h3>
        </div>

        {payouts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Platform Fee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Transaction
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {payouts.map((payout) => (
                  <tr key={payout.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {payout.createdAt.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {payout.organizerAmount.toFixed(2)} SOL
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {payout.platformFee.toFixed(2)} SOL
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(payout.status)}
                    </td>
                    <td className="px-6 py-4">
                      {payout.transactionSignature ? (
                        <a
                          href={`https://solscan.io/tx/${payout.transactionSignature}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-700 text-sm"
                        >
                          View
                          <ExternalLink className="text-xs" />
                        </a>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center">
            <Wallet className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No payout history yet</p>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-green-500 rounded-full mb-4">
                <Wallet className="text-3xl text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Confirm Payout
              </h3>
              <p className="text-gray-600">
                You're about to request an instant payout
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-green-50 rounded-xl p-6 mb-6">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-bold text-gray-900">
                    {availableForPayout.toFixed(2)} SOL
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">To Wallet:</span>
                  <span className="font-mono text-xs text-gray-900">
                    {organizerWallet.substring(0, 12)}...
                  </span>
                </div>
                <div className="pt-3 border-t border-gray-300">
                  <p className="text-xs text-gray-600">
                    Transaction will be processed on Solana blockchain
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmation(false)}
                disabled={isProcessing}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestPayout}
                disabled={isProcessing}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-green-500 text-white rounded-lg hover:shadow-lg transition-all font-bold disabled:opacity-50"
              >
                {isProcessing ? "Processing..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

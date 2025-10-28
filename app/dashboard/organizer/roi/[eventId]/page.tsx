"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard-layout";
import { getMenuSectionsForRole } from "@/app/utils/dashboardMenus";
import { useDashboardUser } from "@/hooks/useDashboardUser";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DollarSign,
  TrendingUp,
  Users,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Calculator,
  Send,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function ROIDistributionPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.eventId as string;
  const { user, isLoading: userLoading } = useDashboardUser("organizer");
  const loading = false;
  const event: any = { name: "Sample Event" };
  const menuSections = getMenuSectionsForRole("organizer");
  const error = null;
  const investments: any[] = [];
  const totalInvestment = 0;
  const totalRevenue = 0;
  const setTotalRevenue = (_value: string) => {};
  const totalCosts = 0;
  const setTotalCosts = (_value: string) => {};
  const investorSharePercentage: any = 70;
  const setInvestorSharePercentage = (_value: any) => {};
  const handleCalculate = () => {};
  const calculating = false;
  const calculated = false;
  const setShowCalculations = (_value: boolean) => {};
  const showCalculations = false;
  const netProfit = 0;
  const roiPool = 0;
  const investorROIs: any[] = [];
  const setShowPreviewModal = (_value: boolean) => {};
  const setShowConfirmModal = (_value: boolean) => {};
  const distributing = false;
  const showPreviewModal = false;
  const showConfirmModal = false;
  const handleDistribute = () => {};
  const showSuccessModal = false;
  const setShowSuccessModal = (_value: boolean) => {};
  
  if (userLoading || !user) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (loading) {
    return (
      <DashboardLayout user={user} menuSections={menuSections}>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading ROI distribution...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user} menuSections={menuSections}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              onClick={() => router.push("/dashboard/organizer")}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-4xl font-bold text-[#03045E]">ROI Distribution 💰</h1>
            <p className="text-gray-600 mt-2">
              Calculate and distribute returns to investors for {event?.name}
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Event Summary */}
        <Card className="bg-gradient-to-r from-[#0077B6] to-[#0096C7] text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Event Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm opacity-90">Event Name</p>
                <p className="text-lg font-bold">{event?.name}</p>
              </div>
              <div>
                <p className="text-sm opacity-90">Total Investors</p>
                <p className="text-lg font-bold">{investments.length}</p>
              </div>
              <div>
                <p className="text-sm opacity-90">Total Investment</p>
                <p className="text-lg font-bold">{totalInvestment.toFixed(2)} SOL</p>
              </div>
              <div>
                <p className="text-sm opacity-90">Status</p>
                <Badge className="bg-white text-blue-600">{event?.status}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Revenue & Costs Input */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-blue-600" />
              Financial Summary
            </CardTitle>
            <CardDescription>Enter event financials to calculate ROI</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Total Revenue */}
              <div className="space-y-2">
                <Label htmlFor="revenue">Total Revenue (SOL)</Label>
                <Input
                  id="revenue"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 100"
                  value={totalRevenue}
                  onChange={(e) => setTotalRevenue(e.target.value)}
                  className="text-lg"
                />
                <p className="text-xs text-gray-500">Total income from ticket sales</p>
              </div>

              {/* Total Costs */}
              <div className="space-y-2">
                <Label htmlFor="costs">Total Costs (SOL)</Label>
                <Input
                  id="costs"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 30"
                  value={totalCosts}
                  onChange={(e) => setTotalCosts(e.target.value)}
                  className="text-lg"
                />
                <p className="text-xs text-gray-500">Total event expenses</p>
              </div>

              {/* Investor Share % */}
              <div className="space-y-2">
                <Label htmlFor="share">Investor Share (%)</Label>
                <Input
                  id="share"
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  placeholder="20"
                  value={investorSharePercentage}
                  onChange={(e) => setInvestorSharePercentage(e.target.value)}
                  className="text-lg"
                />
                <p className="text-xs text-gray-500">% of net profit for investors</p>
              </div>
            </div>

            {/* Calculate Button */}
            <div className="mt-6">
              <Button
                onClick={handleCalculate}
                disabled={calculating || !totalRevenue}
                className="w-full md:w-auto bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                <Calculator className="h-4 w-4 mr-2" />
                {calculating ? "Calculating..." : "Calculate ROI"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Calculation Results */}
        {calculated && (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="h-5 w-5" />
                  Calculation Results
                </CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCalculations(!showCalculations)}
                >
                  {showCalculations ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            {showCalculations && (
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white p-4 rounded-lg border border-green-200">
                    <p className="text-sm text-gray-600 mb-1">Net Profit</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {netProfit.toFixed(2)} SOL
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Revenue ({totalRevenue}) - Costs ({totalCosts})
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-green-200">
                    <p className="text-sm text-gray-600 mb-1">ROI Pool</p>
                    <p className="text-2xl font-bold text-green-600">
                      {roiPool.toFixed(2)} SOL
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {investorSharePercentage}% of net profit
                    </p>
                  </div>

                  <div className="bg-white p-4 rounded-lg border border-green-200">
                    <p className="text-sm text-gray-600 mb-1">Organizer Keeps</p>
                    <p className="text-2xl font-bold text-blue-600">
                      {(netProfit - roiPool).toFixed(2)} SOL
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {100 - parseFloat(investorSharePercentage)}% of net profit
                    </p>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {/* Investor List Table */}
        {calculated && investorROIs.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Investor ROI Distribution
              </CardTitle>
              <CardDescription>
                Individual returns for each investor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Investor</th>
                      <th className="text-right py-3 px-4">Investment</th>
                      <th className="text-right py-3 px-4">ROI Amount</th>
                      <th className="text-right py-3 px-4">ROI %</th>
                      <th className="text-right py-3 px-4">Total Return</th>
                    </tr>
                  </thead>
                  <tbody>
                    {investorROIs.map((investor, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-900">
                              {investor.investor?.display_name || "Investor"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {investor.investor_wallet.substring(0, 8)}...
                            </p>
                          </div>
                        </td>
                        <td className="text-right py-3 px-4 font-medium">
                          {investor.amount_sol.toFixed(2)} SOL
                        </td>
                        <td className="text-right py-3 px-4 font-bold text-green-600">
                          +{investor.roi_amount.toFixed(2)} SOL
                        </td>
                        <td className="text-right py-3 px-4">
                          <Badge className="bg-green-100 text-green-800">
                            +{investor.roi_percentage.toFixed(1)}%
                          </Badge>
                        </td>
                        <td className="text-right py-3 px-4 font-bold text-blue-600">
                          {investor.total_return.toFixed(2)} SOL
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 font-bold">
                      <td className="py-3 px-4">Total</td>
                      <td className="text-right py-3 px-4">
                        {totalInvestment.toFixed(2)} SOL
                      </td>
                      <td className="text-right py-3 px-4 text-green-600">
                        +{roiPool.toFixed(2)} SOL
                      </td>
                      <td className="text-right py-3 px-4">-</td>
                      <td className="text-right py-3 px-4 text-blue-600">
                        {(totalInvestment + roiPool).toFixed(2)} SOL
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowPreviewModal(true)}
                  className="flex-1"
                >
                  Preview Distribution
                </Button>
                <Button
                  onClick={() => setShowConfirmModal(true)}
                  disabled={distributing}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {distributing ? "Distributing..." : "Distribute ROI"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Preview Modal */}
        <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
          <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>ROI Distribution Preview</DialogTitle>
              <DialogDescription>
                Review the distribution before confirming
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Total ROI Pool</p>
                    <p className="font-bold text-lg">{roiPool.toFixed(2)} SOL</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Recipients</p>
                    <p className="font-bold text-lg">{investorROIs.length} investors</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Recipients</h3>
                <div className="space-y-2">
                  {investorROIs.slice(0, 5).map((inv, i) => (
                    <div key={i} className="flex justify-between text-sm bg-white p-2 rounded">
                      <span>{inv.investor?.display_name || inv.investor_wallet.substring(0, 12)}...</span>
                      <span className="font-bold text-green-600">+{inv.roi_amount.toFixed(2)} SOL</span>
                    </div>
                  ))}
                  {investorROIs.length > 5 && (
                    <p className="text-xs text-gray-500">
                      +{investorROIs.length - 5} more investors...
                    </p>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPreviewModal(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Confirmation Modal */}
        <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm ROI Distribution</DialogTitle>
              <DialogDescription>
                This action will distribute {roiPool.toFixed(2)} SOL to {investorROIs.length} investors
              </DialogDescription>
            </DialogHeader>
            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
              <p className="text-sm text-yellow-800">
                <strong>Warning:</strong> This action cannot be undone. Make sure all calculations are correct.
              </p>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowConfirmModal(false)}
                disabled={distributing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDistribute}
                disabled={distributing}
                className="bg-green-600 hover:bg-green-700"
              >
                {distributing ? "Processing..." : "Confirm Distribution"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Success Modal */}
        <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-6 w-6" />
                ROI Distributed Successfully!
              </DialogTitle>
            </DialogHeader>
            <div className="text-center py-6">
              <p className="text-gray-700">
                {roiPool.toFixed(2)} SOL has been distributed to {investorROIs.length} investors
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Redirecting to dashboard...
              </p>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}

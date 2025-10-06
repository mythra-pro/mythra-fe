"use client";

import { EventAnalytics } from "@/app/types/event";
import { Ticket, Coins, UserCheck, TrendingUp } from "lucide-react";

interface AnalyticsDashboardProps {
  analytics: EventAnalytics;
  eventName: string;
}

export default function AnalyticsDashboard({
  analytics,
  eventName,
}: AnalyticsDashboardProps) {
  const {
    totalRevenue,
    ticketsSold,
    maxTickets,
    checkInRate,
    checkedInCount,
    salesByDay,
    revenueByDay,
    checkInTrend,
  } = analytics;

  const organizerPayout = totalRevenue * 0.95;
  const platformFee = totalRevenue * 0.05;
  const ticketsSoldPercentage = (ticketsSold / maxTickets) * 100;

  // Find max values for chart scaling
  const maxSales = Math.max(...salesByDay.map((d) => d.count));
  const maxRevenue = Math.max(...revenueByDay.map((d) => d.amount));
  const maxCheckIn = Math.max(...checkInTrend.map((d) => d.count));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-green-500 rounded-2xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">{eventName}</h2>
        <p className="text-purple-100">Real-time Analytics Dashboard</p>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Tickets Sold */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Ticket className="text-2xl text-purple-600" />
            </div>
            <span className="text-xs font-medium text-gray-500">TICKETS</span>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold text-gray-900">
              {ticketsSold}
              <span className="text-lg text-gray-500">/{maxTickets}</span>
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${ticketsSoldPercentage}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">
              {ticketsSoldPercentage.toFixed(1)}% Sold
            </p>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <Coins className="text-2xl text-green-600" />
            </div>
            <span className="text-xs font-medium text-gray-500">REVENUE</span>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-gray-900">
              {totalRevenue.toFixed(2)}
              <span className="text-lg text-gray-500"> SOL</span>
            </p>
            <p className="text-sm text-green-600 font-medium">
              Your Payout: {organizerPayout.toFixed(2)} SOL
            </p>
            <p className="text-xs text-gray-500">
              Platform Fee: {platformFee.toFixed(2)} SOL (5%)
            </p>
          </div>
        </div>

        {/* Check-in Rate */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <UserCheck className="text-2xl text-blue-600" />
            </div>
            <span className="text-xs font-medium text-gray-500">CHECK-IN</span>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold text-gray-900">
              {checkInRate.toFixed(1)}%
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${checkInRate}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">
              {checkedInCount} / {ticketsSold} Checked In
            </p>
          </div>
        </div>

        {/* Average Price */}
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-orange-100 p-3 rounded-lg">
              <TrendingUp className="text-2xl text-orange-600" />
            </div>
            <span className="text-xs font-medium text-gray-500">AVG PRICE</span>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-bold text-gray-900">
              {ticketsSold > 0
                ? (totalRevenue / ticketsSold).toFixed(2)
                : "0.00"}
              <span className="text-lg text-gray-500"> SOL</span>
            </p>
            <p className="text-sm text-gray-600">Per Ticket</p>
            <p className="text-xs text-gray-500">
              Total: {totalRevenue.toFixed(2)} SOL
            </p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales By Day Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">
            Ticket Sales Trend
          </h3>
          <div className="space-y-3">
            {salesByDay.map((day, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{day.date}</span>
                  <span className="font-medium text-gray-900">
                    {day.count} tickets
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(day.count / maxSales) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue By Day Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6">
            Revenue Trend
          </h3>
          <div className="space-y-3">
            {revenueByDay.map((day, index) => (
              <div key={index} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">{day.date}</span>
                  <span className="font-medium text-gray-900">
                    {day.amount.toFixed(2)} SOL
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-400 to-cyan-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(day.amount / maxRevenue) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Check-in Trend */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">
          Check-in Activity by Hour
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {checkInTrend.map((hour, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 text-center"
            >
              <p className="text-2xl font-bold text-gray-900">{hour.count}</p>
              <p className="text-sm text-gray-600 mt-1">{hour.hour}</p>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-1 rounded-full"
                  style={{ width: `${(hour.count / maxCheckIn) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Insights Section */}
      <div className="bg-gradient-to-r from-purple-50 to-green-50 rounded-xl p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          📊 Quick Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="bg-white rounded-lg p-4">
            <p className="text-gray-600 mb-1">Sales Performance</p>
            <p className="font-bold text-gray-900">
              {ticketsSoldPercentage > 75
                ? "🔥 Strong sales! Event is almost sold out"
                : ticketsSoldPercentage > 50
                ? "✨ Good progress, keep promoting"
                : "📢 Boost marketing to increase sales"}
            </p>
          </div>
          <div className="bg-white rounded-lg p-4">
            <p className="text-gray-600 mb-1">Check-in Status</p>
            <p className="font-bold text-gray-900">
              {checkInRate > 70
                ? "✅ Excellent attendance rate!"
                : checkInRate > 40
                ? "👥 Moderate attendance"
                : "⚠️ Low check-in rate, follow up with attendees"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

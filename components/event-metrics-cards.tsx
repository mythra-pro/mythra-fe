"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TicketIcon, TrendingUp, UserCheck, DollarSign } from "lucide-react";
import { EventAnalytics } from "@/app/types/event";

interface EventMetricsCardsProps {
  analytics: EventAnalytics;
  priceInSOL: number;
}

export function EventMetricsCards({
  analytics,
  priceInSOL,
}: EventMetricsCardsProps) {
  const { totalRevenue, ticketsSold, maxTickets, checkInRate, checkedInCount } =
    analytics;

  const organizerPayout = totalRevenue * 0.95;
  const ticketsSoldPercentage = (ticketsSold / maxTickets) * 100;

  const cards = [
    {
      title: "Tickets Sold",
      value: ticketsSold,
      subtitle: `of ${maxTickets} (${ticketsSoldPercentage.toFixed(1)}%)`,
      icon: TicketIcon,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      title: "Total Revenue",
      value: `${totalRevenue.toFixed(2)} SOL`,
      subtitle: `Your payout: ${organizerPayout.toFixed(2)} SOL`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Check-in Rate",
      value: `${checkInRate.toFixed(1)}%`,
      subtitle: `${checkedInCount} of ${ticketsSold} checked in`,
      icon: UserCheck,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Avg. Price",
      value: `${priceInSOL.toFixed(2)} SOL`,
      subtitle: `Per ticket`,
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {card.title}
              </CardTitle>
              <div className={`${card.bgColor} p-2 rounded-lg`}>
                <Icon className={`h-4 w-4 ${card.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {card.subtitle}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

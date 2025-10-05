"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import { EventAnalytics } from "@/app/types/event";

interface EventChartsProps {
  analytics: EventAnalytics;
}

export function EventCharts({ analytics }: EventChartsProps) {
  const { salesByDay, revenueByDay, checkInTrend } = analytics;

  const salesChartConfig = {
    count: {
      label: "Tickets Sold",
      color: "hsl(var(--chart-1))",
    },
  };

  const revenueChartConfig = {
    amount: {
      label: "Revenue (SOL)",
      color: "hsl(var(--chart-2))",
    },
  };

  const checkInChartConfig = {
    count: {
      label: "Check-ins",
      color: "hsl(var(--chart-3))",
    },
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Sales Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Ticket Sales Trend</CardTitle>
          <CardDescription>Daily ticket sales over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={salesChartConfig} className="h-[300px]">
            <AreaChart data={salesByDay}>
              <defs>
                <linearGradient id="fillCount" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-count)"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-count)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="count"
                stroke="var(--color-count)"
                fillOpacity={1}
                fill="url(#fillCount)"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Revenue Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
          <CardDescription>Daily revenue in SOL</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={revenueChartConfig} className="h-[300px]">
            <BarChart data={revenueByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  });
                }}
              />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="amount"
                fill="var(--color-amount)"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Check-in Activity */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Check-in Activity by Hour</CardTitle>
          <CardDescription>
            Attendee check-in distribution throughout the day
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={checkInChartConfig} className="h-[250px]">
            <BarChart data={checkInTrend}>
              <defs>
                <linearGradient id="colorCheckIn" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--chart-3))"
                    stopOpacity={0.8}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--chart-3))"
                    stopOpacity={0.2}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="hour"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="count"
                fill="url(#colorCheckIn)"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}

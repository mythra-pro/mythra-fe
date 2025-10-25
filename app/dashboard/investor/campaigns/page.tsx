"use client";

import { DashboardLayout } from "@/components/dashboard-layout";
import { getMenuSectionsForRole } from "@/app/utils/dashboardMenus";
import { CampaignCard } from "@/components/campaign-card";
import { useDashboardUser } from "@/hooks/useDashboardUser";
import { dummyUsers, dummyCampaigns } from "@/lib/dummy-data";
import { Target, Search, Filter, TrendingUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

// Force dynamic rendering - required for wallet-connected pages
export const dynamic = "force-dynamic";

export default function InvestorCampaignsPage() {
  const user = useDashboardUser("investor");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const filteredCampaigns = dummyCampaigns
    .filter((campaign) => {
      const matchesSearch =
        campaign.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campaign.eventName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || campaign.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.endDate).getTime() - new Date(a.endDate).getTime();
      } else if (sortBy === "funding") {
        return b.currentAmount - a.currentAmount;
      } else if (sortBy === "deadline") {
        return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
      }
      return 0;
    });

  // Get menu sections for investor role

  const menuSections = getMenuSectionsForRole("investor");

  return (
    <DashboardLayout user={user} menuSections={menuSections}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-[#03045E]">
            Investment Campaigns 🎯
          </h1>
          <p className="text-gray-600 mt-2">
            Discover and support promising event campaigns to earn rewards.
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="p-6 bg-white border border-gray-200 shadow-sm">
          <div className="grid gap-4 md:grid-cols-12">
            {/* Search */}
            <div className="md:col-span-5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search campaigns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-gray-200"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="md:col-span-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="border-gray-200">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="funded">Funded</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort */}
            <div className="md:col-span-3">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="border-gray-200">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="funding">Most Funded</SelectItem>
                  <SelectItem value="deadline">Deadline</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Apply Button */}
            <div className="md:col-span-1">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-lg text-gray-900 font-semibold">
            {filteredCampaigns.length}{" "}
            {filteredCampaigns.length === 1 ? "campaign" : "campaigns"} found
          </p>
        </div>

        {/* Campaign Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
          {filteredCampaigns.map((campaign, idx) => (
            <CampaignCard
              key={campaign.id}
              campaign={campaign}
              delay={idx * 0.1}
            />
          ))}
        </div>

        {/* No Results */}
        {filteredCampaigns.length === 0 && (
          <div className="text-center py-20">
            <Target className="h-20 w-20 mx-auto text-gray-400 mb-4" />
            <h3 className="text-2xl font-bold text-gray-700 mb-2">
              No campaigns found
            </h3>
            <p className="text-gray-500 mb-6">
              Try adjusting your search or filters
            </p>
            <Button
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setSortBy("newest");
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Investment Tips */}
        <Card className="bg-gradient-to-r from-[#0077B6] to-[#0096C7] text-white">
          <CardHeader>
            <CardTitle className="text-white">💡 Investment Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <h4 className="font-semibold mb-2">Diversify Your Portfolio</h4>
                <p className="text-sm opacity-90">
                  Invest in different event categories and organizers to
                  minimize risk.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Research Organizers</h4>
                <p className="text-sm opacity-90">
                  Check past event success rates and organizer reputation before
                  investing.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Monitor Progress</h4>
                <p className="text-sm opacity-90">
                  Keep track of campaign milestones and event development
                  updates.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

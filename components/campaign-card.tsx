"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { Target, Users, TrendingUp, Calendar, Award } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Campaign } from "@/app/types/campaign";
import { cn } from "@/lib/utils";

interface CampaignCardProps {
  campaign: Campaign;
  delay?: number;
}

const statusColors = {
  draft: "bg-gray-500",
  active: "bg-green-500",
  funded: "bg-blue-500",
  completed: "bg-purple-500",
  cancelled: "bg-red-500",
};

export function CampaignCard({ campaign, delay = 0 }: CampaignCardProps) {
  const fundedPercentage =
    (campaign.currentAmount / campaign.targetAmount) * 100;
  const daysLeft = Math.ceil(
    (new Date(campaign.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -5 }}
    >
      <Card className="overflow-hidden bg-white shadow-lg hover:shadow-xl transition-all border-[#48CAE4]">
        <CardHeader className="p-0">
          <div className="relative h-48 w-full overflow-hidden">
            <Image
              src={campaign.coverImage}
              alt={campaign.title}
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

            <div className="absolute top-3 right-3 flex gap-2">
              <Badge
                className={cn(
                  "text-white border-0",
                  statusColors[campaign.status]
                )}
              >
                {campaign.status}
              </Badge>
            </div>

            <div className="absolute bottom-3 left-3 right-3">
              <h3 className="text-xl font-bold text-white mb-1 line-clamp-2">
                {campaign.title}
              </h3>
              <p className="text-sm text-white/90">
                by {campaign.organizerName}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {campaign.description}
          </p>

          {/* Funding Progress */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span className="font-semibold text-[#03045E]">
                ${campaign.currentAmount.toLocaleString()}
              </span>
              <span className="text-gray-500">
                of ${campaign.targetAmount.toLocaleString()}
              </span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#0077B6] via-[#0096C7] to-[#48CAE4]"
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(fundedPercentage, 100)}%` }}
                transition={{ duration: 1, delay: delay + 0.2 }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>{fundedPercentage.toFixed(1)}% funded</span>
              <span>{daysLeft > 0 ? `${daysLeft} days left` : "Ended"}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="text-center p-2 bg-gradient-to-br from-[#CAF0F8] to-[#90E0EF] rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <Users className="h-4 w-4 text-[#0077B6]" />
              </div>
              <p className="text-lg font-bold text-[#03045E]">
                {campaign.investors}
              </p>
              <p className="text-xs text-gray-600">Investors</p>
            </div>

            <div className="text-center p-2 bg-gradient-to-br from-[#CAF0F8] to-[#90E0EF] rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <TrendingUp className="h-4 w-4 text-[#0077B6]" />
              </div>
              <p className="text-lg font-bold text-[#03045E]">
                ${campaign.minInvestment}
              </p>
              <p className="text-xs text-gray-600">Min. Invest</p>
            </div>

            <div className="text-center p-2 bg-gradient-to-br from-[#CAF0F8] to-[#90E0EF] rounded-lg">
              <div className="flex items-center justify-center mb-1">
                <Award className="h-4 w-4 text-[#0077B6]" />
              </div>
              <p className="text-lg font-bold text-[#03045E]">
                {campaign.rewards.length}
              </p>
              <p className="text-xs text-gray-600">Rewards</p>
            </div>
          </div>

          {/* Voting Status */}
          {campaign.votes >= campaign.votingThreshold && (
            <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded-lg">
              <Target className="h-4 w-4 text-green-600" />
              <span className="text-sm text-green-700 font-medium">
                Voting threshold reached! ({campaign.votes} votes)
              </span>
            </div>
          )}
        </CardContent>

        <CardFooter className="p-4 pt-0 flex gap-2">
          <Link href={`/campaigns/${campaign.id}`} className="flex-1">
            <Button className="w-full bg-[#0077B6] hover:bg-[#0096C7] text-white">
              View Campaign
            </Button>
          </Link>
          <Button
            variant="outline"
            className="border-[#0077B6] text-[#0077B6] hover:bg-[#0077B6] hover:text-white"
          >
            <Target className="h-4 w-4" />
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

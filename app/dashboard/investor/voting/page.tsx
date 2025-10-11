"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { RoleSidebar } from "@/components/role-sidebar";
import { dummyUsers } from "@/lib/dummy-data";
import {
  Vote,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  TrendingUp,
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
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

// Mock voting proposals data
const mockProposals = [
  {
    id: "1",
    title: "Reduce Platform Fee to 2.5%",
    description:
      "Proposal to reduce the platform fee from 5% to 2.5% to make events more affordable for organizers and increase platform competitiveness.",
    type: "platform",
    status: "active",
    votesFor: 2847,
    votesAgainst: 1203,
    totalVotes: 4050,
    totalTokens: 10000,
    deadline: "2025-01-15",
    proposer: "DAO Member #1247",
    created: "2024-12-20",
  },
  {
    id: "2",
    title: "Add New Event Category: Gaming",
    description:
      "Add gaming events as a new category to attract esports tournaments and gaming conventions to the platform.",
    type: "feature",
    status: "active",
    votesFor: 3421,
    votesAgainst: 892,
    totalVotes: 4313,
    totalTokens: 10000,
    deadline: "2025-01-20",
    proposer: "DAO Member #0834",
    created: "2024-12-18",
  },
  {
    id: "3",
    title: "Implement Staking Rewards Program",
    description:
      "Create a staking program where token holders can stake their DAO tokens to earn additional rewards from platform fees.",
    type: "tokenomics",
    status: "passed",
    votesFor: 6234,
    votesAgainst: 1456,
    totalVotes: 7690,
    totalTokens: 10000,
    deadline: "2024-12-15",
    proposer: "DAO Member #2341",
    created: "2024-11-28",
  },
  {
    id: "4",
    title: "Partnership with MetaMask",
    description:
      "Establish strategic partnership with MetaMask to improve wallet connectivity and user onboarding experience.",
    type: "partnership",
    status: "rejected",
    votesFor: 2134,
    votesAgainst: 4567,
    totalVotes: 6701,
    totalTokens: 10000,
    deadline: "2024-12-10",
    proposer: "DAO Member #1923",
    created: "2024-11-15",
  },
];

export default function InvestorVotingPage() {
  const user = dummyUsers.find((u) => u.role === "investor")!;
  const [votedProposals, setVotedProposals] = useState<Set<string>>(new Set());

  const activeProposals = mockProposals.filter((p) => p.status === "active");
  const userDaoTokens = 1250; // Mock user's DAO tokens

  const handleVote = (proposalId: string, voteType: "for" | "against") => {
    setVotedProposals((prev) => new Set([...prev, proposalId]));
    // In a real app, you would make an API call here
    alert(
      `Voted ${voteType} on proposal ${proposalId} with ${userDaoTokens} tokens`
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-blue-500";
      case "passed":
        return "bg-green-500";
      case "rejected":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "platform":
        return "bg-purple-500";
      case "feature":
        return "bg-blue-500";
      case "tokenomics":
        return "bg-yellow-500";
      case "partnership":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <DashboardLayout user={user} sidebar={<RoleSidebar role="investor" />}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-[#03045E]">
            DAO Governance 🗳️
          </h1>
          <p className="text-gray-600 mt-2">
            Participate in platform governance and shape the future of Mythra.
          </p>
        </div>

        {/* Voting Power Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-gradient-to-r from-[#0077B6] to-[#0096C7] text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Your DAO Tokens</p>
                  <p className="text-3xl font-bold">
                    {userDaoTokens.toLocaleString()}
                  </p>
                </div>
                <Vote className="h-10 w-10 opacity-75" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-[#48CAE4] to-[#90E0EF] text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Voting Power</p>
                  <p className="text-3xl font-bold">12.5%</p>
                </div>
                <TrendingUp className="h-10 w-10 opacity-75" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Proposals Voted</p>
                  <p className="text-3xl font-bold">{votedProposals.size}</p>
                </div>
                <CheckCircle className="h-10 w-10 opacity-75" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Active Proposals</p>
                  <p className="text-3xl font-bold">{activeProposals.length}</p>
                </div>
                <Clock className="h-10 w-10 opacity-75" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Proposals */}
        <Card className="bg-white/90 border-[#48CAE4] shadow-xl">
          <CardHeader>
            <CardTitle className="text-[#03045E] flex items-center gap-2">
              <Vote className="h-5 w-5" />
              Active Proposals
            </CardTitle>
            <CardDescription>
              Vote on these proposals before they expire
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeProposals.map((proposal, idx) => (
                <motion.div
                  key={proposal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Card className="bg-gradient-to-r from-white to-[#CAF0F8] border-[#48CAE4]">
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                        <div className="flex-1 space-y-4">
                          {/* Header */}
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <h3 className="text-xl font-bold text-[#03045E]">
                                  {proposal.title}
                                </h3>
                                <Badge
                                  className={`${getTypeColor(
                                    proposal.type
                                  )} text-white`}
                                >
                                  {proposal.type}
                                </Badge>
                                <Badge
                                  className={`${getStatusColor(
                                    proposal.status
                                  )} text-white`}
                                >
                                  {proposal.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600">
                                Proposed by {proposal.proposer} •{" "}
                                {new Date(
                                  proposal.created
                                ).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-600">
                                Expires:{" "}
                                {new Date(
                                  proposal.deadline
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          {/* Description */}
                          <p className="text-gray-700 leading-relaxed">
                            {proposal.description}
                          </p>

                          {/* Voting Progress */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">
                                Voting Progress
                              </span>
                              <span className="font-semibold text-[#03045E]">
                                {proposal.totalVotes.toLocaleString()} /{" "}
                                {proposal.totalTokens.toLocaleString()} tokens
                              </span>
                            </div>

                            <div className="space-y-2">
                              {/* For Votes */}
                              <div className="flex items-center gap-3">
                                <CheckCircle className="h-4 w-4 text-green-500" />
                                <div className="flex-1">
                                  <div className="flex justify-between text-sm mb-1">
                                    <span>For</span>
                                    <span className="font-semibold">
                                      {proposal.votesFor.toLocaleString()}{" "}
                                      tokens
                                    </span>
                                  </div>
                                  <Progress
                                    value={
                                      (proposal.votesFor /
                                        proposal.totalTokens) *
                                      100
                                    }
                                    className="h-2 bg-gray-200"
                                  />
                                </div>
                              </div>

                              {/* Against Votes */}
                              <div className="flex items-center gap-3">
                                <XCircle className="h-4 w-4 text-red-500" />
                                <div className="flex-1">
                                  <div className="flex justify-between text-sm mb-1">
                                    <span>Against</span>
                                    <span className="font-semibold">
                                      {proposal.votesAgainst.toLocaleString()}{" "}
                                      tokens
                                    </span>
                                  </div>
                                  <Progress
                                    value={
                                      (proposal.votesAgainst /
                                        proposal.totalTokens) *
                                      100
                                    }
                                    className="h-2 bg-gray-200"
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Voting Actions */}
                        <div className="flex flex-col gap-3 lg:w-40">
                          {!votedProposals.has(proposal.id) ? (
                            <>
                              <Button
                                onClick={() => handleVote(proposal.id, "for")}
                                className="w-full bg-green-500 hover:bg-green-600 text-white"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Vote For
                              </Button>
                              <Button
                                onClick={() =>
                                  handleVote(proposal.id, "against")
                                }
                                variant="outline"
                                className="w-full border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Vote Against
                              </Button>
                            </>
                          ) : (
                            <div className="p-3 bg-green-100 rounded-lg text-center">
                              <CheckCircle className="h-6 w-6 mx-auto text-green-500 mb-2" />
                              <p className="text-sm font-semibold text-green-700">
                                Vote Submitted
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Proposals History */}
        <Card className="bg-white/80 border-[#48CAE4]">
          <CardHeader>
            <CardTitle className="text-[#03045E]">Recent Proposals</CardTitle>
            <CardDescription>Past voting history and results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockProposals
                .filter((p) => p.status !== "active")
                .map((proposal, idx) => (
                  <motion.div
                    key={proposal.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <Card className="bg-gradient-to-r from-[#F8F9FA] to-white border-gray-200">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-[#03045E]">
                                {proposal.title}
                              </h4>
                              <Badge
                                className={`${getStatusColor(
                                  proposal.status
                                )} text-white text-xs`}
                              >
                                {proposal.status}
                              </Badge>
                              <Badge
                                className={`${getTypeColor(
                                  proposal.type
                                )} text-white text-xs`}
                              >
                                {proposal.type}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span>
                                {proposal.status === "passed" ? "✅" : "❌"}
                                {proposal.votesFor.toLocaleString()} for,{" "}
                                {proposal.votesAgainst.toLocaleString()} against
                              </span>
                              <span>
                                Closed:{" "}
                                {new Date(
                                  proposal.deadline
                                ).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Governance Info */}
        <Card className="bg-gradient-to-r from-[#0077B6] to-[#0096C7] text-white">
          <CardHeader>
            <CardTitle className="text-white">
              📋 How DAO Governance Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Proposal Creation
                </h4>
                <p className="text-sm opacity-90">
                  Any DAO token holder with 500+ tokens can create proposals for
                  platform improvements.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Vote className="h-4 w-4" />
                  Voting Process
                </h4>
                <p className="text-sm opacity-90">
                  Vote with your DAO tokens. More tokens = more voting power.
                  Proposals need 50%+ to pass.
                </p>
              </div>
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Implementation
                </h4>
                <p className="text-sm opacity-90">
                  Passed proposals are automatically implemented or queued for
                  development by the core team.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

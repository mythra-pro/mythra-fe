"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useDashboardUser } from "@/hooks/useDashboardUser";
import { DashboardLayout } from "@/components/dashboard-layout";
import { getMenuSectionsForRole } from "@/app/utils/dashboardMenus";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ArrowLeft,
  TrendingUp,
  Users,
  CheckCircle,
  Download,
  Trophy,
  Vote,
  AlertCircle,
} from "lucide-react";

// Force dynamic rendering
export const dynamic = "force-dynamic";

type OptionResult = {
  id: string;
  option_text: string;
  vote_count: number;
  percentage: number;
};

type QuestionResult = {
  questionId: string;
  question: string;
  options: OptionResult[];
  total_votes: number;
};

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function DAOResultsPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.eventId as string;
  const { user, isLoading: userLoading } = useDashboardUser("organizer");
  
  if (userLoading || !user) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  const menuSections = getMenuSectionsForRole("organizer");

  const [results, setResults] = useState<QuestionResult[]>([]);
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (eventId) {
      fetchResults();
      fetchEventDetails();
    }
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      const res = await fetch(`/api/events/${eventId}`);
      const data = await res.json();
      if (data.event) {
        setEvent(data.event);
      }
    } catch (e) {
      console.error("Failed to fetch event:", e);
    }
  };

  const fetchResults = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch(`/api/dao/results?eventId=${eventId}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch results");
      }

      setResults(data.results || []);
    } catch (e: any) {
      console.error("Error fetching DAO results:", e);
      setError(e.message || "Failed to load results");
    } finally {
      setLoading(false);
    }
  };

  const exportResults = () => {
    const csvContent = generateCSV();
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `dao-results-${eventId}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateCSV = () => {
    let csv = "Question,Option,Votes,Percentage\n";
    results.forEach((result) => {
      result.options.forEach((option) => {
        csv += `"${result.question}","${option.option_text}",${option.vote_count},${option.percentage}%\n`;
      });
    });
    return csv;
  };

  const getWinner = (options: OptionResult[]) => {
    if (options.length === 0) return null;
    return options.reduce((prev, current) =>
      current.vote_count > prev.vote_count ? current : prev
    );
  };

  if (loading) {
    return (
      <DashboardLayout user={user} menuSections={menuSections}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading DAO results...</p>
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
              onClick={() => router.back()}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <h1 className="text-4xl font-bold text-gray-900">DAO Voting Results</h1>
            <p className="text-gray-600 mt-2">
              {event?.name || "Event"} - Investor voting outcomes
            </p>
          </div>
          <Button
            onClick={exportResults}
            className="bg-green-600 hover:bg-green-700"
            disabled={results.length === 0}
          >
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Empty State */}
        {!error && results.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Vote className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No voting results yet
              </h3>
              <p className="text-gray-500">
                Investors haven't started voting on DAO questions yet.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Results Grid */}
        {results.length > 0 && (
          <div className="space-y-8">
            {/* Summary Stats */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Questions</p>
                      <p className="text-3xl font-bold text-blue-600">{results.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Vote className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Votes Cast</p>
                      <p className="text-3xl font-bold text-green-600">
                        {results.reduce((sum, r) => sum + r.total_votes, 0)}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Avg Votes/Question</p>
                      <p className="text-3xl font-bold text-purple-600">
                        {results.length > 0
                          ? Math.round(
                              results.reduce((sum, r) => sum + r.total_votes, 0) /
                                results.length
                            )
                          : 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Question Results */}
            {results.map((result, index) => {
              const winner = getWinner(result.options);
              const barData = result.options.map((opt) => ({
                name: opt.option_text,
                votes: opt.vote_count,
                percentage: opt.percentage,
              }));

              const pieData = result.options.map((opt) => ({
                name: opt.option_text,
                value: opt.vote_count,
              }));

              return (
                <Card key={result.questionId} className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className="bg-blue-600">Question {index + 1}</Badge>
                          {result.total_votes > 0 && (
                            <Badge variant="outline" className="border-green-600 text-green-600">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              {result.total_votes} votes
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-xl">{result.question}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6 space-y-6">
                    {/* Winner Badge */}
                    {winner && result.total_votes > 0 && (
                      <Alert className="border-yellow-500 bg-yellow-50">
                        <Trophy className="h-4 w-4 text-yellow-600" />
                        <AlertDescription className="text-yellow-900">
                          <strong>Winner:</strong> {winner.option_text} with{" "}
                          {winner.vote_count} votes ({winner.percentage}%)
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* No Votes Yet */}
                    {result.total_votes === 0 && (
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          No votes have been cast for this question yet.
                        </AlertDescription>
                      </Alert>
                    )}

                    {result.total_votes > 0 && (
                      <>
                        {/* Charts */}
                        <div className="grid md:grid-cols-2 gap-6">
                          {/* Bar Chart */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-4">
                              Votes Distribution
                            </h4>
                            <ResponsiveContainer width="100%" height={300}>
                              <BarChart data={barData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="votes" fill="#3b82f6" />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>

                          {/* Pie Chart */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-700 mb-4">
                              Percentage Breakdown
                            </h4>
                            <ResponsiveContainer width="100%" height={300}>
                              <PieChart>
                                <Pie
                                  data={pieData}
                                  cx="50%"
                                  cy="50%"
                                  labelLine={false}
                                  label={({ name, percent }) =>
                                    `${name}: ${(percent * 100).toFixed(0)}%`
                                  }
                                  outerRadius={80}
                                  fill="#8884d8"
                                  dataKey="value"
                                >
                                  {pieData.map((entry, index) => (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill={COLORS[index % COLORS.length]}
                                    />
                                  ))}
                                </Pie>
                                <Tooltip />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* Options Table */}
                        <div className="border rounded-lg overflow-hidden">
                          <table className="w-full">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                  Option
                                </th>
                                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                                  Votes
                                </th>
                                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                                  Percentage
                                </th>
                                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">
                                  Winner
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {result.options.map((option) => (
                                <tr key={option.id} className="hover:bg-gray-50">
                                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                                    {option.option_text}
                                  </td>
                                  <td className="px-4 py-3 text-sm text-center text-gray-700">
                                    {option.vote_count}
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <Badge variant="outline">
                                      {option.percentage.toFixed(1)}%
                                    </Badge>
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    {winner?.id === option.id && (
                                      <Trophy className="h-4 w-4 text-yellow-600 inline" />
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

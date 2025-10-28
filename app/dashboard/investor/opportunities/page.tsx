"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useDashboardUser } from "@/hooks/useDashboardUser";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Calendar, 
  MapPin, 
  TrendingUp, 
  Users, 
  Target,
  Search,
  Filter,
  Clock,
  DollarSign,
  CheckCircle2,
  Eye
} from "lucide-react";

type Event = {
  id: string;
  name: string;
  slug: string;
  description: string;
  venue: string;
  start_time: string;
  end_time: string;
  category: string;
  status: string;
  banner_url?: string;
  max_tickets: number;
};

type DAOQuestion = {
  id: string;
  question: string;
  options: { id: string; option_text: string }[];
};

type Investment = {
  id: string;
  amount_sol: number;
  investor_id: string;
};

type EventWithDetails = Event & {
  dao_questions?: DAOQuestion[];
  investments?: Investment[];
  total_invested?: number;
  investor_count?: number;
};

export default function InvestorOpportunitiesPage() {
  const router = useRouter();
  const { user, isLoading: userLoading } = useDashboardUser("investor");
  
  // IMPORTANT: All hooks must be called BEFORE any conditional returns (Rules of Hooks)
  const [events, setEvents] = useState<EventWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState("all");

  useEffect(() => {
    if (userLoading || !user?.id) return;
    fetchOpportunities();
  }, [userLoading, user?.id]);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);

      // Fetch investment_window, dao_process, approved, and dao_voting events
      const eventsRes = await fetch(`/api/events?status=investment_window,dao_process,approved,dao_voting`);
      const eventsData = await eventsRes.json();
      
      if (eventsData.events && eventsData.events.length > 0) {
        // Fetch additional details for each event
        const eventsWithDetails = await Promise.all(
          eventsData.events.map(async (event: Event) => {
            // Fetch DAO questions
            const questionsRes = await fetch(`/api/dao/questions?eventId=${event.id}`);
            const questionsData = await questionsRes.json();

            // Fetch investments
            const investmentsRes = await fetch(`/api/investments?eventId=${event.id}`);
            const investmentsData = await investmentsRes.json();

            const investments = investmentsData.investments || [];
            const total_invested = investments.reduce((sum: number, inv: Investment) => 
              sum + parseFloat(inv.amount_sol.toString()), 0
            );
            const investor_count = new Set(investments.map((inv: Investment) => inv.investor_id)).size;

            return {
              ...event,
              dao_questions: questionsData.questions || [],
              investments,
              total_invested,
              investor_count,
            };
          })
        );

        setEvents(eventsWithDetails);
      } else {
        setEvents([]);
      }
    } catch (error) {
      console.error("Error fetching opportunities:", error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // Loading state - render AFTER all hooks
  if (userLoading || !user) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  const filteredEvents = events.filter((event) => {
    // Search filter
    const matchesSearch = 
      event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.venue?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Tab filter
    if (filterTab === "upcoming") {
      return new Date(event.start_time) > new Date();
    } else if (filterTab === "funding") {
      return (event.total_invested || 0) < 100; // Simple threshold
    } else if (filterTab === "popular") {
      return (event.investor_count || 0) > 0;
    }

    return true; // "all" tab
  });

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading investment opportunities...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto py-8 max-w-7xl px-4">
      {/* Hero Header */}
      <div className="mb-8 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-2xl">
        <div className="flex items-center gap-4 mb-3">
          <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
            <span className="text-4xl">💰</span>
          </div>
          <div>
            <h1 className="text-5xl font-bold tracking-tight">Investment Opportunities</h1>
            <p className="text-purple-100 text-lg mt-2">
              🚀 Discover and invest in exciting events. Vote on key decisions and earn ROI!
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl hover:shadow-2xl transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-100">Total Events</p>
                <p className="text-4xl font-bold mt-2">{events.length}</p>
              </div>
              <div className="h-14 w-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Target className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl hover:shadow-2xl transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-100">Upcoming</p>
                <p className="text-4xl font-bold mt-2">
                  {events.filter(e => new Date(e.start_time) > new Date()).length}
                </p>
              </div>
              <div className="h-14 w-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Clock className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-xl hover:shadow-2xl transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-100">Active Investors</p>
                <p className="text-4xl font-bold mt-2">
                  {events.reduce((sum, e) => sum + (e.investor_count || 0), 0)}
                </p>
              </div>
              <div className="h-14 w-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Users className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0 shadow-xl hover:shadow-2xl transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-100">Total Invested</p>
                <p className="text-4xl font-bold mt-2">
                  {events.reduce((sum, e) => sum + (e.total_invested || 0), 0).toFixed(1)} <span className="text-2xl">SOL</span>
                </p>
              </div>
              <div className="h-14 w-14 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <DollarSign className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="mb-8 border-2 border-purple-200 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardContent className="pt-6 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-400" />
              <Input
                placeholder="🔍 Search events by name, description, or venue..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-base border-2 border-purple-200 focus:border-purple-400 rounded-xl"
              />
            </div>
            <Button variant="outline" className="gap-2 h-12 px-6 border-2 border-purple-200 hover:bg-purple-50">
              <Filter className="h-5 w-5" />
              Filters
            </Button>
          </div>

          <Tabs value={filterTab} onValueChange={setFilterTab} className="w-full">
            <TabsList className="grid w-full max-w-3xl grid-cols-4 h-12 bg-purple-100">
              <TabsTrigger value="all" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white font-semibold">📋 All Events</TabsTrigger>
              <TabsTrigger value="upcoming" className="data-[state=active]:bg-green-600 data-[state=active]:text-white font-semibold">📅 Upcoming</TabsTrigger>
              <TabsTrigger value="funding" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white font-semibold">💰 Need Funding</TabsTrigger>
              <TabsTrigger value="popular" className="data-[state=active]:bg-pink-600 data-[state=active]:text-white font-semibold">🔥 Popular</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      {/* Event Cards */}
      {filteredEvents.length === 0 ? (
        <Card className="border-2 border-dashed border-purple-300 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="py-20 text-center">
            <div className="text-8xl mb-6">🎯</div>
            <h3 className="text-2xl font-bold mb-3 text-gray-800">No Investment Opportunities</h3>
            <p className="text-gray-600 text-lg">
              {searchQuery 
                ? "No events match your search criteria. Try different keywords!" 
                : "Check back soon for new investment opportunities!"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="border-2 border-purple-100 hover:border-purple-300 hover:shadow-2xl transition-all bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between mb-3 gap-2">
                  <Badge 
                    className={
                      event.status === "investment_window" || event.status === "approved" 
                        ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 px-3 py-1 shadow-md" 
                        : "bg-gradient-to-r from-purple-500 to-blue-500 text-white border-0 px-3 py-1 shadow-md"
                    }
                  >
                    {(event.status === "investment_window" || event.status === "approved") 
                      ? "💰 Open for Investment" 
                      : event.status === "dao_process" || event.status === "dao_voting"
                      ? "🗳️ DAO Voting"
                      : "Closed"}
                  </Badge>
                  <Badge className="capitalize bg-gradient-to-r from-orange-400 to-pink-400 text-white border-0 shadow-md">
                    {event.category}
                  </Badge>
                </div>
                <CardTitle className="line-clamp-2 text-2xl font-bold text-gray-800">{event.name}</CardTitle>
                <CardDescription className="line-clamp-2 text-base text-gray-600 mt-2">
                  {event.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Event Details */}
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-lg">
                    <div className="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-white" />
                    </div>
                    <span className="font-medium text-gray-700">{new Date(event.start_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-3 bg-purple-50 p-3 rounded-lg">
                    <div className="h-8 w-8 bg-purple-500 rounded-lg flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-white" />
                    </div>
                    <span className="line-clamp-1 font-medium text-gray-700">{event.venue}</span>
                  </div>
                </div>

                {/* Investment Stats */}
                <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-600">Total Invested</span>
                    <span className="font-bold text-lg text-orange-600">{(event.total_invested || 0).toFixed(2)} SOL</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-gray-600">Investors</span>
                    <span className="font-bold text-lg text-purple-600">{event.investor_count || 0} 👥</span>
                  </div>
                </div>

                {/* DAO Questions Preview */}
                {event.dao_questions && event.dao_questions.length > 0 && (
                  <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold text-indigo-700 flex items-center gap-2">
                        <span>🗳️</span> DAO Questions
                      </span>
                      <Badge className="bg-indigo-500 text-white border-0">
                        {event.dao_questions.length}
                      </Badge>
                    </div>
                    <div className="text-sm">
                      <p className="line-clamp-2 font-medium text-gray-700">
                        {event.dao_questions[0].question}
                      </p>
                      {event.dao_questions.length > 1 && (
                        <p className="text-xs mt-2 text-indigo-600 font-semibold">
                          +{event.dao_questions.length - 1} more questions to vote on
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>

              <CardFooter className="gap-3 pt-4 border-t bg-gray-50">
                <Button 
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white h-11 font-semibold shadow-lg hover:shadow-xl transition-all" 
                  onClick={() => router.push(`/dashboard/investor/invest/${event.id}`)}
                >
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Invest Now
                </Button>
                <Button 
                  variant="outline"
                  className="border-2 border-blue-300 hover:bg-blue-50 h-11 w-11"
                  onClick={() => router.push(`/events/${event.id}`)}
                >
                  <Eye className="h-5 w-5" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Info Card */}
      <Card className="mt-12 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white border-0 shadow-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <span>💡 How Investment Works</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-400 text-white flex items-center justify-center text-lg font-bold shadow-lg">1</div>
            <div>
              <p className="font-bold text-lg">🔍 Browse Events</p>
              <p className="text-blue-100 mt-1">Explore approved events and review DAO questions before investing</p>
            </div>
          </div>
          <div className="flex gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-yellow-400 text-white flex items-center justify-center text-lg font-bold shadow-lg">2</div>
            <div>
              <p className="font-bold text-lg">💰 Invest with SOL</p>
              <p className="text-blue-100 mt-1">Connect your wallet and invest any amount in SOL cryptocurrency</p>
            </div>
          </div>
          <div className="flex gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 text-white flex items-center justify-center text-lg font-bold shadow-lg">3</div>
            <div>
              <p className="font-bold text-lg">🗳️ Vote on Decisions</p>
              <p className="text-blue-100 mt-1">Answer DAO questions to help shape key event decisions democratically</p>
            </div>
          </div>
          <div className="flex gap-4 bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 text-white flex items-center justify-center text-lg font-bold shadow-lg">4</div>
            <div>
              <p className="font-bold text-lg">📈 Earn ROI</p>
              <p className="text-blue-100 mt-1">Receive proportional returns based on your investment after the event concludes</p>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}

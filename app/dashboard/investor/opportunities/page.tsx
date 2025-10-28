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
  
  if (userLoading || !user) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  const [events, setEvents] = useState<EventWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState("all");

  useEffect(() => {
    if (user?.id) {
      fetchOpportunities();
    }
  }, [user?.id]);

  const fetchOpportunities = async () => {
    try {
      setLoading(true);

      // Fetch approved and dao_voting events
      const eventsRes = await fetch(`/api/events?status=approved,dao_voting`);
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
    <div className="container mx-auto py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Investment Opportunities</h1>
        <p className="text-muted-foreground">
          Discover and invest in exciting events. Vote on key decisions and earn ROI!
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Events</p>
                <p className="text-2xl font-bold">{events.length}</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Upcoming</p>
                <p className="text-2xl font-bold">
                  {events.filter(e => new Date(e.start_time) > new Date()).length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Investors</p>
                <p className="text-2xl font-bold">
                  {events.reduce((sum, e) => sum + (e.investor_count || 0), 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Invested</p>
                <p className="text-2xl font-bold">
                  {events.reduce((sum, e) => sum + (e.total_invested || 0), 0).toFixed(1)} SOL
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events by name, description, or venue..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>

        <Tabs value={filterTab} onValueChange={setFilterTab} className="w-full">
          <TabsList className="grid w-full max-w-2xl grid-cols-4">
            <TabsTrigger value="all">All Events</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
            <TabsTrigger value="funding">Need Funding</TabsTrigger>
            <TabsTrigger value="popular">Popular</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Event Cards */}
      {filteredEvents.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Investment Opportunities</h3>
            <p className="text-muted-foreground">
              {searchQuery 
                ? "No events match your search criteria." 
                : "Check back soon for new investment opportunities!"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Card key={event.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Badge variant={event.status === "approved" ? "default" : "secondary"}>
                    {event.status === "approved" ? "Open" : "DAO Voting"}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {event.category}
                  </Badge>
                </div>
                <CardTitle className="line-clamp-2">{event.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {event.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Event Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(event.start_time).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="line-clamp-1">{event.venue}</span>
                  </div>
                </div>

                {/* Investment Stats */}
                <div className="bg-muted rounded-lg p-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Invested</span>
                    <span className="font-semibold">{(event.total_invested || 0).toFixed(2)} SOL</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Investors</span>
                    <span className="font-semibold">{event.investor_count || 0}</span>
                  </div>
                </div>

                {/* DAO Questions Preview */}
                {event.dao_questions && event.dao_questions.length > 0 && (
                  <div className="border-t pt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">DAO Questions</span>
                      <Badge variant="secondary" className="text-xs">
                        {event.dao_questions.length} questions
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p className="line-clamp-2">
                        {event.dao_questions[0].question}
                      </p>
                      {event.dao_questions.length > 1 && (
                        <p className="text-xs mt-1">
                          +{event.dao_questions.length - 1} more questions
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>

              <CardFooter className="gap-2">
                <Button 
                  className="flex-1" 
                  onClick={() => router.push(`/dashboard/investor/invest/${event.id}`)}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Invest Now
                </Button>
                <Button 
                  variant="outline"
                  size="icon"
                  onClick={() => router.push(`/events/${event.id}`)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Info Card */}
      <Card className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-blue-600" />
            How Investment Works
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">1</div>
            <div>
              <p className="font-medium">Browse Events</p>
              <p className="text-muted-foreground">Explore approved events and review DAO questions</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">2</div>
            <div>
              <p className="font-medium">Invest with SOL</p>
              <p className="text-muted-foreground">Connect your wallet and invest any amount in SOL</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">3</div>
            <div>
              <p className="font-medium">Vote on Decisions</p>
              <p className="text-muted-foreground">Answer DAO questions to help shape the event</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">4</div>
            <div>
              <p className="font-medium">Earn ROI</p>
              <p className="text-muted-foreground">Receive proportional returns based on your investment after the event</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

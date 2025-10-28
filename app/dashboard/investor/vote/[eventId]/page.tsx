"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useDashboardUser } from "@/hooks/useDashboardUser";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Calendar, 
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Trophy,
  Vote
} from "lucide-react";

type DAOOption = {
  id: string;
  question_id: string;
  option_text: string;
  order: number;};


type DAOQuestion = {
  id: string;
  event_id: string;
  question: string;
  order: number;
  options: DAOOption[];};


type Event = {
  id: string;
  name: string;
  description: string;
  start_time: string;
  status: string;};


type Vote = {
  question_id: string;
  option_id: string;};


export default function VotePage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.eventId as string;
  const { user, isLoading: userLoading } = useDashboardUser("investor");
  
  const [event, setEvent] = useState<Event | null>(null);
  const [questions, setQuestions] = useState<DAOQuestion[]>([]);
  const [existingVotes, setExistingVotes] = useState<any[]>([]);
  const [hasInvested, setHasInvested] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<{[key: string]: string}>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (userLoading || !user || !eventId) return;
    fetchVotingData();
  }, [userLoading, user, eventId]);

  const fetchVotingData = async () => {
    try {
      setLoading(true);
      
      // Fetch event
      const eventRes = await fetch(`/api/events/${eventId}`);
      const eventData = await eventRes.json();
      setEvent(eventData.event);
      
      // Check if user invested
      const investmentRes = await fetch(`/api/investments?eventId=${eventId}&investorId=${user?.id}`);
      const investmentData = await investmentRes.json();
      setHasInvested(investmentData.investments && investmentData.investments.length > 0);
      
      // Fetch DAO questions
      const questionsRes = await fetch(`/api/dao/questions?eventId=${eventId}`);
      const questionsData = await questionsRes.json();
      setQuestions(questionsData.questions || []);
      
      // Fetch existing votes
      const votesRes = await fetch(`/api/dao/votes?eventId=${eventId}&investorId=${user?.id}`);
      const votesData = await votesRes.json();
      setExistingVotes(votesData.votes || []);
      
      // Pre-fill selected options with existing votes
      const preSelected: {[key: string]: string} = {};
      votesData.votes?.forEach((vote: any) => {
        preSelected[vote.question_id] = vote.option_id;
      });
      setSelectedOptions(preSelected);
      
      // Check if all questions are voted
      if (questionsData.questions && votesData.votes) {
        setCompleted(votesData.votes.length === questionsData.questions.length);
      }
      
    } catch (err) {
      console.error("Error fetching voting data:", err);
      setError("Failed to load voting data");
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (questionId: string, optionId: string) => {
    setSelectedOptions(prev => ({ ...prev, [questionId]: optionId }));
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleSubmitVote = async () => {
    const currentQuestion = questions[currentQuestionIndex];
    const optionId = selectedOptions[currentQuestion.id];
    
    if (!optionId) {
      setError("Please select an option");
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      const response = await fetch("/api/dao/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          investorId: user?.id,
          questionId: currentQuestion.id,
          optionId,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to submit vote");
      }
      
      // Add to existing votes
      setExistingVotes(prev => [...prev, data.vote]);
      
      // Move to next question or complete
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        setCompleted(true);
        
        // Check if all investors have voted and update event status
        try {
          const checkResponse = await fetch(`/api/events/${eventId}/check-voting-complete`, {
            method: "POST",
          });
          const checkData = await checkResponse.json();
          
          if (checkData.votingComplete && checkData.statusUpdated) {
            console.log("✅ All investors voted! Event status updated to:", checkData.newStatus);
          }
        } catch (checkErr) {
          console.error("Failed to check voting completion:", checkErr);
          // Don't show error to user, this is a background check
        }
      }
      
    } catch (err: any) {
      console.error("Vote submission error:", err);
      setError(err.message || "Failed to submit vote");
    } finally {
      setSubmitting(false);
    }
  };
  
  if (userLoading || !user) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (loading) {

    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasInvested) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Investment Required:</strong> You must invest in this event before you can vote on DAO questions.
          </AlertDescription>
        </Alert>
        <div className="mt-4 flex gap-2">
          <Button onClick={() => router.push(`/dashboard/investor/invest/${eventId}`)}>
            Invest Now
          </Button>
          <Button variant="outline" onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
        <Card className="border-2 border-dashed border-purple-300 bg-white/90 backdrop-blur-sm shadow-2xl max-w-2xl w-full">
          <CardContent className="py-20 text-center">
            <div className="text-8xl mb-6">🗳️</div>
            <h3 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              No DAO Questions Yet
            </h3>
            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
              The organizer hasn't created any DAO questions for this event yet. Check back soon to participate in governance!
            </p>
            <Button 
              onClick={() => router.push("/dashboard/investor/opportunities")}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white h-12 px-8 text-base font-semibold shadow-lg"
            >
              ⬅️ Back to Opportunities
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (completed) {
    const allVotedCount = existingVotes.length;
    const totalQuestions = questions.length;

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex items-center justify-center p-4">
        <Card className="border-0 bg-white/90 backdrop-blur-sm shadow-2xl max-w-2xl w-full overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 via-emerald-500 to-teal-500 p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className="h-24 w-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm animate-bounce">
                <Trophy className="h-16 w-16 text-white drop-shadow-lg" />
              </div>
            </div>
            <CardTitle className="text-4xl font-bold text-white mb-2 drop-shadow-md">
              🎉 Voting Complete!
            </CardTitle>
            <CardDescription className="text-emerald-50 text-lg">
              Thank you for participating in the DAO voting process
            </CardDescription>
          </div>
          
          <CardContent className="space-y-6 p-8">
            <div className="bg-gradient-to-br from-green-500 to-emerald-500 text-white rounded-2xl p-8 text-center shadow-lg">
              <p className="text-6xl font-bold mb-2">
                {allVotedCount} / {totalQuestions}
              </p>
              <p className="text-emerald-100 text-lg font-semibold">
                ✅ Questions Voted
              </p>
            </div>

            {event && (
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 text-center border-2 border-blue-100">
                <p className="text-sm font-semibold text-gray-600 mb-2">🎪 Event</p>
                <p className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{event.name}</p>
              </div>
            )}

            <Alert className="border-2 border-green-200 bg-green-50">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <AlertDescription className="text-green-800 text-base">
                <strong>✨ Success!</strong> Your votes have been recorded. The organizer will review the results and make decisions based on community input.
              </AlertDescription>
            </Alert>
          </CardContent>
          
          <CardFooter className="flex gap-4 p-8 pt-0">
            <Button 
              variant="outline" 
              className="flex-1 h-12 border-2 border-gray-300 hover:bg-gray-50 font-semibold"
              onClick={() => router.push("/dashboard/investor/opportunities")}
            >
              🔍 Browse More Events
            </Button>
            <Button 
              className="flex-1 h-12 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 font-semibold shadow-lg"
              onClick={() => router.push(`/dashboard/investor/portfolio`)}
            >
              📊 View Portfolio
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const isAlreadyVoted = existingVotes.some(v => v.question_id === currentQuestion.id);
  const selectedOptionId = selectedOptions[currentQuestion.id];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 py-8 px-4">
      <div className="container mx-auto max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            🗳️ DAO Voting
          </h1>
          <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 px-4 py-2 text-base font-semibold shadow-lg">
            Question {currentQuestionIndex + 1} of {questions.length}
          </Badge>
        </div>
        {event && (
          <p className="text-gray-600 text-lg font-medium">🎪 {event.name}</p>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border-2 border-purple-100">
          <Progress value={progress} className="h-3 bg-purple-100" />
          <p className="text-sm font-semibold text-purple-600 mt-3 text-center">
            📊 {Math.round(progress)}% Complete
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Already Voted Alert */}
      {isAlreadyVoted && (
        <Alert className="mb-6 border-green-500 bg-green-50 dark:bg-green-950">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            You've already voted on this question. Your response is shown below.
          </AlertDescription>
        </Alert>
      )}

      {/* Question Card */}
      <Card className="mb-8 border-2 border-purple-200 shadow-2xl bg-white/90 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b-2 border-purple-100">
          <CardTitle className="text-2xl font-bold text-gray-800 mb-2">
            🤔 {currentQuestion.question}
          </CardTitle>
          <CardDescription className="text-base text-gray-600 font-medium">
            {isAlreadyVoted ? "✅ Your selected answer:" : "👆 Select your answer:"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {currentQuestion.options
            .sort((a: any, b: any) => a.order - b.order)
            .map((option: any) => {
              const isSelected = selectedOptionId === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => !isAlreadyVoted && handleOptionSelect(currentQuestion.id, option.id)}
                  disabled={isAlreadyVoted}
                  className={`w-full text-left p-5 rounded-xl border-2 transition-all ${
                    isSelected
                      ? "border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50 shadow-xl scale-[1.02]"
                      : "border-purple-200 hover:border-purple-400 hover:bg-purple-50 hover:shadow-lg"
                  } ${isAlreadyVoted ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                        isSelected ? "border-purple-500 bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg" : "border-purple-300"
                      }`}
                    >
                      {isSelected && (
                        <CheckCircle2 className="h-5 w-5 text-white" />
                      )}
                    </div>
                    <span className={`text-base ${isSelected ? "font-bold text-purple-700" : "font-medium text-gray-700"}`}>
                      {option.option_text}
                    </span>
                  </div>
                </button>
              );
            })}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0 || submitting}
          className="gap-2 h-12 border-2 border-gray-300 hover:bg-gray-50 font-semibold"
        >
          <ArrowLeft className="h-5 w-5" />
          Previous
        </Button>

        <div className="flex-1" />

        {currentQuestionIndex < questions.length - 1 ? (
          <Button
            onClick={isAlreadyVoted ? handleNext : handleSubmitVote}
            disabled={!selectedOptionId || submitting}
            className="gap-2 h-12 font-bold bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl transition-all"
          >
            {submitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Submitting...
              </>
            ) : isAlreadyVoted ? (
              <>
                Next Question
                <ArrowRight className="h-5 w-5" />
              </>
            ) : (
              <>
                \ud83d\udce4 Submit & Next
                <ArrowRight className="h-5 w-5" />
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={handleSubmitVote}
            disabled={!selectedOptionId || submitting}
            className="gap-2 h-12 font-bold bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-xl transition-all"
          >
            {submitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                \u2705 Submit Final Vote
                <CheckCircle2 className="h-5 w-5" />
              </>
            )}
          </Button>
        )}
      </div>
      </div>
    </div>
  );
}

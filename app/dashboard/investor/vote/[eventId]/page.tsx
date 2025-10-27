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
  order: number;
};

type DAOQuestion = {
  id: string;
  event_id: string;
  question: string;
  order: number;
  options: DAOOption[];
};

type Event = {
  id: string;
  name: string;
  description: string;
  start_time: string;
  status: string;
};

type Vote = {
  question_id: string;
  option_id: string;
};

export default function VotePage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.eventId as string;
  const user = useDashboardUser("investor");

  const [event, setEvent] = useState<Event | null>(null);
  const [questions, setQuestions] = useState<DAOQuestion[]>([]);
  const [existingVotes, setExistingVotes] = useState<Vote[]>([]);
  const [hasInvested, setHasInvested] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (eventId && user?.id) {
      fetchData();
    }
  }, [eventId, user?.id]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch event details
      const eventRes = await fetch(`/api/events/${eventId}`);
      const eventData = await eventRes.json();
      if (eventData.event) {
        setEvent(eventData.event);
      }

      // Fetch DAO questions
      const questionsRes = await fetch(`/api/dao/questions?eventId=${eventId}`);
      const questionsData = await questionsRes.json();
      setQuestions(questionsData.questions || []);

      // Check if user has invested
      const investmentsRes = await fetch(`/api/investments?eventId=${eventId}&investorId=${user?.id}`);
      const investmentsData = await investmentsRes.json();
      setHasInvested((investmentsData.investments || []).length > 0);

      // Check existing votes
      const votesRes = await fetch(`/api/dao/votes?eventId=${eventId}&investorId=${user?.id}`);
      const votesData = await votesRes.json();
      setExistingVotes(votesData.votes || []);

      // Pre-fill selected options if already voted
      if (votesData.votes && votesData.votes.length > 0) {
        const voted: Record<string, string> = {};
        votesData.votes.forEach((vote: any) => {
          voted[vote.question_id] = vote.option_id;
        });
        setSelectedOptions(voted);
      }

    } catch (e) {
      console.error("Error fetching data:", e);
      setError("Failed to load voting data");
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (questionId: string, optionId: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [questionId]: optionId
    }));
  };

  const handleSubmitVote = async () => {
    const currentQuestion = questions[currentQuestionIndex];
    const selectedOptionId = selectedOptions[currentQuestion.id];

    if (!selectedOptionId) {
      setError("Please select an option");
      return;
    }

    // Check if already voted on this question
    if (existingVotes.some(v => v.question_id === currentQuestion.id)) {
      // Move to next question if already voted
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        setCompleted(true);
      }
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const voteRes = await fetch("/api/dao/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: currentQuestion.id,
          optionId: selectedOptionId,
          investorId: user?.id,
          eventId,
        }),
      });

      if (!voteRes.ok) {
        const errorData = await voteRes.json();
        throw new Error(errorData.error || "Failed to submit vote");
      }

      // Add to existing votes
      setExistingVotes(prev => [...prev, {
        question_id: currentQuestion.id,
        option_id: selectedOptionId
      }]);

      // Move to next question or complete
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setError(null);
      } else {
        setCompleted(true);
      }

    } catch (e: any) {
      console.error("Error submitting vote:", e);
      setError(e.message || "Failed to submit vote");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      setError(null);
    }
  };

  const handleNext = () => {
    const currentQuestion = questions[currentQuestionIndex];
    const selectedOptionId = selectedOptions[currentQuestion.id];

    if (!selectedOptionId) {
      setError("Please select an option before continuing");
      return;
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setError(null);
    }
  };

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
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Vote className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No DAO Questions</h3>
            <p className="text-muted-foreground mb-4">
              The organizer hasn't created any DAO questions for this event yet.
            </p>
            <Button onClick={() => router.push("/dashboard/investor/opportunities")}>
              Back to Opportunities
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
      <div className="container mx-auto py-8 px-4 max-w-2xl">
        <Card className="border-green-500 bg-green-50 dark:bg-green-950">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Trophy className="h-16 w-16 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Voting Complete!</CardTitle>
            <CardDescription>
              Thank you for participating in the DAO voting process
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center p-4 bg-white dark:bg-gray-900 rounded-lg">
              <p className="text-3xl font-bold text-green-600">
                {allVotedCount} / {totalQuestions}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Questions Voted
              </p>
            </div>

            {event && (
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Event</p>
                <p className="font-semibold">{event.name}</p>
              </div>
            )}

            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Your votes have been recorded. The organizer will review the results and make decisions based on community input.
              </AlertDescription>
            </Alert>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => router.push("/dashboard/investor/opportunities")}
            >
              Browse More Events
            </Button>
            <Button 
              className="flex-1"
              onClick={() => router.push(`/dashboard/investor/voting`)}
            >
              View My Votes
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
    <div className="container mx-auto py-8 px-4 max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold">DAO Voting</h1>
          <Badge variant="secondary">
            Question {currentQuestionIndex + 1} of {questions.length}
          </Badge>
        </div>
        {event && (
          <p className="text-muted-foreground">{event.name}</p>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <Progress value={progress} className="h-2" />
        <p className="text-sm text-muted-foreground mt-2 text-center">
          {Math.round(progress)}% Complete
        </p>
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
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
          <CardDescription>
            {isAlreadyVoted ? "Your selected answer:" : "Select your answer:"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {currentQuestion.options
            .sort((a, b) => a.order - b.order)
            .map((option) => {
              const isSelected = selectedOptionId === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => !isAlreadyVoted && handleOptionSelect(currentQuestion.id, option.id)}
                  disabled={isAlreadyVoted}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-md"
                      : "border-border hover:border-primary/50 hover:bg-accent"
                  } ${isAlreadyVoted ? "cursor-not-allowed opacity-70" : "cursor-pointer"}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        isSelected ? "border-primary bg-primary" : "border-border"
                      }`}
                    >
                      {isSelected && (
                        <CheckCircle2 className="h-3 w-3 text-white" />
                      )}
                    </div>
                    <span className={isSelected ? "font-medium" : ""}>
                      {option.option_text}
                    </span>
                  </div>
                </button>
              );
            })}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0 || submitting}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="flex-1" />

        {currentQuestionIndex < questions.length - 1 ? (
          <Button
            onClick={isAlreadyVoted ? handleNext : handleSubmitVote}
            disabled={!selectedOptionId || submitting}
            className="gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : isAlreadyVoted ? (
              <>
                Next
                <ArrowRight className="h-4 w-4" />
              </>
            ) : (
              <>
                Submit & Next
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={handleSubmitVote}
            disabled={!selectedOptionId || submitting}
            className="gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                Submit Final Vote
                <CheckCircle2 className="h-4 w-4" />
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}

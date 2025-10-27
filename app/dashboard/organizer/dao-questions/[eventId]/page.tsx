"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useDashboardUser } from "@/hooks/useDashboardUser";
import { Trash2, Plus, ArrowLeft, Save, Eye } from "lucide-react";

type DAOOption = {
  id?: string;
  option?: string;
  option_text?: string;
};

type DAOQuestion = {
  id: string;
  question: string;
  order: number;
  options: DAOOption[];
  created_at: string;
};

type Event = {
  id: string;
  name: string;
  status: string;
  event_date: string;
  location: string;
};

export default function DAOQuestionsPage() {
  const params = useParams();
  const router = useRouter();
  const user = useDashboardUser("organizer");
  const eventId = params.eventId as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [questions, setQuestions] = useState<DAOQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state for new question
  const [newQuestion, setNewQuestion] = useState("");
  const [newOptions, setNewOptions] = useState<string[]>(["", ""]);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (user?.id) {
      fetchEventAndQuestions();
    }
  }, [user?.id, eventId]);

  const fetchEventAndQuestions = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔍 Fetching event:", eventId);

      // Fetch event details
      const eventRes = await fetch(`/api/events/${eventId}`);
      console.log("📡 Event API response status:", eventRes.status);
      
      if (!eventRes.ok) {
        const errorData = await eventRes.json();
        console.error("❌ Event fetch failed:", errorData);
        setError(`Failed to load event: ${errorData.error || "Unknown error"}`);
        setLoading(false);
        return;
      }

      const { event: eventData } = await eventRes.json();
      console.log("✅ Event loaded:", eventData);
      setEvent(eventData);

      // Check if event is approved or in dao_voting
      if (eventData.status !== "approved" && eventData.status !== "dao_voting") {
        setError(`Event must be approved before creating DAO questions. Current status: ${eventData.status}`);
        setLoading(false);
        return;
      }

      // Fetch existing questions
      console.log("🔍 Fetching DAO questions for event:", eventId);
      const questionsRes = await fetch(`/api/dao/questions?eventId=${eventId}`);
      
      if (questionsRes.ok) {
        const data = await questionsRes.json();
        console.log("✅ Questions loaded:", data.questions?.length || 0);
        setQuestions(data.questions || []);
      } else {
        console.warn("⚠️ Failed to load questions, but continuing...");
        setQuestions([]);
      }
    } catch (error: any) {
      console.error("❌ Error fetching data:", error);
      setError(`Network error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOption = () => {
    setNewOptions([...newOptions, ""]);
  };

  const handleRemoveOption = (index: number) => {
    if (newOptions.length > 2) {
      const updated = newOptions.filter((_, i) => i !== index);
      setNewOptions(updated);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const updated = [...newOptions];
    updated[index] = value;
    setNewOptions(updated);
  };

  const handleSaveQuestion = async () => {
    // Validation
    if (!newQuestion.trim()) {
      alert("Please enter a question");
      return;
    }

    const validOptions = newOptions.filter((opt) => opt.trim() !== "");
    if (validOptions.length < 2) {
      alert("Please provide at least 2 options");
      return;
    }

    if (!user?.id) {
      alert("User not authenticated");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch("/api/dao/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId,
          question: newQuestion.trim(),
          options: validOptions,
          organizerId: user.id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create question");
      }

      // Reset form
      setNewQuestion("");
      setNewOptions(["", ""]);

      // Refresh questions
      await fetchEventAndQuestions();

      alert("Question created successfully!");
    } catch (error: any) {
      console.error("Error creating question:", error);
      alert(error.message || "Failed to create question");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm("Are you sure you want to delete this question?")) {
      return;
    }

    try {
      const response = await fetch(`/api/dao/questions/${questionId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete question");
      }

      // Refresh questions
      await fetchEventAndQuestions();
      alert("Question deleted successfully!");
    } catch (error) {
      console.error("Error deleting question:", error);
      alert("Failed to delete question");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 max-w-5xl">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading event and questions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="container mx-auto py-8 max-w-5xl">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-xl">⚠️</span>
              </div>
              <div>
                <CardTitle className="text-red-900">Unable to Load Event</CardTitle>
                <CardDescription className="text-red-700">
                  {error || "Event not found or you don't have permission to access it"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white p-4 rounded-md border border-red-200">
              <p className="text-sm text-gray-700 mb-2">
                <strong>Event ID:</strong> <code className="bg-gray-100 px-2 py-1 rounded">{eventId}</code>
              </p>
              <p className="text-sm text-gray-600 mb-3">
                This could happen if:
              </p>
              <ul className="text-sm text-gray-600 space-y-1 ml-4 list-disc">
                <li>The event doesn't exist in the database</li>
                <li>The event hasn't been approved by an admin yet</li>
                <li>You don't have permission to manage this event</li>
                <li>The event is in the wrong status (must be "approved" or "dao_voting")</li>
              </ul>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={() => router.push("/dashboard/organizer")}
                variant="default"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
              <Button
                onClick={() => fetchEventAndQuestions()}
                variant="outline"
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-5xl">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/dashboard/organizer")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{event.name}</h1>
            <p className="text-muted-foreground mt-1">
              Manage DAO Questions for Investor Voting
            </p>
          </div>
          <Badge variant={event.status === "approved" ? "default" : "secondary"}>
            {event.status}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Create New Question */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Create New DAO Question
            </CardTitle>
            <CardDescription>
              Ask investors to vote on important event decisions. Each investor will vote after
              investing.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Question Input */}
            <div className="space-y-2">
              <Label htmlFor="question">Question *</Label>
              <Input
                id="question"
                placeholder="e.g., What type of food should we serve?"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                maxLength={200}
              />
              <p className="text-sm text-muted-foreground">
                {newQuestion.length}/200 characters
              </p>
            </div>

            {/* Options */}
            <div className="space-y-3">
              <Label>Answer Options * (minimum 2)</Label>
              {newOptions.map((option, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    maxLength={100}
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleRemoveOption(index)}
                    disabled={newOptions.length <= 2}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <Button variant="outline" size="sm" onClick={handleAddOption} className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Another Option
            </Button>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button onClick={handleSaveQuestion} disabled={saving} className="flex-1">
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : "Save Question"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
              >
                <Eye className="mr-2 h-4 w-4" />
                {showPreview ? "Hide" : "Preview"}
              </Button>
            </div>

            {/* Preview */}
            {showPreview && newQuestion.trim() && (
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-lg">Preview</CardTitle>
                  <CardDescription>How investors will see this question</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="font-medium mb-3">{newQuestion}</p>
                  <div className="space-y-2">
                    {newOptions
                      .filter((opt) => opt.trim() !== "")
                      .map((option, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-3 border rounded-md hover:bg-background cursor-pointer transition-colors"
                        >
                          <div className="h-4 w-4 rounded-full border-2 border-primary" />
                          <span>{option}</span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Existing Questions */}
        <Card>
          <CardHeader>
            <CardTitle>Existing Questions ({questions.length})</CardTitle>
            <CardDescription>
              Questions that investors will vote on after investing
            </CardDescription>
          </CardHeader>
          <CardContent>
            {questions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No questions created yet.</p>
                <p className="text-sm mt-2">Create your first question above to get started!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {questions.map((q, index) => (
                  <Card key={q.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">Question {index + 1}</Badge>
                            <span className="text-sm text-muted-foreground">
                              {new Date(q.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <CardTitle className="text-lg">{q.question}</CardTitle>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground mb-2">
                          Options:
                        </p>
                        {q.options.map((opt, optIndex) => (
                          <div
                            key={opt.id || optIndex}
                            className="flex items-center gap-2 p-2 border rounded-md"
                          >
                            <div className="h-3 w-3 rounded-full border-2 border-muted-foreground" />
                            <span>{opt.option_text || opt.option}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-blue-50 dark:bg-blue-950">
          <CardHeader>
            <CardTitle className="text-base">💡 How DAO Questions Work</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>
              <strong>1. Create Questions:</strong> Add 3-5 questions about important event
              decisions (food, venue, speakers, etc.)
            </p>
            <p>
              <strong>2. Investors See Questions:</strong> When browsing your event, investors
              can preview the questions before investing
            </p>
            <p>
              <strong>3. After Investment:</strong> Investors must vote on ALL questions to
              complete their investment
            </p>
            <p>
              <strong>4. View Results:</strong> Once all investors vote, you can see the results
              and start selling tickets
            </p>
            <p className="text-muted-foreground pt-2">
              💡 Tip: Create questions that genuinely need investor input. This increases
              engagement and trust!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

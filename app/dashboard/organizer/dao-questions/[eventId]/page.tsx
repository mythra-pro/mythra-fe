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
  option_text?: string;};


type DAOQuestion = {
  id: string;
  question: string;
  order: number;
  options: DAOOption[];
  created_at: string;};


type Event = {
  id: string;
  name: string;
  status: string;
  event_date: string;
  location: string;};


export default function DAOQuestionsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: userLoading } = useDashboardUser("organizer");
  const eventId = params.eventId as string;
  
  // Real state hooks
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [event, setEvent] = useState<any>(null);
  const [questions, setQuestions] = useState<DAOQuestion[]>([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [newOptions, setNewOptions] = useState<string[]>(["", ""]);
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  // Fetch event and questions
  const fetchEventAndQuestions = async () => {
    try {
      setLoading(true);
      console.log("🔍 Fetching event and questions for:", eventId);
      
      // Fetch event details
      const eventRes = await fetch(`/api/events/${eventId}`);
      const eventData = await eventRes.json();
      
      if (!eventRes.ok || !eventData.event) {
        throw new Error(eventData.error || "Event not found");
      }
      
      setEvent(eventData.event);
      
      // Fetch existing questions
      const questionsRes = await fetch(`/api/dao/questions?eventId=${eventId}`);
      const questionsData = await questionsRes.json();
      
      if (questionsRes.ok && questionsData.questions) {
        setQuestions(questionsData.questions);
        console.log("📊 Loaded questions:", questionsData.questions.length);
      }
    } catch (err: any) {
      console.error("❌ Error fetching data:", err);
      setError(err.message || "Failed to load event");
    } finally {
      setLoading(false);
    }
  };
  
  // Load data on mount
  useEffect(() => {
    if (eventId && !userLoading) {
      fetchEventAndQuestions();
    }
  }, [eventId, userLoading]);
  
  // Handle option change
  const handleOptionChange = (index: number, value: string) => {
    const updatedOptions = [...newOptions];
    updatedOptions[index] = value;
    setNewOptions(updatedOptions);
  };
  
  // Remove option
  const handleRemoveOption = (index: number) => {
    if (newOptions.length > 2) {
      setNewOptions(newOptions.filter((_, i) => i !== index));
    }
  };
  
  // Add option
  const handleAddOption = () => {
    setNewOptions([...newOptions, ""]);
  };
  
  // Save question
  const handleSaveQuestion = async () => {
    try {
      // Validation
      if (!newQuestion.trim()) {
        alert("Please enter a question");
        return;
      }
      
      if (newQuestion.length > 200) {
        alert("Question must be 200 characters or less");
        return;
      }
      
      const validOptions = newOptions.filter(opt => opt.trim());
      if (validOptions.length < 2) {
        alert("Please provide at least 2 options");
        return;
      }
      
      setSaving(true);
      console.log("💾 Saving question...");
      
      const response = await fetch("/api/dao/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId,
          question: newQuestion.trim(),
          options: validOptions,
          organizerId: user?.id
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to save question");
      }
      
      console.log("✅ Question saved successfully");
      alert("Question saved successfully!");
      
      // Reset form
      setNewQuestion("");
      setNewOptions(["", ""]);
      
      // Reload questions
      await fetchEventAndQuestions();
    } catch (err: any) {
      console.error("❌ Error saving question:", err);
      alert(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };
  
  // Delete question
  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm("Are you sure you want to delete this question?")) {
      return;
    }
    
    try {
      console.log("🗑️ Deleting question:", questionId);
      
      const response = await fetch(`/api/dao/questions/${questionId}`, {
        method: "DELETE"
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete question");
      }
      
      console.log("✅ Question deleted");
      alert("Question deleted successfully");
      
      // Reload questions
      await fetchEventAndQuestions();
    } catch (err: any) {
      console.error("❌ Error deleting question:", err);
      alert(`Error: ${err.message}`);
    }
  };
  
  if (userLoading || !user) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto py-8 max-w-6xl px-4">
        {/* Header Section */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard/organizer")}
            className="mb-6 hover:bg-white/50 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>

          {/* Hero Header */}
          <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-2xl p-8 text-white shadow-xl mb-8">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <span className="text-2xl">🗳️</span>
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold tracking-tight">{event.name}</h1>
                    <p className="text-purple-100 mt-2 text-lg">
                      📋 DAO Questions for Investor Voting
                    </p>
                  </div>
                </div>
              </div>
              <Badge 
                className={`${
                  event.status === "investment_window" || event.status === "approved"
                    ? "bg-green-500 hover:bg-green-600"
                    : event.status === "dao_process" || event.status === "dao_voting"
                    ? "bg-purple-500 hover:bg-purple-600"
                    : "bg-gray-500"
                } text-white border-0 px-4 py-2 text-sm font-semibold shadow-lg`}
              >
                {event.status === "investment_window" || event.status === "approved"
                  ? "💰 Investment Window"
                  : event.status === "dao_process" || event.status === "dao_voting"
                  ? "🗳️ DAO Voting Active"
                  : event.status}
              </Badge>
            </div>
            
            {/* Info Pills */}
            <div className="mt-6 flex flex-wrap gap-3">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-2">
                <span className="text-purple-200">📝</span>
                <span className="text-sm font-medium">{questions.length} Questions Created</span>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-2">
                <span className="text-purple-200">👥</span>
                <span className="text-sm font-medium">Democratic Voting (1 wallet = 1 vote)</span>
              </div>
            </div>
          </div>
        </div>

      <div className="grid gap-8">
        {/* Create New Question */}
        <Card className="border-2 border-purple-200 shadow-lg hover:shadow-xl transition-shadow bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b-2 border-purple-100">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="h-10 w-10 bg-purple-600 rounded-xl flex items-center justify-center">
                <Plus className="h-5 w-5 text-white" />
              </div>
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent font-bold">
                Create New DAO Question
              </span>
            </CardTitle>
            <CardDescription className="text-base mt-2">
              💬 Ask investors to vote on important event decisions. Each investor will vote after investing.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Question Input */}
            <div className="space-y-3">
              <Label htmlFor="question" className="text-base font-semibold flex items-center gap-2">
                <span>📝</span> Question *
              </Label>
              <Input
                id="question"
                placeholder="e.g., What type of food should we serve?"
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                maxLength={200}
                className="h-12 text-base border-2 focus:border-purple-400 transition-colors"
              />
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  💡 Tip: Be specific and clear
                </p>
                <p className="text-sm font-medium text-purple-600">
                  {newQuestion.length}/200 characters
                </p>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-4">
              <Label className="text-base font-semibold flex items-center gap-2">
                <span>✅</span> Answer Options * (minimum 2)
              </Label>
              {newOptions.map((option: any, index: number) => (
                <div key={index} className="flex gap-3 items-center bg-gray-50 p-3 rounded-lg border-2 border-gray-200 hover:border-purple-300 transition-colors">
                  <span className="text-gray-400 font-semibold min-w-[24px]">{index + 1}.</span>
                  <Input
                    placeholder={`Enter option ${index + 1}`}
                    value={option}
                    onChange={(e) => handleOptionChange(index, e.target.value)}
                    maxLength={100}
                    className="border-0 bg-white shadow-sm h-10"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveOption(index)}
                    disabled={newOptions.length <= 2}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 min-w-[40px]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

            <Button 
              variant="outline" 
              onClick={handleAddOption} 
              className="w-full border-2 border-dashed border-purple-300 hover:border-purple-500 hover:bg-purple-50 h-12 text-purple-600 font-semibold transition-all"
            >
              <Plus className="mr-2 h-5 w-5" />
              Add Another Option
            </Button>

            {/* Actions */}
            <div className="flex gap-4 pt-6 border-t-2 border-gray-100">
              <Button 
                onClick={handleSaveQuestion} 
                disabled={saving} 
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 h-12 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <Save className="mr-2 h-5 w-5" />
                {saving ? "💾 Saving..." : "💾 Save Question"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowPreview(!showPreview)}
                className="border-2 border-blue-300 hover:bg-blue-50 h-12 px-6 font-semibold transition-all"
              >
                <Eye className="mr-2 h-5 w-5" />
                {showPreview ? "Hide" : "👁️ Preview"}
              </Button>
            </div>

            {/* Preview */}
            {showPreview && newQuestion.trim() && (
              <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 shadow-md mt-4">
                <CardHeader className="bg-white/50 backdrop-blur-sm">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span>👁️</span> Preview
                  </CardTitle>
                  <CardDescription className="text-base">
                    How investors will see this question
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="font-semibold text-lg mb-4 text-gray-800">{newQuestion}</p>
                  <div className="space-y-3">
                    {newOptions
                      .filter((opt: any) => opt.trim() !== "")
                      .map((option: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-4 bg-white border-2 border-purple-200 rounded-lg hover:border-purple-400 hover:shadow-md cursor-pointer transition-all"
                        >
                          <div className="h-5 w-5 rounded-full border-3 border-purple-600 flex-shrink-0" />
                          <span className="font-medium text-gray-700">{option}</span>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* Existing Questions */}
        <Card className="border-2 border-blue-200 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b-2 border-blue-100">
            <CardTitle className="flex items-center gap-3 text-xl">
              <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold">{questions.length}</span>
              </div>
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent font-bold">
                Existing Questions
              </span>
            </CardTitle>
            <CardDescription className="text-base mt-2">
              📊 Questions that investors will vote on after investing
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {questions.length === 0 ? (
              <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl border-2 border-dashed border-gray-300">
                <div className="text-6xl mb-4">📝</div>
                <p className="text-lg font-semibold text-gray-700">No questions created yet</p>
                <p className="text-sm text-muted-foreground mt-2">Create your first question above to get started!</p>
              </div>
            ) : (
              <div className="space-y-5">
                {questions.map((q: any, index: number) => (
                  <Card key={q.id} className="border-2 border-indigo-100 hover:border-indigo-300 transition-all hover:shadow-lg bg-gradient-to-br from-white to-indigo-50/30">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <Badge className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-0 px-3 py-1">
                              Question {index + 1}
                            </Badge>
                            <span className="text-sm text-muted-foreground flex items-center gap-1">
                              <span>📅</span>
                              {new Date(q.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <CardTitle className="text-xl font-bold text-gray-800">{q.question}</CardTitle>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-100 border-2 border-transparent hover:border-red-300"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <p className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                          <span>✅</span> Answer Options:
                        </p>
                        {q.options.map((opt: any, optIndex: number) => (
                          <div
                            key={opt.id || optIndex}
                            className="flex items-center gap-3 p-3 bg-white border-2 border-indigo-100 rounded-lg hover:border-indigo-300 transition-colors"
                          >
                            <div className="h-4 w-4 rounded-full border-3 border-indigo-500 flex-shrink-0" />
                            <span className="font-medium text-gray-700">{opt.option_text || opt.option}</span>
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
        <Card className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <span className="text-2xl">💡</span> How DAO Questions Work
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
              <p className="text-white/90">
                <strong className="text-white">1️⃣ Create Questions:</strong> Add 3-5 questions about important event
                decisions (food, venue, speakers, etc.)
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
              <p className="text-white/90">
                <strong className="text-white">2️⃣ Investors See Questions:</strong> When browsing your event, investors
                can preview the questions before investing
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
              <p className="text-white/90">
                <strong className="text-white">3️⃣ After Investment:</strong> Investors must vote on ALL questions to
                complete their investment
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20">
              <p className="text-white/90">
                <strong className="text-white">4️⃣ View Results:</strong> Once all investors vote, you can see the results
                and start selling tickets
              </p>
            </div>
            <div className="bg-yellow-400/20 backdrop-blur-sm p-4 rounded-lg border-2 border-yellow-400/40 mt-6">
              <p className="text-white font-medium">
                💡 <strong>Pro Tip:</strong> Create questions that genuinely need investor input. This increases
                engagement and trust!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      </div>
    </div>
  );
}

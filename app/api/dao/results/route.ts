import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/server";

// GET /api/dao/results?eventId=xxx - Get DAO voting results for an event
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Get all questions for this event
    const { data: questions, error: questionsError } = await supabase
      .from("dao_questions")
      .select("*, options:dao_options(*)")
      .eq("event_id", eventId)
      .order("order", { ascending: true });

    if (questionsError) {
      console.error("❌ Error fetching questions:", questionsError);
      return NextResponse.json(
        { error: questionsError.message },
        { status: 500 }
      );
    }

    // Get all votes for this event
    const { data: votes, error: votesError } = await supabase
      .from("dao_votes")
      .select("question_id, option_id")
      .eq("event_id", eventId);

    if (votesError) {
      console.error("❌ Error fetching votes:", votesError);
      return NextResponse.json(
        { error: votesError.message },
        { status: 500 }
      );
    }

    // Calculate results for each question
    const results = questions.map((question: any) => {
      const questionVotes = votes.filter((v: any) => v.question_id === question.id);
      const totalVotes = questionVotes.length;

      const optionResults = question.options.map((option: any) => {
        const voteCount = questionVotes.filter((v: any) => v.option_id === option.id).length;
        const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;

        return {
          id: option.id,
          option_text: option.option_text,
          vote_count: voteCount,
          percentage: Math.round(percentage * 10) / 10,
        };
      });

      return {
        questionId: question.id,
        question: question.question,
        options: optionResults,
        total_votes: totalVotes,
      };
    });

    console.log("✅ DAO results calculated for event:", eventId);
    return NextResponse.json({ results }, { status: 200 });
  } catch (e: any) {
    console.error("❌ Unexpected error in GET /api/dao/results:", e);
    return NextResponse.json(
      { error: e?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}

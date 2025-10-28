import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/server";

// GET /api/events/[eventId]/dao-stats - Get DAO voting statistics
export async function GET(
  req: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    console.log("📊 Fetching DAO stats for event:", eventId);
    const supabase = getServiceSupabase();

    // Get event
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, name, status")
      .eq("id", eventId)
      .single();

    if (eventError) {
      console.error("❌ Event query error:", eventError);
      return NextResponse.json(
        { error: "Failed to fetch event", details: eventError.message },
        { status: 500 }
      );
    }

    if (!event) {
      console.log("❌ Event not found:", eventId);
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    console.log("✅ Event found:", event.name);

    // Get all DAO questions for this event
    const { data: questions, error: questionsError } = await supabase
      .from("dao_questions")
      .select("*")
      .eq("event_id", eventId);

    if (questionsError) {
      return NextResponse.json(
        { error: "Failed to fetch questions" },
        { status: 500 }
      );
    }

    const questionCount = questions?.length || 0;

    // Get all investors (people who invested in this event)
    const { data: investments, error: investmentsError } = await supabase
      .from("investments")
      .select("investor_id")
      .eq("event_id", eventId)
      .eq("status", "confirmed");

    if (investmentsError) {
      return NextResponse.json(
        { error: "Failed to fetch investments" },
        { status: 500 }
      );
    }

    const investors = investments?.map((inv) => inv.investor_id) || [];
    const investorCount = investors.length;

    // Get all votes for this event
    const { data: votes, error: votesError } = await supabase
      .from("dao_question_votes")
      .select("investor_id, question_id, option_id")
      .eq("event_id", eventId);

    if (votesError) {
      return NextResponse.json(
        { error: "Failed to fetch votes" },
        { status: 500 }
      );
    }

    const totalVotes = votes?.length || 0;
    const expectedVotes = investorCount * questionCount;

    // Calculate how many investors have completed voting
    const investorsVoted = new Set(votes?.map((v) => v.investor_id)).size;
    
    // Check if all investors have voted on all questions
    let allVoted = false;
    if (investorCount > 0 && questionCount > 0) {
      allVoted = totalVotes >= expectedVotes;
    }

    // Calculate voting completion percentage
    const completionPercentage = expectedVotes > 0 
      ? (totalVotes / expectedVotes) * 100 
      : 0;

    return NextResponse.json({
      eventId,
      eventName: event.name,
      status: event.status,
      dao: {
        totalQuestions: questionCount,
        totalInvestors: investorCount,
        investorsVoted,
        totalVotes,
        expectedVotes,
        completionPercentage: Math.round(completionPercentage),
        allVoted,
        canSellTickets: allVoted,
      },
      questions: questions?.map((q) => ({
        id: q.id,
        question: q.question,
        votes: votes?.filter((v) => v.question_id === q.id).length || 0,
      })),
    });
  } catch (e: any) {
    console.error("❌ Error fetching DAO stats:", e);
    return NextResponse.json(
      { error: e?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}

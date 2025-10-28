import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/server";

// POST /api/events/[eventId]/check-voting-complete
// Checks if all investors have voted and updates event status accordingly
export async function POST(
  req: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const supabase = getServiceSupabase();

    // Get event
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, status, name")
      .eq("id", eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // Get all DAO questions for this event
    const { data: questions, error: questionsError } = await supabase
      .from("dao_questions")
      .select("id")
      .eq("event_id", eventId);

    if (questionsError) {
      return NextResponse.json(
        { error: "Failed to fetch questions" },
        { status: 500 }
      );
    }

    const questionCount = questions?.length || 0;

    // If no questions, can't complete voting
    if (questionCount === 0) {
      return NextResponse.json({
        votingComplete: false,
        message: "No DAO questions for this event",
      });
    }

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

    // If no investors, can't complete voting
    if (investorCount === 0) {
      return NextResponse.json({
        votingComplete: false,
        message: "No investors for this event",
      });
    }

    // Get all votes for this event
    const { data: votes, error: votesError } = await supabase
      .from("dao_question_votes")
      .select("investor_id, question_id")
      .eq("event_id", eventId);

    if (votesError) {
      console.error("❌ Error fetching votes:", votesError);
      return NextResponse.json(
        { error: "Failed to fetch votes", details: votesError.message },
        { status: 500 }
      );
    }

    console.log(`📊 Found ${votes?.length || 0} votes for event ${eventId}`);

    // Check if every investor has voted on every question
    let allVoted = true;
    const votingStatus: any = {};

    for (const investorId of investors) {
      votingStatus[investorId] = {
        votedQuestions: 0,
        totalQuestions: questionCount,
      };

      for (const question of questions || []) {
        const hasVoted = votes?.some(
          (v) => v.investor_id === investorId && v.question_id === question.id
        );

        if (hasVoted) {
          votingStatus[investorId].votedQuestions++;
        } else {
          allVoted = false;
        }
      }
    }

    console.log(`📊 Voting Status for Event ${event.name}:`);
    console.log(`  Investors: ${investorCount}`);
    console.log(`  Questions: ${questionCount}`);
    console.log(`  Total Votes: ${votes?.length || 0}`);
    console.log(`  Expected Votes: ${investorCount * questionCount}`);
    console.log(`  All Voted: ${allVoted}`);

    // If all investors have voted on all questions, update event status
    if (allVoted) {
      // Update event status to allow ticket sales
      const newStatus = "selling_tickets"; // Organizer can now sell tickets
      
      const { error: updateError } = await supabase
        .from("events")
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq("id", eventId);

      if (updateError) {
        console.error("Failed to update event status:", updateError);
        return NextResponse.json(
          { error: "Failed to update event status" },
          { status: 500 }
        );
      }

      console.log(`✅ Event status updated to '${newStatus}' - Organizer can now sell tickets!`);

      return NextResponse.json({
        votingComplete: true,
        statusUpdated: true,
        newStatus,
        message: `All ${investorCount} investors have voted on all ${questionCount} questions. Event status updated to '${newStatus}'.`,
        investorCount,
        questionCount,
        totalVotes: votes?.length || 0,
      });
    }

    return NextResponse.json({
      votingComplete: false,
      statusUpdated: false,
      message: "Not all investors have voted yet",
      investorCount,
      questionCount,
      totalVotes: votes?.length || 0,
      expectedVotes: investorCount * questionCount,
      votingStatus,
    });
  } catch (e: any) {
    console.error("❌ Error checking voting completion:", e);
    console.error("Stack:", e.stack);
    return NextResponse.json(
      { error: e?.message || "Unexpected error", stack: e.stack },
      { status: 500 }
    );
  }
}

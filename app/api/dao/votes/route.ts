import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/server";

// GET /api/dao/votes?eventId=xxx&investorId=xxx - Get votes
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");
    const investorId = searchParams.get("investorId");

    const supabase = getServiceSupabase();

    let query = supabase
      .from("dao_votes")
      .select("*, question:dao_questions(*), option:dao_options(*)");

    if (eventId) {
      query = query.eq("event_id", eventId);
    }

    if (investorId) {
      query = query.eq("investor_id", investorId);
    }

    query = query.order("voted_at", { ascending: false });

    const { data: votes, error } = await query;

    if (error) {
      console.error("❌ Error fetching votes:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    console.log("✅ Votes fetched:", votes?.length || 0);
    return NextResponse.json({ votes }, { status: 200 });
  } catch (e: any) {
    console.error("❌ Unexpected error in GET /api/dao/votes:", e);
    return NextResponse.json(
      { error: e?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}

// POST /api/dao/votes - Submit a vote
export async function POST(req: Request) {
  try {
    const { questionId, optionId, investorId, eventId } = await req.json();

    if (!questionId || !optionId || !investorId || !eventId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Check if investor has already voted on this question
    const { data: existingVote } = await supabase
      .from("dao_votes")
      .select("id")
      .eq("question_id", questionId)
      .eq("investor_id", investorId)
      .single();

    if (existingVote) {
      return NextResponse.json(
        { error: "You have already voted on this question" },
        { status: 400 }
      );
    }

    // Check if investor has invested in this event
    const { data: investment } = await supabase
      .from("investments")
      .select("id")
      .eq("event_id", eventId)
      .eq("investor_id", investorId)
      .eq("status", "confirmed")
      .single();

    if (!investment) {
      return NextResponse.json(
        { error: "You must invest in this event to vote" },
        { status: 403 }
      );
    }

    // Insert vote
    const { data: vote, error } = await supabase
      .from("dao_votes")
      .insert({
        question_id: questionId,
        option_id: optionId,
        investor_id: investorId,
        event_id: eventId,
        voted_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error("❌ Error creating vote:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    console.log("✅ Vote created:", vote.id);
    return NextResponse.json({ vote }, { status: 201 });
  } catch (e: any) {
    console.error("❌ Unexpected error in POST /api/dao/votes:", e);
    return NextResponse.json(
      { error: e?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}

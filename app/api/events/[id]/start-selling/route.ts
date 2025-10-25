import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/server";

// POST /api/events/[id]/start-selling - Start selling tickets after DAO completion
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { organizerId } = await req.json();
    const { id } = await params;

    if (!organizerId) {
      return NextResponse.json(
        { error: "Organizer ID is required" },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Verify event belongs to organizer
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .eq("organizer_id", organizerId)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        { error: "Event not found or unauthorized" },
        { status: 404 }
      );
    }

    // Check if DAO is completed
    const { data: questions } = await supabase
      .from("dao_questions")
      .select("id")
      .eq("event_id", id);

    const { data: votes } = await supabase
      .from("dao_votes")
      .select("investor_id")
      .eq("event_id", id);

    const { data: investors } = await supabase
      .from("investments")
      .select("investor_id")
      .eq("event_id", id)
      .eq("status", "confirmed");

    const totalQuestions = questions?.length || 0;
    const totalInvestors = new Set(investors?.map((i: any) => i.investor_id)).size;
    const totalVotes = votes?.length || 0;
    const expectedVotes = totalQuestions * totalInvestors;

    if (totalVotes < expectedVotes) {
      return NextResponse.json(
        { 
          error: "All investors must complete voting before you can start selling tickets",
          details: {
            totalQuestions,
            totalInvestors,
            votesReceived: totalVotes,
            votesRequired: expectedVotes,
          }
        },
        { status: 400 }
      );
    }

    // Update event to allow ticket sales
    const { data: updatedEvent, error: updateError } = await supabase
      .from("events")
      .update({
        can_sell_tickets: true,
        dao_completed: true,
        selling_started_at: new Date().toISOString(),
        status: "live",
        verified: true,
        chain_verified: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("❌ Error updating event:", updateError);
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    console.log("✅ Event ready for ticket sales:", updatedEvent.id);
    return NextResponse.json({ event: updatedEvent }, { status: 200 });
  } catch (e: any) {
    console.error("❌ Unexpected error in POST /api/events/[id]/start-selling:", e);
    return NextResponse.json(
      { error: e?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}

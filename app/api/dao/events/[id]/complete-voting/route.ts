import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/server";

// POST /api/dao/events/[id]/complete-voting - Complete DAO voting and publish event
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { approved, totalVotes, approvalVotes } = await req.json();
    const { id } = await params;

    if (typeof approved !== "boolean") {
      return NextResponse.json(
        { error: "Approved status is required" },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Verify the event is in dao_voting status
    const { data: event, error: fetchError } = await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !event) {
      console.error("❌ Error fetching event:", fetchError);
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.status !== "dao_voting") {
      return NextResponse.json(
        { error: "Event must be in DAO voting status" },
        { status: 400 }
      );
    }

    let updateData: any = {
      dao_completed: true,
      dao_total_votes: totalVotes,
      dao_approval_votes: approvalVotes,
      dao_voting_completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (approved) {
      // DAO approved - publish the event
      updateData.status = "published";
      updateData.published_at = new Date().toISOString();
    } else {
      // DAO rejected
      updateData.status = "rejected";
      updateData.dao_rejection_reason = "Insufficient DAO votes";
    }

    // Update event
    const { data: updatedEvent, error: updateError } = await supabase
      .from("events")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("❌ Error completing DAO voting:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    const message = approved
      ? "Event published successfully! Tickets can now be sold."
      : "Event rejected by DAO voting.";

    console.log(
      `✅ DAO voting completed for event ${updatedEvent.id}: ${
        approved ? "APPROVED" : "REJECTED"
      }`
    );
    return NextResponse.json(
      {
        event: updatedEvent,
        message,
      },
      { status: 200 }
    );
  } catch (e: any) {
    console.error(
      "❌ Unexpected error in POST /api/dao/events/[id]/complete-voting:",
      e
    );
    return NextResponse.json(
      { error: e?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}

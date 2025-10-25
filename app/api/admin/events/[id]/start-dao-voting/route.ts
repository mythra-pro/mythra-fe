import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/server";

// POST /api/admin/events/[id]/start-dao-voting - Start DAO voting after approval
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { adminId } = await req.json();
    const { id } = await params;

    if (!adminId) {
      return NextResponse.json(
        { error: "Admin ID is required" },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // First, verify the event is approved
    const { data: event, error: fetchError } = await supabase
      .from("events")
      .select("*")
      .eq("id", id)
      .single();

    if (fetchError || !event) {
      console.error("❌ Error fetching event:", fetchError);
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.status !== "approved") {
      return NextResponse.json(
        { error: "Event must be approved before starting DAO voting" },
        { status: 400 }
      );
    }

    // Update event status to dao_voting
    const { data: updatedEvent, error: updateError } = await supabase
      .from("events")
      .update({
        status: "dao_voting",
        dao_voting_started_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("❌ Error starting DAO voting:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    console.log("✅ DAO voting started for event:", updatedEvent.id);
    return NextResponse.json({ event: updatedEvent }, { status: 200 });
  } catch (e: any) {
    console.error(
      "❌ Unexpected error in POST /api/admin/events/[id]/start-dao-voting:",
      e
    );
    return NextResponse.json(
      { error: e?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}

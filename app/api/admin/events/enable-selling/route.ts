import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/server";

// POST /api/admin/events/enable-selling - Enable ticket selling for an event
export async function POST(req: Request) {
  try {
    const { eventId } = await req.json();

    if (!eventId) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Update event to enable ticket selling - following best practice from start-selling endpoint
    const { data: updatedEvent, error: updateError } = await supabase
      .from("events")
      .update({
        can_sell_tickets: true,
        dao_completed: true,
        ticket_sales_started_at: new Date().toISOString(),
        status: "selling_tickets",
        verified: true,
        chain_verified: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", eventId)
      .select()
      .single();

    if (updateError) {
      console.error("❌ Error updating event:", updateError);
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    console.log("✅ Ticket selling enabled for event:", updatedEvent.id);
    return NextResponse.json({ 
      success: true,
      event: updatedEvent,
      message: "Ticket selling enabled successfully"
    }, { status: 200 });
  } catch (e: any) {
    console.error("❌ Unexpected error in POST /api/admin/events/enable-selling:", e);
    return NextResponse.json(
      { error: e?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}

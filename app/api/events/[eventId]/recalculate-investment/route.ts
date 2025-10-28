import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/server";

// POST /api/events/[eventId]/recalculate-investment
// Recalculates and updates the current_investment_amount for an event
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
      .select("id, name, current_investment_amount")
      .eq("id", eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // Get all confirmed investments for this event
    const { data: investments, error: investError } = await supabase
      .from("investments")
      .select("amount_sol")
      .eq("event_id", eventId)
      .eq("status", "confirmed");

    if (investError) {
      return NextResponse.json(
        { error: "Failed to fetch investments" },
        { status: 500 }
      );
    }

    // Calculate total
    const actualTotal = investments?.reduce(
      (sum, inv) => sum + parseFloat(inv.amount_sol.toString()),
      0
    ) || 0;

    // Update event
    const { error: updateError } = await supabase
      .from("events")
      .update({ 
        current_investment_amount: actualTotal,
        updated_at: new Date().toISOString()
      })
      .eq("id", eventId);

    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update event" },
        { status: 500 }
      );
    }

    console.log(`✅ Recalculated investment for event "${event.name}"`);
    console.log(`   Old: ${event.current_investment_amount} SOL`);
    console.log(`   New: ${actualTotal} SOL`);
    console.log(`   Investments: ${investments?.length || 0}`);

    return NextResponse.json({
      success: true,
      eventId,
      eventName: event.name,
      oldAmount: event.current_investment_amount,
      newAmount: actualTotal,
      investmentCount: investments?.length || 0,
      message: `Investment amount updated from ${event.current_investment_amount} to ${actualTotal} SOL`,
    });
  } catch (e: any) {
    console.error("❌ Error recalculating investment:", e);
    return NextResponse.json(
      { error: e?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}

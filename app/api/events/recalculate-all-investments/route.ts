import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/server";

// POST /api/events/recalculate-all-investments
// Recalculates investment amounts for ALL events
export async function POST(req: Request) {
  try {
    const supabase = getServiceSupabase();

    // Get all events
    const { data: events, error: eventsError } = await supabase
      .from("events")
      .select("id, name, current_investment_amount");

    if (eventsError) {
      return NextResponse.json(
        { error: "Failed to fetch events" },
        { status: 500 }
      );
    }

    if (!events || events.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No events to recalculate",
        updated: 0,
      });
    }

    const results = [];
    let updatedCount = 0;

    for (const event of events) {
      // Get all confirmed investments for this event
      const { data: investments, error: investError } = await supabase
        .from("investments")
        .select("amount_sol")
        .eq("event_id", event.id)
        .eq("status", "confirmed");

      if (investError) {
        console.error(`❌ Failed to fetch investments for ${event.name}:`, investError);
        results.push({
          eventId: event.id,
          eventName: event.name,
          success: false,
          error: investError.message,
        });
        continue;
      }

      // Calculate total
      const actualTotal = investments?.reduce(
        (sum, inv) => sum + parseFloat(inv.amount_sol.toString()),
        0
      ) || 0;

      // Only update if different
      if (actualTotal !== event.current_investment_amount) {
        const { error: updateError } = await supabase
          .from("events")
          .update({ 
            current_investment_amount: actualTotal,
            updated_at: new Date().toISOString()
          })
          .eq("id", event.id);

        if (updateError) {
          console.error(`❌ Failed to update ${event.name}:`, updateError);
          results.push({
            eventId: event.id,
            eventName: event.name,
            success: false,
            error: updateError.message,
          });
        } else {
          updatedCount++;
          console.log(`✅ ${event.name}: ${event.current_investment_amount} → ${actualTotal} SOL`);
          results.push({
            eventId: event.id,
            eventName: event.name,
            success: true,
            oldAmount: event.current_investment_amount,
            newAmount: actualTotal,
            investmentCount: investments?.length || 0,
          });
        }
      } else {
        results.push({
          eventId: event.id,
          eventName: event.name,
          success: true,
          unchanged: true,
          amount: actualTotal,
          investmentCount: investments?.length || 0,
        });
      }
    }

    console.log(`\n📊 Recalculation Summary:`);
    console.log(`   Total Events: ${events.length}`);
    console.log(`   Updated: ${updatedCount}`);
    console.log(`   Unchanged: ${events.length - updatedCount}`);

    return NextResponse.json({
      success: true,
      message: `Recalculated ${events.length} events, updated ${updatedCount}`,
      totalEvents: events.length,
      updated: updatedCount,
      unchanged: events.length - updatedCount,
      results,
    });
  } catch (e: any) {
    console.error("❌ Error recalculating all investments:", e);
    return NextResponse.json(
      { error: e?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}

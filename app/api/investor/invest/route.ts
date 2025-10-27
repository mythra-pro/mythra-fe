import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/server";

/**
 * POST /api/investor/invest
 * Submit investment for an event
 * Body: { eventId, investorId, amountInSOL }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { eventId, investorId, amountInSOL } = body;

    console.log("💰 Investment submission");
    console.log("   Event ID:", eventId);
    console.log("   Investor ID:", investorId);
    console.log("   Amount (SOL):", amountInSOL);

    if (!eventId || !investorId || !amountInSOL) {
      return NextResponse.json(
        { error: "Event ID, investor ID, and amount are required" },
        { status: 400 }
      );
    }

    if (amountInSOL <= 0) {
      return NextResponse.json(
        { error: "Investment amount must be greater than 0" },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Step 1: Verify event exists and is published
    console.log("🔍 Verifying event...");
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, title, status, target_investment, current_investment, organizer_id")
      .eq("id", eventId)
      .maybeSingle();

    if (eventError) {
      console.error("❌ Error fetching event:", eventError.message);
      return NextResponse.json(
        { error: "Failed to fetch event" },
        { status: 500 }
      );
    }

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    if (event.status !== "published") {
      return NextResponse.json(
        { error: "Event is not available for investment" },
        { status: 400 }
      );
    }

    console.log("✅ Event verified:", event.title);

    // Step 2: Verify investor exists
    console.log("🔍 Verifying investor...");
    const { data: investor, error: investorError } = await supabase
      .from("users")
      .select("id, email, display_name")
      .eq("id", investorId)
      .maybeSingle();

    if (investorError) {
      console.error("❌ Error fetching investor:", investorError.message);
      return NextResponse.json(
        { error: "Failed to fetch investor" },
        { status: 500 }
      );
    }

    if (!investor) {
      return NextResponse.json(
        { error: "Investor not found" },
        { status: 404 }
      );
    }

    console.log("✅ Investor verified:", investor.email);

    // Step 3: Create investment record
    console.log("📝 Creating investment record...");
    
    const { data: investment, error: investmentError } = await supabase
      .from("investments")
      .insert({
        event_id: eventId,
        investor_id: investorId,
        amount_sol: amountInSOL,
        amount_usd: amountInSOL * 150, // Mock: 1 SOL = $150
        status: "pending", // pending, confirmed, completed
        transaction_hash: null,
        created_at: new Date().toISOString(),
      })
      .select("id, event_id, investor_id, amount_sol, amount_usd, status, created_at")
      .single();

    if (investmentError) {
      console.error("❌ Error creating investment:", investmentError.message);
      return NextResponse.json(
        { error: "Failed to create investment: " + investmentError.message },
        { status: 500 }
      );
    }

    console.log("✅ Investment created:", investment.id);

    // Step 4: Update event's current_investment
    const currentInvestment = (event.current_investment || 0) + amountInSOL;
    console.log("📊 Updating event investment total to:", currentInvestment);

    const { error: updateError } = await supabase
      .from("events")
      .update({
        current_investment: currentInvestment,
        updated_at: new Date().toISOString(),
      })
      .eq("id", eventId);

    if (updateError) {
      console.warn("⚠️ Failed to update event investment total:", updateError.message);
      // Don't fail - investment is created
    }

    console.log("✅ Investment successful!");
    console.log("   Investment ID:", investment.id);
    console.log("   Amount: ", amountInSOL, "SOL");

    return NextResponse.json(
      {
        success: true,
        message: "Investment submitted successfully",
        investment: {
          id: investment.id,
          eventId: investment.event_id,
          investorId: investment.investor_id,
          amountInSOL: investment.amount_sol,
          amountInUSD: investment.amount_usd,
          status: investment.status,
          createdAt: investment.created_at,
        },
      },
      { status: 201 }
    );
  } catch (e: any) {
    console.error("❌ Error in POST /api/investor/invest:", e);
    console.error("   Stack:", e.stack);
    return NextResponse.json(
      { error: e?.message || "Investment failed" },
      { status: 500 }
    );
  }
}

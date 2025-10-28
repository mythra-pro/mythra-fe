import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/server";

// GET /api/investments?eventId=xxx - Get all investments for an event
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");
    const investorId = searchParams.get("investorId");

    const supabase = getServiceSupabase();

    let query = supabase
      .from("investments")
      .select("*, investor:users!investments_investor_id_fkey(id, display_name, wallet_address)");

    if (eventId) {
      query = query.eq("event_id", eventId);
    }

    if (investorId) {
      query = query.eq("investor_id", investorId);
    }

    query = query.order("investment_date", { ascending: false });

    const { data: investments, error } = await query;

    if (error) {
      console.error("❌ Error fetching investments:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    console.log("✅ Investments fetched:", investments?.length || 0);
    return NextResponse.json({ investments }, { status: 200 });
  } catch (e: any) {
    console.error("❌ Unexpected error in GET /api/investments:", e);
    return NextResponse.json(
      { error: e?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}

// POST /api/investments - Create a new investment
export async function POST(req: Request) {
  try {
    const { eventId, investorId, investorWallet, amountSol, transactionSignature } = await req.json();

    if (!eventId || !investorId || !investorWallet || !amountSol) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Validate investor exists
    const { data: investor, error: investorError } = await supabase
      .from("users")
      .select("id")
      .eq("id", investorId)
      .single();

    if (investorError || !investor) {
      console.error("❌ Investor not found:", investorId);
      return NextResponse.json(
        { error: "Investor not found. Please ensure the user exists." },
        { status: 404 }
      );
    }

    // Validate event exists and get vault cap + status
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, vault_cap, status")
      .eq("id", eventId)
      .single();

    if (eventError || !event) {
      console.error("❌ Event not found:", eventId);
      return NextResponse.json(
        { error: "Event not found." },
        { status: 404 }
      );
    }

    // Validate event status - must be in investment_window or dao_process to accept investments
    const validInvestmentStatuses = [
      "investment_window", 
      "dao_process",
      // Legacy statuses (backwards compatibility)
      "approved", 
      "dao_voting"
    ];
    
    if (!validInvestmentStatuses.includes(event.status)) {
      console.error("❌ Event not eligible for investments. Status:", event.status);
      return NextResponse.json(
        { error: `Event is not accepting investments. Must be in investment window or DAO process. Current status: '${event.status}'` },
        { status: 400 }
      );
    }

    // Check vault cap (ALWAYS REQUIRED - every event must have a vault cap)
    if (!event.vault_cap || event.vault_cap <= 0) {
      console.error("❌ Event has invalid vault cap:", event.vault_cap);
      return NextResponse.json(
        { error: "Event configuration error: Invalid vault cap." },
        { status: 500 }
      );
    }

    // Calculate total invested so far
    const { data: existingInvestments, error: investError } = await supabase
      .from("investments")
      .select("amount_sol")
      .eq("event_id", eventId)
      .eq("status", "confirmed");

    if (investError) {
      console.error("❌ Error checking investments:", investError);
      return NextResponse.json(
        { error: "Failed to check vault capacity" },
        { status: 500 }
      );
    }

    const totalInvested = existingInvestments?.reduce(
      (sum, inv) => sum + parseFloat(inv.amount_sol.toString()),
      0
    ) || 0;

    const remaining = event.vault_cap - totalInvested;

    if (amountSol > remaining) {
      console.error("❌ Investment exceeds vault capacity");
      return NextResponse.json(
        { 
          error: `Investment exceeds vault capacity. Only ${remaining.toFixed(2)} SOL available (Vault: ${totalInvested.toFixed(2)}/${event.vault_cap} SOL)`,
          remaining,
          vaultCap: event.vault_cap,
          totalInvested
        },
        { status: 400 }
      );
    }

    if (remaining <= 0) {
      console.error("❌ Vault is full");
      return NextResponse.json(
        { error: "Vault is full. No more investments can be accepted." },
        { status: 400 }
      );
    }

    console.log(`✅ Vault capacity check passed: ${totalInvested + amountSol}/${event.vault_cap} SOL`);

    // Check if investor has already invested in this event (ONE INVESTMENT PER EVENT)
    const { data: existingInvestment, error: checkError } = await supabase
      .from("investments")
      .select("id")
      .eq("event_id", eventId)
      .eq("investor_id", investorId)
      .single();

    if (existingInvestment) {
      console.error("❌ Investor already invested in this event:", investorId);
      return NextResponse.json(
        { error: "You have already invested in this event. Each investor can only invest once per event." },
        { status: 400 }
      );
    }

    // Insert investment
    const { data: investment, error } = await supabase
      .from("investments")
      .insert({
        event_id: eventId,
        investor_id: investorId,
        investor_wallet: investorWallet,
        amount_sol: amountSol,
        transaction_signature: transactionSignature,
        investment_date: new Date().toISOString(),
        status: "confirmed",
      })
      .select()
      .single();

    if (error) {
      console.error("❌ Error creating investment:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Update event's current_investment_amount
    const newTotal = totalInvested + amountSol;
    const { error: updateError } = await supabase
      .from("events")
      .update({ 
        current_investment_amount: newTotal,
        updated_at: new Date().toISOString()
      })
      .eq("id", eventId);

    if (updateError) {
      console.error("⚠️ Warning: Failed to update event investment total:", updateError);
      // Don't fail the investment, just log the warning
    } else {
      console.log(`✅ Event investment total updated: ${newTotal} SOL (was ${totalInvested})`);
    }

    console.log("✅ Investment created:", investment.id);
    return NextResponse.json({ investment }, { status: 201 });
  } catch (e: any) {
    console.error("❌ Unexpected error in POST /api/investments:", e);
    return NextResponse.json(
      { error: e?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}

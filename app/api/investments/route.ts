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

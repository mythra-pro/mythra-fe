import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/v2/tickets
 * Query params:
 *   - owner: wallet_address (gets all tickets for this buyer)
 *   - eventId: UUID (gets all tickets for this event)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const ownerWallet = searchParams.get("owner");
  const eventId = searchParams.get("eventId");

  try {
    let query = supabase
      .from("tickets")
      .select(`
        *,
        tier:ticket_tiers(*),
        event:events(*),
        buyer:users(id, wallet_address, display_name)
      `);

    // Filter by owner wallet
    if (ownerWallet) {
      // First get user ID from wallet
      const { data: user } = await supabase
        .from("users")
        .select("id")
        .eq("wallet_address", ownerWallet)
        .single();

      if (!user) {
        return NextResponse.json({ tickets: [] });
      }

      query = query.eq("buyer_id", user.id);
    }

    // Filter by event
    if (eventId) {
      query = query.eq("event_id", eventId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ tickets: data || [] });
  } catch (error: any) {
    console.error("Error fetching tickets:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/v2/tickets
 * Body: { eventId, tierId, buyerWallet, mintPubkey, txHash, amount }
 * Creates a ticket AND transaction record
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, tierId, buyerWallet, mintPubkey, txHash, amount } = body;

    if (!eventId || !tierId || !buyerWallet || !mintPubkey) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get or create buyer
    let { data: buyer } = await supabase
      .from("users")
      .select("id")
      .eq("wallet_address", buyerWallet)
      .single();

    if (!buyer) {
      const { data: newBuyer, error: userError } = await supabase
        .from("users")
        .insert({ wallet_address: buyerWallet })
        .select()
        .single();

      if (userError) throw userError;
      buyer = newBuyer;
    }

    // Create ticket
    const { data: ticket, error: ticketError } = await supabase
      .from("tickets")
      .insert({
        event_id: eventId,
        tier_id: tierId,
        buyer_id: buyer.id,
        mint_pubkey: mintPubkey,
        tx_hash: txHash,
        status: "unused",
      })
      .select()
      .single();

    if (ticketError) throw ticketError;

    // Create transaction record
    if (txHash && amount) {
      await supabase.from("transactions").insert({
        ticket_id: ticket.id,
        buyer_id: buyer.id,
        event_id: eventId,
        tx_hash: txHash,
        amount: amount,
        status: "confirmed",
        on_chain: true,
      });
    }

    // Update tier sold count
    await supabase.rpc("increment", {
      table_name: "ticket_tiers",
      row_id: tierId,
      column_name: "supply_sold",
    });

    return NextResponse.json({ ticket }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating ticket:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

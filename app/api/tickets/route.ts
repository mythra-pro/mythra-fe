import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/server";

// GET /api/tickets?owner=xxx OR ?eventId=xxx - Get tickets
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const owner = searchParams.get("owner"); // wallet address
    const eventId = searchParams.get("eventId");

    const supabase = getServiceSupabase();

    if (owner) {
      // Get user by wallet address, then get their tickets
      const { data: user } = await supabase
        .from("users")
        .select("id")
        .eq("wallet_address", owner)
        .single();

      if (!user) {
        console.log("⚠️ User not found for wallet:", owner);
        return NextResponse.json({ tickets: [] }, { status: 200 });
      }

      const { data: tickets, error } = await supabase
        .from("tickets")
        .select("*")
        .eq("buyer_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Error fetching tickets:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      console.log(`✅ Tickets fetched for ${owner}: ${tickets?.length || 0}`);
      return NextResponse.json({ tickets: tickets || [] }, { status: 200 });
    } else if (eventId) {
      const { data: tickets, error } = await supabase
        .from("tickets")
        .select("*")
        .eq("event_id", eventId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("❌ Error fetching tickets:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      console.log(`✅ Tickets fetched for event: ${tickets?.length || 0}`);
      return NextResponse.json({ tickets: tickets || [] }, { status: 200 });
    } else {
      return NextResponse.json(
        { error: "owner or eventId parameter required" },
        { status: 400 }
      );
    }
  } catch (e: any) {
    console.error("❌ Unexpected error in GET /api/tickets:", e);
    return NextResponse.json(
      { error: e?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}

// POST /api/tickets - Purchase a ticket
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      eventId,
      tierId,
      buyerWallet,  // Changed from ownerWallet
      quantity = 1,
    } = body;

    console.log("🎫 Ticket purchase request:", {
      eventId,
      buyerWallet,
      quantity
    });

    if (!eventId || !buyerWallet) {
      console.error("❌ Missing required fields:", { eventId, buyerWallet });
      return NextResponse.json(
        { error: "Missing required fields: eventId, buyerWallet" },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // 1. Upsert buyer to get buyer_id
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("wallet_address", buyerWallet)
      .single();

    let buyerId = existingUser?.id;

    if (!buyerId) {
      // Create new user
      const { data: newUser, error: userError } = await supabase
        .from("users")
        .insert({
          wallet_address: buyerWallet,
          display_name: buyerWallet.split("@")[0] || "Customer",
        })
        .select("id")
        .single();

      if (userError || !newUser) {
        console.error("❌ Failed to create user:", userError);
        return NextResponse.json(
          { error: "Failed to create user" },
          { status: 500 }
        );
      }

      buyerId = newUser.id;
    }

    console.log("✅ Buyer ID:", buyerId);

    // 2. Validate event exists and can sell tickets
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("id, name, status, can_sell_tickets, max_tickets")
      .eq("id", eventId)
      .single();

    if (eventError || !event) {
      console.error("❌ Event not found:", eventId);
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      );
    }

    // Check if event can sell tickets
    const canSell = 
      event.status === "live" || 
      event.status === "selling_tickets" || 
      event.status === "waiting_for_event" ||
      event.status === "event_running" ||
      event.can_sell_tickets === true;
    
    if (!canSell) {
      return NextResponse.json(
        { error: "This event is not currently selling tickets" },
        { status: 400 }
      );
    }

    // 3. Check available tickets
    const { data: soldTickets } = await supabase
      .from("tickets")
      .select("id")
      .eq("event_id", eventId);

    const soldCount = soldTickets?.length || 0;
    const available = event.max_tickets - soldCount;

    if (available < quantity) {
      return NextResponse.json(
        { 
          error: `Only ${available} ticket(s) available`,
          available,
          requested: quantity
        },
        { status: 400 }
      );
    }

    // 4. Create tickets with proper schema
    const tickets = [];
    
    for (let i = 0; i < quantity; i++) {
      // Generate unique mint pubkey (simplified for now)
      const mintPubkey = `MINT_${eventId}_${buyerId}_${Date.now()}_${i}_${Math.random().toString(36).substring(2, 15)}`;
      
      const ticketData = {
        event_id: eventId,
        tier_id: tierId || null,
        buyer_id: buyerId,
        mint_pubkey: mintPubkey,
        onchain_ticket_pda: null,
        used: false,
        used_at: null,
        tx_hash: null,
        status: "unused",
      };

      const { data: ticket, error: ticketError } = await supabase
        .from("tickets")
        .insert(ticketData)
        .select()
        .single();

      if (ticketError) {
        console.error("❌ Error creating ticket:", ticketError);
        // Rollback: delete previously created tickets
        if (tickets.length > 0) {
          await supabase
            .from("tickets")
            .delete()
            .in("id", tickets.map(t => t.id));
        }
        return NextResponse.json(
          { error: ticketError.message },
          { status: 500 }
        );
      }

      tickets.push(ticket);
    }

    console.log(`✅ ${tickets.length} ticket(s) created for event:`, eventId);
    return NextResponse.json({ 
      tickets,
      message: `Successfully purchased ${tickets.length} ticket(s)!`
    }, { status: 201 });
  } catch (e: any) {
    console.error("❌ Unexpected error in POST /api/tickets:", e);
    return NextResponse.json(
      { error: e?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}

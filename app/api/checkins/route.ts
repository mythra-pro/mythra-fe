import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/server";

// GET /api/checkins?eventId=xxx OR ?staffId=xxx - Get check-ins
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");
    const staffId = searchParams.get("staffId");

    const supabase = getServiceSupabase();

    let query = supabase
      .from("checkins")
      .select(`
        *,
        ticket:tickets(*),
        event:events(name, venue),
        staff:users(display_name, wallet_address)
      `);

    if (eventId) {
      query = query.eq("event_id", eventId);
    } else if (staffId) {
      query = query.eq("staff_id", staffId);
    } else {
      return NextResponse.json(
        { error: "eventId or staffId parameter required" },
        { status: 400 }
      );
    }

    query = query.order("checked_in_at", { ascending: false });

    const { data: checkins, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ checkins }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}

function isUuid(v: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    v
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      ticketId,
      eventId,
      checkInDate,
      walletSignature,
      location,
    } = body as {
      ticketId: string;
      eventId?: string;
      checkInDate: string | Date;
      walletSignature?: string;
      location?: string | null;
    };

    if (!ticketId) {
      return NextResponse.json({ ok: false, reason: "Missing ticketId" }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    let ticketRow: any | null = null;

    if (isUuid(ticketId)) {
      const { data, error } = await supabase
        .from("tickets")
        .select("id,event_id,used,status")
        .eq("id", ticketId)
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      ticketRow = data;
    } else {
      const { data, error } = await supabase
        .from("tickets")
        .select("id,event_id,used,status")
        .eq("mint_pubkey", ticketId)
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      ticketRow = data;
    }

    if (!ticketRow) {
      return NextResponse.json({ ok: false, reason: "Ticket not found" }, { status: 404 });
    }

    if (ticketRow.used || ticketRow.status === "used") {
      return NextResponse.json({ ok: false, reason: "Ticket already used" }, { status: 409 });
    }

    if (eventId && isUuid(eventId) && ticketRow.event_id !== eventId) {
      return NextResponse.json(
        { ok: false, reason: "Ticket does not belong to this event" },
        { status: 400 }
      );
    }

    let staffId: string | null = null;
    const wallet = req.headers.get("x-wallet-address")?.trim();
    if (wallet) {
      const { data: staff } = await supabase
        .from("users")
        .select("id")
        .eq("wallet_address", wallet)
        .limit(1);
      if (staff && staff.length > 0) staffId = staff[0].id;
    }

    const when = typeof checkInDate === "string" ? checkInDate : new Date(checkInDate).toISOString();

    const { error: updateErr } = await supabase
      .from("tickets")
      .update({ used: true, used_at: when, status: "used" })
      .eq("id", ticketRow.id);
    if (updateErr) throw updateErr;

    const { error: insertErr } = await supabase.from("checkins").insert({
      ticket_id: ticketRow.id,
      staff_id: staffId,
      event_id: ticketRow.event_id,
      signature: walletSignature || null,
      location: location || null,
      verified_on_chain: false,
    });
    if (insertErr) throw insertErr;

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, reason: e?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}

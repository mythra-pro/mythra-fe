import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/server";

// GET /api/tickets?owner=xxx OR ?eventId=xxx - Get tickets
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const owner = searchParams.get("owner"); // wallet address
    const eventId = searchParams.get("eventId");

    const supabase = getServiceSupabase();

    let query = supabase
      .from("tickets")
      .select(`
        *,
        ticket_tier:ticket_tiers(
          *,
          event:events(*)
        )
      `);

    if (owner) {
      query = query.eq("owner_wallet", owner);
    } else if (eventId) {
      query = query.eq("ticket_tier.event_id", eventId);
    } else {
      return NextResponse.json(
        { error: "owner or eventId parameter required" },
        { status: 400 }
      );
    }

    query = query.order("created_at", { ascending: false });

    const { data: tickets, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ tickets }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}

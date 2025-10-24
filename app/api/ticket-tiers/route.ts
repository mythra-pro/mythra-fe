import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/server";

// GET /api/ticket-tiers?eventId=xxx - Get ticket tiers by event
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json(
        { error: "eventId is required" },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    const { data: tiers, error } = await supabase
      .from("ticket_tiers")
      .select("*")
      .eq("event_id", eventId)
      .order("price", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ tiers }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}

// POST /api/ticket-tiers - Create ticket tier
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { eventId, name, description, price, supplyMax } = body;

    if (!eventId || !name || price === undefined || !supplyMax) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    const { data: tier, error } = await supabase
      .from("ticket_tiers")
      .insert({
        event_id: eventId,
        name,
        description: description || null,
        price,
        supply_max: supplyMax,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ tier }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}

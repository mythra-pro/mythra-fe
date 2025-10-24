import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/server";

// GET /api/events - Get all events with optional filters
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status"); // draft, published, cancelled
    const organizerId = searchParams.get("organizerId");
    const category = searchParams.get("category");

    const supabase = getServiceSupabase();

    let query = supabase
      .from("events")
      .select("*, organizer:users(id, display_name, wallet_address)");

    // Apply filters
    if (status) query = query.eq("status", status);
    if (organizerId) query = query.eq("organizer_id", organizerId);
    if (category) query = query.eq("category", category);

    // Order by start_time descending
    query = query.order("start_time", { ascending: false });

    const { data: events, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ events }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      description,
      date,
      endDate,
      location,
      priceInSOL,
      maxTickets,
      category,
    } = body as {
      name: string;
      description?: string;
      date: string;
      endDate?: string | null;
      location: string;
      priceInSOL: number;
      maxTickets: number;
      category?: string;
    };

    if (!name || !date || !location || !maxTickets || !priceInSOL) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    const desiredSlug = slugify(name);
    let finalSlug = desiredSlug;
    // Ensure unique slug
    const { data: existing } = await supabase
      .from("events")
      .select("id")
      .eq("slug", desiredSlug)
      .limit(1);
    if (existing && existing.length > 0) {
      finalSlug = `${desiredSlug}-${Date.now().toString(36)}`;
    }

    // Optional: organizer via wallet header
    const wallet = req.headers.get("x-wallet-address")?.trim();
    let organizerId: string | null = null;
    if (wallet) {
      const { data: users } = await supabase
        .from("users")
        .select("id")
        .eq("wallet_address", wallet)
        .limit(1);
      organizerId = users && users.length > 0 ? users[0].id : null;
    }

    const { data: eventRows, error: eventErr } = await supabase
      .from("events")
      .insert({
        name,
        slug: finalSlug,
        description: description || null,
        venue: location,
        category: category || null,
        start_time: new Date(date).toISOString(),
        end_time: endDate ? new Date(endDate).toISOString() : null,
        max_tickets: maxTickets,
        organizer_id: organizerId,
        status: "draft",
      })
      .select("id")
      .limit(1);

    if (eventErr || !eventRows || eventRows.length === 0) {
      return NextResponse.json(
        { error: eventErr?.message || "Failed to create event" },
        { status: 500 }
      );
    }

    const eventId = eventRows[0].id as string;

    // Create default ticket tier
    const { error: tierErr } = await supabase.from("ticket_tiers").insert({
      event_id: eventId,
      name: "General Admission",
      price: priceInSOL,
      supply_max: maxTickets,
      description: "Default ticket tier",
    });

    if (tierErr) {
      return NextResponse.json(
        { error: tierErr.message || "Failed to create ticket tier" },
        { status: 500 }
      );
    }

    return NextResponse.json({ id: eventId }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}

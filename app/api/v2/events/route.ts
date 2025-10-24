import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/v2/events
 * Query params:
 *   - status: draft | live | completed | cancelled
 *   - organizerId: UUID
 *   - category: string
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const organizerId = searchParams.get("organizerId");
  const category = searchParams.get("category");

  try {
    let query = supabase
      .from("events")
      .select(`
        *,
        organizer:users!organizer_id(id, wallet_address, display_name),
        ticket_tiers(*)
      `)
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }

    if (organizerId) {
      query = query.eq("organizer_id", organizerId);
    }

    if (category) {
      query = query.eq("category", category);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ events: data || [] });
  } catch (error: any) {
    console.error("Error fetching events:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/v2/events
 * Body: { name, description, venue, startTime, endTime, maxTickets, category, bannerUrl, tiers }
 * Headers: x-wallet-address (organizer wallet)
 */
export async function POST(request: NextRequest) {
  try {
    const walletAddress = request.headers.get("x-wallet-address");
    if (!walletAddress) {
      return NextResponse.json(
        { error: "Wallet address required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      venue,
      startTime,
      endTime,
      maxTickets,
      category,
      bannerUrl,
      tiers = [],
    } = body;

    if (!name || !venue || !startTime || !maxTickets) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get or create user
    let { data: user } = await supabase
      .from("users")
      .select("id")
      .eq("wallet_address", walletAddress)
      .single();

    if (!user) {
      const { data: newUser, error: userError } = await supabase
        .from("users")
        .insert({ wallet_address: walletAddress })
        .select()
        .single();

      if (userError) throw userError;
      user = newUser;
    }

    if (!user) {
      return NextResponse.json(
        { error: "Failed to get or create user" },
        { status: 500 }
      );
    }

    // Generate slug
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") +
      "-" +
      Date.now();

    // Create event
    const { data: event, error: eventError } = await supabase
      .from("events")
      .insert({
        organizer_id: user.id,
        name,
        slug,
        description,
        venue,
        start_time: startTime,
        end_time: endTime,
        banner_url: bannerUrl,
        category,
        max_tickets: maxTickets,
        status: "draft",
      })
      .select()
      .single();

    if (eventError) throw eventError;

    // Create ticket tiers if provided
    if (tiers.length > 0) {
      const tiersToInsert = tiers.map((tier: any) => ({
        event_id: event.id,
        name: tier.name,
        price: tier.price,
        supply_max: tier.supply,
        description: tier.description,
      }));

      await supabase.from("ticket_tiers").insert(tiersToInsert);
    }

    // Assign organizer role for this event
    const { data: organizerRole } = await supabase
      .from("roles")
      .select("id")
      .eq("name", "organizer")
      .single();

    if (organizerRole) {
      await supabase.from("user_roles").insert({
        user_id: user.id,
        role_id: organizerRole.id,
        context_type: "event",
        context_id: event.id,
        status: "active",
      });
    }

    return NextResponse.json({ event }, { status: 201 });
  } catch (error: any) {
    console.error("Error creating event:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

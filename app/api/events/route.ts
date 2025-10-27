import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/server";

// GET /api/events - Get all events with optional filters
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    // Status filter: pending_approval, approved, dao_voting, published, live, completed, cancelled, rejected
    const status = searchParams.get("status");
    const organizerId = searchParams.get("organizerId");
    const category = searchParams.get("category");
    const verified = searchParams.get("verified"); // true/false
    const chainVerified = searchParams.get("chain_verified"); // true/false

    console.log("📝 GET /api/events - Query params:", {
      status,
      organizerId,
      category,
      verified,
      chainVerified,
    });

    const supabase = getServiceSupabase();

    let query = supabase
      .from("events")
      .select(
        "*, organizer:users!events_organizer_id_fkey(id, display_name, wallet_address)"
      );

    // Apply filters
    if (status) {
      console.log("🔍 Filtering by status:", status);
      // Support multiple statuses separated by commas
      const statuses = status.split(",").map((s) => s.trim());
      if (statuses.length === 1) {
        query = query.eq("status", statuses[0]);
      } else {
        query = query.in("status", statuses);
      }
    }
    if (organizerId) {
      console.log("🔍 Filtering by organizerId:", organizerId);
      query = query.eq("organizer_id", organizerId);
    }
    if (category) {
      console.log("🔍 Filtering by category:", category);
      query = query.eq("category", category);
    }
    if (verified === "true") {
      console.log("🔍 Filtering by verified=true");
      query = query.eq("verified", true);
    }
    if (verified === "false") {
      console.log("🔍 Filtering by verified=false");
      query = query.eq("verified", false);
    }
    if (chainVerified === "true") {
      console.log("🔍 Filtering by chain_verified=true");
      query = query.eq("chain_verified", true);
    }
    if (chainVerified === "false") {
      console.log("🔍 Filtering by chain_verified=false");
      query = query.eq("chain_verified", false);
    }

    // Order by start_time descending
    query = query.order("start_time", { ascending: false });

    const { data: events, error } = await query;

    if (error) {
      console.error("❌ Error fetching events:", error);
      return NextResponse.json(
        { error: error.message, details: error },
        { status: 500 }
      );
    }

    console.log("✅ Events fetched:", events?.length || 0);
    if (events && events.length > 0) {
      console.log("📊 First event:", events[0]);
    }
    return NextResponse.json({ events }, { status: 200 });
  } catch (e: any) {
    console.error("❌ Unexpected error in GET /api/events:", e);
    return NextResponse.json(
      { error: e?.message || "Unexpected error", details: e },
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
    console.log("📝 [POST /api/events] Received request");

    const body = await req.json();
    console.log("📋 Request body:", body);

    const {
      name,
      description,
      date,
      endDate,
      location,
      priceInSOL,
      maxTickets,
      category,
      status,
    } = body as {
      name: string;
      description?: string;
      date: string;
      endDate?: string | null;
      location: string;
      priceInSOL: number;
      maxTickets: number;
      category?: string;
      status?: string;
    };

    // Validate required fields
    if (
      !name ||
      !date ||
      !location ||
      !maxTickets ||
      priceInSOL === undefined
    ) {
      console.error("❌ Missing required fields:", {
        name: !!name,
        date: !!date,
        location: !!location,
        maxTickets: !!maxTickets,
        priceInSOL: priceInSOL !== undefined,
      });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();
    console.log("✅ Supabase client created");

    const desiredSlug = slugify(name);
    let finalSlug = desiredSlug;

    // Ensure unique slug
    const { data: existing, error: slugError } = await supabase
      .from("events")
      .select("id")
      .eq("slug", desiredSlug)
      .limit(1);

    if (slugError) {
      console.error("❌ Error checking slug:", slugError);
    }

    if (existing && existing.length > 0) {
      finalSlug = `${desiredSlug}-${Date.now().toString(36)}`;
      console.log("🔄 Slug collision detected, using:", finalSlug);
    }

    // Get organizer via wallet header
    const wallet = req.headers.get("x-wallet-address")?.trim();
    
    if (!wallet) {
      console.error("❌ No wallet address provided in headers");
      return NextResponse.json(
        { error: "Wallet address is required. Please connect your wallet." },
        { status: 401 }
      );
    }

    console.log("🔍 Looking up organizer for wallet:", wallet);
    
    // Get or create user - ensures user exists before creating event
    let { data: user } = await supabase
      .from("users")
      .select("id")
      .eq("wallet_address", wallet)
      .single();

    if (!user) {
      console.log("👤 User not found, creating new user...");
      const { data: newUser, error: userError } = await supabase
        .from("users")
        .insert({ 
          wallet_address: wallet,
          civic_auth_verified: false,
          reputation_score: 0,
        })
        .select("id")
        .single();

      if (userError) {
        console.error("❌ Error creating user:", userError);
        return NextResponse.json(
          { error: "Failed to create user: " + userError.message },
          { status: 500 }
        );
      }
      
      user = newUser;
      console.log("✅ New user created:", user?.id);
    }

    if (!user || !user.id) {
      console.error("❌ Failed to get or create user");
      return NextResponse.json(
        { error: "Failed to get or create user. Please try again." },
        { status: 500 }
      );
    }

    const organizerId = user.id;
    console.log("👤 Organizer ID:", organizerId);

    // Insert event
    console.log("📝 Inserting event with data:", {
      name,
      slug: finalSlug,
      venue: location,
      category,
      start_time: new Date(date).toISOString(),
      end_time: endDate ? new Date(endDate).toISOString() : null,
      max_tickets: maxTickets,
      organizer_id: organizerId,
      status: status || "pending_approval", // Use provided status or default to pending_approval
    });

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
        status: status || "pending_approval", // Use provided status or default to pending_approval
      })
      .select("*")
      .single();

    if (eventErr) {
      console.error("❌ Error inserting event:", eventErr);
      return NextResponse.json(
        { error: eventErr.message || "Failed to create event" },
        { status: 500 }
      );
    }

    if (!eventRows) {
      console.error("❌ No event data returned from insert");
      return NextResponse.json(
        { error: "Failed to create event - no data returned" },
        { status: 500 }
      );
    }

    const eventId = eventRows.id as string;
    console.log("✅ Event created with ID:", eventId);
    console.log("📊 Event data:", eventRows);

    // Create default ticket tier
    console.log("🎫 Creating ticket tier for event:", eventId);
    const { data: tierData, error: tierErr } = await supabase
      .from("ticket_tiers")
      .insert({
        event_id: eventId,
        name: "General Admission",
        price: priceInSOL,
        supply_max: maxTickets,
        description: "Default ticket tier",
      })
      .select("*")
      .single();

    if (tierErr) {
      console.error("❌ Error creating ticket tier:", tierErr);
      return NextResponse.json(
        { error: tierErr.message || "Failed to create ticket tier" },
        { status: 500 }
      );
    }

    console.log("✅ Ticket tier created successfully:", tierData);
    return NextResponse.json(
      {
        success: true,
        event: eventRows,
        ticketTier: tierData,
      },
      { status: 201 }
    );
  } catch (e: any) {
    console.error("❌ Unexpected error in POST /api/events:", e);
    return NextResponse.json(
      { error: e?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}

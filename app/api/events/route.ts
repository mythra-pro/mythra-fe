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

    // Validate required fields
    if (!name || !date || !location || !maxTickets || priceInSOL === undefined) {
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
    let organizerId: string | null = null;
    
    if (wallet) {
      console.log("🔍 Looking up organizer for wallet:", wallet);
      const { data: users, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("wallet_address", wallet)
        .limit(1);
      
      if (userError) {
        console.error("❌ Error fetching user:", userError);
      }
      
      organizerId = users && users.length > 0 ? users[0].id : null;
      console.log("👤 Organizer ID:", organizerId);
    } else {
      console.warn("⚠️ No wallet address provided in headers");
    }

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
      status: "draft",
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
        status: "draft",
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
    const { data: tierData, error: tierErr } = await supabase.from("ticket_tiers").insert({
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
    return NextResponse.json({ 
      success: true,
      event: eventRows,
      ticketTier: tierData
    }, { status: 201 });
  } catch (e: any) {
    console.error("❌ Unexpected error in POST /api/events:", e);
    return NextResponse.json(
      { error: e?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}

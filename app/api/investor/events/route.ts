import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/server";

/**
 * GET /api/investor/events
 * Fetch all publishable events for investor to invest in
 * Returns events with status "published"
 */
export async function GET(req: Request) {
  try {
    const supabase = getServiceSupabase();

    console.log("📋 Fetching publishable events for investor...");

    // Get all published events
    const { data: events, error } = await supabase
      .from("events")
      .select(
        `
        id,
        title,
        description,
        category,
        start_date,
        end_date,
        location,
        min_ticket_price,
        event_image,
        status,
        organizer:users!events_organizer_id_fkey(id, display_name, wallet_address),
        target_investment,
        current_investment,
        target_roi,
        token_name,
        token_symbol
      `
      )
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Error fetching events:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("✅ Found", events?.length || 0, "publishable events");

    return NextResponse.json(
      {
        success: true,
        events: events || [],
        count: events?.length || 0,
      },
      { status: 200 }
    );
  } catch (e: any) {
    console.error("❌ Error in GET /api/investor/events:", e);
    return NextResponse.json(
      { error: e?.message || "Failed to fetch events" },
      { status: 500 }
    );
  }
}

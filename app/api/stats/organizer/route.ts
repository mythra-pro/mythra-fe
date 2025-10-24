import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/server";

// GET /api/stats/organizer?organizerId=xxx - Get organizer stats
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const organizerId = searchParams.get("organizerId");

    if (!organizerId) {
      return NextResponse.json(
        { error: "organizerId is required" },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Get all events by organizer
    const { data: events, error: eventsError } = await supabase
      .from("events")
      .select("id, status, created_at")
      .eq("organizer_id", organizerId);

    if (eventsError) {
      return NextResponse.json(
        { error: eventsError.message },
        { status: 500 }
      );
    }

    const eventIds = events?.map((e) => e.id) || [];

    // Get ticket counts and revenue
    let totalTicketsSold = 0;
    let totalRevenue = 0;

    if (eventIds.length > 0) {
      const { data: tickets } = await supabase
        .from("tickets")
        .select(`
          id,
          ticket_tier:ticket_tiers(price)
        `)
        .in("ticket_tier.event_id", eventIds);

      totalTicketsSold = tickets?.length || 0;
      totalRevenue = tickets?.reduce((sum, t: any) => {
        return sum + (t.ticket_tier?.price || 0);
      }, 0) || 0;
    }

    // Get check-in counts
    const { count: totalCheckins } = await supabase
      .from("checkins")
      .select("*", { count: "exact", head: true })
      .in("event_id", eventIds.length > 0 ? eventIds : [""]);

    const stats = {
      totalEvents: events?.length || 0,
      publishedEvents: events?.filter((e) => e.status === "published").length || 0,
      draftEvents: events?.filter((e) => e.status === "draft").length || 0,
      totalTicketsSold,
      totalRevenue,
      totalCheckins: totalCheckins || 0,
    };

    return NextResponse.json({ stats }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}

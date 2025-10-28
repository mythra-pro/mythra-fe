import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/server";

// GET /api/stats/admin - Get platform-wide admin stats
export async function GET() {
  try {
    const supabase = getServiceSupabase();

    // Get total users
    const { count: totalUsers } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });

    // Get total events
    const { data: events } = await supabase
      .from("events")
      .select("id, status");

    const totalEvents = events?.length || 0;
    const publishedEvents = events?.filter((e) => e.status === "published").length || 0;
    const pendingApprovals = events?.filter((e) => e.status === "draft").length || 0;

    // Get all tickets for revenue calculation
    const { data: tickets } = await supabase
      .from("tickets")
      .select(`
        id,
        ticket_tier:ticket_tiers(price)
      `);

    const totalRevenue = tickets?.reduce((sum, t: any) => {
      return sum + (t.ticket_tier?.price || 0);
    }, 0) || 0;

    // Get check-ins
    const { count: totalCheckins } = await supabase
      .from("checkins")
      .select("*", { count: "exact", head: true });

    const stats = {
      totalUsers: totalUsers || 0,
      totalEvents,
      publishedEvents,
      pendingApprovals,
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

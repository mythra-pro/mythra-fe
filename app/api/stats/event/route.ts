import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/server";

// GET /api/stats/event?eventId=xxx - Get event stats
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

    // Get event details
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("max_tickets")
      .eq("id", eventId)
      .single();

    if (eventError) {
      return NextResponse.json(
        { error: eventError.message },
        { status: 500 }
      );
    }

    // Get ticket tiers
    const { data: tiers } = await supabase
      .from("ticket_tiers")
      .select("id, price, supply_max")
      .eq("event_id", eventId);

    const tierIds = tiers?.map((t) => t.id) || [];

    // Get tickets sold
    const { data: tickets } = await supabase
      .from("tickets")
      .select("id, status, ticket_tier_id")
      .in("ticket_tier_id", tierIds.length > 0 ? tierIds : [""]);

    const totalTicketsSold = tickets?.length || 0;
    const totalRevenue = tickets?.reduce((sum, ticket: any) => {
      const tier = tiers?.find((t) => t.id === ticket.ticket_tier_id);
      return sum + (tier?.price || 0);
    }, 0) || 0;

    // Get check-ins
    const { count: checkedIn } = await supabase
      .from("checkins")
      .select("*", { count: "exact", head: true })
      .eq("event_id", eventId);

    const stats = {
      maxTickets: event?.max_tickets || 0,
      ticketsSold: totalTicketsSold,
      ticketsRemaining: (event?.max_tickets || 0) - totalTicketsSold,
      revenue: totalRevenue,
      checkedIn: checkedIn || 0,
      checkInRate: totalTicketsSold > 0 
        ? ((checkedIn || 0) / totalTicketsSold * 100).toFixed(1)
        : "0",
    };

    return NextResponse.json({ stats }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}

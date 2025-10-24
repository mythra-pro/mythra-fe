import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/server";

// GET /api/tickets/[id] - Get single ticket
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getServiceSupabase();

    const { data: ticket, error } = await supabase
      .from("tickets")
      .select(`
        *,
        ticket_tier:ticket_tiers(
          *,
          event:events(*)
        )
      `)
      .eq("id", id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    return NextResponse.json({ ticket }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}

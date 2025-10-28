import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/server";

// GET /api/debug/event/[id] - Debug endpoint to check event details
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const supabase = getServiceSupabase();

    // Fetch event with all details
    const { data: event, error } = await supabase
      .from("events")
      .select("*, organizer:users!events_organizer_id_fkey(id, display_name, wallet_address)")
      .eq("id", id)
      .single();

    if (error) {
      return NextResponse.json(
        { 
          error: error.message,
          eventId: id,
          found: false
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        event,
        debug: {
          eventId: event.id,
          eventName: event.name,
          organizerId: event.organizer_id,
          organizerName: event.organizer?.display_name,
          organizerWallet: event.organizer?.wallet_address,
          status: event.status,
          verified: event.verified,
          chainVerified: event.chain_verified,
          createdAt: event.created_at,
        }
      },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}

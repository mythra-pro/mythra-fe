import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/server";

// GET /api/admin/events/pending - Get all pending events for admin approval
export async function GET() {
  try {
    const supabase = getServiceSupabase();

    const { data: events, error } = await supabase
      .from("events")
      .select("*, organizer:users!events_organizer_id_fkey(id, display_name, wallet_address)")
      .eq("status", "pending_approval")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Error fetching pending events:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    console.log("✅ Pending events fetched:", events?.length || 0);
    if (events && events.length > 0) {
      console.log("📋 First pending event:", events[0]);
    }
    return NextResponse.json({ success: true, events }, { status: 200 });
  } catch (e: any) {
    console.error("❌ Unexpected error in GET /api/admin/events/pending:", e);
    return NextResponse.json(
      { error: e?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}

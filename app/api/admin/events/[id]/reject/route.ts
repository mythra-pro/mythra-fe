import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/server";

// POST /api/admin/events/[id]/reject - Reject an event
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { adminId, reason } = await req.json();
    const { id } = await params;

    if (!adminId) {
      return NextResponse.json(
        { error: "Admin ID is required" },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Update event status to rejected
    const { data: event, error } = await supabase
      .from("events")
      .update({
        status: "rejected",
        approval_status: "rejected",
        approved_by: adminId,
        approved_at: new Date().toISOString(),
        rejected_reason: reason || "Not specified",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("❌ Error rejecting event:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    console.log("✅ Event rejected:", event.id);
    return NextResponse.json({ event }, { status: 200 });
  } catch (e: any) {
    console.error("❌ Unexpected error in POST /api/admin/events/[id]/reject:", e);
    return NextResponse.json(
      { error: e?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}

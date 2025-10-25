import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/server";

// POST /api/admin/events/[id]/approve - Approve an event
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { adminId } = await req.json();
    const { id } = await params;

    if (!adminId) {
      return NextResponse.json(
        { error: "Admin ID is required" },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Update event status to approved
    const { data: event, error } = await supabase
      .from("events")
      .update({
        status: "approved",
        approval_status: "approved",
        approved_by: adminId,
        approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("❌ Error approving event:", error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    console.log("✅ Event approved:", event.id);
    return NextResponse.json({ event }, { status: 200 });
  } catch (e: any) {
    console.error("❌ Unexpected error in POST /api/admin/events/[id]/approve:", e);
    return NextResponse.json(
      { error: e?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}

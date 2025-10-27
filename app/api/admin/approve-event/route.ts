import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/server";

// POST /api/admin/approve-event - Approve event
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { eventId, approved } = body as {
      eventId: string;
      approved: boolean;
    };

    if (!eventId) {
      return NextResponse.json(
        { error: "eventId is required" },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Get admin user ID from header
    const adminWallet = req.headers.get("x-wallet-address");
    let approvedBy: string | null = null;

    if (adminWallet) {
      const { data: admin } = await supabase
        .from("users")
        .select("id")
        .eq("wallet_address", adminWallet)
        .single();
      approvedBy = admin?.id || null;
    }

    const { data: event, error } = await supabase
      .from("events")
      .update({
        status: approved ? "dao_voting" : "rejected",
        approved_by: approvedBy,
        approved_at: approved ? new Date().toISOString() : null,
        dao_voting_started_at: approved ? new Date().toISOString() : null,
        rejected_at: !approved ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", eventId)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ event }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}

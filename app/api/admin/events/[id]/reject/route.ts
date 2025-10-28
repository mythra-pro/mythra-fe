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
        { error: "Admin ID (UUID) is required" },
        { status: 400 }
      );
    }

    // TODO: Implement wallet-based admin lookup instead
    // const walletAddress = req.headers.get("x-wallet-address");
    // if (!walletAddress) {
    //   return NextResponse.json(
    //     { error: "Wallet address is required in x-wallet-address header" },
    //     { status: 400 }
    //   );
    // }
    // const supabase = getServiceSupabase();
    // const { data: adminUser, error: adminError } = await supabase
    //   .from("users")
    //   .select("id")
    //   .eq("wallet_address", walletAddress)
    //   .single();
    // if (adminError || !adminUser) {
    //   return NextResponse.json({ error: "Admin user not found" }, { status: 404 });
    // }
    // const adminId = adminUser.id;

    const supabase = getServiceSupabase();

    // Update event status to rejected
    const { data: event, error } = await supabase
      .from("events")
      .update({
        status: "rejected",
        rejected_reason: reason || "Not specified",
        rejected_by: adminId,
        rejected_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("❌ Error rejecting event:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("✅ Event rejected:", event.id);
    return NextResponse.json({ 
      success: true, 
      event,
      message: "Event rejected successfully."
    }, { status: 200 });
  } catch (e: any) {
    console.error(
      "❌ Unexpected error in POST /api/admin/events/[id]/reject:",
      e
    );
    return NextResponse.json(
      { error: e?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/server";

/**
 * Test endpoint - List all users in database
 * DELETE THIS AFTER TESTING
 */
export async function GET(req: Request) {
  try {
    const supabase = getServiceSupabase();

    const { data: users, error } = await supabase
      .from("users")
      .select("id, email, display_name, role")
      .limit(20);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("📋 Users in database:", users);

    return NextResponse.json(
      {
        count: users?.length || 0,
        users: users,
      },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Error" },
      { status: 500 }
    );
  }
}

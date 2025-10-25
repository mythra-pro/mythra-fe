import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/server";

/**
 * Test endpoint - Create a test admin user
 * DELETE THIS AFTER TESTING
 */
export async function POST(req: Request) {
  try {
    const { email, displayName } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const supabase = getServiceSupabase();

    // Check if user already exists
    const { data: existing } = await supabase
      .from("users")
      .select("id")
      .eq("email", email)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "User already exists", userId: existing.id },
        { status: 409 }
      );
    }

    // Create new user
    const { data: newUser, error } = await supabase
      .from("users")
      .insert({
        email: email,
        display_name: displayName || email.split("@")[0],
        role: "admin",
        wallet_address: `admin-${email}`,
        created_at: new Date().toISOString(),
      })
      .select("id, email, display_name, role")
      .single();

    if (error) {
      console.error("❌ Error creating user:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("✅ Test admin user created:", newUser);

    return NextResponse.json(
      {
        success: true,
        message: "Test admin user created",
        user: newUser,
      },
      { status: 201 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Error" }, { status: 500 });
  }
}

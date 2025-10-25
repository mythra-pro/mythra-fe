import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/server";

/**
 * Generic login endpoint for all roles
 * POST /api/login
 * Body: { email, role }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, role } = body;

    console.log("📝 Login attempt");
    console.log("   Email:", email);
    console.log("   Role:", role);

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Query user by email to get UUID from users table
    console.log("🔍 Querying Supabase users table for email:", email);
    
    const { data: user, error: queryError } = await supabase
      .from("users")
      .select("id, email, display_name")
      .eq("email", email)
      .maybeSingle();

    console.log("📊 Query result:");
    console.log("   - User found:", !!user);
    console.log("   - User ID (UUID):", user?.id);
    console.log("   - Query error:", queryError?.message);

    if (queryError) {
      console.error("❌ Query error:", queryError.message);
      return NextResponse.json(
        { error: "Database query failed: " + queryError.message },
        { status: 500 }
      );
    }

    if (!user) {
      console.warn("⚠️ User not found in database with email:", email);
      return NextResponse.json(
        { error: "User not found. Please create account first." },
        { status: 401 }
      );
    }

    if (!user.id) {
      console.error("❌ User found but no UUID (id field):", user);
      return NextResponse.json(
        { error: "User record is missing UUID field" },
        { status: 500 }
      );
    }

    console.log("✅ Login successful!");
    console.log("   Email:", email);
    console.log("   UUID:", user.id);
    console.log("   Role:", role);

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id, // UUID from Supabase users table
          email: user.email,
          displayName: user.display_name || "",
          role: role || "user",
        },
      },
      { status: 200 }
    );
  } catch (e: any) {
    console.error("❌ Error in POST /api/login:", e);
    console.error("   Stack:", e.stack);
    return NextResponse.json(
      { error: e?.message || "Login failed" },
      { status: 500 }
    );
  }
}

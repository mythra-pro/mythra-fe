import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    console.log("📝 Admin login attempt");
    console.log("   Email:", email);
    console.log("   Password provided:", !!password);

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // TODO: Add password validation after password_hash column is created in users table
    // For now, just check if email exists in database

    const supabase = getServiceSupabase();

    // Query user by email to get UUID from users table
    console.log("🔍 Querying Supabase users table for email:", email);

    const { data: user, error: queryError } = await supabase
      .from("users")
      .select("id, email, display_name, role")
      .eq("email", email)
      .maybeSingle(); // Use maybeSingle instead of single to avoid error if not found

    console.log("📊 Query result:");
    console.log("   - User found:", !!user);
    console.log("   - User ID (UUID):", user?.id);
    console.log("   - User email:", user?.email);
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

    // TODO: Add proper password verification with bcrypt after password_hash column is added
    // For now, just validate that the user exists with matching email
    console.log("✅ Email validated in database, proceeding with login");

    console.log("✅ Admin login successful!");
    console.log("   Email:", email);
    console.log("   UUID:", user.id);

    return NextResponse.json(
      {
        success: true,
        user: {
          id: user.id, // UUID from Supabase users table
          email: user.email,
          displayName: user.display_name || "",
          role: user.role || "admin",
        },
      },
      { status: 200 }
    );
  } catch (e: any) {
    console.error("❌ Error in POST /api/admin/login:", e);
    console.error("   Stack:", e.stack);
    return NextResponse.json(
      { error: e?.message || "Login failed" },
      { status: 500 }
    );
  }
}

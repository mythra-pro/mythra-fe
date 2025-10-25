import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, displayName } = body;

    console.log("📝 Admin registration attempt");
    console.log("   Email:", email);
    console.log("   Display Name:", displayName);

    if (!email || !displayName) {
      return NextResponse.json(
        { error: "Email and display name are required" },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Step 1: Get admin role ID from roles table
    console.log("🔍 Fetching admin role from roles table...");

    const { data: roleData, error: roleError } = await supabase
      .from("roles")
      .select("id")
      .eq("name", "admin")
      .maybeSingle();

    if (roleError) {
      console.error("❌ Error fetching admin role:", roleError.message);
      return NextResponse.json(
        { error: "Admin role not found" },
        { status: 500 }
      );
    }

    if (!roleData) {
      console.error("❌ Admin role does not exist in roles table");
      return NextResponse.json(
        { error: "Admin role is not configured" },
        { status: 500 }
      );
    }

    const adminRoleId = roleData.id;
    console.log("✅ Admin role ID:", adminRoleId);

    // Step 2: Check if user already exists
    console.log("🔍 Checking if user already exists with email:", email);

    const { data: existing, error: checkError } = await supabase
      .from("users")
      .select("id, email")
      .eq("email", email)
      .maybeSingle();

    if (checkError) {
      console.error("❌ Error checking existing user:", checkError.message);
      return NextResponse.json(
        { error: "Database error: " + checkError.message },
        { status: 500 }
      );
    }

    if (existing) {
      console.warn("⚠️ User already exists with email:", email);
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    // Step 3: Create new user (without role field)
    console.log("📝 Creating new user...");

    const { data: newUser, error: createError } = await supabase
      .from("users")
      .insert({
        email: email,
        display_name: displayName,
        wallet_address: `admin-${email}`,
        created_at: new Date().toISOString(),
      })
      .select("id, email, display_name")
      .single();

    if (createError) {
      console.error("❌ Error creating user:", createError.message);
      return NextResponse.json(
        { error: "Failed to create user: " + createError.message },
        { status: 500 }
      );
    }

    if (!newUser || !newUser.id) {
      console.error("❌ User created but no UUID returned:", newUser);
      return NextResponse.json(
        { error: "User created but missing UUID" },
        { status: 500 }
      );
    }

    console.log("✅ User created with UUID:", newUser.id);

    // Step 4: Link user to admin role via user_roles junction table
    console.log("📝 Linking user to admin role via user_roles table...");

    const { error: linkError } = await supabase.from("user_roles").insert({
      users_id: newUser.id,
      roles_id: adminRoleId,
    });

    if (linkError) {
      console.error("❌ Error linking user to role:", linkError.message);
      // Don't fail - user is created, just role assignment failed
      console.warn("⚠️ User created but failed to assign admin role");
    } else {
      console.log("✅ User successfully linked to admin role");
    }

    console.log("✅ Admin user registered successfully!");
    console.log("   Email:", email);
    console.log("   UUID:", newUser.id);

    return NextResponse.json(
      {
        success: true,
        message: "Registration successful",
        user: {
          id: newUser.id, // UUID from Supabase users table
          email: newUser.email,
          displayName: newUser.display_name || "",
          role: "admin",
        },
      },
      { status: 201 }
    );
  } catch (e: any) {
    console.error("❌ Error in POST /api/admin/register:", e);
    console.error("   Stack:", e.stack);
    return NextResponse.json(
      { error: e?.message || "Registration failed" },
      { status: 500 }
    );
  }
}

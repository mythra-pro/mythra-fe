import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/server";

/**
 * Generic register endpoint for all roles
 * POST /api/register
 * Body: { email, displayName, role }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, displayName, role } = body;

    console.log("📝 Registration attempt");
    console.log("   Email:", email);
    console.log("   Display Name:", displayName);
    console.log("   Role:", role);

    if (!email || !displayName) {
      return NextResponse.json(
        { error: "Email and display name are required" },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Step 1: Get role ID from roles table
    console.log("🔍 Fetching role ID from roles table for role:", role || "user");
    
    const { data: roleData, error: roleError } = await supabase
      .from("roles")
      .select("id")
      .eq("name", role || "user")
      .maybeSingle();

    if (roleError) {
      console.error("❌ Error fetching role:", roleError.message);
      return NextResponse.json(
        { error: "Role not found" },
        { status: 500 }
      );
    }

    if (!roleData) {
      console.error("❌ Role does not exist in roles table:", role);
      return NextResponse.json(
        { error: `${role || "user"} role is not configured` },
        { status: 500 }
      );
    }

    const roleId = roleData.id;
    console.log("✅ Role ID:", roleId);

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
        wallet_address: `${role || "user"}-${email}`,
        created_at: new Date().toISOString(),
      })
      .select("id, email, display_name")
      .single();

    if (createError) {
      console.error("❌ Error creating user:", createError);
      return NextResponse.json(
        { error: "Failed to create user: " + createError },
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

    // Step 4: Link user to role via user_roles junction table
    console.log("📝 Linking user to role via user_roles table...");

    const { error: linkError } = await supabase
      .from("user_roles")
      .insert({
        users_id: newUser.id,
        roles_id: roleId,
      });

    if (linkError) {
      console.error("❌ Error linking user to role:", linkError.message);
      console.warn("⚠️ User created but failed to assign role");
    } else {
      console.log("✅ User successfully linked to role");
    }

    console.log("✅ User registered successfully!");
    console.log("   Email:", email);
    console.log("   UUID:", newUser.id);
    console.log("   Role:", role);

    return NextResponse.json(
      {
        success: true,
        message: "Registration successful",
        user: {
          id: newUser.id, // UUID from Supabase users table
          email: newUser.email,
          displayName: newUser.display_name || "",
          role: role || "user",
        },
      },
      { status: 201 }
    );
  } catch (e: any) {
    console.error("❌ Error in POST /api/register:", e);
    console.error("   Stack:", e.stack);
    return NextResponse.json(
      { error: e?.message || "Registration failed" },
      { status: 500 }
    );
  }
}

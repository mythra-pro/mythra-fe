import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/server";

/**
 * Check if a wallet address is already registered
 * POST /api/auth/wallet/check
 * Body: { walletAddress: string }
 * 
 * Returns:
 * - { exists: true, user: { id, email, displayName, role } } if wallet is registered
 * - { exists: false } if wallet is not registered
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { walletAddress } = body;

    console.log("🔍 Wallet check request for:", walletAddress);

    // Validate input
    if (!walletAddress || typeof walletAddress !== "string") {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Query user by wallet address
    const { data: user, error: queryError } = await supabase
      .from("users")
      .select("id, email, display_name, wallet_address")
      .eq("wallet_address", walletAddress)
      .maybeSingle();

    if (queryError) {
      console.error("❌ Database query error:", queryError);
      return NextResponse.json(
        { error: "Database error: " + queryError.message },
        { status: 500 }
      );
    }

    // If user exists, fetch their roles
    if (user) {
      console.log("✅ Wallet found:", user.id);
      
      // Get user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("roles(name)")
        .eq("user_id", user.id);

      if (rolesError) {
        console.error("⚠️ Error fetching roles:", rolesError);
      }

      const roles = userRoles?.map((ur: any) => ur.roles.name) || [];
      
      console.log("📋 User roles found:", roles);
      
      // Prioritize roles: admin > organizer > investor > staff > customer
      const rolePriority = ["admin", "organizer", "investor", "staff", "customer"];
      let primaryRole = "customer";
      
      for (const priorityRole of rolePriority) {
        if (roles.includes(priorityRole)) {
          primaryRole = priorityRole;
          break;
        }
      }
      
      console.log("🎯 Selected primary role:", primaryRole);

      return NextResponse.json(
        {
          exists: true,
          user: {
            id: user.id,
            email: user.email,
            displayName: user.display_name || "",
            walletAddress: user.wallet_address,
            role: primaryRole,
            roles: roles,
          },
        },
        { status: 200 }
      );
    }

    // Wallet not found
    console.log("ℹ️ Wallet not registered");
    return NextResponse.json(
      { exists: false },
      { status: 200 }
    );
  } catch (e: any) {
    console.error("❌ Error in POST /api/auth/wallet/check:", e);
    return NextResponse.json(
      { error: e?.message || "Wallet check failed" },
      { status: 500 }
    );
  }
}

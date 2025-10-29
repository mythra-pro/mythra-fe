import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/server";
import { validateAuthentication } from "@/lib/auth/message-signing";
import { validateEmail, validateDisplayName } from "@/lib/validation/email";
import { checkRateLimit, getClientId, recordFailedAttempt, clearRateLimit } from "@/lib/security/rate-limit";

/**
 * Verify wallet signature and register/login user
 * POST /api/auth/wallet/verify
 * 
 * Body: {
 *   walletAddress: string,
 *   signature: string,
 *   message: string,
 *   email: string,
 *   displayName: string,
 *   role: string
 * }
 * 
 * Returns:
 * - { success: true, user: {...}, isNewUser: boolean }
 */
export async function POST(req: Request) {
  try {
    // Check rate limit
    const clientId = getClientId(req);
    const rateLimit = checkRateLimit(clientId, 'auth');
    
    if (!rateLimit.allowed) {
      console.warn(`🚫 Rate limit exceeded for ${clientId}`);
      return NextResponse.json(
        { 
          error: "Too many authentication attempts. Please try again later.",
          retryAfter: rateLimit.retryAfter,
        },
        { 
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.retryAfter || 60),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(rateLimit.resetAt),
          }
        }
      );
    }
    
    const body = await req.json();
    const { walletAddress, signature, message, email, displayName, role } = body;

    console.log("🔐 Wallet verification request");
    console.log("   Wallet:", walletAddress);
    console.log("   Email:", email);
    console.log("   Role:", role);

    // Validate required fields
    if (!walletAddress || !signature || !message) {
      return NextResponse.json(
        { error: "Wallet address, signature, and message are required" },
        { status: 400 }
      );
    }

    // Verify signature
    console.log("🔏 Verifying signature...");
    const authResult = validateAuthentication(message, signature, walletAddress);
    
    if (!authResult.valid) {
      console.error("❌ Signature verification failed:", authResult.error);
      // Record failed attempt for stricter rate limiting
      recordFailedAttempt(clientId);
      return NextResponse.json(
        { error: authResult.error || "Invalid signature" },
        { status: 401 }
      );
    }

    console.log("✅ Signature verified successfully");

    const supabase = getServiceSupabase();

    // Check if wallet already exists
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("id, email, display_name, wallet_address")
      .eq("wallet_address", walletAddress)
      .maybeSingle();

    if (checkError) {
      console.error("❌ Database error:", checkError);
      return NextResponse.json(
        { error: "Database error: " + checkError.message },
        { status: 500 }
      );
    }

    // If user exists, return existing user (login flow)
    if (existingUser) {
      console.log("✅ Existing user found, logging in...");
      
      // Get user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("roles(name)")
        .eq("user_id", existingUser.id);

      if (rolesError) {
        console.error("❌ Error fetching roles:", rolesError);
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

      // Clear rate limit on successful login
      clearRateLimit(clientId, 'auth');

      return NextResponse.json(
        {
          success: true,
          isNewUser: false,
          user: {
            id: existingUser.id,
            email: existingUser.email,
            displayName: existingUser.display_name || "",
            walletAddress: existingUser.wallet_address,
            role: primaryRole,
            roles: roles,
          },
        },
        { status: 200 }
      );
    }

    // NEW USER REGISTRATION
    console.log("📝 New user registration...");

    // Validate email (required for new users)
    if (!email) {
      return NextResponse.json(
        { error: "Email is required for registration" },
        { status: 400 }
      );
    }

    const emailValidation = validateEmail(email, { allowDisposable: true });
    if (!emailValidation.valid) {
      return NextResponse.json(
        { error: emailValidation.error },
        { status: 400 }
      );
    }

    // Validate display name
    if (!displayName) {
      return NextResponse.json(
        { error: "Display name is required for registration" },
        { status: 400 }
      );
    }

    const nameValidation = validateDisplayName(displayName);
    if (!nameValidation.valid) {
      return NextResponse.json(
        { error: nameValidation.error },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ["organizer", "customer", "investor", "staff"];
    const selectedRole = role && validRoles.includes(role) ? role : "customer";

    // Check if email already exists (1:1 mapping)
    const { data: emailCheck, error: emailCheckError } = await supabase
      .from("users")
      .select("id")
      .eq("email", emailValidation.normalized)
      .maybeSingle();

    if (emailCheckError) {
      console.error("❌ Email check error:", emailCheckError);
      return NextResponse.json(
        { error: "Database error" },
        { status: 500 }
      );
    }

    if (emailCheck) {
      return NextResponse.json(
        { error: "This email is already registered with another wallet" },
        { status: 409 }
      );
    }

    // Get role ID
    const { data: roleData, error: roleError } = await supabase
      .from("roles")
      .select("id")
      .eq("name", selectedRole)
      .maybeSingle();

    if (roleError || !roleData) {
      console.error("❌ Role error:", roleError);
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 500 }
      );
    }

    // Create new user
    const { data: newUser, error: createError } = await supabase
      .from("users")
      .insert({
        email: emailValidation.normalized,
        display_name: displayName.trim(),
        wallet_address: walletAddress,
        civic_auth_verified: false,
        reputation_score: 0,
        created_at: new Date().toISOString(),
      })
      .select("id, email, display_name, wallet_address")
      .single();

    if (createError || !newUser) {
      console.error("❌ User creation error:", createError);
      return NextResponse.json(
        { error: "Failed to create user: " + (createError?.message || "Unknown error") },
        { status: 500 }
      );
    }

    console.log("✅ User created:", newUser.id);

    // Always link user to customer role
    const { data: customerRole, error: customerRoleError } = await supabase
      .from("roles")
      .select("id")
      .eq("name", "customer")
      .maybeSingle();

    if (customerRoleError || !customerRole) {
      console.error("❌ Customer role error:", customerRoleError);
      // Continue anyway - user is created
    }

    // Assign primary rolw + customer role
    const rolesToAssign = [{ user_id: newUser.id, role_id: roleData.id}]
    if (customerRole) {
      rolesToAssign.push({ user_id: newUser.id, role_id: customerRole.id})
    }

    // Link user to role
    const { error: linkError } = await supabase
      .from("user_roles")
      .insert(rolesToAssign);

    if (linkError) {
      console.error("⚠️ Role linking error:", linkError);
      // Rollback user creation
      await supabase
        .from("users")
        .delete()
        .eq("id", newUser.id);
      
      return NextResponse.json(
        { error: "Role assignment failed: " + linkError.message },
        { status: 500 }
      );
    }
    //  else {
    //   console.log("✅ User linked to role:", selectedRole);
    // }

    // Clear rate limit on successful registration
    clearRateLimit(clientId, 'auth');

    return NextResponse.json(
      {
        success: true,
        isNewUser: true,
        user: {
          id: newUser.id,
          email: newUser.email,
          displayName: newUser.display_name || "",
          walletAddress: newUser.wallet_address,
          role: selectedRole,
          roles: [selectedRole],
        },
      },
      { status: 201 }
    );
  } catch (e: any) {
    console.error("❌ Error in POST /api/auth/wallet/verify:", e);
    return NextResponse.json(
      { error: e?.message || "Verification failed" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/server";

// GET /api/users/[wallet] - Get user by wallet address
export async function GET(
  req: Request,
  { params }: { params: Promise<{ wallet: string }> }
) {
  try {
    const { wallet } = await params;

    if (!wallet) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("wallet_address", wallet)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}

// PATCH /api/users/[wallet] - Update user profile
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ wallet: string }> }
) {
  try {
    const { wallet } = await params;
    const body = await req.json();
    const { displayName, email, avatarUrl } = body;

    if (!wallet) {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    const supabase = getServiceSupabase();

    // Build update object with only provided fields
    const updates: any = {};
    if (displayName !== undefined) updates.display_name = displayName;
    if (email !== undefined) updates.email = email;
    if (avatarUrl !== undefined) updates.avatar_url = avatarUrl;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No fields to update" },
        { status: 400 }
      );
    }

    const { data: user, error } = await supabase
      .from("users")
      .update(updates)
      .eq("wallet_address", wallet)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { getServiceSupabase } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { walletAddress, displayName, email } = body as {
      walletAddress: string;
      displayName?: string;
      email?: string;
    };

    console.log("User upsert request:", { walletAddress, displayName, email });

    if (!walletAddress || walletAddress.trim().length === 0) {
      return NextResponse.json(
        { error: "walletAddress is required" },
        { status: 400 }
      );
    }

    console.log("Creating Supabase client...");
    const supabase = getServiceSupabase();
    console.log("Supabase client created successfully");

    // Check if user exists
    console.log("Checking if user exists...");
    const { data: existing, error: selectErr } = await supabase
      .from("users")
      .select("id, wallet_address, display_name, email")
      .eq("wallet_address", walletAddress)
      .limit(1)
      .maybeSingle();

    if (selectErr) {
      console.error("Select error:", selectErr);
    }

    if (existing) {
      // User exists, return existing data
      console.log("User already exists:", existing.id);
      return NextResponse.json({ user: existing }, { status: 200 });
    }

    // User doesn't exist, insert new user
    console.log("Inserting new user...");
    const { data: newUser, error: insertErr } = await supabase
      .from("users")
      .insert({
        wallet_address: walletAddress,
        display_name: displayName || null,
        email: email || null,
        civic_auth_verified: false,
        reputation_score: 0,
      })
      .select("id, wallet_address, display_name, email")
      .limit(1)
      .single();

    if (insertErr || !newUser) {
      console.error("User insert error:", insertErr);
      return NextResponse.json(
        { 
          error: insertErr?.message || "Failed to create user",
          details: insertErr?.details,
          hint: insertErr?.hint,
          code: insertErr?.code
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ user: newUser }, { status: 201 });
  } catch (e: any) {
    console.error("User upsert exception:", e);
    return NextResponse.json(
      { 
        error: e?.message || "Unexpected error",
        stack: e?.stack
      },
      { status: 500 }
    );
  }
}

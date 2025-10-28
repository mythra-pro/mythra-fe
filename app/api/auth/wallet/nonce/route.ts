import { NextResponse } from "next/server";
import { generateNonce, generateAuthMessage } from "@/lib/auth/message-signing";

/**
 * Generate a nonce and authentication message for wallet signing
 * POST /api/auth/wallet/nonce
 * Body: { walletAddress: string }
 * 
 * Returns: { nonce: string, message: string }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { walletAddress } = body;

    console.log("🎲 Nonce generation request for:", walletAddress);

    // Validate wallet address
    if (!walletAddress || typeof walletAddress !== "string") {
      return NextResponse.json(
        { error: "Wallet address is required" },
        { status: 400 }
      );
    }

    // Generate nonce
    const nonce = generateNonce();
    
    // Generate message to sign
    const message = generateAuthMessage(walletAddress, nonce);

    console.log("✅ Nonce generated successfully");

    return NextResponse.json(
      {
        nonce,
        message,
      },
      { status: 200 }
    );
  } catch (e: any) {
    console.error("❌ Error generating nonce:", e);
    return NextResponse.json(
      { error: e?.message || "Failed to generate nonce" },
      { status: 500 }
    );
  }
}

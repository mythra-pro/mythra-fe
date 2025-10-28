/**
 * Message Signing Utilities for Web3 Wallet Authentication
 * 
 * Handles generation and verification of authentication messages
 * that users sign with their wallets to prove ownership.
 */

import { PublicKey } from "@solana/web3.js";
import * as nacl from "tweetnacl";
import bs58 from "bs58";

/**
 * Generate a cryptographically secure nonce
 */
export function generateNonce(): string {
  const nonce = nacl.randomBytes(32);
  return bs58.encode(nonce);
}

/**
 * Generate authentication message for user to sign
 * 
 * @param walletAddress - User's wallet public key
 * @param nonce - Unique nonce to prevent replay attacks
 * @returns Message string to be signed
 */
export function generateAuthMessage(
  walletAddress: string,
  nonce: string
): string {
  const timestamp = Date.now();
  
  return `Welcome to Mythra!

Sign this message to authenticate your wallet.

Wallet Address: ${walletAddress}
Nonce: ${nonce}
Timestamp: ${timestamp}

This request will not trigger any blockchain transaction or cost any fees.`;
}

/**
 * Verify that a signature is valid for a given message and wallet
 * 
 * @param message - Original message that was signed
 * @param signature - Base58 encoded signature
 * @param walletAddress - Public key that should have signed the message
 * @returns true if signature is valid, false otherwise
 */
export function verifySignature(
  message: string,
  signature: string,
  walletAddress: string
): boolean {
  try {
    // Decode the signature from base58
    const signatureBytes = bs58.decode(signature);
    
    // Convert message to Uint8Array
    const messageBytes = new TextEncoder().encode(message);
    
    // Decode the public key
    const publicKey = new PublicKey(walletAddress);
    const publicKeyBytes = publicKey.toBytes();
    
    // Verify the signature
    const isValid = nacl.sign.detached.verify(
      messageBytes,
      signatureBytes,
      publicKeyBytes
    );
    
    return isValid;
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}

/**
 * Extract timestamp from authentication message
 * 
 * @param message - Authentication message
 * @returns timestamp in milliseconds, or null if not found
 */
export function extractTimestamp(message: string): number | null {
  const timestampMatch = message.match(/Timestamp: (\d+)/);
  if (!timestampMatch) {
    return null;
  }
  return parseInt(timestampMatch[1], 10);
}

/**
 * Check if a message timestamp is still valid (within 5 minutes)
 * This prevents replay attacks with old signatures
 * 
 * @param message - Authentication message
 * @param maxAgeMs - Maximum age in milliseconds (default: 5 minutes)
 * @returns true if timestamp is valid, false otherwise
 */
export function isTimestampValid(
  message: string,
  maxAgeMs: number = 5 * 60 * 1000 // 5 minutes
): boolean {
  const timestamp = extractTimestamp(message);
  
  if (timestamp === null) {
    return false;
  }
  
  const now = Date.now();
  const age = now - timestamp;
  
  return age >= 0 && age <= maxAgeMs;
}

/**
 * Extract nonce from authentication message
 * 
 * @param message - Authentication message
 * @returns nonce string, or null if not found
 */
export function extractNonce(message: string): string | null {
  const nonceMatch = message.match(/Nonce: ([^\s]+)/);
  if (!nonceMatch) {
    return null;
  }
  return nonceMatch[1];
}

/**
 * Validate complete authentication flow
 * - Verifies signature is valid
 * - Checks timestamp is fresh
 * - Validates wallet address matches
 * 
 * @param message - Original signed message
 * @param signature - Base58 encoded signature
 * @param walletAddress - Expected wallet address
 * @returns { valid: boolean, error?: string }
 */
export function validateAuthentication(
  message: string,
  signature: string,
  walletAddress: string
): { valid: boolean; error?: string } {
  // Check timestamp first (fast check)
  if (!isTimestampValid(message)) {
    return {
      valid: false,
      error: "Message has expired. Please try signing again.",
    };
  }
  
  // Verify signature (crypto operation)
  if (!verifySignature(message, signature, walletAddress)) {
    return {
      valid: false,
      error: "Invalid signature. Please sign the message with your wallet.",
    };
  }
  
  // All checks passed
  return { valid: true };
}

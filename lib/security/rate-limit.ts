/**
 * Rate Limiting Utility
 * 
 * Prevents abuse by limiting the number of requests per IP address
 * Uses in-memory store for simplicity (replace with Redis in production)
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
  blockedUntil?: number;
}

// In-memory store (replace with Redis for production)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Configuration
const RATE_LIMIT_CONFIG = {
  // Auth endpoints
  auth: {
    maxAttempts: 5,        // Max attempts per window
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 30 * 60 * 1000, // 30 minutes cooldown
  },
  // General API endpoints
  api: {
    maxAttempts: 100,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 5 * 60 * 1000, // 5 minutes cooldown
  },
};

/**
 * Get client identifier from request
 * Uses IP address as identifier
 */
export function getClientId(request: Request): string {
  // Try to get real IP from headers (if behind proxy)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  // Fallback to a default (not ideal for production)
  return 'unknown-client';
}

/**
 * Check if client is rate limited
 * 
 * @param clientId - Client identifier (usually IP address)
 * @param type - Rate limit type ('auth' or 'api')
 * @returns { allowed: boolean, remaining: number, resetAt: number, blockedUntil?: number }
 */
export function checkRateLimit(
  clientId: string,
  type: 'auth' | 'api' = 'api'
): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  blockedUntil?: number;
  retryAfter?: number;
} {
  const config = RATE_LIMIT_CONFIG[type];
  const now = Date.now();
  const key = `${type}:${clientId}`;
  
  let entry = rateLimitStore.get(key);
  
  // Check if client is blocked
  if (entry?.blockedUntil && entry.blockedUntil > now) {
    const retryAfter = Math.ceil((entry.blockedUntil - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
      blockedUntil: entry.blockedUntil,
      retryAfter,
    };
  }
  
  // Initialize or reset if window expired
  if (!entry || entry.resetAt <= now) {
    entry = {
      count: 0,
      resetAt: now + config.windowMs,
    };
    rateLimitStore.set(key, entry);
  }
  
  // Increment count
  entry.count++;
  
  // Check if limit exceeded
  if (entry.count > config.maxAttempts) {
    entry.blockedUntil = now + config.blockDurationMs;
    const retryAfter = Math.ceil(config.blockDurationMs / 1000);
    
    console.warn(`🚫 Rate limit exceeded for ${clientId} (${type})`);
    
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
      blockedUntil: entry.blockedUntil,
      retryAfter,
    };
  }
  
  const remaining = config.maxAttempts - entry.count;
  
  return {
    allowed: true,
    remaining,
    resetAt: entry.resetAt,
  };
}

/**
 * Record a failed auth attempt
 * Increments the count for stricter limiting on failures
 */
export function recordFailedAttempt(clientId: string): void {
  const key = `auth:${clientId}`;
  const entry = rateLimitStore.get(key);
  
  if (entry) {
    // Add penalty for failed attempts
    entry.count += 2; // Count failed attempts as 2x
  }
}

/**
 * Clear rate limit for a client (use after successful auth)
 */
export function clearRateLimit(clientId: string, type: 'auth' | 'api' = 'api'): void {
  const key = `${type}:${clientId}`;
  rateLimitStore.delete(key);
}

/**
 * Cleanup expired entries (run periodically)
 * Call this from a cron job or periodic task
 */
export function cleanupExpiredEntries(): void {
  const now = Date.now();
  let cleaned = 0;
  
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt <= now && (!entry.blockedUntil || entry.blockedUntil <= now)) {
      rateLimitStore.delete(key);
      cleaned++;
    }
  }
  
  if (cleaned > 0) {
    console.log(`🧹 Cleaned ${cleaned} expired rate limit entries`);
  }
}

// Run cleanup every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupExpiredEntries, 5 * 60 * 1000);
}

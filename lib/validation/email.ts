/**
 * Email Validation Utilities
 * 
 * Validates email addresses for Web3 wallet registration
 */

/**
 * Email validation regex (RFC 5322 simplified)
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * List of common disposable email domains (optional - can be extended)
 */
const DISPOSABLE_DOMAINS = [
  "tempmail.com",
  "guerrillamail.com",
  "10minutemail.com",
  "throwaway.email",
  "mailinator.com",
  "temp-mail.org",
];

/**
 * Validate email format
 * 
 * @param email - Email address to validate
 * @returns true if email format is valid
 */
export function isValidEmailFormat(email: string): boolean {
  if (!email || typeof email !== "string") {
    return false;
  }
  
  // Trim whitespace
  const trimmedEmail = email.trim();
  
  // Check format
  return EMAIL_REGEX.test(trimmedEmail);
}

/**
 * Check if email domain is disposable (optional security measure)
 * 
 * @param email - Email address to check
 * @returns true if email is from a disposable domain
 */
export function isDisposableEmail(email: string): boolean {
  if (!email || typeof email !== "string") {
    return false;
  }
  
  const domain = email.toLowerCase().split("@")[1];
  
  if (!domain) {
    return false;
  }
  
  return DISPOSABLE_DOMAINS.includes(domain);
}

/**
 * Normalize email address (lowercase, trim)
 * 
 * @param email - Email address to normalize
 * @returns normalized email address
 */
export function normalizeEmail(email: string): string {
  if (!email || typeof email !== "string") {
    return "";
  }
  
  return email.trim().toLowerCase();
}

/**
 * Validate email for registration
 * Comprehensive validation including format and optional disposable check
 * 
 * @param email - Email address to validate
 * @param options - Validation options
 * @returns { valid: boolean, error?: string, normalized?: string }
 */
export function validateEmail(
  email: string,
  options: {
    allowDisposable?: boolean;
  } = {}
): { valid: boolean; error?: string; normalized?: string } {
  // Check if email is provided
  if (!email || typeof email !== "string") {
    return {
      valid: false,
      error: "Email is required",
    };
  }
  
  // Normalize
  const normalized = normalizeEmail(email);
  
  // Check format
  if (!isValidEmailFormat(normalized)) {
    return {
      valid: false,
      error: "Invalid email format. Please enter a valid email address.",
    };
  }
  
  // Check for disposable email (if not allowed)
  if (options.allowDisposable === false && isDisposableEmail(normalized)) {
    return {
      valid: false,
      error: "Disposable email addresses are not allowed. Please use a permanent email.",
    };
  }
  
  // All checks passed
  return {
    valid: true,
    normalized,
  };
}

/**
 * Validate display name
 * 
 * @param displayName - Display name to validate
 * @returns { valid: boolean, error?: string }
 */
export function validateDisplayName(
  displayName: string
): { valid: boolean; error?: string } {
  if (!displayName || typeof displayName !== "string") {
    return {
      valid: false,
      error: "Display name is required",
    };
  }
  
  const trimmed = displayName.trim();
  
  if (trimmed.length < 2) {
    return {
      valid: false,
      error: "Display name must be at least 2 characters",
    };
  }
  
  if (trimmed.length > 50) {
    return {
      valid: false,
      error: "Display name must be less than 50 characters",
    };
  }
  
  return { valid: true };
}

// ============================================
// CRYPTOGRAPHY CONSTANTS
// ============================================

/**
 * Argon2 parameters for key derivation
 *
 * - Resistant to side-channel attacks
 * - Resistant to GPU cracking
 *
 * Parameters based on OWASP recommendations (2023)
 */

export const ARGON2_PARAMS = {
  MEMORY: 64 * 1024, // 64 MB (memory cost)
  ITERATIONS: 3, // Time cost (iterations)
  PARALLELISM: 4, // Number of parallel threads
  HASH_LENGTH: 32, // Output length in bytes
  SALT_LENGTH: 16, // Salt length in bytes
} as const;

/**
 * AES-GCM encryption parameters
 *
 * AES-GCM is an authenticated encryption mode
 * - Provides both confidentiality and authenticity
 * - Industry standard for modern encryption
 */
export const AES_PARAMS = {
  KEY_LENGTH: 256, // AES-256 (32 bytes)
  IV_LENGTH: 12, // Recommended IV length for GCM (96 bits)
  TAG_LENGTH: 128, // Authentication tag length (bits)
} as const;

// ============================================
// JWT CONSTANTS
// ============================================
export const JWT = {
  EXPIRY: "1d",
} as const;

/**
 * Rate limiting constants
 */
export const RATE_LIMITS = {
  LOGIN_ATTEMPTS: 5, // Max failed login attempts
  LOGIN_WINDOW: 15 * 60 * 1000, // 15 minutes in milliseconds
  API_REQUESTS: 100, // Max API requests per window
  API_WINDOW: 15 * 60 * 1000, // 15 minutes
} as const;

// ============================================
// ERROR CODES
// ============================================

export const ERROR_CODES = {
  // Authentication errors
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  EMAIL_NOT_VERIFIED: "EMAIL_NOT_VERIFIED",

  // Authorization errors
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  TOKEN_EXPIRED: "TOKEN_EXPIRED",

  // Validation errors
  VALIDATION_ERROR: "VALIDATION_ERROR",
  EMAIL_ALREADY_EXISTS: "EMAIL_ALREADY_EXISTS",

  // Resource errors
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",

  // Server errors
  INTERNAL_ERROR: "INTERNAL_ERROR",
  DATABASE_ERROR: "DATABASE_ERROR",
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

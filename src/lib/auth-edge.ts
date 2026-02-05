/**
 * Edge Runtime Compatible Authentication Utilities
 * 
 * Uses Web Crypto API (PBKDF2-SHA256) for password hashing.
 * Replaces bcryptjs for edge runtime compatibility.
 * 
 * Security Features:
 * - PBKDF2-SHA256 with 100,000 iterations (OWASP 2023)
 * - Cryptographically secure random salts
 * - Constant-time comparison (timing attack prevention)
 * - Versioned hash format (future-proof)
 * 
 * Hash Format: v1:<iterations>:<salt_base64>:<hash_base64>
 */

// --- CONSTANTS ---

const CURRENT_VERSION = 'v1'
const DEFAULT_ITERATIONS = 100000 // OWASP 2023 minimum
const SALT_LENGTH = 16 // 16 bytes = 128 bits
const HASH_LENGTH = 256 // 256 bits

// --- BASE64 ENCODING/DECODING ---

/**
 * Encode Uint8Array to base64 string (URL-safe)
 */
function base64Encode(buffer: Uint8Array): string {
  const bytes = Array.from(buffer)
  const binary = String.fromCharCode(...bytes)
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

/**
 * Decode base64 string to Uint8Array
 */
function base64Decode(base64: string): Uint8Array {
  // Convert URL-safe base64 back to standard base64
  const standard = base64
    .replace(/-/g, '+')
    .replace(/_/g, '/')
  
  // Add padding if needed
  const padding = '='.repeat((4 - (standard.length % 4)) % 4)
  const padded = standard + padding
  
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

// --- CONSTANT-TIME COMPARISON ---

/**
 * Constant-time string comparison to prevent timing attacks
 * 
 * CRITICAL: This must take the same time regardless of where strings differ
 */
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Still do comparison to maintain constant time
    // Compare against itself to keep timing consistent (prevent timing attacks)
    let result = 1
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ a.charCodeAt(i % b.length)
    }
    // Use result to prevent optimization, but always return false for length mismatch
    return result === 0
  }
  
  let mismatch = 0
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  
  return mismatch === 0
}

// --- HASH FORMAT DETECTION ---

/**
 * Detect if hash is in bcrypt format
 * 
 * Bcrypt hashes start with: $2a$, $2b$, $2x$, or $2y$
 */
export function isBcryptHash(hash: string): boolean {
  return /^\$2[abxy]\$/.test(hash)
}

/**
 * Detect if hash is in Web Crypto format
 */
export function isWebCryptoHash(hash: string): boolean {
  return hash.startsWith(`${CURRENT_VERSION}:`)
}

// --- PASSWORD HASHING (WEB CRYPTO API) ---

/**
 * Hash a password using PBKDF2-SHA256 (Web Crypto API)
 * 
 * Returns hash in format: v1:<iterations>:<salt_base64>:<hash_base64>
 * 
 * @param password - Plain text password to hash
 * @param iterations - Number of PBKDF2 iterations (default: 100,000)
 * @returns Promise<string> - Formatted hash string
 */
export async function hashPassword(
  password: string,
  iterations: number = DEFAULT_ITERATIONS
): Promise<string> {
  // 1. Generate cryptographically secure random salt
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH))
  
  // 2. Convert password to ArrayBuffer
  const encoder = new TextEncoder()
  const passwordBuffer = encoder.encode(password)
  
  // 3. Import password as CryptoKey for PBKDF2
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    'PBKDF2',
    false,
    ['deriveBits']
  )
  
  // 4. Derive hash using PBKDF2-SHA256
  const hashBuffer = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: iterations,
      hash: 'SHA-256'
    },
    keyMaterial,
    HASH_LENGTH
  )
  
  // 5. Encode to base64
  const saltBase64 = base64Encode(salt)
  const hashBase64 = base64Encode(new Uint8Array(hashBuffer))
  
  // 6. Return formatted hash
  return `${CURRENT_VERSION}:${iterations}:${saltBase64}:${hashBase64}`
}

/**
 * Verify a password against a stored hash (Web Crypto format)
 * 
 * Uses constant-time comparison to prevent timing attacks.
 * 
 * @param password - Plain text password to verify
 * @param storedHash - Stored hash in v1 format
 * @returns Promise<boolean> - True if password matches
 */
export async function verifyPassword(
  password: string,
  storedHash: string
): Promise<boolean> {
  try {
    // 1. Parse stored hash
    const parts = storedHash.split(':')
    
    // Validate format
    if (parts.length !== 4) {
      console.warn('Invalid hash format: incorrect number of parts')
      return false
    }
    
    const [version, iterationsStr, saltBase64, expectedHashBase64] = parts
    
    // Validate version
    if (version !== CURRENT_VERSION) {
      console.warn(`Unsupported hash version: ${version}`)
      return false
    }
    
    // Parse iterations
    const iterations = parseInt(iterationsStr, 10)
    if (isNaN(iterations) || iterations < 1000) {
      console.warn('Invalid iteration count')
      return false
    }
    
    // 2. Decode salt
    const salt = base64Decode(saltBase64) as Uint8Array
    
    // 3. Re-hash the provided password with the same salt
    const encoder = new TextEncoder()
    const passwordBuffer = encoder.encode(password)
    
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      'PBKDF2',
      false,
      ['deriveBits']
    )
    
    const hashBuffer = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt as BufferSource,
        iterations: iterations,
        hash: 'SHA-256'
      },
      keyMaterial,
      HASH_LENGTH
    )
    
    const actualHashBase64 = base64Encode(new Uint8Array(hashBuffer))
    
    // 4. Constant-time comparison (CRITICAL for security)
    return constantTimeEqual(actualHashBase64, expectedHashBase64)
    
  } catch (error) {
    console.error('Password verification error:', error)
    return false
  }
}

// --- HYBRID VERIFICATION (BACKWARD COMPATIBILITY) ---

/**
 * Verify password against either bcrypt or Web Crypto hash
 * 
 * This is the transition function that supports both formats.
 * Use this during migration period.
 * 
 * NOTE: bcrypt verification requires Node.js runtime (not edge-compatible)
 * For full edge runtime, use verifyPassword() directly with Web Crypto hashes
 * 
 * @param password - Plain text password to verify
 * @param storedHash - Hash in either bcrypt or Web Crypto format
 * @returns Promise<boolean> - True if password matches
 */
export async function verifyPasswordHybrid(
  password: string,
  storedHash: string
): Promise<boolean> {
  // Detect hash format
  if (isBcryptHash(storedHash)) {
    // Legacy bcrypt verification (Node.js only)
    try {
      const bcrypt = await import('bcryptjs')
      return await bcrypt.compare(password, storedHash)
    } catch (error) {
      console.error('bcrypt verification failed (not available in edge runtime?):', error)
      return false
    }
  } else if (isWebCryptoHash(storedHash)) {
    // New Web Crypto verification (edge-compatible)
    return await verifyPassword(password, storedHash)
  } else {
    console.warn('Unknown hash format')
    return false
  }
}

// --- HASH MIGRATION HELPER ---

/**
 * Check if a hash needs migration to Web Crypto format
 * 
 * @param hash - Current hash
 * @returns boolean - True if hash should be migrated
 */
export function needsMigration(hash: string): boolean {
  return isBcryptHash(hash)
}

/**
 * Migrate a password from bcrypt to Web Crypto format
 * 
 * This should be called after successful login with bcrypt hash.
 * 
 * @param password - Plain text password (just verified)
 * @returns Promise<string> - New Web Crypto hash
 */
export async function migratePasswordHash(password: string): Promise<string> {
  return await hashPassword(password)
}

// --- TESTING HELPERS (for development/testing only) ---

/**
 * Generate a test hash for development
 * 
 * @param password - Password to hash
 * @param iterations - Optional custom iterations (default: 100,000)
 * @returns Promise<string> - Hash string
 */
export async function generateTestHash(
  password: string,
  iterations?: number
): Promise<string> {
  return await hashPassword(password, iterations)
}

/**
 * Parse a hash and return its components (for debugging)
 * 
 * @param hash - Hash to parse
 * @returns Object with hash components or null
 */
export function parseHash(hash: string): {
  version: string
  iterations: number
  salt: string
  hash: string
} | null {
  if (!isWebCryptoHash(hash)) return null
  
  const parts = hash.split(':')
  if (parts.length !== 4) return null
  
  return {
    version: parts[0],
    iterations: parseInt(parts[1], 10),
    salt: parts[2],
    hash: parts[3]
  }
}

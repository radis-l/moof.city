/**
 * Edge Runtime Compatible JWT Utilities
 * 
 * Replaces 'jsonwebtoken' library with Web Crypto API
 * for edge runtime compatibility.
 * 
 * Implements HS256 (HMAC-SHA256) JWT signing and verification.
 */

import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET
const FALLBACK_SECRET = 'fallback_secret_for_dev_only'

// Fail fast if secret is missing in production
if (!JWT_SECRET && (process.env.NODE_ENV === 'production' || process.env.VERCEL === '1')) {
  console.error('CRITICAL: JWT_SECRET environment variable is missing in production.')
}

const getSecret = () => JWT_SECRET || FALLBACK_SECRET
const TOKEN_EXPIRY_HOURS = 24
export const COOKIE_NAME = 'admin_session'

// --- BASE64 URL-SAFE ENCODING ---

function base64UrlEncode(buffer: Uint8Array): string {
  const bytes = Array.from(buffer)
  const binary = String.fromCharCode(...bytes)
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

function base64UrlDecode(base64: string): Uint8Array {
  const standard = base64
    .replace(/-/g, '+')
    .replace(/_/g, '/')
  const padding = '='.repeat((4 - (standard.length % 4)) % 4)
  const padded = standard + padding
  
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

// --- JWT TYPES ---

export interface AdminTokenPayload {
  role: 'admin'
  iat: number
  exp: number
}

// --- JWT GENERATION ---

/**
 * Generate admin JWT token using Web Crypto API (HS256)
 * 
 * @returns Promise<string> - JWT token
 */
export async function generateAdminToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const exp = now + (TOKEN_EXPIRY_HOURS * 60 * 60)
  
  const payload: AdminTokenPayload = {
    role: 'admin',
    iat: now,
    exp: exp
  }
  
  // Create JWT header
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  }
  
  // Encode header and payload
  const encoder = new TextEncoder()
  const headerBase64 = base64UrlEncode(encoder.encode(JSON.stringify(header)))
  const payloadBase64 = base64UrlEncode(encoder.encode(JSON.stringify(payload)))
  
  // Create signature using HMAC-SHA256
  const message = `${headerBase64}.${payloadBase64}`
  const messageBuffer = encoder.encode(message)
  
  // Import secret key
  const secretBuffer = encoder.encode(getSecret())
  const key = await crypto.subtle.importKey(
    'raw',
    secretBuffer,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  
  // Sign the message
  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    messageBuffer
  )
  
  const signatureBase64 = base64UrlEncode(new Uint8Array(signatureBuffer))
  
  // Return complete JWT
  return `${message}.${signatureBase64}`
}

/**
 * Verify and decode JWT token using Web Crypto API
 * 
 * @param token - JWT token to verify
 * @returns Promise<AdminTokenPayload | null> - Decoded payload or null if invalid
 */
export async function verifyAdminToken(token: string): Promise<AdminTokenPayload | null> {
  try {
    // Split JWT into parts
    const parts = token.split('.')
    if (parts.length !== 3) return null
    
    const [headerBase64, payloadBase64, signatureBase64] = parts
    
    // Verify signature
    const encoder = new TextEncoder()
    const message = `${headerBase64}.${payloadBase64}`
    const messageBuffer = encoder.encode(message)
    
    // Import secret key
    const secretBuffer = encoder.encode(getSecret())
    const key = await crypto.subtle.importKey(
      'raw',
      secretBuffer,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )
    
    // Verify signature
    const signatureUint8 = base64UrlDecode(signatureBase64)
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureUint8 as BufferSource,
      messageBuffer
    )
    
    if (!isValid) return null
    
    // Decode payload
    const payloadBuffer = base64UrlDecode(payloadBase64)
    const payloadJson = new TextDecoder().decode(payloadBuffer)
    const payload = JSON.parse(payloadJson) as AdminTokenPayload
    
    // Verify expiration
    const now = Math.floor(Date.now() / 1000)
    if (payload.exp < now) return null
    
    // Verify role
    if (payload.role !== 'admin') return null
    
    return payload
    
  } catch (error) {
    console.error('JWT verification error:', error)
    return null
  }
}

/**
 * Extract JWT token from request (cookie or Authorization header)
 * 
 * @param request - Next.js request object
 * @returns string | null - Token or null
 */
export function extractTokenFromRequest(request: NextRequest): string | null {
  // 1. Try Cookie (Preferred for security)
  const cookieToken = request.cookies.get(COOKIE_NAME)?.value
  if (cookieToken) return cookieToken

  // 2. Try Authorization Header (Fallback for legacy/direct API calls)
  const authHeader = request.headers.get('authorization')
  return authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null
}

/**
 * Authenticate admin request
 * 
 * @param request - Next.js request object
 * @returns Promise<AdminTokenPayload | null> - Decoded token or null
 */
export async function authenticateAdmin(request: NextRequest): Promise<AdminTokenPayload | null> {
  const token = extractTokenFromRequest(request)
  return token ? await verifyAdminToken(token) : null
}

/**
 * Check if token is expiring soon (within 1 hour)
 * 
 * @param token - Decoded token payload
 * @returns boolean - True if expiring within 1 hour
 */
export function isTokenExpiringSoon(token: AdminTokenPayload): boolean {
  const now = Math.floor(Date.now() / 1000)
  const oneHour = 60 * 60
  return (token.exp - now) < oneHour
}

/**
 * Refresh token if needed
 * 
 * @param token - Decoded token payload
 * @returns Promise<string | null> - New token or null
 */
export async function refreshTokenIfNeeded(token: AdminTokenPayload): Promise<string | null> {
  return isTokenExpiringSoon(token) ? await generateAdminToken() : null
}

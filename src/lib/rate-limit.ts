/**
 * Rate Limiting Utilities for moof.city
 * 
 * Hybrid rate limiting system:
 * - Production: Supabase-backed (distributed, persistent)
 * - Development: In-memory (fast, simple)
 * 
 * Rate Limit Configurations:
 * - Fortune Generation: 10 requests per 10 seconds (prevents spam)
 * - Admin Login: 5 attempts per 15 minutes (prevents brute force)
 * - Admin Operations: 30 requests per minute (prevents abuse)
 */

import { NextRequest } from 'next/server'
import { InMemoryRateLimiter } from './rate-limit-memory'
import { SupabaseRateLimiter } from './rate-limit-supabase'

// --- RATE LIMITER SELECTION ---

// Determine which limiter to use based on environment
const isProduction = process.env.NODE_ENV === 'production'
const hasSupabase = Boolean(
  process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY
)

// Use Supabase in production when available, fallback to in-memory
const shouldUseSupabase = isProduction && hasSupabase

// Log rate limiter selection for debugging
if (typeof window === 'undefined') {
  console.log(`[Rate Limit] Using ${shouldUseSupabase ? 'Supabase' : 'In-Memory'} rate limiter`)
}

// Select rate limiter implementation
const RateLimiter = shouldUseSupabase ? SupabaseRateLimiter : InMemoryRateLimiter

// --- RATE LIMITER INSTANCES ---

/**
 * Fortune Generation Rate Limiter
 * Limits: 10 requests per 10 seconds
 * Purpose: Prevent spam and abuse of fortune generation
 */
export const fortuneRateLimit = new RateLimiter(10, 10000)

/**
 * Admin Login Rate Limiter
 * Limits: 5 attempts per 15 minutes
 * Purpose: Prevent brute force password attacks
 */
export const adminLoginRateLimit = new RateLimiter(5, 15 * 60 * 1000)

/**
 * Admin Operations Rate Limiter
 * Limits: 30 requests per minute
 * Purpose: Prevent abuse of admin functionality
 */
export const adminOpsRateLimit = new RateLimiter(30, 60000)

// --- IP ADDRESS HELPERS ---

/**
 * Extract client IP address from request headers
 * Supports various proxy configurations (Vercel, Cloudflare, etc.)
 */
export function getClientIp(request: NextRequest): string {
  // Check forwarded IP headers (common in production behind proxies)
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    // X-Forwarded-For can contain multiple IPs, take the first one
    return forwardedFor.split(',')[0].trim()
  }

  // Check real IP header (Cloudflare, etc.)
  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp.trim()
  }

  // Fallback to connection remote address
  const cfConnectingIp = request.headers.get('cf-connecting-ip')
  if (cfConnectingIp) {
    return cfConnectingIp.trim()
  }

  // Development fallback
  return 'dev-local'
}

/**
 * Create a rate limit identifier combining IP and optional user identifier
 */
export function createRateLimitIdentifier(
  request: NextRequest, 
  prefix: string,
  userId?: string
): string {
  const ip = getClientIp(request)
  return userId ? `${prefix}:${ip}:${userId}` : `${prefix}:${ip}`
}

// --- RATE LIMIT RESPONSE HELPERS ---

/**
 * Calculate seconds until rate limit resets
 */
export function getRetryAfterSeconds(resetTime: number): number {
  return Math.ceil((resetTime - Date.now()) / 1000)
}

/**
 * Format Thai error message for rate limit exceeded
 */
export function getRateLimitErrorMessage(
  resetTime: number,
  type: 'fortune' | 'admin-login' | 'admin-ops'
): string {
  const retryAfter = getRetryAfterSeconds(resetTime)
  const minutes = Math.ceil(retryAfter / 60)
  
  const messages = {
    'fortune': `กรุณารอสักครู่ ระบบกำลังประมวลผลคำขอที่มาก่อนหน้า โปรดลองใหม่ในอีก ${retryAfter} วินาที`,
    'admin-login': `คุณพยายามเข้าสู่ระบบหลายครั้งเกินไป กรุณารออีก ${minutes} นาที`,
    'admin-ops': `คุณทำงานเร็วเกินไป กรุณารอสักครู่แล้วลองใหม่อีกครั้ง (${retryAfter} วินาที)`
  }
  
  return messages[type]
}

/**
 * Rate Limiting Utilities for moof.city
 * 
 * Uses in-memory rate limiting - zero setup required, works everywhere.
 * 
 * Rate Limit Configurations:
 * - Fortune Generation: 10 requests per 10 seconds (prevents spam)
 * - Admin Login: 5 attempts per 15 minutes (prevents brute force)
 * - Admin Operations: 30 requests per minute (prevents abuse)
 */

import { NextRequest } from 'next/server'

// --- IN-MEMORY RATE LIMITER ---

interface RateLimitEntry {
  count: number
  resetTime: number
}

class InMemoryRateLimiter {
  private store = new Map<string, RateLimitEntry>()
  private maxRequests: number
  private windowMs: number

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests
    this.windowMs = windowMs
    
    // Clean up expired entries every minute
    setInterval(() => this.cleanup(), 60000)
  }

  async limit(identifier: string): Promise<{
    success: boolean
    limit: number
    remaining: number
    reset: number
    pending: Promise<unknown>
  }> {
    const now = Date.now()
    const entry = this.store.get(identifier)

    // If no entry or entry expired, create new one
    if (!entry || now >= entry.resetTime) {
      this.store.set(identifier, {
        count: 1,
        resetTime: now + this.windowMs
      })
      return {
        success: true,
        limit: this.maxRequests,
        remaining: this.maxRequests - 1,
        reset: now + this.windowMs,
        pending: Promise.resolve()
      }
    }

    // Increment count
    entry.count++
    const remaining = Math.max(0, this.maxRequests - entry.count)
    const success = entry.count <= this.maxRequests

    return {
      success,
      limit: this.maxRequests,
      remaining,
      reset: entry.resetTime,
      pending: Promise.resolve()
    }
  }

  private cleanup() {
    const now = Date.now()
    const entries = Array.from(this.store.entries())
    for (const [key, entry] of entries) {
      if (now >= entry.resetTime) {
        this.store.delete(key)
      }
    }
  }
}

// --- RATE LIMITER INSTANCES ---

/**
 * Fortune Generation Rate Limiter
 * Limits: 10 requests per 10 seconds
 * Purpose: Prevent spam and abuse of fortune generation
 */
export const fortuneRateLimit = new InMemoryRateLimiter(10, 10000)

/**
 * Admin Login Rate Limiter
 * Limits: 5 attempts per 15 minutes
 * Purpose: Prevent brute force password attacks
 */
export const adminLoginRateLimit = new InMemoryRateLimiter(5, 15 * 60 * 1000)

/**
 * Admin Operations Rate Limiter
 * Limits: 30 requests per minute
 * Purpose: Prevent abuse of admin functionality
 */
export const adminOpsRateLimit = new InMemoryRateLimiter(30, 60000)

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

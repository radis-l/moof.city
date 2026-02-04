/**
 * In-Memory Rate Limiter (Fallback for development)
 * 
 * Lightweight rate limiter for local development.
 * Note: Does NOT work across multiple serverless instances.
 * Use SupabaseRateLimiter for production.
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

export class InMemoryRateLimiter {
  private store = new Map<string, RateLimitEntry>()
  private maxRequests: number
  private windowMs: number

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests
    this.windowMs = windowMs
  }

  async limit(identifier: string): Promise<{
    success: boolean
    limit: number
    remaining: number
    reset: number
    pending: Promise<unknown>
  }> {
    // Cleanup expired entries before checking (prevents memory bloat)
    this.cleanup()
    
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

  /**
   * Remove expired entries from memory
   * Called on every limit() check to prevent memory leaks
   */
  private cleanup() {
    const now = Date.now()
    const entries = Array.from(this.store.entries())
    
    for (const [key, entry] of entries) {
      if (now >= entry.resetTime) {
        this.store.delete(key)
      }
    }
  }

  /**
   * Get current store size (for debugging)
   */
  getStoreSize(): number {
    return this.store.size
  }
}

/**
 * Supabase-backed Rate Limiter for moof.city
 * 
 * Uses PostgreSQL table for distributed rate limiting across serverless instances.
 * Automatically handles cleanup and provides graceful degradation on errors.
 */

import { createClient } from '@supabase/supabase-js'

interface RateLimitResult {
  success: boolean
  limit: number
  remaining: number
  reset: number
  pending: Promise<unknown>
}

export class SupabaseRateLimiter {
  private supabase
  private maxRequests: number
  private windowMs: number

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests
    this.windowMs = windowMs
    
    // Initialize Supabase client
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured for rate limiting')
    }
    
    this.supabase = createClient(supabaseUrl, supabaseKey)
  }

  async limit(identifier: string): Promise<RateLimitResult> {
    const now = Date.now()
    const resetTime = new Date(now + this.windowMs)

    try {
      // Clean up expired entries first (opportunistic cleanup)
      await this.cleanupExpired()

      // Get current entry
      const { data: existing, error: fetchError } = await this.supabase
        .from('rate_limits')
        .select('*')
        .eq('identifier', identifier)
        .maybeSingle()

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "no rows found", which is ok
        throw fetchError
      }

      // If no entry or expired, create/reset
      if (!existing || new Date(existing.reset_time).getTime() <= now) {
        const { error: upsertError } = await this.supabase
          .from('rate_limits')
          .upsert({
            identifier,
            count: 1,
            reset_time: resetTime.toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'identifier'
          })

        if (upsertError) throw upsertError

        return {
          success: true,
          limit: this.maxRequests,
          remaining: this.maxRequests - 1,
          reset: resetTime.getTime(),
          pending: Promise.resolve()
        }
      }

      // Increment count
      const newCount = existing.count + 1
      const { error: updateError } = await this.supabase
        .from('rate_limits')
        .update({ 
          count: newCount,
          updated_at: new Date().toISOString()
        })
        .eq('identifier', identifier)

      if (updateError) throw updateError

      const remaining = Math.max(0, this.maxRequests - newCount)
      const success = newCount <= this.maxRequests

      return {
        success,
        limit: this.maxRequests,
        remaining,
        reset: new Date(existing.reset_time).getTime(),
        pending: Promise.resolve()
      }
    } catch (error) {
      console.error('Rate limit check failed:', error)
      
      // Graceful degradation: allow request on database error
      // This prevents rate limiting from blocking legitimate users if Supabase is down
      return {
        success: true,
        limit: this.maxRequests,
        remaining: this.maxRequests,
        reset: resetTime.getTime(),
        pending: Promise.resolve()
      }
    }
  }

  /**
   * Clean up expired rate limit entries
   * Called opportunistically on each limit check
   */
  private async cleanupExpired(): Promise<void> {
    try {
      // Only cleanup if random chance (1 in 10) to avoid excessive DB calls
      if (Math.random() > 0.1) return

      await this.supabase
        .from('rate_limits')
        .delete()
        .lt('reset_time', new Date().toISOString())
    } catch (error) {
      // Cleanup is opportunistic, ignore errors
      console.warn('Rate limit cleanup failed (non-critical):', error)
    }
  }
}

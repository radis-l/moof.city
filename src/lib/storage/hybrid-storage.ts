import { getEnvironmentInfo } from '../environment'
import { supabaseStorage, type PaginationOptions } from './supabase'
import type { UserData, FortuneResult } from '@/types'

// Re-export PaginationOptions for use in API routes
export type { PaginationOptions }

export const saveFortune = async (userData: UserData, fortuneResult: FortuneResult) => {
  return supabaseStorage.saveFortune(userData, fortuneResult)
}

export const checkEmail = async (email: string) => {
  return supabaseStorage.checkEmail(email)
}

export const getAllFortunes = async (options?: PaginationOptions) => {
  return supabaseStorage.getAllFortunes(options)
}

export const deleteFortune = async (id: string) => {
  return supabaseStorage.deleteFortune(id)
}

export const clearAllFortunes = async () => {
  return supabaseStorage.clearAllFortunes()
}

// AUTH OPERATIONS
export const verifyAdminPassword = async (password: string): Promise<boolean> => {
  const env = getEnvironmentInfo()

  // 1. Development: Use ADMIN_PASSWORD env var (default: "admin")
  if (env.isDevelopment) {
    const devPassword = process.env.ADMIN_PASSWORD || 'admin'
    return password === devPassword
  }

  // 2. Production: Use hash from Supabase database
  try {
    const { hash, error } = await supabaseStorage.getAdminHash()

    if (!error && hash) {
      // Use edge-compatible hybrid verification
      const { verifyPasswordHybrid } = await import('../auth-edge')
      const match = await verifyPasswordHybrid(password, hash)

      if (match) {
        // If hash is bcrypt, migrate to Web Crypto on successful login
        const { needsMigration, migratePasswordHash } = await import('../auth-edge')
        if (needsMigration(hash)) {
          const newHash = await migratePasswordHash(password)
          await supabaseStorage.updateAdminPassword(newHash)
          console.log('Password migrated from bcrypt to Web Crypto format')
        }
        return true
      }
    }
  } catch (error) {
    console.warn('Production auth check failed:', error)
  }

  // 3. Emergency fallback: ADMIN_PASSWORD env var (for recovery)
  if (process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD) {
    return true
  }

  return false
}

export const changeAdminPassword = async (newPassword: string): Promise<boolean> => {
  const env = getEnvironmentInfo()

  // Disable password change in development
  if (env.isDevelopment) {
    console.warn('Password change disabled in development - use ADMIN_PASSWORD env var')
    return false
  }

  try {
    // Use edge-compatible Web Crypto hashing
    const { hashPassword } = await import('../auth-edge')
    const passwordHash = await hashPassword(newPassword)

    // Update Supabase with new hash
    const { error } = await supabaseStorage.updateAdminPassword(passwordHash)

    if (error) {
      console.error('Failed to update password in Supabase:', error)
    }

    return !error
  } catch (error) {
    console.error('Password change failed:', error)
    return false
  }
}

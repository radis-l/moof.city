import { getStorageMode } from '../environment'
import { supabaseStorage, type PaginationOptions as SupabasePaginationOptions } from './supabase'
import type { UserData, FortuneResult } from '@/types'

// SQLite types (without importing the module itself for edge runtime compatibility)
export interface SQLitePaginationOptions {
  limit?: number
  offset?: number
  orderBy?: 'generated_at' | 'email'
  order?: 'asc' | 'desc'
}

// Re-export PaginationOptions for use in API routes
export type PaginationOptions = SQLitePaginationOptions & SupabasePaginationOptions

// Lazy load SQLite storage only when needed (not in edge runtime)
let sqliteStorageCache: typeof import('./sqlite').sqliteStorage | null = null
async function getSQLiteStorage() {
  if (!sqliteStorageCache) {
    const { sqliteStorage } = await import('./sqlite')
    sqliteStorageCache = sqliteStorage
  }
  return sqliteStorageCache
}

async function getStorage() {
  const mode = getStorageMode()
  
  if (mode === 'supabase') {
    return supabaseStorage
  }
  
  // Strict check: If we're on Vercel/Production but Supabase is not ready,
  // do NOT fall back to SQLite (which is temporary and misleading).
  // Instead, the getStorageMode() error will be visible in the Admin UI.
  if (mode.startsWith('error')) {
    console.error('CRITICAL: Storage configuration error. Supabase keys missing in production.')
  }

  // Lazy load SQLite only in development (Node.js runtime)
  return await getSQLiteStorage()
}

export const saveFortune = async (userData: UserData, fortuneResult: FortuneResult) => {
  const storage = await getStorage()
  return storage.saveFortune(userData, fortuneResult)
}

export const checkEmail = async (email: string) => {
  const storage = await getStorage()
  return storage.checkEmail(email)
}

export const getAllFortunes = async (options?: PaginationOptions) => {
  const storage = await getStorage()
  return storage.getAllFortunes(options)
}

export const deleteFortune = async (id: string) => {
  const storage = await getStorage()
  return storage.deleteFortune(id)
}

export const clearAllFortunes = async () => {
  const storage = await getStorage()
  return storage.clearAllFortunes()
}

// AUTH OPERATIONS
export const verifyAdminPassword = async (password: string): Promise<boolean> => {
  const mode = getStorageMode()
  
  // 1. Local Environment: Fixed password 'admin'
  if (mode === 'sqlite') {
    return password === 'admin'
  }

  // 2. Production Environment: Dynamic Supabase Auth
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

  // 3. Root Fallback: Environment Variable (Emergency Access)
  if (process.env.ADMIN_PASSWORD && password === process.env.ADMIN_PASSWORD) {
    return true
  }

  return false
}

export const changeAdminPassword = async (newPassword: string): Promise<boolean> => {
  const mode = getStorageMode()
  
  // 1. Disable in Development (SQLite mode)
  if (mode === 'sqlite') {
    console.warn('Password change disabled in development mode')
    return false
  }

  try {
    // Use edge-compatible Web Crypto hashing
    const { hashPassword } = await import('../auth-edge')
    const passwordHash = await hashPassword(newPassword)

    // 2. Update Supabase with new Web Crypto hash
    const { error } = await supabaseStorage.updateAdminPassword(passwordHash)

    if (error) {
      console.error('Failed to sync password to Supabase:', error)
    }

    return !error
  } catch (error) {
    console.error('Password change failed:', error)
    return false
  }
}

import { getStorageMode } from '../environment'
import { sqliteStorage } from './sqlite'
import { supabaseStorage } from './supabase'
import type { UserData, FortuneResult } from '@/types'

const getStorage = () => {
  const mode = getStorageMode()
  
  if (mode === 'supabase') {
    return supabaseStorage
  }
  
  if (mode.startsWith('error')) {
    console.error('CRITICAL: Storage configuration error:', mode)
    // In production/Vercel, we'd rather fail than silently save to a non-existent SQLite file
    // However, to keep the app "working" (even if not persisting correctly), we return sqliteStorage
    // but the getStorageMode() will correctly report the error to the UI
  }

  return sqliteStorage
}

export const saveFortune = async (userData: UserData, fortuneResult: FortuneResult) => {
  return getStorage().saveFortune(userData, fortuneResult)
}

export const checkEmail = async (email: string) => {
  return getStorage().checkEmail(email)
}

export const getAllFortunes = async () => {
  return getStorage().getAllFortunes()
}

export const deleteFortune = async (id: string) => {
  return getStorage().deleteFortune(id)
}

export const clearAllFortunes = async () => {
  return getStorage().clearAllFortunes()
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
    const bcrypt = await import('bcryptjs')
    const { hash, error } = await supabaseStorage.getAdminHash()

    if (!error && hash) {
      const match = await bcrypt.compare(password, hash)
      if (match) return true
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
    const bcrypt = await import('bcryptjs')
    const passwordHash = await bcrypt.hash(newPassword, 12)

    // 2. Update Supabase
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

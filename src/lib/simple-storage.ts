// Simple Storage - Replace entire hybrid system with one clean file
import { createClient } from '@supabase/supabase-js'
import type { UserData, FortuneResult, FortuneDataEntry } from '@/types'

// Initialize Supabase (production) or use in-memory Map (development)
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY
const isProduction = process.env.NODE_ENV === 'production'

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null

// Simple in-memory storage for development
const devStorage = new Map<string, FortuneDataEntry>()
const devAdminPassword = process.env.ADMIN_PASSWORD || 'temp_dev_password_change_me'

// Simple table name
const FORTUNES_TABLE = isProduction ? 'prod_fortunes' : 'dev_fortunes'
const ADMIN_TABLE = isProduction ? 'prod_admin_config' : 'dev_admin_config'

// FORTUNE OPERATIONS
export const saveFortune = async (userData: UserData, fortuneResult: FortuneResult): Promise<{
  success: boolean
  message: string
  id?: string
}> => {
  const timestamp = new Date().toISOString()
  
  if (supabase && isProduction) {
    try {
      const { data, error } = await supabase
        .from(FORTUNES_TABLE)
        .insert([{
          email: userData.email,
          age_range: userData.ageRange,
          birth_day: userData.birthDay,
          blood_group: userData.bloodGroup,
          lucky_number: fortuneResult.luckyNumber,
          relationship: fortuneResult.relationship,
          work: fortuneResult.work,
          health: fortuneResult.health,
          generated_at: timestamp
        }])
        .select('id')
        .single()

      if (error) {
        if (error.code === '23505') return { success: false, message: 'Email already exists' }
        throw error
      }

      return { success: true, message: 'Saved successfully', id: data.id }
    } catch (error: unknown) {
      return { success: false, message: error instanceof Error ? error.message : 'Save failed' }
    }
  }

  // Development: in-memory storage
  if (devStorage.has(userData.email)) {
    return { success: false, message: 'Email already exists' }
  }

  const id = `dev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  const entry: FortuneDataEntry = {
    id,
    userData,
    fortuneResult: { ...fortuneResult, generatedAt: timestamp },
    timestamp
  }
  
  devStorage.set(userData.email, entry)
  return { success: true, message: 'Saved successfully', id }
}

export const checkEmail = async (email: string): Promise<{
  success: boolean
  exists: boolean
  fortune?: FortuneDataEntry
  message: string
}> => {
  if (supabase && isProduction) {
    try {
      const { data, error } = await supabase
        .from(FORTUNES_TABLE)
        .select('*')
        .eq('email', email)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return { success: true, exists: false, message: 'Email not found' }
        throw error
      }

      const fortune: FortuneDataEntry = {
        id: data.id,
        userData: {
          email: data.email,
          ageRange: data.age_range,
          birthDay: data.birth_day,
          bloodGroup: data.blood_group
        },
        fortuneResult: {
          luckyNumber: data.lucky_number,
          relationship: data.relationship,
          work: data.work,
          health: data.health,
          generatedAt: data.generated_at
        },
        timestamp: data.generated_at
      }

      return { success: true, exists: true, fortune, message: 'Email found' }
    } catch (error: unknown) {
      return { success: false, exists: false, message: error instanceof Error ? error.message : 'Check failed' }
    }
  }

  // Development: check in-memory storage
  const fortune = devStorage.get(email)
  return {
    success: true,
    exists: !!fortune,
    fortune,
    message: fortune ? 'Email found' : 'Email not found'
  }
}

// ADMIN OPERATIONS (simplified)
export const getAllFortunes = async (): Promise<{
  success: boolean
  data: FortuneDataEntry[]
  message: string
}> => {
  if (supabase && isProduction) {
    try {
      const { data, error } = await supabase
        .from(FORTUNES_TABLE)
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      const formattedData: FortuneDataEntry[] = data.map(row => ({
        id: row.id,
        userData: {
          email: row.email,
          ageRange: row.age_range,
          birthDay: row.birth_day,
          bloodGroup: row.blood_group
        },
        fortuneResult: {
          luckyNumber: row.lucky_number,
          relationship: row.relationship,
          work: row.work,
          health: row.health,
          generatedAt: row.generated_at
        },
        timestamp: row.generated_at
      }))

      return { success: true, data: formattedData, message: 'Retrieved successfully' }
    } catch (error: unknown) {
      return { success: false, data: [], message: error instanceof Error ? error.message : 'Retrieval failed' }
    }
  }

  // Development: return in-memory data
  return {
    success: true,
    data: Array.from(devStorage.values()),
    message: 'Retrieved successfully'
  }
}

export const deleteFortune = async (id: string): Promise<{ success: boolean; message: string }> => {
  if (supabase && isProduction) {
    try {
      const { error } = await supabase.from(FORTUNES_TABLE).delete().eq('id', id)
      if (error) throw error
      return { success: true, message: 'Deleted successfully' }
    } catch (error: unknown) {
      return { success: false, message: error instanceof Error ? error.message : 'Delete failed' }
    }
  }

  // Development: find and delete from in-memory storage
  for (const [email, entry] of devStorage) {
    if (entry.id === id) {
      devStorage.delete(email)
      return { success: true, message: 'Deleted successfully' }
    }
  }
  
  return { success: false, message: 'Entry not found' }
}

export const clearAllFortunes = async (): Promise<{ success: boolean; message: string }> => {
  if (supabase && isProduction) {
    try {
      const { error } = await supabase.from(FORTUNES_TABLE).delete().neq('id', '00000000-0000-0000-0000-000000000000')
      if (error) throw error
      return { success: true, message: 'All data cleared' }
    } catch (error: unknown) {
      return { success: false, message: error instanceof Error ? error.message : 'Clear failed' }
    }
  }

  // Development: clear in-memory storage
  devStorage.clear()
  return { success: true, message: 'All data cleared' }
}

export const verifyAdminPassword = async (password: string): Promise<boolean> => {
  if (supabase && isProduction) {
    try {
      // Dynamic import bcrypt only when needed
      const bcrypt = await import('bcryptjs')
      
      const { data, error } = await supabase
        .from(ADMIN_TABLE)
        .select('password_hash')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error) return false
      return await bcrypt.compare(password, data.password_hash)
    } catch {
      return false
    }
  }

  // Development: use bcrypt hashing for security consistency
  try {
    const bcrypt = await import('bcryptjs')
    
    // First check if there's a hashed password stored in memory (from password changes)
    if (devAdminPasswordHash) {
      return await bcrypt.compare(password, devAdminPasswordHash)
    }
    
    // Check if devAdminPassword is already hashed (starts with $2)
    if (devAdminPassword.startsWith('$2')) {
      return await bcrypt.compare(password, devAdminPassword)
    } else {
      // Plain text comparison (for backward compatibility during transition)
      return password === devAdminPassword
    }
  } catch {
    // Fallback to plain text if bcrypt fails
    return password === devAdminPassword
  }
}

// In-memory development password storage (hashed)
let devAdminPasswordHash: string | null = null

export const changeAdminPassword = async (newPassword: string): Promise<boolean> => {
  if (supabase && isProduction) {
    try {
      const bcrypt = await import('bcryptjs')
      const passwordHash = await bcrypt.hash(newPassword, 12)
      
      // Clear existing and insert new
      await supabase.from(ADMIN_TABLE).delete().neq('id', '00000000-0000-0000-0000-000000000000')
      
      const { error } = await supabase.from(ADMIN_TABLE).insert([{
        password_hash: passwordHash,
        updated_at: new Date().toISOString()
      }])

      return !error
    } catch {
      return false
    }
  }

  // Development: hash and store in memory
  try {
    const bcrypt = await import('bcryptjs')
    devAdminPasswordHash = await bcrypt.hash(newPassword, 12)
    return true
  } catch {
    return false
  }
}
// Unified Storage System - Simplified architecture
// Production: Supabase only | Development: SQLite only

import bcrypt from 'bcryptjs'
import { createClient } from '@supabase/supabase-js'
import type { UserData, FortuneResult, FortuneDataEntry } from '@/types'
import { 
  saveFortuneDataSQLite, 
  getAllFortuneDataSQLite, 
  deleteFortuneDataSQLite,
  clearAllFortuneDataSQLite,
  checkEmailExistsSQLite,
  getAdminPasswordHashSQLite,
  saveAdminPasswordHashSQLite
} from './sqlite-storage'

// Environment detection
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL
const forceSQLiteLocal = process.env.USE_SQLITE_LOCAL === 'true'
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

// Initialize Supabase (production only, or when explicitly not forcing SQLite)
const supabase = (isProduction && !forceSQLiteLocal) && supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null

// Table name helper
const getTableName = (baseTable: string) => {
  return isProduction ? `prod_${baseTable}` : `dev_${baseTable}`
}

// FORTUNE DATA OPERATIONS
export const saveFortuneData = async (
  userData: UserData,
  fortuneResult: FortuneResult
): Promise<{ success: boolean; message: string; id?: string }> => {
  if (isProduction && supabase) {
    try {
      const { data, error } = await supabase
        .from(getTableName('fortunes'))
        .insert([{
          email: userData.email,
          age_range: userData.ageRange,
          birth_day: userData.birthDay,
          blood_group: userData.bloodGroup,
          lucky_number: fortuneResult.luckyNumber,
          relationship: fortuneResult.relationship,
          work: fortuneResult.work,
          health: fortuneResult.health,
          generated_at: new Date().toISOString()
        }])
        .select('id')
        .single()

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          return { success: false, message: 'Email already exists' }
        }
        throw error
      }

      return {
        success: true,
        message: 'Fortune data saved successfully',
        id: data.id
      }
    } catch (error: unknown) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to save fortune data'
      }
    }
  }
  
  return saveFortuneDataSQLite(userData, fortuneResult)
}

export const checkEmailExists = async (email: string): Promise<{
  success: boolean
  exists: boolean
  fortune?: FortuneDataEntry
  message: string
}> => {
  if (isProduction && supabase) {
    try {
      const { data, error } = await supabase
        .from(getTableName('fortunes'))
        .select('*')
        .eq('email', email)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return { success: true, exists: false, message: 'Email not found' }
        }
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
      return {
        success: false,
        exists: false,
        message: error instanceof Error ? error.message : 'Failed to check email'
      }
    }
  }

  return checkEmailExistsSQLite(email)
}

export const getAllFortuneData = async (): Promise<{
  success: boolean
  data: FortuneDataEntry[]
  totalRecords: number
  message: string
}> => {
  if (isProduction && supabase) {
    try {
      const { data, error } = await supabase
        .from(getTableName('fortunes'))
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      const formattedData: FortuneDataEntry[] = data.map((row: any) => ({
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

      return {
        success: true,
        data: formattedData,
        totalRecords: formattedData.length,
        message: 'Data retrieved successfully'
      }
    } catch (error: unknown) {
      return {
        success: false,
        data: [],
        totalRecords: 0,
        message: error instanceof Error ? error.message : 'Failed to retrieve data'
      }
    }
  }

  return getAllFortuneDataSQLite()
}

export const deleteFortuneData = async (id: string): Promise<{
  success: boolean
  message: string
}> => {
  if (isProduction && supabase) {
    try {
      const { error } = await supabase
        .from(getTableName('fortunes'))
        .delete()
        .eq('id', id)

      if (error) throw error
      return { success: true, message: 'Fortune data deleted successfully' }
    } catch (error: unknown) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete fortune data'
      }
    }
  }

  return deleteFortuneDataSQLite(id)
}

export const clearAllFortuneData = async (): Promise<{
  success: boolean
  message: string
}> => {
  if (isProduction && supabase) {
    try {
      const { error } = await supabase
        .from(getTableName('fortunes'))
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000')

      if (error) throw error
      return { success: true, message: 'All fortune data cleared successfully' }
    } catch (error: unknown) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to clear all data'
      }
    }
  }

  return clearAllFortuneDataSQLite()
}

export const exportToCSV = async (): Promise<{
  success: boolean
  csvData?: string
  message: string
}> => {
  const result = await getAllFortuneData()
  
  if (!result.success) {
    return { success: false, message: result.message }
  }
  
  if (result.data.length === 0) {
    return {
      success: true,
      csvData: 'ID,Email,Age Range,Birth Day,Blood Group,Lucky Number,Relationship,Work,Health,Generated At\n',
      message: 'No data to export'
    }
  }
  
  const headers = 'ID,Email,Age Range,Birth Day,Blood Group,Lucky Number,Relationship,Work,Health,Generated At\n'
  const rows = result.data.map(item => 
    `${item.id},"${item.userData.email}","${item.userData.ageRange}","${item.userData.birthDay}","${item.userData.bloodGroup}",${item.fortuneResult.luckyNumber},"${item.fortuneResult.relationship}","${item.fortuneResult.work}","${item.fortuneResult.health}","${item.timestamp}"`
  ).join('\n')
  
  return {
    success: true,
    csvData: headers + rows,
    message: 'CSV data generated successfully'
  }
}

// ADMIN AUTH OPERATIONS
export const getAdminPasswordHash = async (): Promise<string | null> => {
  if (isProduction && supabase) {
    try {
      const { data, error } = await supabase
        .from(getTableName('admin_config'))
        .select('password_hash')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error) {
        if (error.code !== 'PGRST116') {
          console.error('Error reading admin config from Supabase:', error)
        }
        return null
      }

      return data.password_hash
    } catch (error) {
      console.error('Error reading admin config from Supabase:', error)
      return null
    }
  }

  return getAdminPasswordHashSQLite()
}

export const setAdminPasswordHash = async (password: string): Promise<boolean> => {
  const passwordHash = await bcrypt.hash(password, 12)

  if (isProduction && supabase) {
    try {
      // Clear existing config
      await supabase
        .from(getTableName('admin_config'))
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000')
      
      // Insert new config
      const { error } = await supabase
        .from(getTableName('admin_config'))
        .insert([{
          password_hash: passwordHash,
          updated_at: new Date().toISOString()
        }])

      if (error) {
        console.error('Error saving admin config to Supabase:', error)
        return false
      }

      return true
    } catch (error) {
      console.error('Error saving admin config to Supabase:', error)
      return false
    }
  }

  return saveAdminPasswordHashSQLite(passwordHash)
}

export const initializeAdminPassword = async (defaultPassword: string): Promise<boolean> => {
  const existing = await getAdminPasswordHash()
  if (existing) {
    return false // Already initialized
  }
  
  return await setAdminPasswordHash(defaultPassword)
}
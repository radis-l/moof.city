import { createClient } from '@supabase/supabase-js'
import type { UserData, FortuneResult, FortuneDataEntry } from '@/types'

// Initialize Supabase client (with build-time fallback)
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY

// Create client only if both credentials exist
const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null

// Environment-based table names
const getTableName = (baseTable: string) => {
  const isProduction = process.env.NODE_ENV === 'production' && process.env.VERCEL
  return isProduction ? `prod_${baseTable}` : `dev_${baseTable}`
}

const FORTUNES_TABLE = getTableName('fortunes')

// Save fortune data to Supabase
export const saveFortuneDataSupabase = async (
  userData: UserData,
  fortuneResult: FortuneResult
): Promise<{ success: boolean; message: string; id?: string }> => {
  if (!supabase) {
    return {
      success: false,
      message: 'Supabase client not configured - missing credentials'
    }
  }

  try {
    // Use upsert to handle duplicate emails
    const { data, error } = await supabase
      .from(FORTUNES_TABLE)
      .upsert([
        {
          email: userData.email,
          age_range: userData.ageRange,
          birth_day: userData.birthDay,
          blood_group: userData.bloodGroup,
          lucky_number: fortuneResult.luckyNumber,
          relationship: fortuneResult.relationship,
          work: fortuneResult.work,
          health: fortuneResult.health,
          generated_at: fortuneResult.generatedAt
        }
      ], { 
        onConflict: 'email',
        ignoreDuplicates: false 
      })
      .select()
      .single()

    if (error) {
      return {
        success: false,
        message: `Failed to save fortune data: ${error.message}`
      }
    }

    return {
      success: true,
      message: 'Fortune data saved successfully to Supabase',
      id: data.id
    }
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

// Get all fortune data from Supabase
export const getAllFortuneDataSupabase = async (): Promise<{
  success: boolean
  data: FortuneDataEntry[]
  totalRecords: number
  message: string
}> => {
  if (!supabase) {
    return {
      success: false,
      data: [],
      totalRecords: 0,
      message: 'Supabase client not configured - missing credentials'
    }
  }

  try {
    const { data, error } = await supabase
      .from(FORTUNES_TABLE)
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      return {
        success: false,
        data: [],
        totalRecords: 0,
        message: `Failed to get fortune data: ${error.message}`
      }
    }

    // Transform Supabase data to match FortuneDataEntry interface
    const transformedData: FortuneDataEntry[] = data.map((item) => ({
      id: item.id,
      userData: {
        email: item.email,
        ageRange: item.age_range,
        birthDay: item.birth_day,
        bloodGroup: item.blood_group,
        timestamp: item.created_at
      },
      fortuneResult: {
        luckyNumber: item.lucky_number,
        relationship: item.relationship,
        work: item.work,
        health: item.health,
        generatedAt: item.generated_at
      },
      timestamp: item.created_at
    }))

    return {
      success: true,
      data: transformedData,
      totalRecords: transformedData.length,
      message: 'Fortune data retrieved successfully from Supabase'
    }
  } catch (error: unknown) {
    return {
      success: false,
      data: [],
      totalRecords: 0,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

// Check if email exists in Supabase
export const checkEmailExistsSupabase = async (email: string): Promise<{
  success: boolean
  exists: boolean
  fortune?: FortuneDataEntry
  message: string
}> => {
  if (!supabase) {
    return {
      success: false,
      exists: false,
      message: 'Supabase client not configured - missing credentials'
    }
  }

  try {
    const { data, error } = await supabase
      .from(FORTUNES_TABLE)
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1)

    if (error) {
      return {
        success: false,
        exists: false,
        message: `Failed to check email: ${error.message}`
      }
    }

    if (!data || data.length === 0) {
      return {
        success: true,
        exists: false,
        message: 'Email not found'
      }
    }

    const item = data[0]
    const fortune: FortuneDataEntry = {
      id: item.id,
      userData: {
        email: item.email,
        ageRange: item.age_range,
        birthDay: item.birth_day,
        bloodGroup: item.blood_group,
        timestamp: item.created_at
      },
      fortuneResult: {
        luckyNumber: item.lucky_number,
        relationship: item.relationship,
        work: item.work,
        health: item.health,
        generatedAt: item.generated_at
      },
      timestamp: item.created_at
    }

    return {
      success: true,
      exists: true,
      fortune,
      message: 'Email found'
    }
  } catch (error: unknown) {
    return {
      success: false,
      exists: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

// Delete fortune data from Supabase
export const deleteFortuneDataSupabase = async (id: string): Promise<{
  success: boolean
  message: string
}> => {
  if (!supabase) {
    return {
      success: false,
      message: 'Supabase client not configured - missing credentials'
    }
  }

  try {
    const { error } = await supabase
      .from(FORTUNES_TABLE)
      .delete()
      .eq('id', id)

    if (error) {
      return {
        success: false,
        message: `Failed to delete fortune data: ${error.message}`
      }
    }

    return {
      success: true,
      message: 'Fortune data deleted successfully from Supabase'
    }
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

// Clear all fortune data from Supabase
export const clearAllFortuneDataSupabase = async (): Promise<{
  success: boolean
  message: string
}> => {
  if (!supabase) {
    return {
      success: false,
      message: 'Supabase client not configured - missing credentials'
    }
  }

  try {
    const { error } = await supabase
      .from(FORTUNES_TABLE)
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all records

    if (error) {
      return {
        success: false,
        message: `Failed to clear all fortune data: ${error.message}`
      }
    }

    return {
      success: true,
      message: 'All fortune data cleared successfully from Supabase'
    }
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}

// Export to CSV from Supabase
export const exportToCSVSupabase = async (): Promise<{
  success: boolean
  csvData?: string
  message: string
}> => {
  if (!supabase) {
    return {
      success: false,
      message: 'Supabase client not configured - missing credentials'
    }
  }

  try {
    const result = await getAllFortuneDataSupabase()
    
    if (!result.success) {
      return {
        success: false,
        message: result.message
      }
    }

    if (result.data.length === 0) {
      return {
        success: true,
        csvData: 'Email,Age Range,Birth Day,Blood Group,Lucky Number,Relationship,Work,Health,Generated At,Created At\n',
        message: 'No data to export'
      }
    }

    // CSV headers
    let csvContent = 'Email,Age Range,Birth Day,Blood Group,Lucky Number,Relationship,Work,Health,Generated At,Created At\n'
    
    // Add data rows
    result.data.forEach(entry => {
      const row = [
        entry.userData.email,
        entry.userData.ageRange,
        entry.userData.birthDay,
        entry.userData.bloodGroup,
        entry.fortuneResult.luckyNumber,
        entry.fortuneResult.relationship,
        entry.fortuneResult.work,
        entry.fortuneResult.health,
        entry.fortuneResult.generatedAt,
        entry.timestamp
      ]
      csvContent += row.map(field => `"${field}"`).join(',') + '\n'
    })

    return {
      success: true,
      csvData: csvContent,
      message: 'CSV export completed successfully from Supabase'
    }
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }
  }
}
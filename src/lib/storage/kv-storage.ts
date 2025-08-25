import { kv } from '@vercel/kv'
import type { UserData, FortuneResult, FortuneDataEntry } from '@/types'

// @vercel/kv automatically detects environment variables in this order:
// KV_REST_API_URL, STORAGE_REST_API_URL, UPSTASH_REDIS_REST_URL
// KV_REST_API_TOKEN, STORAGE_REST_API_TOKEN, UPSTASH_REDIS_REST_TOKEN

const KV_KEY = 'fortune-data'

// Save fortune data to Vercel KV
export const saveFortuneDataKV = async (
  userData: UserData,
  fortuneResult: FortuneResult
): Promise<{ success: boolean; message: string; id?: string }> => {
  try {
    // Get existing data
    const existingData: FortuneDataEntry[] = await kv.get(KV_KEY) || []
    
    // Find existing entry with same email
    const existingEntryIndex = existingData.findIndex(entry => 
      entry.userData.email === userData.email
    )
    
    const entryData: FortuneDataEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleString('th-TH', { 
        timeZone: 'Asia/Bangkok',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }),
      userData,
      fortuneResult
    }
    
    let updatedData: FortuneDataEntry[]
    let message: string
    
    if (existingEntryIndex !== -1) {
      // Update existing entry (replace)
      updatedData = [...existingData]
      updatedData[existingEntryIndex] = entryData
      message = 'Fortune updated successfully'
    } else {
      // Add new entry
      updatedData = [...existingData, entryData]
      message = 'Fortune saved successfully'
    }
    
    // Save to KV
    await kv.set(KV_KEY, updatedData)
    
    return {
      success: true,
      message,
      id: entryData.id
    }
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error saving fortune data'
    }
  }
}

// Get all fortune data from Vercel KV
export const getAllFortuneDataKV = async (): Promise<{
  success: boolean
  data: FortuneDataEntry[]
  totalRecords: number
  message: string
}> => {
  try {
    const data: FortuneDataEntry[] = await kv.get(KV_KEY) || []
    
    return {
      success: true,
      data,
      totalRecords: data.length,
      message: `Retrieved ${data.length} fortune records`
    }
  } catch (error: unknown) {
    return {
      success: false,
      data: [],
      totalRecords: 0,
      message: error instanceof Error ? error.message : 'Error retrieving fortune data'
    }
  }
}

// Delete fortune data by ID from Vercel KV
export const deleteFortuneDataKV = async (id: string): Promise<{
  success: boolean
  message: string
}> => {
  try {
    const data: FortuneDataEntry[] = await kv.get(KV_KEY) || []
    const filteredData = data.filter(item => item.id !== id)
    
    if (data.length === filteredData.length) {
      return {
        success: false,
        message: 'Fortune data not found'
      }
    }
    
    await kv.set(KV_KEY, filteredData)
    
    return {
      success: true,
      message: 'Fortune data deleted successfully'
    }
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error deleting fortune data'
    }
  }
}

// Clear all fortune data from Vercel KV
export const clearAllFortuneDataKV = async (): Promise<{
  success: boolean
  message: string
}> => {
  try {
    await kv.set(KV_KEY, [])
    
    return {
      success: true,
      message: 'All fortune data cleared successfully'
    }
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error clearing all data'
    }
  }
}

// Check if email exists in Vercel KV
export const checkEmailExistsKV = async (email: string): Promise<{
  success: boolean
  exists: boolean
  fortune?: FortuneDataEntry
  message: string
}> => {
  try {
    const data: FortuneDataEntry[] = await kv.get(KV_KEY) || []
    const existingEntry = data.find(entry => entry.userData.email === email)
    
    return {
      success: true,
      exists: !!existingEntry,
      fortune: existingEntry,
      message: existingEntry ? 'Email found' : 'Email not found'
    }
  } catch (error: unknown) {
    return {
      success: false,
      exists: false,
      message: error instanceof Error ? error.message : 'Error checking email'
    }
  }
}

// Export data to CSV format from Vercel KV
export const exportToCSVKV = async (): Promise<{
  success: boolean
  csvData?: string
  message: string
}> => {
  try {
    const data: FortuneDataEntry[] = await kv.get(KV_KEY) || []
    
    if (data.length === 0) {
      return {
        success: false,
        message: 'No data to export'
      }
    }
    
    // CSV headers
    const headers = [
      'ID',
      'Timestamp', 
      'Email',
      'Age Range',
      'Birth Day',
      'Blood Group',
      'Lucky Number',
      'Relationship',
      'Work',
      'Health'
    ]
    
    // Convert data to CSV rows
    const rows = data.map(entry => [
      entry.id,
      entry.timestamp,
      entry.userData.email,
      entry.userData.ageRange,
      entry.userData.birthDay,
      entry.userData.bloodGroup,
      entry.fortuneResult.luckyNumber,
      `"${entry.fortuneResult.relationship.replace(/"/g, '""')}"`,
      `"${entry.fortuneResult.work.replace(/"/g, '""')}"`,
      `"${entry.fortuneResult.health.replace(/"/g, '""')}"`
    ])
    
    // Combine headers and rows
    const csvData = [headers, ...rows]
      .map(row => row.join(','))
      .join('\n')
    
    return {
      success: true,
      csvData,
      message: `Exported ${data.length} records to CSV`
    }
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error exporting to CSV'
    }
  }
}
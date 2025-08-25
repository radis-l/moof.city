import type { UserData, FortuneResult, FortuneDataEntry } from '@/types'

// Import both storage methods
import {
  saveFortuneData as saveFile,
  getAllFortuneData as getAllFile,
  deleteFortuneData as deleteFile,
  exportToCSV as exportFile
} from './file-storage'

import {
  saveFortuneDataKV,
  getAllFortuneDataKV,
  deleteFortuneDataKV,
  clearAllFortuneDataKV,
  checkEmailExistsKV,
  exportToCSVKV
} from './kv-storage'

// Detect if we're in production (Vercel) or development
const isProduction = process.env.NODE_ENV === 'production' && process.env.VERCEL

// Hybrid save function
export const saveFortuneData = async (
  userData: UserData,
  fortuneResult: FortuneResult
): Promise<{ success: boolean; message: string; id?: string }> => {
  if (isProduction) {
    return saveFortuneDataKV(userData, fortuneResult)
  } else {
    return saveFile(userData, fortuneResult)
  }
}

// Hybrid get all function
export const getAllFortuneData = async (): Promise<{
  success: boolean
  data: FortuneDataEntry[]
  totalRecords: number
  message: string
}> => {
  if (isProduction) {
    return getAllFortuneDataKV()
  } else {
    return getAllFile()
  }
}

// Hybrid delete function
export const deleteFortuneData = async (id: string): Promise<{
  success: boolean
  message: string
}> => {
  if (isProduction) {
    return deleteFortuneDataKV(id)
  } else {
    return deleteFile(id)
  }
}

// Clear all function (KV only, file storage uses direct file write)
export const clearAllFortuneData = async (): Promise<{
  success: boolean
  message: string
}> => {
  if (isProduction) {
    return clearAllFortuneDataKV()
  } else {
    // For local development, use file system
    try {
      const fs = await import('fs')
      const path = await import('path')
      const DATA_DIR = path.join(process.cwd(), 'data')
      const FORTUNE_FILE = path.join(DATA_DIR, 'fortune-data.json')
      
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true })
      }
      
      fs.writeFileSync(FORTUNE_FILE, '[]')
      
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
}

// Check email exists function
export const checkEmailExists = async (email: string): Promise<{
  success: boolean
  exists: boolean
  fortune?: FortuneDataEntry
  message: string
}> => {
  if (isProduction) {
    return checkEmailExistsKV(email)
  } else {
    // Use file storage for development
    try {
      const allData = await getAllFile()
      if (!allData.success) {
        return {
          success: false,
          exists: false,
          message: allData.message
        }
      }
      
      const existingEntry = allData.data.find(entry => entry.userData.email === email)
      
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
}

// Export to CSV function
export const exportToCSV = async (): Promise<{
  success: boolean
  csvData?: string
  message: string
}> => {
  if (isProduction) {
    return exportToCSVKV()
  } else {
    return exportFile()
  }
}
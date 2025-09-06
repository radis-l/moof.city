import type { UserData, FortuneResult, FortuneDataEntry } from '@/types'

// Import storage methods
import {
  saveFortuneData as saveFile,
  getAllFortuneData as getAllFile,
  deleteFortuneData as deleteFile,
  exportToCSV as exportFile
} from './file-storage'

import {
  saveFortuneDataSupabase,
  getAllFortuneDataSupabase,
  deleteFortuneDataSupabase,
  clearAllFortuneDataSupabase,
  checkEmailExistsSupabase,
  exportToCSVSupabase
} from './supabase-storage'

import {
  saveFortuneDataSQLite,
  getAllFortuneDataSQLite,
  deleteFortuneDataSQLite,
  clearAllFortuneDataSQLite,
  checkEmailExistsSQLite,
  exportToCSVSQLite
} from './sqlite-storage'

// Detect storage method based on environment
const isProduction = process.env.NODE_ENV === 'production' && process.env.VERCEL
const hasSupabase = process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY
const useSupabasePrimary = process.env.USE_SUPABASE_PRIMARY !== 'false' // Default to true

// Storage method priority: 
// Production: Supabase Primary
// Local Dev: SQLite > File Storage (fallback only)
const getStorageMethod = () => {
  console.log('Storage method:', hasSupabase ? 'Supabase' : 'SQLite/File', 'hasSupabase:', hasSupabase, 'useSupabasePrimary:', useSupabasePrimary)
  
  if (hasSupabase && useSupabasePrimary) return 'supabase'
  if (!isProduction) return 'sqlite' // Local development uses SQLite
  
  // Fallback for production without Supabase (should not happen)
  console.warn('Production environment without Supabase credentials - using SQLite fallback')
  return 'sqlite'
}

// Hybrid save function
export const saveFortuneData = async (
  userData: UserData,
  fortuneResult: FortuneResult
): Promise<{ success: boolean; message: string; id?: string }> => {
  const storageMethod = getStorageMethod()
  
  switch (storageMethod) {
    case 'supabase':
      return saveFortuneDataSupabase(userData, fortuneResult)
    case 'sqlite':
      return saveFortuneDataSQLite(userData, fortuneResult)
    default:
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
  const storageMethod = getStorageMethod()
  
  switch (storageMethod) {
    case 'supabase':
      return getAllFortuneDataSupabase()
    case 'sqlite':
      return getAllFortuneDataSQLite()
    default:
      return getAllFile()
  }
}

// Hybrid delete function
export const deleteFortuneData = async (id: string): Promise<{
  success: boolean
  message: string
}> => {
  const storageMethod = getStorageMethod()
  
  switch (storageMethod) {
    case 'supabase':
      return deleteFortuneDataSupabase(id)
    case 'sqlite':
      return deleteFortuneDataSQLite(id)
    default:
      return deleteFile(id)
  }
}

// Clear all function
export const clearAllFortuneData = async (): Promise<{
  success: boolean
  message: string
}> => {
  const storageMethod = getStorageMethod()
  
  switch (storageMethod) {
    case 'supabase':
      return clearAllFortuneDataSupabase()
    case 'sqlite':
      return clearAllFortuneDataSQLite()
    default:
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
  const storageMethod = getStorageMethod()
  
  switch (storageMethod) {
    case 'supabase':
      return checkEmailExistsSupabase(email)
    case 'sqlite':
      return checkEmailExistsSQLite(email)
    default:
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
  const storageMethod = getStorageMethod()
  
  switch (storageMethod) {
    case 'supabase':
      return exportToCSVSupabase()
    case 'sqlite':
      return exportToCSVSQLite()
    default:
      return exportFile()
  }
}
import fs from 'fs'
import path from 'path'
import type { UserData, FortuneResult } from '@/types'

// Define data structure for storing fortune data
export interface FortuneDataEntry {
  id: string
  timestamp: string
  userData: UserData
  fortuneResult: FortuneResult
}

// File paths
const DATA_DIR = path.join(process.cwd(), 'data')
const FORTUNE_FILE = path.join(DATA_DIR, 'fortune-data.json')

// Ensure data directory exists
const ensureDataDir = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

// Read existing data from file
const readFortuneData = (): FortuneDataEntry[] => {
  try {
    ensureDataDir()
    
    if (!fs.existsSync(FORTUNE_FILE)) {
      return []
    }
    
    const data = fs.readFileSync(FORTUNE_FILE, 'utf8')
    return JSON.parse(data) || []
  } catch (error) {
    console.error('Error reading fortune data:', error)
    return []
  }
}

// Write data to file
const writeFortuneData = (data: FortuneDataEntry[]): boolean => {
  try {
    ensureDataDir()
    fs.writeFileSync(FORTUNE_FILE, JSON.stringify(data, null, 2))
    return true
  } catch (error) {
    console.error('Error writing fortune data:', error)
    return false
  }
}

// Add new fortune data
export const saveFortuneData = async (
  userData: UserData,
  fortuneResult: FortuneResult
): Promise<{ success: boolean; message: string; id?: string }> => {
  try {
    const existingData = readFortuneData()
    
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
    
    const success = writeFortuneData(updatedData)
    
    if (success) {
      return {
        success: true,
        message,
        id: entryData.id
      }
    } else {
      return {
        success: false,
        message: 'Failed to save fortune data'
      }
    }
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error saving fortune data'
    }
  }
}

// Get all fortune data
export const getAllFortuneData = async (): Promise<{
  success: boolean
  data: FortuneDataEntry[]
  totalRecords: number
  message: string
}> => {
  try {
    const data = readFortuneData()
    
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

// Get fortune data by ID
export const getFortuneDataById = async (id: string): Promise<{
  success: boolean
  data?: FortuneDataEntry
  message: string
}> => {
  try {
    const data = readFortuneData()
    const entry = data.find(item => item.id === id)
    
    if (entry) {
      return {
        success: true,
        data: entry,
        message: 'Fortune data found'
      }
    } else {
      return {
        success: false,
        message: 'Fortune data not found'
      }
    }
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error retrieving fortune data'
    }
  }
}


// Delete fortune data by ID
export const deleteFortuneData = async (id: string): Promise<{
  success: boolean
  message: string
}> => {
  try {
    const data = readFortuneData()
    const filteredData = data.filter(item => item.id !== id)
    
    if (data.length === filteredData.length) {
      return {
        success: false,
        message: 'Fortune data not found'
      }
    }
    
    const success = writeFortuneData(filteredData)
    
    if (success) {
      return {
        success: true,
        message: 'Fortune data deleted successfully'
      }
    } else {
      return {
        success: false,
        message: 'Failed to delete fortune data'
      }
    }
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error deleting fortune data'
    }
  }
}

// Export data to CSV format
export const exportToCSV = async (): Promise<{
  success: boolean
  csvData?: string
  message: string
}> => {
  try {
    const data = readFortuneData()
    
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
      .join('\\n')
    
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
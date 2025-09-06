import { v4 as uuidv4 } from 'uuid'
import path from 'path'
import fs from 'fs'
import type { UserData, FortuneResult, FortuneDataEntry } from '@/types'

// Dynamic import for SQLite to handle production environments
let Database: any = null
try {
  if (typeof window === 'undefined' && process.env.NODE_ENV !== 'production') {
    Database = require('better-sqlite3')
  }
} catch (error) {
  // SQLite not available (production environment)
  Database = null
}

const DB_PATH = path.join(process.cwd(), 'data', 'local.db')

// Ensure data directory exists
const ensureDataDir = () => {
  const dataDir = path.dirname(DB_PATH)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
}

// Initialize database with tables
const initDatabase = () => {
  if (!Database) {
    throw new Error('SQLite not available in production environment')
  }
  ensureDataDir()
  const db = new Database(DB_PATH)
  
  // Create fortunes table
  db.exec(`
    CREATE TABLE IF NOT EXISTS fortunes (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      age_range TEXT NOT NULL,
      birth_day TEXT NOT NULL,
      blood_group TEXT NOT NULL,
      lucky_number INTEGER NOT NULL,
      relationship TEXT NOT NULL,
      work TEXT NOT NULL,
      health TEXT NOT NULL,
      generated_at TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `)
  
  // Create admin_config table
  db.exec(`
    CREATE TABLE IF NOT EXISTS admin_config (
      id TEXT PRIMARY KEY,
      password_hash TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
  `)
  
  return db
}

// Get database instance
const getDatabase = () => {
  if (!Database) {
    throw new Error('SQLite not available in production environment')
  }
  return initDatabase()
}

// Save fortune data to SQLite
export const saveFortuneDataSQLite = async (
  userData: UserData,
  fortuneResult: FortuneResult
): Promise<{ success: boolean; message: string; id?: string }> => {
  try {
    const db = getDatabase()
    const id = uuidv4()
    const timestamp = new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })
    
    const stmt = db.prepare(`
      INSERT INTO fortunes (
        id, email, age_range, birth_day, blood_group,
        lucky_number, relationship, work, health, generated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    
    stmt.run(
      id,
      userData.email,
      userData.ageRange,
      userData.birthDay,
      userData.bloodGroup,
      fortuneResult.luckyNumber,
      fortuneResult.relationship,
      fortuneResult.work,
      fortuneResult.health,
      timestamp
    )
    
    db.close()
    
    return {
      success: true,
      message: 'Fortune data saved successfully',
      id
    }
  } catch (error: unknown) {
    if (error instanceof Error && 'code' in error && error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return {
        success: false,
        message: 'Email already exists'
      }
    }
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to save fortune data'
    }
  }
}

// Get all fortune data from SQLite
export const getAllFortuneDataSQLite = async (): Promise<{
  success: boolean
  data: FortuneDataEntry[]
  totalRecords: number
  message: string
}> => {
  try {
    const db = getDatabase()
    
    const rows = db.prepare(`
      SELECT 
        id,
        email,
        age_range as ageRange,
        birth_day as birthDay,
        blood_group as bloodGroup,
        lucky_number as luckyNumber,
        relationship,
        work,
        health,
        generated_at as generatedAt,
        created_at as createdAt
      FROM fortunes
      ORDER BY created_at DESC
    `).all()
    
    db.close()
    
    const data: FortuneDataEntry[] = rows.map((row: any) => ({
      id: row.id,
      userData: {
        email: row.email,
        ageRange: row.ageRange,
        birthDay: row.birthDay,
        bloodGroup: row.bloodGroup
      },
      fortuneResult: {
        luckyNumber: row.luckyNumber,
        relationship: row.relationship,
        work: row.work,
        health: row.health,
        generatedAt: row.generatedAt
      },
      timestamp: row.generatedAt
    }))
    
    return {
      success: true,
      data,
      totalRecords: data.length,
      message: 'Data retrieved successfully'
    }
  } catch (error: any) {
    return {
      success: false,
      data: [],
      totalRecords: 0,
      message: error.message || 'Failed to retrieve data'
    }
  }
}

// Delete fortune data from SQLite
export const deleteFortuneDataSQLite = async (id: string): Promise<{
  success: boolean
  message: string
}> => {
  try {
    const db = getDatabase()
    
    const stmt = db.prepare('DELETE FROM fortunes WHERE id = ?')
    const result = stmt.run(id)
    
    db.close()
    
    if (result.changes === 0) {
      return {
        success: false,
        message: 'Fortune data not found'
      }
    }
    
    return {
      success: true,
      message: 'Fortune data deleted successfully'
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to delete fortune data'
    }
  }
}

// Clear all fortune data from SQLite
export const clearAllFortuneDataSQLite = async (): Promise<{
  success: boolean
  message: string
}> => {
  try {
    const db = getDatabase()
    
    db.prepare('DELETE FROM fortunes').run()
    
    db.close()
    
    return {
      success: true,
      message: 'All fortune data cleared successfully'
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to clear all data'
    }
  }
}

// Check if email exists in SQLite
export const checkEmailExistsSQLite = async (email: string): Promise<{
  success: boolean
  exists: boolean
  fortune?: FortuneDataEntry
  message: string
}> => {
  try {
    const db = getDatabase()
    
    const row = db.prepare(`
      SELECT 
        id,
        email,
        age_range as ageRange,
        birth_day as birthDay,
        blood_group as bloodGroup,
        lucky_number as luckyNumber,
        relationship,
        work,
        health,
        generated_at as generatedAt
      FROM fortunes 
      WHERE email = ?
    `).get(email) as any
    
    db.close()
    
    if (row) {
      const fortune: FortuneDataEntry = {
        id: row.id,
        userData: {
          email: row.email,
          ageRange: row.ageRange,
          birthDay: row.birthDay,
          bloodGroup: row.bloodGroup
        },
        fortuneResult: {
          luckyNumber: row.luckyNumber,
          relationship: row.relationship,
          work: row.work,
          health: row.health,
          generatedAt: row.generatedAt
        },
        timestamp: row.generatedAt
      }
      
      return {
        success: true,
        exists: true,
        fortune,
        message: 'Email found'
      }
    }
    
    return {
      success: true,
      exists: false,
      message: 'Email not found'
    }
  } catch (error: any) {
    return {
      success: false,
      exists: false,
      message: error.message || 'Failed to check email'
    }
  }
}

// Export to CSV from SQLite
export const exportToCSVSQLite = async (): Promise<{
  success: boolean
  csvData?: string
  message: string
}> => {
  try {
    const result = await getAllFortuneDataSQLite()
    
    if (!result.success) {
      return {
        success: false,
        message: result.message
      }
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
  } catch (error: any) {
    return {
      success: false,
      message: error.message || 'Failed to export CSV'
    }
  }
}

// Admin password management
export const getAdminPasswordHashSQLite = async (): Promise<string | null> => {
  try {
    const db = getDatabase()
    
    const row = db.prepare('SELECT password_hash FROM admin_config ORDER BY created_at DESC LIMIT 1').get() as any
    
    db.close()
    
    return row ? row.password_hash : null
  } catch (error) {
    console.error('Error getting admin password hash from SQLite:', error)
    return null
  }
}

export const saveAdminPasswordHashSQLite = async (passwordHash: string): Promise<boolean> => {
  try {
    const db = getDatabase()
    
    // Clear existing passwords and insert new one
    db.prepare('DELETE FROM admin_config').run()
    
    const stmt = db.prepare(`
      INSERT INTO admin_config (id, password_hash, updated_at)
      VALUES (?, ?, ?)
    `)
    
    stmt.run(uuidv4(), passwordHash, new Date().toISOString())
    
    db.close()
    
    return true
  } catch (error) {
    console.error('Error saving admin password hash to SQLite:', error)
    return false
  }
}
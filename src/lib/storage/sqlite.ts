import Database from 'better-sqlite3'
import type { UserData, FortuneResult, FortuneDataEntry } from '@/types'

// DATABASE ROW TYPE
interface DBFortuneRow {
  id: string
  email: string
  age_range: string
  birth_day: string
  blood_group: string
  lucky_number: number
  relationship: string
  work: string
  health: string
  generated_at: string
}

// PAGINATION OPTIONS INTERFACE (matching Supabase)
export interface PaginationOptions {
  limit?: number                               // จำนวนรายการต่อหน้า (Default: 50)
  offset?: number                              // เริ่มต้นจากตำแหน่งที่ (Default: 0)
  orderBy?: 'generated_at' | 'email'          // เรียงตาม (Default: 'generated_at')
  order?: 'asc' | 'desc'                      // ทิศทางการเรียง (Default: 'desc')
}

let db: Database.Database | null = null

const initDB = () => {
  if (db) return db
  try {
    db = new Database('./data/local.db')
    db.exec(`
      CREATE TABLE IF NOT EXISTS dev_fortunes (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE,
        age_range TEXT,
        birth_day TEXT,
        blood_group TEXT,
        lucky_number INTEGER,
        relationship TEXT,
        work TEXT,
        health TEXT,
        generated_at TEXT
      );
    `)
    return db
  } catch (error) {
    console.error('Failed to initialize SQLite database:', error)
    return null
  }
}

const mapRowToFortune = (row: DBFortuneRow): FortuneDataEntry => ({
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
})

export const sqliteStorage = {
  async saveFortune(userData: UserData, fortuneResult: FortuneResult): Promise<{
    success: boolean
    message: string
    id?: string
  }> {
    const db = initDB()
    if (!db) return { success: false, message: 'Database not initialized' }

    try {
      const timestamp = new Date().toISOString()
      const id = `loc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const insert = db.prepare(`
        INSERT INTO dev_fortunes (id, email, age_range, birth_day, blood_group, lucky_number, relationship, work, health, generated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)

      insert.run(
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
      return { success: true, message: 'Saved successfully', id }
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string }
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return { success: false, message: 'Email already exists' }
      }
      return { success: false, message: err.message || 'SQLite Save failed' }
    }
  },

  async checkEmail(email: string): Promise<{
    success: boolean
    exists: boolean
    fortune?: FortuneDataEntry
    message: string
  }> {
    const db = initDB()
    if (!db) return { success: false, exists: false, message: 'Database not initialized' }

    try {
      const row = db.prepare('SELECT * FROM dev_fortunes WHERE email = ?').get(email) as DBFortuneRow | undefined
      if (!row) return { success: true, exists: false, message: 'Email not found' }

      return { success: true, exists: true, fortune: mapRowToFortune(row), message: 'Email found' }
    } catch (error: unknown) {
      const err = error as { message?: string }
      return { success: false, exists: false, message: err.message || 'SQLite check failed' }
    }
  },

  async getAllFortunes(options?: PaginationOptions): Promise<{
    success: boolean
    data: FortuneDataEntry[]
    count: number | null
    message: string
  }> {
    const db = initDB()
    if (!db) return { success: false, data: [], count: 0, message: 'Database not initialized' }

    // Set defaults for pagination (matching Supabase implementation)
    const limit = options?.limit ?? 50
    const offset = options?.offset ?? 0
    const orderBy = options?.orderBy ?? 'generated_at'
    const order = options?.order ?? 'desc'

    try {
      // Get total count for pagination
      const countRow = db.prepare('SELECT COUNT(*) as total FROM dev_fortunes').get() as { total: number }
      const totalCount = countRow.total

      // Build dynamic SQL query with pagination
      const orderDirection = order.toUpperCase()
      const query = `
        SELECT * FROM dev_fortunes 
        ORDER BY ${orderBy} ${orderDirection}
        LIMIT ? OFFSET ?
      `
      
      const rows = db.prepare(query).all(limit, offset) as DBFortuneRow[]
      
      return { 
        success: true, 
        data: rows.map(mapRowToFortune), 
        count: totalCount,
        message: 'Retrieved successfully' 
      }
    } catch (error: unknown) {
      const err = error as { message?: string }
      return { success: false, data: [], count: 0, message: err.message || 'SQLite retrieval failed' }
    }
  },

  async deleteFortune(id: string): Promise<{ success: boolean; message: string }> {
    const db = initDB()
    if (!db) return { success: false, message: 'Database not initialized' }

    try {
      db.prepare('DELETE FROM dev_fortunes WHERE id = ?').run(id)
      return { success: true, message: 'Deleted successfully' }
    } catch (error: unknown) {
      const err = error as { message?: string }
      return { success: false, message: err.message || 'SQLite delete failed' }
    }
  },

  async clearAllFortunes(): Promise<{ success: boolean; message: string }> {
    const db = initDB()
    if (!db) return { success: false, message: 'Database not initialized' }

    try {
      db.prepare('DELETE FROM dev_fortunes').run()
      return { success: true, message: 'All data cleared' }
    } catch (error: unknown) {
      const err = error as { message?: string }
      return { success: false, message: err.message || 'SQLite clear failed' }
    }
  }
}

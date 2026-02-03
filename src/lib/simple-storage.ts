// Simple Storage - Upgrade to persistent SQLite for local development
import { createClient } from '@supabase/supabase-js'
import Database from 'better-sqlite3'
import type { UserData, FortuneResult, FortuneDataEntry } from '@/types'

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

// Initialize Supabase (production)
const supabaseUrl = process.env.SUPABASE_URL || 'https://kqkjbavhplvbdvefachg.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtxa2piYXZocGx2YmR2ZWZhY2hnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwNDgzNTQsImV4cCI6MjA3MTYyNDM1NH0.5ylvBeRBWMchdLB1EUuIXvllsG9rM5koFHtEAaWqXP4'
const isProduction = process.env.NODE_ENV === 'production'

const supabase = createClient(supabaseUrl, supabaseKey)

// Persistent SQLite for local development
let db: Database.Database | null = null
if (!isProduction) {
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
      CREATE TABLE IF NOT EXISTS dev_admin_config (
        id TEXT PRIMARY KEY DEFAULT 'main',
        password_hash TEXT,
        updated_at TEXT
      );
    `)
  } catch (error) {
    console.error('Failed to initialize SQLite database:', error)
  }
}

const devAdminPassword = process.env.ADMIN_PASSWORD || 'temp_dev_password_change_me'

// Table names
const FORTUNES_TABLE = isProduction ? 'prod_fortunes' : 'dev_fortunes'
const ADMIN_TABLE = isProduction ? 'prod_admin_config' : 'dev_admin_config'

// FORTUNE OPERATIONS
export const saveFortune = async (userData: UserData, fortuneResult: FortuneResult): Promise<{
  success: boolean
  message: string
  id?: string
}> => {
  const timestamp = new Date().toISOString()

  if (isProduction) {
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

  // Development: persistent SQLite
  try {
    const id = `loc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const insert = db!.prepare(`
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
}

export const checkEmail = async (email: string): Promise<{
  success: boolean
  exists: boolean
  fortune?: FortuneDataEntry
  message: string
}> => {
  if (isProduction) {
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

  // Development: SQLite check
  try {
    const row = db!.prepare('SELECT * FROM dev_fortunes WHERE email = ?').get(email) as DBFortuneRow | undefined

    if (!row) {
      return { success: true, exists: false, message: 'Email not found' }
    }

    const fortune: FortuneDataEntry = {
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
    }

    return { success: true, exists: true, fortune, message: 'Email found' }
  } catch (error: unknown) {
    const err = error as { message?: string }
    return { success: false, exists: false, message: err.message || 'SQLite check failed' }
  }
}

// ADMIN OPERATIONS (simplified)
export const getAllFortunes = async (): Promise<{
  success: boolean
  data: FortuneDataEntry[]
  message: string
}> => {
  if (isProduction) {
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

  // Development: SQLite retrieval
  try {
    const rows = db!.prepare('SELECT * FROM dev_fortunes ORDER BY generated_at DESC').all() as DBFortuneRow[]
    const formattedData: FortuneDataEntry[] = rows.map((row) => ({
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
    const err = error as { message?: string }
    return { success: false, data: [], message: err.message || 'SQLite retrieval failed' }
  }
}

export const deleteFortune = async (id: string): Promise<{ success: boolean; message: string }> => {
  if (isProduction) {
    try {
      const { error } = await supabase.from(FORTUNES_TABLE).delete().eq('id', id)
      if (error) throw error
      return { success: true, message: 'Deleted successfully' }
    } catch (error: unknown) {
      return { success: false, message: error instanceof Error ? error.message : 'Delete failed' }
    }
  }

  // Development: SQLite delete
  try {
    db!.prepare('DELETE FROM dev_fortunes WHERE id = ?').run(id)
    return { success: true, message: 'Deleted successfully' }
  } catch (error: unknown) {
    const err = error as { message?: string }
    return { success: false, message: err.message || 'SQLite delete failed' }
  }
}

export const clearAllFortunes = async (): Promise<{ success: boolean; message: string }> => {
  if (isProduction) {
    try {
      const { error } = await supabase.from(FORTUNES_TABLE).delete().neq('id', '00000000-0000-0000-0000-000000000000')
      if (error) throw error
      return { success: true, message: 'All data cleared' }
    } catch (error: unknown) {
      return { success: false, message: error instanceof Error ? error.message : 'Clear failed' }
    }
  }

  // Development: SQLite clear
  try {
    db!.prepare('DELETE FROM dev_fortunes').run()
    return { success: true, message: 'All data cleared' }
  } catch (error: unknown) {
    const err = error as { message?: string }
    return { success: false, message: err.message || 'SQLite clear failed' }
  }
}

export const verifyAdminPassword = async (password: string): Promise<boolean> => {
  if (isProduction) {
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

  // Development: SQLite admin check with bcrypt
  try {
    const bcrypt = await import('bcryptjs')
    const row = db!.prepare('SELECT password_hash FROM dev_admin_config WHERE id = ?').get('main') as { password_hash: string } | undefined

    if (row) {
      return await bcrypt.compare(password, row.password_hash)
    }

    // Fallback if no password set in DB yet
    return password === devAdminPassword
  } catch {
    return password === devAdminPassword
  }
}

export const changeAdminPassword = async (newPassword: string): Promise<boolean> => {
  if (isProduction) {
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

  // Development: SQLite password update
  try {
    const bcrypt = await import('bcryptjs')
    const passwordHash = await bcrypt.hash(newPassword, 12)
    const timestamp = new Date().toISOString()

    db!.prepare(`
      INSERT INTO dev_admin_config (id, password_hash, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET password_hash=excluded.password_hash, updated_at=excluded.updated_at
    `).run('main', passwordHash, timestamp)

    return true
  } catch (error) {
    console.error('SQLite password change failed:', error)
    return false
  }
}
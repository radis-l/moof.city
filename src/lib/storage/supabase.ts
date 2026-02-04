import { supabase } from '../supabase-client'
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

const FORTUNES_TABLE = 'prod_fortunes'
const ADMIN_TABLE = 'prod_admin_config'

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

// PAGINATION OPTIONS INTERFACE
export interface PaginationOptions {
  limit?: number                               // จำนวนรายการต่อหน้า (Default: 50)
  offset?: number                              // เริ่มต้นจากตำแหน่งที่ (Default: 0)
  orderBy?: 'generated_at' | 'email'          // เรียงตาม (Default: 'generated_at')
  order?: 'asc' | 'desc'                      // ทิศทางการเรียง (Default: 'desc')
}

export const supabaseStorage = {
  async saveFortune(userData: UserData, fortuneResult: FortuneResult): Promise<{
    success: boolean
    message: string
    id?: string
  }> {
    const timestamp = new Date().toISOString()
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
        console.error(`Supabase error inserting into ${FORTUNES_TABLE}:`, error.message)
        if (error.code === '23505') return { success: false, message: 'Email already exists' }
        throw error
      }
      return { success: true, message: 'Saved successfully', id: data.id }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Save failed'
      return { success: false, message: msg }
    }
  },

  async checkEmail(email: string): Promise<{
    success: boolean
    exists: boolean
    fortune?: FortuneDataEntry
    message: string
  }> {
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
      return { success: true, exists: true, fortune: mapRowToFortune(data), message: 'Email found' }
    } catch (error: unknown) {
      return { success: false, exists: false, message: error instanceof Error ? error.message : 'Check failed' }
    }
  },

  async getAllFortunes(options?: PaginationOptions): Promise<{
    success: boolean
    data: FortuneDataEntry[]
    count: number | null
    message: string
  }> {
    // Set defaults for pagination
    const limit = options?.limit ?? 50
    const offset = options?.offset ?? 0
    const orderBy = options?.orderBy ?? 'generated_at'
    const order = options?.order ?? 'desc'
    const ascending = order === 'asc'

    try {
      // Use count: 'exact' to get total count for pagination UI
      const { data, error, count } = await supabase
        .from(FORTUNES_TABLE)
        .select('*', { count: 'exact' })
        .order(orderBy, { ascending })
        .range(offset, offset + limit - 1)

      if (error) {
        console.error(`Supabase error fetching from ${FORTUNES_TABLE}:`, error.message)
        throw error
      }
      
      return { 
        success: true, 
        data: data.map(mapRowToFortune), 
        count: count ?? 0,
        message: 'Retrieved successfully' 
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Retrieval failed'
      return { success: false, data: [], count: 0, message: msg }
    }
  },

  async deleteFortune(id: string): Promise<{ success: boolean; message: string }> {
    try {
      // Use .select() to confirm if a row was actually deleted
      const { data, error } = await supabase
        .from(FORTUNES_TABLE)
        .delete()
        .eq('id', id)
        .select()

      if (error) {
        console.error(`Supabase error deleting from ${FORTUNES_TABLE}:`, error.message)
        throw error
      }

      if (!data || data.length === 0) {
        return { success: false, message: 'ไม่พบข้อมูลที่ต้องการลบ (No record found to delete)' }
      }

      return { success: true, message: 'Deleted successfully' }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Delete failed'
      return { success: false, message: msg }
    }
  },

  async clearAllFortunes(): Promise<{ success: boolean; message: string }> {
    try {
      // Use a more standard filter for "delete all" in Supabase
      const { data, error } = await supabase
        .from(FORTUNES_TABLE)
        .delete()
        .gt('id', '00000000-0000-0000-0000-000000000000')
        .select()

      if (error) {
        console.error(`Supabase error clearing ${FORTUNES_TABLE}:`, error.message)
        throw error
      }
      return { success: true, message: `All data cleared (${data?.length || 0} records deleted)` }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Clear failed'
      return { success: false, message: msg }
    }
  },

  // Auth specific to Supabase
  async getAdminHash(): Promise<{ hash: string | null; error: unknown }> {
    const { data, error } = await supabase
      .from(ADMIN_TABLE)
      .select('password_hash')
      .order('updated_at', { ascending: false })
      .limit(1)
      .single()
    
    return { hash: data?.password_hash || null, error }
  },

  async updateAdminPassword(passwordHash: string): Promise<{ error: unknown }> {
    const timestamp = new Date().toISOString()
    const { error } = await supabase
      .from(ADMIN_TABLE)
      .upsert({
        id: 'main',
        password_hash: passwordHash,
        updated_at: timestamp
      })
    return { error }
  }
}

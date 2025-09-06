// Admin Configuration Storage
// Development: JSON file fallback, Production: Supabase primary

import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

interface AdminConfig {
  passwordHash: string
  lastUpdated: string
}

// Initialize Supabase client (if credentials available)
const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null

// Check if we should use Supabase
const hasSupabase = !!supabase
const useSupabasePrimary = process.env.USE_SUPABASE_PRIMARY !== 'false'

// File storage (development)
const fileStorage = {
  async getConfig(): Promise<AdminConfig | null> {
    try {
      const configPath = path.join(process.cwd(), 'data', 'admin-config.json')
      
      if (!fs.existsSync(configPath)) {
        return null
      }
      
      const data = fs.readFileSync(configPath, 'utf8')
      return JSON.parse(data)
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error reading admin config:', error)
      }
      return null
    }
  },

  async saveConfig(config: AdminConfig): Promise<boolean> {
    try {
      const dataDir = path.join(process.cwd(), 'data')
      const configPath = path.join(dataDir, 'admin-config.json')
      
      // Ensure data directory exists
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true })
      }
      
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2))
      return true
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error saving admin config:', error)
      }
      return false
    }
  }
}

// Supabase storage (primary)
const supabaseStorage = {
  async getConfig(): Promise<AdminConfig | null> {
    if (!supabase) return null
    
    try {
      const { data, error } = await supabase
        .from('admin_config')
        .select('password_hash, updated_at')
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error) {
        if (error.code !== 'PGRST116') { // Not "no rows returned"
          console.error('Error reading admin config from Supabase:', error)
        }
        return null
      }

      return {
        passwordHash: data.password_hash,
        lastUpdated: data.updated_at
      }
    } catch (error) {
      console.error('Error reading admin config from Supabase:', error)
      return null
    }
  },

  async saveConfig(config: AdminConfig): Promise<boolean> {
    if (!supabase) return false
    
    try {
      // Delete existing config (we only want 1 record)
      await supabase.from('admin_config').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      
      // Insert new config
      const { error } = await supabase
        .from('admin_config')
        .insert([{
          password_hash: config.passwordHash,
          updated_at: config.lastUpdated
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
}

// Storage method selection
const getStorage = () => {
  if (hasSupabase && useSupabasePrimary) return supabaseStorage
  return fileStorage // Fallback to file storage
}

// Main functions
export async function getAdminPasswordHash(): Promise<string | null> {
  const storage = getStorage()
  const config = await storage.getConfig()
  return config?.passwordHash || null
}

export async function setAdminPasswordHash(password: string): Promise<boolean> {
  const passwordHash = await bcrypt.hash(password, 12)
  const config: AdminConfig = {
    passwordHash,
    lastUpdated: new Date().toISOString()
  }
  
  const storage = getStorage()
  return await storage.saveConfig(config)
}

export async function initializeAdminPassword(defaultPassword: string): Promise<boolean> {
  // Only initialize if no password exists
  const existing = await getAdminPasswordHash()
  if (existing) {
    return false // Already initialized
  }
  
  return await setAdminPasswordHash(defaultPassword)
}
// Admin Configuration Storage
// Development: JSON file, Production: Vercel KV

import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'

interface AdminConfig {
  passwordHash: string
  lastUpdated: string
}

// Check if we're in a Vercel environment (production)
const isProduction = !!process.env.VERCEL || process.env.NODE_ENV === 'production'

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

// KV storage (production)
const kvStorage = {
  async getConfig(): Promise<AdminConfig | null> {
    try {
      const { kv } = await import('@vercel/kv')
      const config = await kv.get<AdminConfig>('admin-config')
      return config
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error reading admin config from KV:', error)
      }
      return null
    }
  },

  async saveConfig(config: AdminConfig): Promise<boolean> {
    try {
      const { kv } = await import('@vercel/kv')
      await kv.set('admin-config', config)
      return true
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error saving admin config to KV:', error)
      }
      return false
    }
  }
}

// Main functions
export async function getAdminPasswordHash(): Promise<string | null> {
  const storage = isProduction ? kvStorage : fileStorage
  const config = await storage.getConfig()
  return config?.passwordHash || null
}

export async function setAdminPasswordHash(password: string): Promise<boolean> {
  const passwordHash = await bcrypt.hash(password, 12)
  const config: AdminConfig = {
    passwordHash,
    lastUpdated: new Date().toISOString()
  }
  
  const storage = isProduction ? kvStorage : fileStorage
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
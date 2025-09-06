import bcrypt from 'bcryptjs'
import { getAdminPasswordHashSQLite, saveAdminPasswordHashSQLite } from './sqlite-storage'

// Initialize admin password (SQLite version)
export const initializeAdminPasswordSQLite = async (defaultPassword: string): Promise<void> => {
  try {
    console.log('🔐 Password initialization: Checking if password exists')
    const existingHash = await getAdminPasswordHashSQLite()
    
    if (existingHash) {
      console.log('🔐 Password initialization: Password already exists')
      return
    }
    
    console.log('🔐 Password initialization: Creating new password')
    const saltRounds = 12
    const hash = await bcrypt.hash(defaultPassword, saltRounds)
    await saveAdminPasswordHashSQLite(hash)
    console.log('🔐 Password initialization: Created new password')
  } catch (error) {
    console.error('Error initializing admin password (SQLite):', error)
  }
}

// Get admin password hash (SQLite version)
export const getAdminPasswordHashFromSQLite = async (): Promise<string | null> => {
  return getAdminPasswordHashSQLite()
}

// Change admin password (SQLite version)
export const changeAdminPasswordSQLite = async (newPassword: string): Promise<boolean> => {
  try {
    const saltRounds = 12
    const hash = await bcrypt.hash(newPassword, saltRounds)
    return await saveAdminPasswordHashSQLite(hash)
  } catch (error) {
    console.error('Error changing admin password (SQLite):', error)
    return false
  }
}
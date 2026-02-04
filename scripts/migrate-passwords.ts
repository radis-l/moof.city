#!/usr/bin/env node
/**
 * Password Migration Script
 * 
 * Migrates admin passwords from bcrypt format to Web Crypto format
 * for edge runtime compatibility.
 * 
 * Usage:
 *   npm run migrate-passwords           # Dry run (shows what would happen)
 *   npm run migrate-passwords --apply   # Actually perform migration
 * 
 * Requirements:
 *   - SUPABASE_URL environment variable
 *   - SUPABASE_SERVICE_KEY environment variable (admin key, not anon key)
 *   - Access to prod_admin_config table
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config()

// --- CONFIGURATION ---

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY
const ADMIN_TABLE = 'prod_admin_config'

// --- WEB CRYPTO IMPLEMENTATION (for Node.js) ---

const CURRENT_VERSION = 'v1'
const DEFAULT_ITERATIONS = 100000
const SALT_LENGTH = 16
const HASH_LENGTH = 256

function base64Encode(buffer: Uint8Array): string {
  const bytes = Array.from(buffer)
  const binary = String.fromCharCode(...bytes)
  return Buffer.from(binary, 'binary').toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

async function hashPassword(password: string): Promise<string> {
  const crypto = await import('crypto')
  
  // Generate salt
  const salt = crypto.randomBytes(SALT_LENGTH)
  
  // Derive key using PBKDF2
  const derivedKey = crypto.pbkdf2Sync(
    password,
    salt,
    DEFAULT_ITERATIONS,
    32, // 256 bits / 8
    'sha256'
  )
  
  // Encode to base64
  const saltBase64 = base64Encode(new Uint8Array(salt))
  const hashBase64 = base64Encode(new Uint8Array(derivedKey))
  
  return `${CURRENT_VERSION}:${DEFAULT_ITERATIONS}:${saltBase64}:${hashBase64}`
}

// --- BCRYPT DETECTION ---

function isBcryptHash(hash: string): boolean {
  return /^\$2[abxy]\$/.test(hash)
}

// --- MAIN MIGRATION LOGIC ---

async function main() {
  const isDryRun = !process.argv.includes('--apply')
  
  console.log('🔐 Password Migration Script')
  console.log('============================\n')
  
  if (isDryRun) {
    console.log('⚠️  DRY RUN MODE - No changes will be made')
    console.log('   Run with --apply flag to perform actual migration\n')
  } else {
    console.log('⚠️  LIVE MODE - Changes will be applied!')
    console.log('   Make sure you have a backup of your database\n')
  }
  
  // Validate environment
  if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Error: Missing required environment variables')
    console.error('   Required: SUPABASE_URL, SUPABASE_SERVICE_KEY')
    console.error('   Note: Use SUPABASE_SERVICE_KEY (admin key), not SUPABASE_ANON_KEY')
    process.exit(1)
  }
  
  // Initialize Supabase client with service key
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
  
  console.log('📡 Connecting to Supabase...')
  
  // Fetch current admin password hash
  const { data, error } = await supabase
    .from(ADMIN_TABLE)
    .select('id, password_hash, updated_at')
    .order('updated_at', { ascending: false })
    .limit(1)
    .single()
  
  if (error) {
    console.error('❌ Error fetching admin config:', error.message)
    process.exit(1)
  }
  
  if (!data || !data.password_hash) {
    console.error('❌ Error: No password hash found in database')
    console.error('   The admin password must be set first')
    process.exit(1)
  }
  
  console.log('✅ Current password hash retrieved')
  console.log(`   ID: ${data.id}`)
  console.log(`   Last updated: ${data.updated_at}`)
  console.log(`   Hash preview: ${data.password_hash.substring(0, 20)}...`)
  
  // Check if already migrated
  if (!isBcryptHash(data.password_hash)) {
    console.log('\n✅ Password is already in Web Crypto format!')
    console.log('   No migration needed.')
    
    // Validate format
    const parts = data.password_hash.split(':')
    if (parts.length === 4 && parts[0] === 'v1') {
      console.log(`   Version: ${parts[0]}`)
      console.log(`   Iterations: ${parts[1]}`)
      console.log('   ✅ Format is valid')
    } else {
      console.log('   ⚠️  Warning: Hash format seems invalid')
      console.log('   Please verify manually')
    }
    
    process.exit(0)
  }
  
  console.log('\n🔍 Password is in bcrypt format')
  console.log('   Migration is required for edge runtime compatibility')
  
  // CRITICAL: We cannot migrate without the plain text password
  console.log('\n❌ CRITICAL: Cannot automatically migrate bcrypt hashes')
  console.log('')
  console.log('   bcrypt hashes are one-way - we cannot extract the original password.')
  console.log('   You have two options:')
  console.log('')
  console.log('   Option 1 (Recommended): Let it migrate on first login')
  console.log('   -------------------------------------------------------')
  console.log('   1. Deploy the new edge runtime code')
  console.log('   2. Log in with your current password')
  console.log('   3. The system will automatically re-hash with Web Crypto')
  console.log('   4. No manual intervention needed')
  console.log('')
  console.log('   Option 2: Manual migration with known password')
  console.log('   -----------------------------------------------')
  console.log('   Run this script with the password:')
  console.log('   npm run migrate-passwords --apply --password="your-password"')
  console.log('')
  
  // Check if password was provided
  const passwordArg = process.argv.find(arg => arg.startsWith('--password='))
  if (!passwordArg) {
    console.log('💡 Recommendation: Use Option 1 (automatic migration on login)')
    console.log('   This is safer and doesn\'t require exposing your password in commands')
    process.exit(0)
  }
  
  // Extract password from argument
  const password = passwordArg.split('=')[1]
  if (!password) {
    console.error('❌ Error: Password cannot be empty')
    process.exit(1)
  }
  
  console.log('\n🔐 Generating new Web Crypto hash...')
  const newHash = await hashPassword(password)
  console.log('✅ New hash generated')
  console.log(`   Preview: ${newHash.substring(0, 40)}...`)
  
  if (isDryRun) {
    console.log('\n📋 DRY RUN - Would update database with:')
    console.log(`   Old hash: ${data.password_hash.substring(0, 40)}...`)
    console.log(`   New hash: ${newHash.substring(0, 40)}...`)
    console.log('\n   Run with --apply to perform actual migration')
    process.exit(0)
  }
  
  // Perform actual migration
  console.log('\n💾 Updating database...')
  const { error: updateError } = await supabase
    .from(ADMIN_TABLE)
    .upsert({
      id: data.id,
      password_hash: newHash,
      updated_at: new Date().toISOString()
    })
  
  if (updateError) {
    console.error('❌ Error updating database:', updateError.message)
    process.exit(1)
  }
  
  console.log('✅ Migration complete!')
  console.log('')
  console.log('📊 Summary:')
  console.log('   - Old format: bcrypt')
  console.log('   - New format: Web Crypto (PBKDF2-SHA256)')
  console.log('   - Iterations: 100,000')
  console.log('   - Edge runtime: Compatible ✅')
  console.log('')
  console.log('⚠️  IMPORTANT: Test admin login immediately!')
  console.log('   If login fails, you can restore from backup')
  console.log('')
}

// --- ERROR HANDLING ---

main().catch(error => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})

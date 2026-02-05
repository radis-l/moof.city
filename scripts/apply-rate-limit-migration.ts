/**
 * Apply Rate Limiting Migration to Supabase
 * Run with: npx tsx scripts/apply-rate-limit-migration.ts
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') })

// Load environment variables
const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_ANON_KEY must be set')
  console.error('Please check your environment variables')
  process.exit(1)
}

async function applyMigration() {
  console.log('🔄 Applying rate limiting migration...')
  
  const supabase = createClient(supabaseUrl!, supabaseKey!)
  
  // Read migration file
  const sqlPath = path.join(process.cwd(), 'migrations/002_add_rate_limiting.sql')
  const sql = fs.readFileSync(sqlPath, 'utf-8')
  
  console.log('📄 Migration SQL:')
  console.log(sql)
  console.log('')
  
  // Split by semicolons and execute each statement
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))
  
  for (const statement of statements) {
    try {
      // Try to use rpc if available
      const result = await supabase.rpc('exec_sql', { sql: statement + ';' })
      
      if (result.error) {
        console.warn(`⚠️  Could not execute via RPC: ${result.error.message}`)
        console.log('Please execute this SQL in the Supabase SQL Editor:')
        console.log(statement + ';')
        console.log('')
      }
    } catch (err) {
      // RPC might not be available, that's okay
      console.warn(`⚠️  Statement execution note:`, err)
    }
  }
  
  // Verify table was created
  console.log('🔍 Verifying rate_limits table...')
  const { error } = await supabase
    .from('rate_limits')
    .select('*')
    .limit(1)
  
  if (!error) {
    console.log('✅ Rate limiting table created successfully!')
    console.log('   Table is ready for use')
  } else {
    console.log('⚠️  Please execute the migration SQL manually in Supabase Dashboard:')
    console.log('   1. Go to: https://supabase.com/dashboard')
    console.log('   2. Select your project')
    console.log('   3. Go to SQL Editor')
    console.log('   4. Paste and run the SQL from migrations/002_add_rate_limiting.sql')
  }
}

applyMigration()
  .then(() => {
    console.log('\n✅ Migration process complete')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Migration failed:', error)
    process.exit(1)
  })

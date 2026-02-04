import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables!')
  console.error('')
  console.error('To run this migration, you need:')
  console.error('  1. SUPABASE_URL (your Supabase project URL)')
  console.error('  2. SUPABASE_SERVICE_ROLE_KEY (preferred) or SUPABASE_ANON_KEY')
  console.error('')
  console.error('Usage:')
  console.error('  SUPABASE_URL=https://xxx.supabase.co \\')
  console.error('  SUPABASE_SERVICE_ROLE_KEY=eyJxxx... \\')
  console.error('  npm run migrate-db')
  console.error('')
  console.error('Or use the manual migration approach (see migrations/MANUAL_MIGRATION.md)')
  process.exit(1)
}

console.log('🔄 Database Migration Script')
console.log('=' .repeat(60))
console.log('')

// Read migration SQL
const migrationPath = join(__dirname, '..', 'migrations', '001_add_performance_indexes.sql')
const migrationSQL = readFileSync(migrationPath, 'utf-8')

console.log('📋 Migration SQL to execute:')
console.log('-'.repeat(60))
console.log(migrationSQL)
console.log('-'.repeat(60))
console.log('')

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey)

async function runMigration() {
  console.log('🚀 Attempting to execute migration...')
  console.log('')

  // Split by semicolon to execute each statement separately
  const statements = migrationSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))

  console.log(`Found ${statements.length} SQL statements to execute`)
  console.log('')

  let successCount = 0
  let errorCount = 0

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i]
    console.log(`[${i + 1}/${statements.length}] Executing: ${stmt.substring(0, 60)}...`)

    try {
      // Try using rpc if available
      const { data, error } = await supabase.rpc('exec_sql', { query: stmt })

      if (error) {
        console.error(`  ❌ Error:`, error.message)
        errorCount++
      } else {
        console.log(`  ✅ Success`)
        successCount++
      }
    } catch (err: any) {
      console.error(`  ⚠️  Method failed:`, err.message)
      console.log(`  ℹ️  This is expected if using ANON key - see manual migration steps below`)
      errorCount++
    }
  }

  console.log('')
  console.log('=' .repeat(60))
  console.log(`📊 Results: ${successCount} succeeded, ${errorCount} failed`)
  console.log('=' .repeat(60))
  console.log('')

  if (errorCount > 0) {
    console.log('⚠️  Some statements failed to execute automatically.')
    console.log('')
    console.log('📝 MANUAL MIGRATION REQUIRED:')
    console.log('')
    console.log('1. Go to your Supabase Dashboard: ' + supabaseUrl.replace('//', '//app.').replace('.co', '.co/project/_'))
    console.log('2. Navigate to: SQL Editor')
    console.log('3. Copy the SQL from migrations/001_add_performance_indexes.sql')
    console.log('4. Paste and execute it')
    console.log('')
    console.log('✅ The migration uses IF NOT EXISTS - safe to run multiple times')
    console.log('')
  } else {
    console.log('✅ Migration completed successfully!')
    console.log('')
    
    // Try to verify indexes
    try {
      const { data: indexes, error: indexError } = await supabase
        .from('information_schema.tables')
        .select('*')
        .limit(1)

      if (!indexError) {
        console.log('🔍 To verify indexes were created, run this SQL query:')
        console.log('')
        console.log("  SELECT indexname, indexdef")
        console.log("  FROM pg_indexes")
        console.log("  WHERE tablename = 'prod_fortunes';")
        console.log('')
      }
    } catch (err) {
      // Ignore verification errors
    }
  }
}

runMigration().catch((err) => {
  console.error('')
  console.error('❌ Fatal error:', err)
  console.error('')
  console.error('Please use the manual migration method.')
  console.error('See: migrations/MANUAL_MIGRATION.md')
  process.exit(1)
})

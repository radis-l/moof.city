import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const isProduction = process.env.NODE_ENV === 'production' || !!process.env.VERCEL
  const tableName = isProduction ? 'prod_admin_config' : 'dev_admin_config'
  
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: !!process.env.VERCEL,
      isProduction,
      tableName
    },
    supabase: {
      configured: !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY),
      url: process.env.SUPABASE_URL ? 'SET' : 'MISSING',
      anonKey: process.env.SUPABASE_ANON_KEY ? 'SET' : 'MISSING',
      connection: 'TESTING...',
      adminConfigTest: 'TESTING...',
      latestRecord: null as { id: string; hashPrefix: string; created: string } | null
    }
  }

  // Test Supabase connection
  if (health.supabase.configured) {
    try {
      const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!)
      
      // Test basic connection
      const { error: connectionError } = await supabase.from(tableName).select('count').limit(1)
      health.supabase.connection = connectionError ? `ERROR: ${connectionError.message}` : 'SUCCESS'
      
      // Test admin config access specifically  
      const { data: adminData, error: adminError } = await supabase
        .from(tableName)
        .select('id, password_hash, created_at')
        .limit(1)
        
      if (adminError) {
        health.supabase.adminConfigTest = `ERROR: ${adminError.message}`
      } else if (adminData && adminData.length > 0) {
        health.supabase.adminConfigTest = `SUCCESS: Found ${adminData.length} records`
        health.supabase.latestRecord = {
          id: adminData[0].id,
          hashPrefix: adminData[0].password_hash?.substring(0, 20) + '...',
          created: adminData[0].created_at
        }
      } else {
        health.supabase.adminConfigTest = 'SUCCESS: No records found'
      }
    } catch (error) {
      health.supabase.connection = `ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  } else {
    health.supabase.connection = 'NOT_CONFIGURED'
  }

  return NextResponse.json(health)
}
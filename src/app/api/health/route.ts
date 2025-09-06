import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: !!process.env.VERCEL,
      isProduction: process.env.NODE_ENV === 'production' || !!process.env.VERCEL
    },
    supabase: {
      configured: !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY),
      url: process.env.SUPABASE_URL ? 'SET' : 'MISSING',
      anonKey: process.env.SUPABASE_ANON_KEY ? 'SET' : 'MISSING',
      connection: 'TESTING...'
    }
  }

  // Test Supabase connection
  if (health.supabase.configured) {
    try {
      const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!)
      const { error } = await supabase.from('dev_admin_config').select('count').limit(1)
      health.supabase.connection = error ? `ERROR: ${error.message}` : 'SUCCESS'
    } catch (error) {
      health.supabase.connection = `ERROR: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  } else {
    health.supabase.connection = 'NOT_CONFIGURED'
  }

  return NextResponse.json(health)
}
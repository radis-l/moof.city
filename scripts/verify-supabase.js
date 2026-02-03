// Quick test to verify Supabase tables exist
import { supabase } from './src/lib/supabase-client.ts'

async function verifyTables() {
    console.log('🔍 Checking Supabase connection...\n')

    // Check prod_fortunes table
    const { error: fortunesError } = await supabase
        .from('prod_fortunes')
        .select('*')
        .limit(1)

    if (fortunesError) {
        console.log('❌ prod_fortunes table:', fortunesError.message)
    } else {
        console.log('✅ prod_fortunes table exists')
    }

    // Check prod_admin_config table
    const { error: adminError } = await supabase
        .from('prod_admin_config')
        .select('*')
        .limit(1)

    if (adminError) {
        console.log('❌ prod_admin_config table:', adminError.message)
    } else {
        console.log('✅ prod_admin_config table exists')
    }

    console.log('\n📊 Summary:')
    console.log('- Supabase URL:', process.env.SUPABASE_URL || 'Not set')
    console.log('- Connection:', fortunesError && adminError ? '❌ Failed' : '✅ Success')
}

verifyTables().catch(console.error)

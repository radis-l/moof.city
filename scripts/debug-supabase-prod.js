import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load production env
dotenv.config({ path: path.resolve(process.cwd(), '.env.prod') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

console.log('Testing connection with:');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseKey ? 'Set (masked)' : 'NOT SET');

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('\n1. Testing "prod_fortunes" table...');
  const { data: fortunes, error: fortunesError } = await supabase
    .from('prod_fortunes')
    .select('*')
    .limit(1);

  if (fortunesError) {
    console.error('❌ Error fetching from prod_fortunes:', fortunesError);
  } else {
    console.log('✅ Successfully fetched from prod_fortunes. Row count (limited to 1):', fortunes.length);
  }

  console.log('\n2. Testing "prod_admin_config" table...');
  const { data: admin, error: adminError } = await supabase
    .from('prod_admin_config')
    .select('*')
    .limit(1);

  if (adminError) {
    console.error('❌ Error fetching from prod_admin_config:', adminError);
  } else {
    console.log('✅ Successfully fetched from prod_admin_config. Row count (limited to 1):', admin.length);
  }

  console.log('\n3. Checking for other tables (probing common names)...');
  const commonTables = ['fortunes', 'fortunes_data', 'user_fortunes', 'data'];
  for (const table of commonTables) {
    const { error } = await supabase.from(table).select('*').limit(1);
    if (!error) {
      console.log(`✅ Found alternative table: ${table}`);
    }
  }
}

testConnection();

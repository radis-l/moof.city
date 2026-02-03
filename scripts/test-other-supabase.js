import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Manual test with the other URL
const supabaseUrl = 'https://wbyjptteluydlesmqeva.supabase.co';
const supabaseKey = 'sb_publishable_BTfOlPHWFRMrht8_vLK_SQ_A4IwNVPc'; // This was hardcoded before

console.log('Testing connection with:');
console.log('URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('\n1. Testing "prod_fortunes" table...');
  const { data: fortunes, error: fortunesError } = await supabase
    .from('prod_fortunes')
    .select('*')
    .limit(5);

  if (fortunesError) {
    console.error('❌ Error fetching from prod_fortunes:', fortunesError);
  } else {
    console.log('✅ Successfully fetched from prod_fortunes. Row count:', fortunes.length);
    console.log('Sample data:', fortunes);
  }

  console.log('\n2. Testing "prod_admin_config" table...');
  const { data: admin, error: adminError } = await supabase
    .from('prod_admin_config')
    .select('*')
    .limit(1);

  if (adminError) {
    console.error('❌ Error fetching from prod_admin_config:', adminError);
  } else {
    console.log('✅ Successfully fetched from prod_admin_config.');
  }
}

testConnection();

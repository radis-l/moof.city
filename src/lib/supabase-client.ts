import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL || 'https://wbyjptteluydlesmqeva.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_BTfOlPHWFRMrht8_vLK_SQ_A4IwNVPc'

export const supabase = createClient(supabaseUrl, supabaseKey)

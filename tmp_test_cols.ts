import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(url, key)

async function run() {
  const { data, error } = await supabase.from('escolinhas').select('*').limit(1)
  if (error) {
    console.error('Error:', error)
  } else {
    console.log('Columns:', data && data.length > 0 ? Object.keys(data[0]) : 'No rows found, cannot infer columns from empty data. Using raw query...')
    
    // Fallback if empty
    if (!data || data.length === 0) {
       const res = await supabase.rpc('get_table_columns', { table_name: 'escolinhas' })
       console.log('RPC:', res)
    }
  }
}
run()

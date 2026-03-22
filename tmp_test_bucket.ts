import { createClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(url, key)

async function run() {
  const { data, error } = await supabase.storage.listBuckets()
  if (error) {
    console.error('Error:', error)
  } else {
    console.log('Buckets:', data?.map(b => b.name))
  }
}
run()

// ============================================
// ScoutJR — Supabase Browser Client
// Usado em Client Components ('use client')
// ============================================

import { createBrowserClient } from '@supabase/ssr'

// Browser client (Client Components)
export function createSupabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )
}

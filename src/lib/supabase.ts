// ============================================
// ScoutJR — Supabase Browser Client
// Usado em Client Components ('use client')
// ============================================

import { createBrowserClient } from '@supabase/ssr'

// Browser client (Client Components)
export function createSupabaseBrowser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    // Retorna um objeto vazio durante o build para evitar erro do SDK
    return {} as ReturnType<typeof createBrowserClient>
  }

  return createBrowserClient(url, key)
}

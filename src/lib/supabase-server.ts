// ============================================
// ScoutJR — Supabase Server Clients
// APENAS para Server Components e Route Handlers
// NUNCA importe em 'use client' components
// ============================================

import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY!

// -----------------------------------------------
// Server client (Server Components, Route Handlers)
// -----------------------------------------------
export async function createSupabaseServer() {
  const cookieStore = await cookies()

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Read-only em Server Components — o middleware cuida do refresh
        }
      },
    },
  })
}

// -----------------------------------------------
// Admin client — service role, NUNCA no browser
// -----------------------------------------------
export function createSupabaseAdmin() {
  if (!SUPABASE_SERVICE_ROLE) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY não definida')
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

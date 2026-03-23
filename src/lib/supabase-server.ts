// ============================================
// ScoutJR — Supabase Server Clients
// APENAS para Server Components e Route Handlers
// NUNCA importe em 'use client' components
// ============================================

import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function createSupabaseServer() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    // Retorna um objeto vazio durante o build para evitar erro do SDK
    return {} as Awaited<ReturnType<typeof createServerClient>>
  }

  const cookieStore = await cookies()
  return createServerClient(url, key, {
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
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  
  if (!key) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY não definida')
  }
  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// -----------------------------------------------
// Helper de Verificação de Perfil
// -----------------------------------------------
export async function checkUserVerification() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { user: null, profile: null, isVerified: false, isAdmin: false }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const isAdmin = profile?.is_admin || false
  const isVerified = (profile?.status === 'ativo' || isAdmin)

  return { user, profile, isVerified, isAdmin }
}

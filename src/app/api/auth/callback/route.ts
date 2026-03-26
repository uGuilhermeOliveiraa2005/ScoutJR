import { createSupabaseServer } from '@/lib/supabase-server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createSupabaseServer()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('telefone, status, role')
          .eq('user_id', user.id)
          .single()

        // Usuário já tem conta completa (tem telefone) → vai direto pro dashboard
        if (profile?.telefone) {
          return NextResponse.redirect(`${origin}/dashboard`)
        }

        // Novo usuário via Google → precisa completar cadastro
        return NextResponse.redirect(`${origin}/cadastro?method=google`)
      }

      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}
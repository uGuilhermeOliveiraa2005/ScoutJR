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
      // Pequeno delay para garantir que o trigger handle_new_user teve tempo de rodar
      await new Promise(resolve => setTimeout(resolve, 800))
      
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Verifica se o perfil foi criado pelo trigger
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, telefone')
          .eq('user_id', user.id)
          .single()

        // Se o perfil existe mas não tem telefone, é um convite para completar o cadastro
        if (!profile || !profile.telefone) {
          return NextResponse.redirect(`${origin}/cadastro?method=google`)
        }
      }
      
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}

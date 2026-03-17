import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase-server'
import { createBillingPortal } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const { data: clube } = await supabase
    .from('clubes')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  if (!clube?.stripe_customer_id) {
    return NextResponse.json({ error: 'Sem assinatura ativa' }, { status: 400 })
  }

  const session = await createBillingPortal(
    clube.stripe_customer_id,
    `${process.env.NEXT_PUBLIC_APP_URL}/configuracoes`
  )

  return NextResponse.json({ url: session.url })
}

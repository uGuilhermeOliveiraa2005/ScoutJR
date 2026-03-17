import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase-server'
import { stripe, PLANOS, PRODUTOS, getOrCreateStripeCustomer, createSubscriptionCheckout, createPaymentCheckout } from '@/lib/stripe'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
    }

    const { tipo, plano } = await req.json()

    // Busca dados do usuário
    const { data: profile } = await supabase
      .from('profiles')
      .select('nome, email')
      .eq('user_id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })
    }

    const customerId = await getOrCreateStripeCustomer(
      profile.email,
      profile.nome,
      user.id
    )

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL!
    const successUrl = `${baseUrl}/dashboard?checkout=success`
    const cancelUrl = `${baseUrl}/configuracoes?checkout=canceled`

    let session

    if (tipo === 'assinatura') {
      const planoConfig = PLANOS[plano as keyof typeof PLANOS]
      if (!planoConfig) return NextResponse.json({ error: 'Plano inválido' }, { status: 400 })

      session = await createSubscriptionCheckout(
        customerId,
        planoConfig.priceId,
        successUrl,
        cancelUrl,
        { user_id: user.id, plano }
      )
    } else if (tipo === 'destaque') {
      session = await createPaymentCheckout(
        customerId,
        PRODUTOS.destaque.priceId,
        successUrl,
        cancelUrl,
        { user_id: user.id, tipo: 'destaque' }
      )
    } else if (tipo === 'verificacao') {
      session = await createPaymentCheckout(
        customerId,
        PRODUTOS.verificacao.priceId,
        successUrl,
        cancelUrl,
        { user_id: user.id, tipo: 'verificacao' }
      )
    } else {
      return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
    }

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('[STRIPE CHECKOUT]', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}

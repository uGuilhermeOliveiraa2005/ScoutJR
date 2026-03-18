import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createSupabaseAdmin } from '@/lib/supabase-server'
import Stripe from 'stripe'

// Stripe envia o body como raw — desabilitar body parser

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('[WEBHOOK] Assinatura inválida:', err)
    return NextResponse.json({ error: 'Webhook signature invalid' }, { status: 400 })
  }

  const supabase = createSupabaseAdmin()

  try {
    switch (event.type) {

      // -----------------------------------------------
      // Checkout concluído
      // -----------------------------------------------
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.user_id
        const tipo = session.metadata?.tipo
        const plano = session.metadata?.plano

        if (!userId) break

        if (session.mode === 'subscription' && plano) {
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string)

          console.log('[WEBHOOK] userId:', userId)
          console.log('[WEBHOOK] plano:', plano)
          console.log('[WEBHOOK] subscription status:', subscription.status)

          // Verifica se o clube existe
          const { data: clubeExistente, error: erroClube } = await supabase
            .from('clubes')
            .select('id, user_id')
            .eq('user_id', userId)
            .single()

          console.log('[WEBHOOK] clube encontrado:', clubeExistente)
          console.log('[WEBHOOK] erro ao buscar clube:', erroClube)

          const { error: erroUpdate } = await supabase.from('clubes').update({
            plano,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            status_assinatura: subscription.status,
            assinatura_expira_em: new Date((subscription as any).current_period_end * 1000).toISOString(),
          }).eq('user_id', userId)

          console.log('[WEBHOOK] erro no update:', erroUpdate)
        }

        if (session.mode === 'payment' && tipo === 'destaque') {
          // Ativar destaque do atleta por 30 dias
          const expira = new Date()
          expira.setDate(expira.getDate() + 30)
          await supabase.from('atletas').update({
            destaque_ativo: true,
            destaque_expira_em: expira.toISOString(),
          }).eq('responsavel_id', userId)
        }

        if (session.mode === 'payment' && tipo === 'verificacao') {
          // Verificar clube
          await supabase.from('clubes').update({
            verificado: true,
            verificado_em: new Date().toISOString(),
            stripe_customer_id: session.customer as string,
          }).eq('user_id', userId)
        }

        break
      }

      // -----------------------------------------------
      // Assinatura atualizada / renovada
      // -----------------------------------------------
      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription
        const customerId = sub.customer as string

        const { data: clube } = await supabase
          .from('clubes')
          .select('id')
          .eq('stripe_customer_id', customerId)
          .single()

        if (clube) {
          await supabase.from('clubes').update({
            status_assinatura: sub.status,
            assinatura_expira_em: new Date((sub as any).current_period_end * 1000).toISOString(),
          }).eq('id', clube.id)
        }
        break
      }

      // -----------------------------------------------
      // Assinatura cancelada
      // -----------------------------------------------
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        const customerId = sub.customer as string

        await supabase.from('clubes').update({
          status_assinatura: 'canceled',
          plano: null,
        }).eq('stripe_customer_id', customerId)
        break
      }

      // -----------------------------------------------
      // Pagamento falhou
      // -----------------------------------------------
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const customerId = invoice.customer as string

        await supabase.from('clubes').update({
          status_assinatura: 'past_due',
        }).eq('stripe_customer_id', customerId)
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('[WEBHOOK] Erro ao processar evento:', event.type, err)
    return NextResponse.json({ error: 'Webhook handler error' }, { status: 500 })
  }
}

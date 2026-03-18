import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase-server'
import { stripe, PLANOS, PRODUTOS } from '@/lib/stripe'

export async function POST(req: NextRequest) {
    try {
        const supabase = await createSupabaseServer()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
        }

        const { tipo, plano } = await req.json()

        const { data: profile } = await supabase
            .from('profiles')
            .select('nome, email')
            .eq('user_id', user.id)
            .single()

        if (!profile) {
            return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })
        }

        // Busca ou cria customer
        const existing = await stripe.customers.list({ email: profile.email, limit: 1 })
        let customerId = existing.data[0]?.id

        if (!customerId) {
            const customer = await stripe.customers.create({
                email: profile.email,
                name: profile.nome,
                metadata: { supabase_user_id: user.id },
            })
            customerId = customer.id
        }

        let amount = 0
        let description = ''

        if (tipo === 'assinatura' && plano) {
            const planoConfig = PLANOS[plano as keyof typeof PLANOS]
            if (!planoConfig) return NextResponse.json({ error: 'Plano inválido' }, { status: 400 })
            amount = planoConfig.preco * 100
            description = `Plano ${planoConfig.nome} - ScoutJR`
        } else if (tipo === 'destaque') {
            amount = PRODUTOS.destaque.preco * 100
            description = 'Destaque de Atleta - ScoutJR'
        } else if (tipo === 'verificacao') {
            amount = PRODUTOS.verificacao.preco * 100
            description = 'Verificação de Clube - ScoutJR'
        } else {
            return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'brl',
            customer: customerId,
            description,
            metadata: {
                user_id: user.id,
                tipo,
                plano: plano || '',
            },
            automatic_payment_methods: { enabled: true },
        })

        return NextResponse.json({
            clientSecret: paymentIntent.client_secret,
            amount,
            description,
        })
    } catch (err) {
        console.error('[PAYMENT INTENT]', err)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}
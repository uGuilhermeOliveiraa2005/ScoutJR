import { NextRequest, NextResponse } from 'next/server'
import { mpPayment } from '@/lib/mercadopago'
import { createSupabaseAdmin } from '@/lib/supabase-server'
import { validateMPWebhook, sanitizePaymentData, validatePaymentAmount } from '@/lib/mp-security'
import { PLANOS_MP, PRODUTOS_MP } from '@/lib/mercadopago'

export async function POST(req: NextRequest) {
    try {
        const xSignature = req.headers.get('x-signature') ?? ''
        const xRequestId = req.headers.get('x-request-id') ?? ''
        const body = await req.json()
        const dataId = body?.data?.id?.toString() ?? ''

        // Valida assinatura do webhook
        if (process.env.MP_WEBHOOK_SECRET) {
            const isValid = validateMPWebhook(xSignature, xRequestId, dataId)
            if (!isValid) {
                console.error('[WEBHOOK MP] Assinatura inválida')
                return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 })
            }
        }

        // Só processa eventos de pagamento
        if (body.type !== 'payment') {
            return NextResponse.json({ received: true })
        }

        const paymentId = body.data?.id
        if (!paymentId) {
            return NextResponse.json({ error: 'ID de pagamento ausente' }, { status: 400 })
        }

        // Busca pagamento no MP para verificar dados reais
        const payment = await mpPayment.get({ id: paymentId })

        if (!payment || payment.status !== 'approved') {
            return NextResponse.json({ received: true })
        }

        // Extrai referência
        const externalRef = payment.external_reference ?? ''
        const [userId, tipo, plano] = externalRef.split('|')

        if (!userId || !tipo) {
            console.error('[WEBHOOK MP] Referência inválida:', externalRef)
            return NextResponse.json({ error: 'Referência inválida' }, { status: 400 })
        }

        // Valida valor do pagamento
        let expectedAmount: number
        if (tipo === 'assinatura' && plano && plano in PLANOS_MP) {
            expectedAmount = PLANOS_MP[plano as keyof typeof PLANOS_MP].preco
        } else if (tipo === 'destaque') {
            expectedAmount = PRODUTOS_MP.destaque.preco
        } else if (tipo === 'verificacao') {
            expectedAmount = PRODUTOS_MP.verificacao.preco
        } else {
            console.error('[WEBHOOK MP] Tipo inválido:', tipo)
            return NextResponse.json({ error: 'Tipo inválido' }, { status: 400 })
        }

        if (!validatePaymentAmount(payment.transaction_amount ?? 0, expectedAmount)) {
            console.error('[WEBHOOK MP] Valor inválido:', payment.transaction_amount, 'esperado:', expectedAmount)
            return NextResponse.json({ error: 'Valor inválido' }, { status: 400 })
        }

        const supabase = createSupabaseAdmin()

        // Processa conforme tipo
        if (tipo === 'assinatura' && plano) {
            const expira = new Date()
            expira.setMonth(expira.getMonth() + 1)

            await supabase.from('escolinhas').update({
                plano,
                status_assinatura: 'active',
                assinatura_expira_em: expira.toISOString(),
                mp_payment_id: String(payment.id),
            }).eq('user_id', userId)
        }

        if (tipo === 'destaque') {
            // Busca o ID do profile real para usar como responsavel_id
            const { data: profile } = await supabase
                .from('profiles')
                .select('id')
                .eq('user_id', userId)
                .single()

            if (profile) {
                const expira = new Date()
                expira.setDate(expira.getDate() + 30)
                await supabase.from('atletas').update({
                    destaque_ativo: true,
                    destaque_expira_em: expira.toISOString(),
                }).eq('responsavel_id', profile.id)
            }
        }

        if (tipo === 'verificacao') {
            await supabase.from('escolinhas').update({
                verificado: true,
                verificado_em: new Date().toISOString(),
                mp_payment_id: String(payment.id),
            }).eq('user_id', userId)
        }

        return NextResponse.json({ received: true })

    } catch (err) {
        console.error('[WEBHOOK MP] Erro:', err)
        return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
    }
}
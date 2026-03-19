// ============================================
// CAMINHO: src/app/api/mp/payment/status/route.ts
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { mpPayment } from '@/lib/mercadopago'
import { createSupabaseServer, createSupabaseAdmin } from '@/lib/supabase-server'

// Atualiza o banco quando o PIX for aprovado
async function processApprovedPix(
    userId: string,
    tipo: string,
    plano: string | undefined,
    paymentId: number
) {
    const supabase = createSupabaseAdmin()

    try {
        if (tipo === 'assinatura' && plano) {
            const expira = new Date()
            expira.setMonth(expira.getMonth() + 1)

            await supabase.from('clubes').update({
                plano,
                status_assinatura: 'active',
                assinatura_expira_em: expira.toISOString(),
                mp_payment_id: String(paymentId),
            }).eq('user_id', userId)
        }

        if (tipo === 'destaque') {
            const expira = new Date()
            expira.setDate(expira.getDate() + 30)

            await supabase.from('atletas').update({
                destaque_ativo: true,
                destaque_expira_em: expira.toISOString(),
            }).eq('responsavel_id', userId)
        }

        if (tipo === 'verificacao') {
            await supabase.from('clubes').update({
                verificado: true,
                verificado_em: new Date().toISOString(),
                mp_payment_id: String(paymentId),
            }).eq('user_id', userId)
        }
    } catch (err) {
        console.error('[MP STATUS] Erro ao processar PIX aprovado:', err)
    }
}

export async function GET(req: NextRequest) {
    try {
        const supabase = await createSupabaseServer()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
        }

        const id = req.nextUrl.searchParams.get('id')
        if (!id) {
            return NextResponse.json({ error: 'ID obrigatório' }, { status: 400 })
        }

        const payment = await mpPayment.get({ id: Number(id) })

        // Verifica se o pagamento pertence ao usuário
        const externalRef = payment.external_reference ?? ''
        const [userId, tipo, plano] = externalRef.split('|')

        if (userId !== user.id) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
        }

        // PIX aprovado — atualiza o banco direto aqui (sem precisar de webhook)
        if (payment.status === 'approved') {
            await processApprovedPix(user.id, tipo, plano || undefined, payment.id!)
        }

        return NextResponse.json({
            status: payment.status,
            status_detail: payment.status_detail,
        })

    } catch (err) {
        console.error('[MP STATUS]', err)
        return NextResponse.json({ error: 'Erro ao consultar pagamento' }, { status: 500 })
    }
}
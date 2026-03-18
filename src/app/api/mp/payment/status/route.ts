import { NextRequest, NextResponse } from 'next/server'
import { mpPayment } from '@/lib/mercadopago'
import { createSupabaseServer } from '@/lib/supabase-server'

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
        const [userId] = externalRef.split('|')

        if (userId !== user.id) {
            return NextResponse.json({ error: 'Não autorizado' }, { status: 403 })
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
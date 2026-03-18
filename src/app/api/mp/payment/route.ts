import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase-server'
import { mpPayment, PLANOS_MP, PRODUTOS_MP } from '@/lib/mercadopago'
import { checkRateLimit } from '@/lib/mp-security'
import { z } from 'zod'

const paymentSchema = z.object({
    tipo: z.enum(['assinatura', 'destaque', 'verificacao']),
    plano: z.enum(['starter', 'pro', 'enterprise']).optional(),
    token: z.string().min(1, 'Token do cartão obrigatório').optional(),
    payment_method_id: z.string().min(1).optional(),
    installments: z.number().min(1).max(12).optional(),
    issuer_id: z.string().optional(),
    payer: z.object({
        email: z.string().email(),
        first_name: z.string().min(2),
        last_name: z.string().min(2),
        identification: z.object({
            type: z.enum(['CPF', 'CNPJ']),
            number: z.string().min(11).max(14),
        }),
        phone: z.object({
            area_code: z.string().length(2),
            number: z.string().min(8).max(9),
        }),
        address: z.object({
            zip_code: z.string().length(8),
            street_name: z.string().min(3),
            street_number: z.string().min(1),
            neighborhood: z.string().min(2),
            city: z.string().min(2),
            federal_unit: z.string().length(2),
        }),
    }),
    payment_type: z.enum(['credit_card', 'debit_card', 'pix']),
})

export async function POST(req: NextRequest) {
    try {
        // Rate limiting
        const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'
        if (!checkRateLimit(ip, 10, 60000)) {
            return NextResponse.json(
                { error: 'Muitas requisições. Aguarde um momento.' },
                { status: 429 }
            )
        }

        // Autenticação
        const supabase = await createSupabaseServer()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
        }

        // Validação do body
        const body = await req.json()
        const parsed = paymentSchema.safeParse(body)
        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Dados inválidos', details: parsed.error.flatten() },
                { status: 400 }
            )
        }

        const data = parsed.data

        // Busca perfil do usuário
        const { data: profile } = await supabase
            .from('profiles')
            .select('nome, email')
            .eq('user_id', user.id)
            .single()

        if (!profile) {
            return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })
        }

        // Determina valor e descrição
        let amount: number
        let description: string

        if (data.tipo === 'assinatura' && data.plano) {
            const plano = PLANOS_MP[data.plano]
            amount = plano.preco
            description = plano.descricao
        } else if (data.tipo === 'destaque') {
            amount = PRODUTOS_MP.destaque.preco
            description = PRODUTOS_MP.destaque.descricao
        } else if (data.tipo === 'verificacao') {
            amount = PRODUTOS_MP.verificacao.preco
            description = PRODUTOS_MP.verificacao.descricao
        } else {
            return NextResponse.json({ error: 'Tipo de pagamento inválido' }, { status: 400 })
        }

        // Monta payload do pagamento
        const paymentData: Record<string, unknown> = {
            transaction_amount: amount,
            description,
            external_reference: `${user.id}|${data.tipo}|${data.plano ?? ''}|${Date.now()}`,
            payer: {
                email: data.payer.email,
                first_name: data.payer.first_name,
                last_name: data.payer.last_name,
                identification: data.payer.identification,
                phone: data.payer.phone,
                address: data.payer.address,
            },
            metadata: {
                user_id: user.id,
                tipo: data.tipo,
                plano: data.plano ?? null,
            },
            notification_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/mp/webhook`,
        }

        // PIX
        if (data.payment_type === 'pix') {
            paymentData.payment_method_id = 'pix'
            paymentData.date_of_expiration = new Date(
                Date.now() + 30 * 60 * 1000 // 30 minutos
            ).toISOString()
        }

        // Cartão
        if (data.payment_type === 'credit_card' || data.payment_type === 'debit_card') {
            if (!data.token || !data.payment_method_id) {
                return NextResponse.json(
                    { error: 'Token e método de pagamento obrigatórios para cartão' },
                    { status: 400 }
                )
            }
            paymentData.token = data.token
            paymentData.payment_method_id = data.payment_method_id
            paymentData.installments = data.installments ?? 1
            if (data.issuer_id) paymentData.issuer_id = data.issuer_id
        }

        // Cria pagamento no MP
        const payment = await mpPayment.create({ body: paymentData })

        // Retorna resposta segura (sem dados sensíveis)
        return NextResponse.json({
            id: payment.id,
            status: payment.status,
            status_detail: payment.status_detail,
            payment_type: data.payment_type,
            // PIX QR Code
            pix: data.payment_type === 'pix' ? {
                qr_code: payment.point_of_interaction?.transaction_data?.qr_code,
                qr_code_base64: payment.point_of_interaction?.transaction_data?.qr_code_base64,
                ticket_url: payment.point_of_interaction?.transaction_data?.ticket_url,
            } : undefined,
        })

    } catch (err) {
        console.error('[MP PAYMENT]', err)
        return NextResponse.json({ error: 'Erro interno ao processar pagamento' }, { status: 500 })
    }
}
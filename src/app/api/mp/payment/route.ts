// ============================================
// CAMINHO: src/app/api/mp/payment/route.ts
// ============================================

import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServer, createSupabaseAdmin } from '@/lib/supabase-server'
import { mpPayment, mpPreApproval, PLANOS_MP, PRODUTOS_MP } from '@/lib/mercadopago'
import { checkRateLimit } from '@/lib/mp-security'
import { z } from 'zod'
import { cpf, cnpj } from 'cpf-cnpj-validator'

// O formulário CardPayment do MP envia só email e identification
// Os demais campos (first_name, last_name, phone, address) são opcionais
const paymentSchema = z.object({
    tipo: z.enum(['assinatura', 'destaque', 'verificacao']),
    plano: z.enum(['starter', 'pro', 'enterprise']).optional(),
    token: z.string().optional(),
    payment_method_id: z.string().optional(),
    installments: z.number().min(1).max(12).optional(),
    issuer_id: z.string().optional(),
    payer: z.object({
        email: z.string().email(),
        first_name: z.string().optional(),
        last_name: z.string().optional(),
        identification: z.object({
            type: z.enum(['CPF', 'CNPJ']),
            number: z.string().min(11).max(14),
        }).refine(doc => {
            if (doc.type === 'CPF') return cpf.isValid(doc.number)
            if (doc.type === 'CNPJ') return cnpj.isValid(doc.number)
            return false
        }, { message: 'CPF ou CNPJ inválido' }).optional(),
        phone: z.object({
            area_code: z.string(),
            number: z.string(),
        }).optional(),
        address: z.object({
            zip_code: z.string(),
            street_name: z.string(),
            street_number: z.string(),
            neighborhood: z.string(),
            city: z.string(),
            federal_unit: z.string(),
        }).optional(),
    }),
    payment_type: z.enum(['credit_card', 'debit_card', 'pix']),
})

async function processApprovedPayment(
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
            await supabase.from('escolinhas').update({
                plano,
                status_assinatura: 'active',
                assinatura_expira_em: expira.toISOString(),
                mp_payment_id: String(paymentId),
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
                mp_payment_id: String(paymentId),
            }).eq('user_id', userId)
        }
    } catch (err) {
        console.error('[MP PAYMENT] Erro ao processar pagamento aprovado:', err)
    }
}

export async function POST(req: NextRequest) {
    try {
        const ip = req.headers.get('x-forwarded-for') ?? req.headers.get('x-real-ip') ?? 'unknown'
        if (!checkRateLimit(ip, 10, 60000)) {
            return NextResponse.json({ error: 'Muitas requisições. Aguarde um momento.' }, { status: 429 })
        }

        const supabase = await createSupabaseServer()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
        }

        const body = await req.json()

        const parsed = paymentSchema.safeParse(body)
        if (!parsed.success) {
            console.error('[MP PAYMENT] Erro de validação:', parsed.error.flatten())
            return NextResponse.json(
                { error: 'Dados inválidos', details: parsed.error.flatten() },
                { status: 400 }
            )
        }

        const data = parsed.data

        const { data: profile } = await supabase
            .from('profiles')
            .select('nome, email')
            .eq('user_id', user.id)
            .single()

        if (!profile) {
            return NextResponse.json({ error: 'Perfil não encontrado' }, { status: 404 })
        }

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

        // Monta o payer — campos opcionais recebem valores padrão
        // pois o formulário CardPayment do MP não envia todos os campos
        const nomeParts = (data.payer.first_name ?? profile.nome ?? 'Usuario').trim().split(' ')
        const payer = {
            email: data.payer.email,
            first_name: data.payer.first_name ?? nomeParts[0],
            last_name: data.payer.last_name ?? (nomeParts.length > 1 ? nomeParts.slice(1).join(' ') : nomeParts[0]),
            identification: data.payer.identification ?? { type: 'CPF', number: '00000000000' },
            phone: data.payer.phone ?? { area_code: '11', number: '999999999' },
            address: data.payer.address ?? {
                zip_code: '01310100',
                street_name: 'Avenida Paulista',
                street_number: '1',
                neighborhood: 'Centro',
                city: 'São Paulo',
                federal_unit: 'SP',
            },
        }

        const paymentData: Record<string, unknown> = {
            transaction_amount: amount,
            description,
            external_reference: `${user.id}|${data.tipo}|${data.plano ?? ''}|${Date.now()}`,
            payer,
            metadata: {
                user_id: user.id,
                tipo: data.tipo,
                plano: data.plano ?? null,
            },
            notification_url: process.env.MP_WEBHOOK_SECRET
                ? `${process.env.NEXT_PUBLIC_APP_URL}/api/mp/webhook`
                : undefined,
        }

        if (data.payment_type === 'pix') {
            paymentData.payment_method_id = 'pix'
            paymentData.date_of_expiration = new Date(Date.now() + 30 * 60 * 1000).toISOString()
        }

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

        let responsePayload: any = {}

        if (data.tipo === 'assinatura' && (data.payment_type === 'credit_card' || data.payment_type === 'debit_card')) {
            if (!data.token) return NextResponse.json({ error: 'Token obrigatório' }, { status: 400 })
            const subscription = await mpPreApproval.create({
                body: {
                    payer_email: payer.email,
                    reason: description,
                    auto_recurring: {
                        frequency: 1,
                        frequency_type: "months",
                        transaction_amount: amount,
                        currency_id: "BRL"
                    },
                    card_token_id: data.token,
                    status: "authorized",
                    external_reference: `${user.id}|assinatura|${data.plano ?? ''}|${Date.now()}`
                } as any
            })

            const isApproved = subscription.status === 'authorized'
            if (isApproved) {
                await processApprovedPayment(user.id, data.tipo, data.plano, Number(subscription.id))
            }

            responsePayload = {
                id: subscription.id,
                status: isApproved ? 'approved' : 'rejected',
                status_detail: subscription.status,
                payment_type: data.payment_type
            }

        } else {
            const payment = await mpPayment.create({ body: paymentData })

            if (payment.status === 'approved' && data.payment_type !== 'pix') {
                await processApprovedPayment(user.id, data.tipo, data.plano, payment.id!)
            }

            responsePayload = {
                id: payment.id,
                status: payment.status,
                status_detail: payment.status_detail,
                payment_type: data.payment_type,
                pix: data.payment_type === 'pix' ? {
                    qr_code: payment.point_of_interaction?.transaction_data?.qr_code,
                    qr_code_base64: payment.point_of_interaction?.transaction_data?.qr_code_base64,
                    ticket_url: payment.point_of_interaction?.transaction_data?.ticket_url,
                } : undefined,
            }
        }

        return NextResponse.json(responsePayload)

    } catch (err: any) {
        console.error('[MP ERROR]', {
            message: err?.message,
            cause: err?.cause,
            status: err?.status,
        })
        return NextResponse.json({ error: 'Erro interno ao processar pagamento' }, { status: 500 })
    }
}
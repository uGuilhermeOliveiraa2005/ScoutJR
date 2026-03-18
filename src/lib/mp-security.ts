import crypto from 'crypto'

const WEBHOOK_SECRET = process.env.MP_WEBHOOK_SECRET!

// Valida assinatura do webhook do Mercado Pago
export function validateMPWebhook(
    xSignature: string,
    xRequestId: string,
    dataId: string
): boolean {
    try {
        const parts = xSignature.split(',')
        let ts: string | undefined
        let hash: string | undefined

        for (const part of parts) {
            const [key, value] = part.trim().split('=')
            if (key === 'ts') ts = value
            if (key === 'v1') hash = value
        }

        if (!ts || !hash) return false

        const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`
        const expected = crypto
            .createHmac('sha256', WEBHOOK_SECRET)
            .update(manifest)
            .digest('hex')

        return crypto.timingSafeEqual(
            Buffer.from(hash, 'hex'),
            Buffer.from(expected, 'hex')
        )
    } catch {
        return false
    }
}

// Sanitiza dados do pagamento antes de salvar
export function sanitizePaymentData(data: Record<string, unknown>): Record<string, unknown> {
    const allowed = [
        'id', 'status', 'status_detail', 'payment_method_id',
        'payment_type_id', 'transaction_amount', 'currency_id',
        'date_approved', 'date_created', 'external_reference',
        'payer', 'metadata'
    ]
    return Object.fromEntries(
        Object.entries(data).filter(([key]) => allowed.includes(key))
    )
}

// Rate limiting simples por IP em memória
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(ip: string, maxRequests = 10, windowMs = 60000): boolean {
    const now = Date.now()
    const entry = rateLimitMap.get(ip)

    if (!entry || now > entry.resetAt) {
        rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs })
        return true
    }

    if (entry.count >= maxRequests) return false

    entry.count++
    return true
}

// Valida se o valor do pagamento bate com o esperado
export function validatePaymentAmount(
    received: number,
    expected: number,
    toleranceCents = 1
): boolean {
    return Math.abs(received - expected) <= toleranceCents
}
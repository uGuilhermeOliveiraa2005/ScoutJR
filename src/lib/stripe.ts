import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-01-27.acacia',
  typescript: true,
})

export const PLANOS = {
  starter: {
    priceId: process.env.STRIPE_PRICE_STARTER!,
    nome: 'Starter',
    preco: 297,
    atletasVisiveis: 500,
    contatosMes: 10,
    descricao: 'Ideal para escolinhas e clubes pequenos',
  },
  pro: {
    priceId: process.env.STRIPE_PRICE_PRO!,
    nome: 'Pro',
    preco: 797,
    atletasVisiveis: -1, // ilimitado
    contatosMes: 50,
    descricao: 'Para clubes em crescimento',
  },
  enterprise: {
    priceId: process.env.STRIPE_PRICE_ENTERPRISE!,
    nome: 'Enterprise',
    preco: 1497,
    atletasVisiveis: -1,
    contatosMes: -1,
    descricao: 'Para grandes clubes e federações',
  },
} as const

export const PRODUTOS = {
  destaque: {
    priceId: process.env.STRIPE_PRICE_DESTAQUE!,
    nome: 'Destaque de jogador',
    preco: 49,
    duracaoDias: 30,
  },
  verificacao: {
    priceId: process.env.STRIPE_PRICE_VERIFICACAO!,
    nome: 'Verificação de clube',
    preco: 997,
  },
} as const

// -----------------------------------------------
// Criar ou recuperar customer do Stripe
// -----------------------------------------------
export async function getOrCreateStripeCustomer(
  email: string,
  nome: string,
  userId: string
): Promise<string> {
  const existing = await stripe.customers.list({
    email,
    limit: 1,
  })

  if (existing.data.length > 0) {
    return existing.data[0].id
  }

  const customer = await stripe.customers.create({
    email,
    name: nome,
    metadata: { supabase_user_id: userId },
  })

  return customer.id
}

// -----------------------------------------------
// Criar checkout session de assinatura
// -----------------------------------------------
export async function createSubscriptionCheckout(
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string,
  metadata?: Record<string, string>
) {
  return stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
    subscription_data: {
      metadata: metadata ?? {},
    },
    allow_promotion_codes: true,
    billing_address_collection: 'required',
  })
}

// -----------------------------------------------
// Criar checkout session de pagamento único
// -----------------------------------------------
export async function createPaymentCheckout(
  customerId: string,
  priceId: string,
  successUrl: string,
  cancelUrl: string,
  metadata?: Record<string, string>
) {
  return stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'payment',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata,
  })
}

// -----------------------------------------------
// Criar portal de billing
// -----------------------------------------------
export async function createBillingPortal(
  customerId: string,
  returnUrl: string
) {
  return stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  })
}

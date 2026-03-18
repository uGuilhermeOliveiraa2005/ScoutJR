import { MercadoPagoConfig, Payment, PreApproval } from 'mercadopago'

if (!process.env.MP_ACCESS_TOKEN) {
    throw new Error('MP_ACCESS_TOKEN não definida')
}

export const mp = new MercadoPagoConfig({
    accessToken: process.env.MP_ACCESS_TOKEN,
    options: {
        timeout: 10000,
    },
})

export const mpPayment = new Payment(mp)
export const mpPreApproval = new PreApproval(mp)

export const PLANOS_MP = {
    starter: {
        nome: 'ScoutJR Starter',
        preco: 297,
        descricao: 'Plano Starter — até 500 atletas, 10 contatos/mês',
    },
    pro: {
        nome: 'ScoutJR Pro',
        preco: 797,
        descricao: 'Plano Pro — atletas ilimitados, 50 contatos/mês',
    },
    enterprise: {
        nome: 'ScoutJR Enterprise',
        preco: 1497,
        descricao: 'Plano Enterprise — tudo ilimitado',
    },
} as const

export const PRODUTOS_MP = {
    destaque: {
        nome: 'Destaque de Atleta',
        preco: 49,
        descricao: 'Destaque do perfil do atleta por 30 dias',
    },
    verificacao: {
        nome: 'Verificação de Clube',
        preco: 997,
        descricao: 'Verificação oficial do clube na plataforma',
    },
} as const
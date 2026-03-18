import { createSupabaseServer } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { NavbarDashboard } from '@/components/layout/Navbar'
import { PLANOS, PRODUTOS } from '@/lib/stripe'
import { CheckoutForm } from './CheckoutForm'
import { Shield, Lock, BadgeCheck, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default async function CheckoutPage({
    searchParams,
}: {
    searchParams: Promise<{ tipo?: string; plano?: string }>
}) {
    const supabase = await createSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

    if (!profile) redirect('/login')

    const params = await searchParams
    const tipo = params.tipo || 'destaque'
    const plano = params.plano || ''

    // Assinaturas usam o Stripe Checkout original (webhooks funcionam melhor)
    if (tipo === 'assinatura') {
        redirect('/configuracoes')
    }

    // Apenas destaque e verificacao usam o checkout customizado
    if (tipo !== 'destaque' && tipo !== 'verificacao') {
        redirect('/configuracoes')
    }

    let titulo = ''
    let descricao = ''
    let preco = 0

    if (tipo === 'destaque') {
        titulo = PRODUTOS.destaque.nome
        descricao = 'Apareça no topo das buscas por 30 dias'
        preco = PRODUTOS.destaque.preco
    } else if (tipo === 'verificacao') {
        titulo = PRODUTOS.verificacao.nome
        descricao = 'Selo de clube verificado na plataforma'
        preco = PRODUTOS.verificacao.preco
    }

    return (
        <>
            <NavbarDashboard userName={profile.nome} userRole={profile.role} />
            <main className="min-h-screen bg-neutral-100 py-10 px-4">
                <div className="max-w-4xl mx-auto">

                    <Link href="/configuracoes" className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-700 mb-6 transition-colors">
                        <ArrowLeft size={14} /> Voltar
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                        {/* Resumo do pedido */}
                        <div className="flex flex-col gap-4">
                            <div className="bg-white border border-neutral-200 rounded-2xl p-6">
                                <p className="text-xs uppercase tracking-widest text-neutral-400 mb-4">Resumo do pedido</p>

                                <div className="flex items-start justify-between mb-6">
                                    <div>
                                        <h2 className="font-display text-3xl text-neutral-900">{titulo}</h2>
                                        <p className="text-sm text-neutral-500 mt-1">{descricao}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-display text-3xl text-green-700">
                                            R$ {preco.toLocaleString('pt-BR')}
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t border-neutral-100 pt-4 flex flex-col gap-3">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-neutral-500">Subtotal</span>
                                        <span className="font-medium">R$ {preco.toLocaleString('pt-BR')}</span>
                                    </div>
                                    <div className="flex justify-between text-sm font-medium border-t border-neutral-100 pt-3">
                                        <span>Total hoje</span>
                                        <span className="text-green-700 text-base">R$ {preco.toLocaleString('pt-BR')}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Benefícios */}
                            <div className="bg-green-700 rounded-2xl p-6 text-white">
                                <p className="text-xs uppercase tracking-widest text-white/40 mb-4">O que você recebe</p>
                                <div className="flex flex-col gap-3">
                                    {tipo === 'destaque' && [
                                        'Aparece no topo das buscas',
                                        'Badge de destaque no perfil',
                                        'Validade de 30 dias',
                                        'Mais visibilidade para clubes',
                                    ].map(b => (
                                        <div key={b} className="flex items-center gap-2 text-sm text-white/80">
                                            <BadgeCheck size={16} className="text-green-300 flex-shrink-0" />
                                            {b}
                                        </div>
                                    ))}
                                    {tipo === 'verificacao' && [
                                        'Selo verificado no perfil',
                                        'Mais credibilidade na plataforma',
                                        'Acesso a recursos exclusivos',
                                        'Verificação permanente',
                                    ].map(b => (
                                        <div key={b} className="flex items-center gap-2 text-sm text-white/80">
                                            <BadgeCheck size={16} className="text-green-300 flex-shrink-0" />
                                            {b}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Segurança */}
                            <div className="flex items-center gap-3 px-4 py-3 bg-white border border-neutral-200 rounded-xl">
                                <Lock size={16} className="text-neutral-400 flex-shrink-0" />
                                <p className="text-xs text-neutral-400 leading-relaxed">
                                    Pagamento 100% seguro processado pelo Stripe. Seus dados nunca são armazenados em nossos servidores.
                                </p>
                            </div>
                        </div>

                        {/* Formulário de pagamento */}
                        <div>
                            <CheckoutForm
                                tipo={tipo}
                                plano={plano}
                                preco={preco}
                                titulo={titulo}
                                userEmail={profile.email}
                            />
                        </div>

                    </div>
                </div>
            </main>
        </>
    )
}
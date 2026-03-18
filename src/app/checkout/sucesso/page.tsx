import { createSupabaseServer } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { NavbarDashboard } from '@/components/layout/Navbar'
import { PLANOS, PRODUTOS } from '@/lib/stripe'
import { CircleCheckBig, ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default async function CheckoutSucessoPage({
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
    const tipo = params.tipo || 'assinatura'
    const plano = params.plano || 'starter'

    let titulo = ''
    let descricao = ''
    let proximosPassos: string[] = []

    if (tipo === 'assinatura' && plano) {
        const planoConfig = PLANOS[plano as keyof typeof PLANOS]
        titulo = `Plano ${planoConfig.nome} ativado!`
        descricao = `Sua assinatura foi confirmada com sucesso. Bem-vindo ao plano ${planoConfig.nome}!`
        proximosPassos = [
            'Acesse a busca de atletas e use os filtros avançados',
            'Salve seus atletas favoritos para acompanhar',
            'Entre em contato com responsáveis de atletas do seu interesse',
        ]
    } else if (tipo === 'destaque') {
        titulo = 'Destaque ativado!'
        descricao = 'Seu atleta agora aparece no topo das buscas por 30 dias!'
        proximosPassos = [
            'Seu atleta já aparece em destaque nas buscas',
            'Clubes verificados podem ver seu perfil com prioridade',
            'Acompanhe o aumento de visualizações no dashboard',
        ]
    } else if (tipo === 'verificacao') {
        titulo = 'Clube verificado!'
        descricao = 'Seu clube recebeu o selo de verificação na plataforma!'
        proximosPassos = [
            'Seu selo de verificado já aparece no seu perfil',
            'Famílias confiam mais em clubes verificados',
            'Acesse recursos exclusivos para clubes verificados',
        ]
    }

    return (
        <>
            <NavbarDashboard userName={profile.nome} userRole={profile.role} />
            <main className="min-h-screen bg-neutral-100 flex items-center justify-center px-4 py-12">
                <div className="w-full max-w-lg">

                    {/* Card principal */}
                    <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">

                        {/* Header verde */}
                        <div className="bg-green-700 px-8 py-10 text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-full opacity-10">
                                <div className="absolute top-4 left-8 w-32 h-32 rounded-full bg-white" />
                                <div className="absolute bottom-2 right-6 w-20 h-20 rounded-full bg-amber-400" />
                            </div>
                            <div className="relative z-10">
                                <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CircleCheckBig size={40} className="text-white" />
                                </div>
                                <div className="font-display text-4xl text-white mb-2">{titulo}</div>
                                <p className="text-white/70 text-sm leading-relaxed">{descricao}</p>
                            </div>
                        </div>

                        {/* Conteúdo */}
                        <div className="p-8">

                            {/* Próximos passos */}
                            <div className="mb-8">
                                <div className="flex items-center gap-2 mb-4">
                                    <Sparkles size={16} className="text-amber-500" />
                                    <h3 className="text-sm font-medium text-neutral-900">Próximos passos</h3>
                                </div>
                                <div className="flex flex-col gap-3">
                                    {proximosPassos.map((passo, i) => (
                                        <div key={i} className="flex items-start gap-3">
                                            <div className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-display flex-shrink-0 mt-0.5">
                                                {i + 1}
                                            </div>
                                            <p className="text-sm text-neutral-600 leading-relaxed">{passo}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Resumo */}
                            <div className="bg-neutral-50 rounded-xl p-4 mb-8">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-neutral-500">Confirmação enviada para</span>
                                    <span className="font-medium text-neutral-700">{profile.email}</span>
                                </div>
                            </div>

                            {/* Botões */}
                            <div className="flex flex-col gap-3">
                                <Link href="/dashboard">
                                    <Button variant="dark" size="lg" className="w-full">
                                        Ir para o dashboard <ArrowRight size={16} />
                                    </Button>
                                </Link>
                                {profile.role === 'clube' && (
                                    <Link href="/busca">
                                        <Button variant="outline" size="lg" className="w-full">
                                            Explorar atletas
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Logo */}
                    <div className="text-center mt-6">
                        <span className="font-display text-xl tracking-widest text-green-700">
                            SCOUT<span className="text-amber-500">JR</span>
                        </span>
                    </div>

                </div>
            </main>
        </>
    )
}
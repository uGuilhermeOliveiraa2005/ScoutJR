// ============================================
// CAMINHO: src/app/dashboard/page.tsx
// ============================================

import { createSupabaseServer, createSupabaseAdmin } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { NavbarDashboard } from '@/components/layout/Navbar'
import { Users, Star, MessageCircle, TrendingUp, ArrowRight, Eye, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default async function DashboardPage() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: initialProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  let profile = initialProfile

  if (!profile) {
    const adminSupabase = createSupabaseAdmin()
    const { data: newProfile, error: insertError } = await adminSupabase
      .from('profiles')
      .upsert(
        {
          user_id: user.id,
          nome: user.user_metadata?.nome || 'Usuário',
          email: user.email!,
          role: user.user_metadata?.role || 'responsavel'
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single()

    if (insertError) {
      console.error('Erro ao auto-criar perfil:', insertError)
      redirect('/login?error=profile_not_found')
    }
    profile = newProfile
  }

  const isClube = profile.role === 'clube'

  let clube = null
  let athlete = null

  if (isClube) {
    const { data } = await supabase
      .from('clubes')
      .select('*')
      .eq('user_id', user.id)
      .single()
    clube = data
  } else {
    // Busca o primeiro atleta deste responsável
    const { data } = await supabase
      .from('atletas')
      .select('*')
      .eq('responsavel_id', profile.id)
      .order('created_at', { ascending: true })
      .limit(1)
      .single()
    athlete = data

    // Busca posição no ranking
    if (athlete) {
      const { count } = await supabase
        .from('atletas')
        .select('*', { count: 'exact', head: true })
        .gt('ranking_score', athlete.ranking_score)
      athlete.ranking_position = (count || 0) + 1
    }
  }

  return (
    <>
      <NavbarDashboard
        userName={profile.nome}
        userRole={profile.role}
        verificado={clube?.verificado ?? false}
      />
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {/* Welcome */}
        <div className="mb-8 animate-in fade-in slide-in-from-left duration-500">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-display text-3xl md:text-4xl text-neutral-900 tracking-tight leading-tight">
              OLÁ, {isClube ? profile.nome.toUpperCase() : profile.nome.split(' ')[0].toUpperCase()}
            </h1>
            {/* Selo de verificado no título */}
            {isClube && clube?.verificado && (
              <div className="flex items-center gap-1.5 bg-green-100 text-green-700 text-[10px] md:text-xs font-bold px-3 py-1.5 rounded-full border border-green-200 shadow-sm">
                <ShieldCheck size={13} />
                CLUBE VERIFICADO
              </div>
            )}
          </div>
          <p className="text-sm md:text-base text-neutral-500 mt-1 max-w-lg">
            {isClube ? 'Gerencie suas buscas e acompanhe novos talentos em tempo real.' : 'Acompanhe o desempenho e a visibilidade do seu perfil profissional.'}
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {isClube ? (
            <>
              <StatCard icon={<Eye size={18} />} label="Perfis vistos" value="—" color="green" />
              <StatCard icon={<Star size={18} />} label="Favoritos" value="—" color="amber" />
              <StatCard icon={<MessageCircle size={18} />} label="Interesses" value="—" color="blue" />
              <StatCard icon={<TrendingUp size={18} />} label="Novos Atletas" value="—" color="green" />
            </>
          ) : (
            <>
              <StatCard icon={<Eye size={18} />} label="Visitas" value="—" color="green" />
              <StatCard icon={<Star size={18} />} label="Favoritos" value={athlete?.favoritos_count || '0'} color="amber" />
              <StatCard icon={<MessageCircle size={18} />} label="Interesses" value={athlete?.interesses_count || '0'} color="blue" />
              <StatCard icon={<TrendingUp size={18} />} label="Ranking" value={athlete ? `#${athlete.ranking_position}` : '—'} color="green" />
            </>
          )}
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-6">

            {isClube ? (
              <div className="bg-white border border-neutral-200 rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-medium text-neutral-900">Buscar talentos</h2>
                  <Link href="/busca"><Button size="sm" variant="outline">Ver todos <ArrowRight size={13} /></Button></Link>
                </div>
                <p className="text-sm text-neutral-500 mb-4">Encontre o próximo craque usando nossos filtros avançados.</p>
                <Link href="/busca"><Button variant="dark">Explorar atletas</Button></Link>
              </div>
            ) : (
              <div className="bg-white border border-neutral-200 rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-medium text-neutral-900">Meu atleta</h2>
                  {athlete && (
                    <Link href={`/perfil/${athlete.id}`}>
                      <Button size="sm" variant="outline">Ver perfil <ArrowRight size={13} /></Button>
                    </Link>
                  )}
                </div>
                
                {athlete ? (
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-neutral-100 rounded-xl flex items-center justify-center text-neutral-400">
                      <Users size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-display text-green-700">{athlete.nome.toUpperCase()}</h3>
                      <p className="text-sm text-neutral-500">{athlete.posicao} • {athlete.cidade}/{athlete.estado}</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-neutral-500 mb-4">Nenhum atleta cadastrado ainda. Crie o perfil do seu filho para aparecer para os clubes.</p>
                    <Link href="/perfil/novo"><Button variant="dark">Cadastrar atleta</Button></Link>
                  </>
                )}
              </div>
            )}

            <div className="bg-white border border-neutral-200 rounded-xl p-6">
              <h2 className="font-medium text-neutral-900 mb-4">Atividade recente</h2>
              <div className="flex flex-col items-center justify-center py-8 text-neutral-300">
                <TrendingUp size={32} />
                <p className="text-sm mt-2">Nenhuma atividade ainda</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-4">
            <div className="bg-white border border-neutral-200 rounded-xl p-5">
              <h3 className="text-sm font-medium text-neutral-900 mb-3">Minha conta</h3>
              <div className="flex flex-col gap-2 text-sm text-neutral-500">
                <div className="flex justify-between">
                  <span>Plano</span>
                  <span className="font-medium text-neutral-700">
                    {isClube
                      ? (clube?.plano ? clube.plano.charAt(0).toUpperCase() + clube.plano.slice(1) : 'Gratuito')
                      : 'Família'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Status</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${clube?.status_assinatura === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-neutral-200 text-neutral-600'
                    }`}>
                    {clube?.status_assinatura === 'active' ? 'Ativo' : 'Gratuito'}
                  </span>
                </div>
                {/* Linha de verificado na sidebar */}
                {isClube && (
                  <div className="flex justify-between">
                    <span>Verificação</span>
                    {clube?.verificado ? (
                      <span className="flex items-center gap-1 text-xs font-medium text-green-700">
                        <ShieldCheck size={11} /> Verificado
                      </span>
                    ) : (
                      <span className="text-xs text-neutral-400">Não verificado</span>
                    )}
                  </div>
                )}
              </div>
              {isClube && clube?.status_assinatura !== 'active' && (
                <Link href="/configuracoes" className="mt-4 block">
                  <Button variant="amber" size="sm" className="w-full">Fazer upgrade</Button>
                </Link>
              )}
            </div>

            {!isClube && !athlete?.destaque_ativo && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-5">
                <h3 className="text-sm font-medium text-amber-800 mb-2">Destaque seu atleta</h3>
                <p className="text-xs text-amber-600 leading-relaxed mb-3">Apareça no topo das buscas e receba mais atenção dos clubes por apenas R$ 49/mês.</p>
                <Link href="/configuracoes"><Button variant="amber" size="sm" className="w-full">Ativar destaque</Button></Link>
              </div>
            )}
            
            {athlete?.destaque_ativo && (
              <div className="bg-green-50 border border-green-100 rounded-xl p-5">
                <h3 className="text-sm font-medium text-green-800 mb-2 flex items-center gap-2">
                  <Star size={14} fill="currentColor" /> Perfil em Destaque
                </h3>
                <p className="text-xs text-green-600 leading-relaxed">Seu atleta está aparecendo no topo das buscas dos clubes! 🔥</p>
              </div>
            )}

            {/* Banner verificação para clubes não verificados */}
            {isClube && !clube?.verificado && (
              <div className="bg-green-50 border border-green-100 rounded-xl p-5">
                <h3 className="text-sm font-medium text-green-800 mb-2 flex items-center gap-1.5">
                  <ShieldCheck size={14} /> Verifique seu clube
                </h3>
                <p className="text-xs text-green-600 leading-relaxed mb-3">
                  Obtenha o selo verificado e aumente a confiança das famílias na plataforma.
                </p>
                <Link href="/configuracoes">
                  <Button variant="dark" size="sm" className="w-full">Verificar agora</Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  const colors: Record<string, string> = {
    green: 'bg-green-100 text-green-700',
    amber: 'bg-amber-100 text-amber-700',
    blue: 'bg-blue-100 text-blue-700',
  }
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-4">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${colors[color]}`}>{icon}</div>
      <div className="font-display text-2xl text-neutral-900 leading-none mb-1">{value}</div>
      <div className="text-xs text-neutral-400">{label}</div>
    </div>
  )
}
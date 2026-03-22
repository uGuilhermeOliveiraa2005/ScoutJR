import { createSupabaseServer, createSupabaseAdmin } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { NavbarDashboard } from '@/components/layout/Navbar'
import { Users, Star, MessageCircle, TrendingUp, ArrowRight, Eye } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { RecentActivity } from '@/components/notifications/RecentActivity'
import { Avatar } from '@/components/ui/Avatar'

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

  const isEscolinha = profile.role === 'escolinha'

  let escolinha = null
  let athlete = null

  if (isEscolinha) {
    const { data } = await supabase
      .from('escolinhas')
      .select('*')
      .eq('user_id', user.id)
      .single()
    escolinha = data
  } else {
    const { data } = await supabase
      .from('atletas')
      .select('*')
      .eq('responsavel_id', profile.id)
      .order('created_at', { ascending: true })
      .limit(1)
      .single()
    athlete = data

    if (athlete) {
      const { count } = await supabase
        .from('atletas')
        .select('*', { count: 'exact', head: true })
        .gt('ranking_score', athlete.ranking_score)
      athlete.ranking_position = (count || 0) + 1
    }
  }

  const userFotoUrl = isEscolinha
    ? (escolinha?.foto_url ?? profile?.foto_url ?? null)
    : (profile?.foto_url ?? null)

  return (
    <>
      <NavbarDashboard
        userName={profile.nome}
        userRole={profile.role}
        userId={user.id}
        userFotoUrl={userFotoUrl}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-8 pb-24 md:pb-8">

        {/* Welcome */}
        <div className="mb-5 sm:mb-8 animate-in fade-in slide-in-from-left duration-500">
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl text-neutral-900 tracking-tight leading-tight">
            OLÁ, {isEscolinha ? profile.nome.toUpperCase() : profile.nome.split(' ')[0].toUpperCase()}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1 max-w-lg">
            {isEscolinha
              ? 'Gerencie suas buscas e acompanhe novos talentos.'
              : 'Acompanhe o desempenho e a visibilidade do atleta.'}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-10">
          {isEscolinha ? (
            <>
              <StatCard icon={<Eye size={16} />} label="Perfis vistos" value="—" color="green" />
              <StatCard icon={<Star size={16} />} label="Favoritos" value="—" color="amber" />
              <StatCard icon={<MessageCircle size={16} />} label="Interesses" value="—" color="blue" />
              <StatCard icon={<TrendingUp size={16} />} label="Novos atletas" value="—" color="green" />
            </>
          ) : (
            <>
              <StatCard icon={<Eye size={16} />} label="Visitas" value="—" color="green" />
              <StatCard icon={<Star size={16} />} label="Favoritos" value={athlete?.favoritos_count || '0'} color="amber" />
              <StatCard icon={<MessageCircle size={16} />} label="Interesses" value={athlete?.interesses_count || '0'} color="blue" />
              <StatCard icon={<TrendingUp size={16} />} label="Ranking" value={athlete ? `#${athlete.ranking_position}` : '—'} color="green" />
            </>
          )}
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 flex flex-col gap-4 sm:gap-6">

            {isEscolinha ? (
              <div className="bg-white border border-neutral-200 rounded-xl p-5 sm:p-6">
                <div className="flex justify-between items-center mb-3 sm:mb-4">
                  <h2 className="font-medium text-neutral-900 text-sm sm:text-base">Buscar talentos</h2>
                  <Link href="/busca">
                    <Button size="sm" variant="outline" className="text-xs">
                      Ver todos <ArrowRight size={12} />
                    </Button>
                  </Link>
                </div>
                <p className="text-xs sm:text-sm text-neutral-500 mb-4">
                  Encontre o próximo craque usando nossos filtros avançados.
                </p>
                <Link href="/busca">
                  <Button variant="dark" className="w-full sm:w-auto justify-center">Explorar atletas</Button>
                </Link>
              </div>
            ) : (
              <div className="bg-white border border-neutral-200 rounded-xl p-5 sm:p-6">
                <div className="flex justify-between items-center mb-3 sm:mb-4">
                  <h2 className="font-medium text-neutral-900 text-sm sm:text-base">Meu atleta</h2>
                  {athlete && (
                    <Link href={`/perfil/${athlete.id}`}>
                      <Button size="sm" variant="outline" className="text-xs">
                        Ver perfil <ArrowRight size={12} />
                      </Button>
                    </Link>
                  )}
                </div>

                {athlete ? (
                  <div className="flex items-center gap-3 sm:gap-4">
                    <Avatar
                      src={athlete.foto_url}
                      nome={athlete.nome}
                      size="xl"
                      colorClass="bg-green-100 text-green-700"
                    />
                    <div>
                      <h3 className="text-base sm:text-lg font-display text-green-700">{athlete.nome.toUpperCase()}</h3>
                      <p className="text-xs sm:text-sm text-neutral-500">{athlete.posicao} • {athlete.cidade}/{athlete.estado}</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-xs sm:text-sm text-neutral-500 mb-4">Nenhum atleta cadastrado ainda.</p>
                    <Link href="/perfil/novo">
                      <Button variant="dark" className="w-full sm:w-auto justify-center">Cadastrar atleta</Button>
                    </Link>
                  </>
                )}
              </div>
            )}

            <div className="bg-white border border-neutral-200 rounded-xl p-5 sm:p-6">
              <h2 className="font-medium text-neutral-900 text-sm sm:text-base mb-4">Atividade recente</h2>
              <RecentActivity userId={user.id} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="bg-white border border-neutral-200 rounded-xl p-4 sm:p-5">
              <h3 className="text-xs sm:text-sm font-medium text-neutral-900 mb-3">Minha conta</h3>
              <div className="flex flex-col gap-2 text-xs sm:text-sm text-neutral-500">
                <div className="flex justify-between">
                  <span>Tipo de conta</span>
                  <span className="font-medium text-neutral-700">
                    {isEscolinha ? 'Escolinha' : 'Família'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Status</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700">
                    Ativo
                  </span>
                </div>
              </div>
              <Link href="/configuracoes" className="mt-3 block">
                <Button variant="outline" size="sm" className="w-full justify-center text-xs">
                  Configurações
                </Button>
              </Link>
            </div>

            {/* Dica para responsável sem atleta */}
            {!isEscolinha && !athlete && (
              <div className="bg-green-50 border border-green-100 rounded-xl p-4 sm:p-5">
                <h3 className="text-xs sm:text-sm font-medium text-green-800 mb-1.5">
                  Cadastre seu atleta
                </h3>
                <p className="text-[10px] sm:text-xs text-green-600 leading-relaxed mb-3">
                  Crie o perfil do seu filho e deixe que escolinhas de todo o Brasil o descubram.
                </p>
                <Link href="/perfil/novo">
                  <Button variant="dark" size="sm" className="w-full justify-center text-xs">
                    Criar perfil agora
                  </Button>
                </Link>
              </div>
            )}

            {/* Dica para escolinha */}
            {isEscolinha && (
              <div className="bg-green-50 border border-green-100 rounded-xl p-4 sm:p-5">
                <h3 className="text-xs sm:text-sm font-medium text-green-800 mb-1.5">
                  Explore os talentos
                </h3>
                <p className="text-[10px] sm:text-xs text-green-600 leading-relaxed mb-3">
                  Use os filtros avançados para encontrar o atleta ideal para sua escolinha.
                </p>
                <Link href="/busca">
                  <Button variant="dark" size="sm" className="w-full justify-center text-xs">
                    Buscar atletas
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}

function StatCard({ icon, label, value, color }: {
  icon: React.ReactNode
  label: string
  value: string
  color: string
}) {
  const colors: Record<string, string> = {
    green: 'bg-green-100 text-green-700',
    amber: 'bg-amber-100 text-amber-700',
    blue: 'bg-blue-100 text-blue-700',
  }
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-3.5 sm:p-4">
      <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center mb-2 sm:mb-3 ${colors[color]}`}>
        {icon}
      </div>
      <div className="font-display text-xl sm:text-2xl text-neutral-900 leading-none mb-0.5 sm:mb-1">{value}</div>
      <div className="text-[10px] sm:text-xs text-neutral-400">{label}</div>
    </div>
  )
}
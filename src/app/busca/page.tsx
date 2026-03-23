import { redirect } from 'next/navigation'
import { createSupabaseServer } from '@/lib/supabase-server'
import { NavbarDashboard } from '@/components/layout/Navbar'
import { NavbarPublic } from '@/components/layout/Navbar'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { POSICOES, ESTADOS } from '@/lib/utils'
import { PositionAlertButton } from '@/components/busca/PositionAlertButton'
import { Avatar } from '@/components/ui/Avatar'
import { SearchSidebar } from '@/components/busca/SearchSidebar'

export const dynamic = 'force-dynamic'

export default async function BuscaPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  const params = await searchParams

  let profile = null
  let escolinha = null
  if (user) {
    const { data: profileData } = await supabase.from('profiles').select('*').eq('user_id', user.id).single()
    profile = profileData

    console.log('DEBUG SEARCH:', {
      userId: user.id,
      email: user.email,
      profileExists: !!profile,
      profileStatus: profile?.status,
      profileIsAdmin: profile?.is_admin
    })

    // Strict Lockout for unverified users
    if (profile && profile.status !== 'ativo' && !profile.is_admin) {
      console.log('SEARCH REDIRECTING TO WAITING PAGE...')
      redirect('/aguardando-verificacao')
    }

    if (profile?.role === 'escolinha') {
      const { data: escolinhaData } = await supabase.from('escolinhas').select('id, verificado, foto_url').eq('user_id', user.id).single()
      escolinha = escolinhaData
    }
  }

  const escolinhaId = (profile?.role === 'escolinha' && escolinha) ? escolinha.id : null

  let query = supabase
    .from('atletas')
    .select(`
      id, nome, posicao, estado, cidade, data_nascimento,
      habilidade_tecnica, habilidade_velocidade, habilidade_visao,
      habilidade_fisico, habilidade_finalizacao, habilidade_passes,
      destaque_ativo, foto_url
    `)
    .eq('visivel', true)
    .eq('status', 'ativo')
    .order('destaque_ativo', { ascending: false })
    .order('habilidade_visao', { ascending: false })
    .limit(48)

  if (params.nome) query = query.ilike('nome', `%${params.nome}%`)
  if (params.posicao) query = query.eq('posicao', params.posicao)
  if (params.estado) query = query.eq('estado', params.estado)
  if (params.cidade) query = query.eq('cidade', params.cidade)

  const { data: atletas } = await query

  const hasFilters = params.nome || params.posicao || params.estado || params.cidade

  const userFotoUrl = profile?.role === 'escolinha'
    ? (escolinha?.foto_url ?? profile?.foto_url ?? null)
    : (profile?.foto_url ?? null)

  const Navbar = user && profile ? (
    <NavbarDashboard
      userName={profile.nome}
      userRole={profile.role}
      verificado={escolinha?.verificado ?? false}
      userId={user.id}
      userFotoUrl={userFotoUrl}
    />
  ) : <NavbarPublic />

  return (
    <>
      {Navbar}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-8 pb-24 md:pb-8">

        {/* Header */}
        <div className="mb-5 sm:mb-8 animate-in fade-in slide-in-from-top duration-500">
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-neutral-900 mb-1 tracking-tight">
            EXPLORAR TALENTOS
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500">Encontre o próximo craque do futebol brasileiro.</p>
        </div>

        {/* Mobile: Search bar no topo */}
        <div className="md:hidden mb-4">
          <form method="GET" className="flex gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
              <input
                name="nome"
                defaultValue={params.nome}
                placeholder="Buscar atleta..."
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-neutral-200 rounded-xl outline-none focus:border-green-400 bg-white"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-green-700 text-white rounded-xl text-sm font-medium"
            >
              <Search size={16} />
            </button>
          </form>
        </div>

        {/* Mobile: Filtros horizontais scroll */}
        <div className="md:hidden mb-4 -mx-4 px-4">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            <a
              href="/busca"
              className={`flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${!params.posicao && !params.estado
                ? 'bg-green-700 text-white border-green-700'
                : 'bg-white border-neutral-200 text-neutral-600'
                }`}
            >
              Todos
            </a>
            {POSICOES.map(p => (
              <a
                key={p.value}
                href={`/busca?${new URLSearchParams({ ...params, posicao: p.value }).toString()}`}
                className={`flex-shrink-0 px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${params.posicao === p.value
                  ? 'bg-green-700 text-white border-green-700'
                  : 'bg-white border-neutral-200 text-neutral-600'
                  }`}
              >
                {p.value}
              </a>
            ))}
          </div>
        </div>

        {/* Active filters (mobile) */}
        {hasFilters && (
          <div className="md:hidden flex items-center gap-2 mb-4 flex-wrap">
            <span className="text-xs text-neutral-500">Filtros:</span>
            {params.nome && (
              <div className="flex items-center gap-1 bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                "{params.nome}"
                <a href={`/busca?${new URLSearchParams({ ...params, nome: '' }).toString()}`}>
                  <X size={10} />
                </a>
              </div>
            )}
            {params.estado && (
              <div className="flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                {params.estado}
                <a href={`/busca?${new URLSearchParams({ ...params, estado: '', cidade: '' }).toString()}`}>
                  <X size={10} />
                </a>
              </div>
            )}
            {params.cidade && (
              <div className="flex items-center gap-1 bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full">
                {params.cidade}
                <a href={`/busca?${new URLSearchParams({ ...params, cidade: '' }).toString()}`}>
                  <X size={10} />
                </a>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">

          {/* Sidebar filters — desktop only */}
          <aside className="hidden lg:block lg:col-span-1">
            <SearchSidebar params={params} />
          </aside>

          {/* Results */}
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-3 sm:mb-4">
              <span className="text-xs sm:text-sm text-neutral-500">
                <strong className="text-neutral-900">{atletas?.length ?? 0}</strong> atletas
              </span>

              {escolinhaId && params.posicao && (
                <div className="hidden sm:block ml-4">
                  <PositionAlertButton escolinhaId={escolinhaId} posicao={params.posicao} />
                </div>
              )}
              <select className="text-xs sm:text-sm border border-neutral-200 rounded-lg px-2.5 sm:px-3 py-1 sm:py-1.5 outline-none focus:border-green-400 bg-white">
                <option>Melhor avaliação</option>
                <option>Mais recentes</option>
                <option>Mais jovens</option>
              </select>
            </div>

            {escolinhaId && params.posicao && (
              <div className="sm:hidden mb-4">
                <PositionAlertButton escolinhaId={escolinhaId} posicao={params.posicao} />
              </div>
            )}

            {!user && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 sm:p-4 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className="text-xs sm:text-sm text-amber-700">Faça login para ver perfis completos.</p>
                <a href="/login" className="text-xs sm:text-sm font-medium text-amber-800 underline whitespace-nowrap">Entrar →</a>
              </div>
            )}

            {atletas && atletas.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                {atletas.map((a: any, i: number) => (
                  <AtletaCard key={a.id} atleta={a} index={i} loggedIn={!!user} />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-neutral-200 rounded-xl p-8 sm:p-12 text-center">
                <Search size={28} className="text-neutral-300 mx-auto mb-3" />
                <p className="text-sm text-neutral-500">Nenhum atleta encontrado.</p>
                {hasFilters && (
                  <a href="/busca" className="text-xs text-green-600 mt-2 inline-block">Limpar filtros</a>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}

const CARD_COLORS = [
  { bg: 'bg-green-400', hex: '#1D9E75', light: 'bg-green-50' },
  { bg: 'bg-blue-400', hex: '#378ADD', light: 'bg-blue-50' },
  { bg: 'bg-amber-500', hex: '#EF9F27', light: 'bg-amber-50' },
  { bg: 'bg-red-400', hex: '#E24B4A', light: 'bg-red-50' },
  { bg: 'bg-purple-400', hex: '#8B5CF6', light: 'bg-purple-50' },
]

function AtletaCard({ atleta, index, loggedIn }: { atleta: any; index: number; loggedIn: boolean }) {
  const color = CARD_COLORS[index % CARD_COLORS.length]
  const nota = Math.round((atleta.habilidade_tecnica + atleta.habilidade_visao + atleta.habilidade_passes) / 3)

  return (
    <a
      href={loggedIn ? `/perfil/${atleta.id}` : '/login'}
      className="bg-white border border-neutral-200 rounded-xl overflow-hidden hover:-translate-y-0.5 hover:shadow-md transition-all duration-150 block active:scale-95"
    >
      {/* Header com foto ou iniciais */}
      <div
        className="px-3 sm:px-4 pt-3 sm:pt-4 pb-2 flex items-end justify-between relative"
        style={{ background: `color-mix(in srgb, ${color.hex} 12%, white)` }}
      >
        <Avatar
          src={atleta.foto_url}
          nome={atleta.nome}
          size="md"
          colorClass={`${color.bg} text-white`}
        />
        <div className="font-display text-3xl sm:text-5xl opacity-20 leading-none text-neutral-600">
          {atleta.posicao}
        </div>
      </div>

      <div className="p-2.5 sm:p-3">
        <div className="text-xs sm:text-sm font-medium text-neutral-900 mb-0.5 truncate">{atleta.nome}</div>
        <div className="text-[10px] sm:text-xs text-neutral-400 mb-2 sm:mb-3 truncate">
          {atleta.posicao} · {atleta.cidade}, {atleta.estado}
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
            <div className="h-full bg-green-400 rounded-full" style={{ width: `${nota}%` }} />
          </div>
          <span className="text-[10px] sm:text-xs font-medium text-neutral-600">{nota}</span>
        </div>
        {atleta.destaque_ativo && (
          <span className="mt-1.5 sm:mt-2 inline-block bg-amber-100 text-amber-700 text-[9px] sm:text-[10px] font-medium px-1.5 sm:px-2 py-0.5 rounded-full">
            Em destaque
          </span>
        )}
      </div>
    </a>
  )
}
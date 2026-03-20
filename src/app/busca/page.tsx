import { createSupabaseServer } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { NavbarDashboard } from '@/components/layout/Navbar'
import { NavbarPublic } from '@/components/layout/Navbar'
import { Search, SlidersHorizontal } from 'lucide-react'
import { POSICOES, ESTADOS } from '@/lib/utils'

export default async function BuscaPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  const params = await searchParams

  let profile = null
  let clube = null
  if (user) {
    const { data: profileData } = await supabase.from('profiles').select('*').eq('user_id', user.id).single()
    profile = profileData

    if (profile?.role === 'clube') {
      const { data: clubeData } = await supabase.from('clubes').select('verificado').eq('user_id', user.id).single()
      clube = clubeData
    }
  }

  // Build query
  let query = supabase
    .from('atletas')
    .select(`
      id, nome, posicao, estado, cidade, data_nascimento,
      habilidade_tecnica, habilidade_velocidade, habilidade_visao,
      habilidade_fisico, habilidade_finalizacao, habilidade_passes,
      destaque_ativo, foto_url
    `)
    .eq('visivel', true)
    .order('destaque_ativo', { ascending: false })
    .order('habilidade_visao', { ascending: false })
    .limit(48)

  if (params.nome) query = query.ilike('nome', `%${params.nome}%`)
  if (params.posicao) query = query.eq('posicao', params.posicao)
  if (params.estado) query = query.eq('estado', params.estado)

  const { data: atletas } = await query

  const Navbar = user && profile ? (
    <NavbarDashboard
      userName={profile.nome}
      userRole={profile.role}
      verificado={clube?.verificado ?? false}
    />
  ) : <NavbarPublic />

  return (
    <>
      {Navbar}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="mb-8 animate-in fade-in slide-in-from-top duration-500">
          <h1 className="font-display text-3xl md:text-5xl text-neutral-900 mb-1 tracking-tight">EXPLORAR TALENTOS</h1>
          <p className="text-sm md:text-base text-neutral-500">Encontre o próximo craque do futebol brasileiro.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters */}
          <aside className="lg:col-span-1">
            <div className="bg-white border border-neutral-200 rounded-xl p-5 sticky top-20">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium flex items-center gap-2"><SlidersHorizontal size={15} /> Filtros</span>
                <a href="/busca" className="text-xs text-green-600 hover:text-green-700">Limpar</a>
              </div>

              <form method="GET" className="flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wide mb-1.5">Buscar por nome</label>
                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                    <input name="nome" defaultValue={params.nome} placeholder="Nome do atleta..." className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-200 rounded-lg outline-none focus:border-green-400 bg-white" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wide mb-1.5">Posição</label>
                  <div className="grid grid-cols-3 gap-1.5">
                    <a href={`/busca?${new URLSearchParams({ ...params, posicao: '' }).toString()}`} className={`text-center py-1.5 text-xs border rounded-lg transition-colors ${!params.posicao ? 'bg-green-100 border-green-400 text-green-700 font-medium' : 'border-neutral-200 text-neutral-500 hover:border-neutral-300'}`}>Todos</a>
                    {POSICOES.map(p => (
                      <a key={p.value} href={`/busca?${new URLSearchParams({ ...params, posicao: p.value }).toString()}`} className={`text-center py-1.5 text-xs border rounded-lg transition-colors ${params.posicao === p.value ? 'bg-green-100 border-green-400 text-green-700 font-medium' : 'border-neutral-200 text-neutral-500 hover:border-neutral-300'}`}>{p.value}</a>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wide mb-1.5">Estado</label>
                  <select name="estado" defaultValue={params.estado} className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg outline-none focus:border-green-400 bg-white">
                    <option value="">Todos</option>
                    {ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                  </select>
                </div>

                <button type="submit" className="w-full py-2 text-sm bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors font-medium">
                  Buscar
                </button>
              </form>
            </div>
          </aside>

          {/* Results */}
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-neutral-500"><strong className="text-neutral-900">{atletas?.length ?? 0}</strong> atletas encontrados</span>
              <select className="text-sm border border-neutral-200 rounded-lg px-3 py-1.5 outline-none focus:border-green-400 bg-white">
                <option>Melhor avaliação</option>
                <option>Mais recentes</option>
                <option>Mais jovens</option>
              </select>
            </div>

            {!user && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 flex items-center justify-between gap-4">
                <p className="text-sm text-amber-700">Faça login para ver perfis completos e contatar responsáveis.</p>
                <a href="/login" className="text-sm font-medium text-amber-800 underline whitespace-nowrap">Entrar</a>
              </div>
            )}

            {atletas && atletas.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {atletas.map((a, i) => (
                  <AtletaCard key={a.id} atleta={a} index={i} loggedIn={!!user} />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-neutral-200 rounded-xl p-12 text-center">
                <Search size={32} className="text-neutral-300 mx-auto mb-3" />
                <p className="text-neutral-500">Nenhum atleta encontrado com esses filtros.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}

const CARD_COLORS = ['bg-green-400','bg-blue-400','bg-amber-500','bg-red-400','bg-purple-400']

function AtletaCard({ atleta, index, loggedIn }: { atleta: any; index: number; loggedIn: boolean }) {
  const color = CARD_COLORS[index % CARD_COLORS.length]
  const initials = atleta.nome.split(' ').map((p: string) => p[0]).slice(0, 2).join('').toUpperCase()
  const nota = Math.round((atleta.habilidade_tecnica + atleta.habilidade_visao + atleta.habilidade_passes) / 3)

  return (
    <a href={loggedIn ? `/perfil/${atleta.id}` : '/login'} className="bg-white border border-neutral-200 rounded-xl overflow-hidden hover:-translate-y-1 hover:shadow-md transition-all duration-150 block">
      <div className={`${CARD_COLORS[index % CARD_COLORS.length].replace('bg-','bg-').replace('-400','-100').replace('-500','-100')} bg-opacity-50 px-4 pt-4 pb-2 flex items-end justify-between relative`} style={{ background: `color-mix(in srgb, ${color.includes('green') ? '#1D9E75' : color.includes('blue') ? '#378ADD' : color.includes('amber') ? '#EF9F27' : color.includes('red') ? '#E24B4A' : '#8B5CF6'} 15%, white)` }}>
        <div className={`w-11 h-11 rounded-full ${color} text-white flex items-center justify-center font-display text-base`}>{initials}</div>
        <div className="font-display text-5xl opacity-20 leading-none text-neutral-600">
          {atleta.posicao}
        </div>
      </div>
      <div className="p-3">
        <div className="text-sm font-medium text-neutral-900 mb-0.5 truncate">{atleta.nome}</div>
        <div className="text-xs text-neutral-400 mb-3">{atleta.posicao} · {atleta.cidade}, {atleta.estado}</div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
            <div className="h-full bg-green-400 rounded-full" style={{ width: `${nota}%` }} />
          </div>
          <span className="text-xs font-medium text-neutral-600">{nota}</span>
        </div>
        {atleta.destaque_ativo && (
          <span className="mt-2 inline-block bg-amber-100 text-amber-700 text-[10px] font-medium px-2 py-0.5 rounded-full">Em destaque</span>
        )}
      </div>
    </a>
  )
}

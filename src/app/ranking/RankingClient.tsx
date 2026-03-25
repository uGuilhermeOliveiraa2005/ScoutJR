'use client'

import { useState, useMemo } from 'react'
import { NavbarDashboard, NavbarPublic } from '@/components/layout/Navbar'
import { Trophy, Star, MessageCircle, TrendingUp, Search, X, SlidersHorizontal } from 'lucide-react'
import Link from 'next/link'
import { Avatar } from '@/components/ui/Avatar'
import { cn, POSICOES, ESTADOS } from '@/lib/utils'
import { CitySelect } from '@/components/ui/CitySelect'

const MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

interface RankingClientProps {
  initialAtletas: any[]
  user: any
  profile: any
  escolinha: any
}

export function RankingClient({ initialAtletas, user, profile, escolinha }: RankingClientProps) {
  const atletas = initialAtletas
  const loading = false

  // Filtros
  const [search, setSearch] = useState('')
  const [posicao, setPosicao] = useState('')
  const [estado, setEstado] = useState('')
  const [cidade, setCidade] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // Filtragem client-side
  const filtered = useMemo(() => {
    return atletas.filter(a => {
      const matchSearch = !search ||
        a.nome.toLowerCase().includes(search.toLowerCase()) ||
        a.cidade?.toLowerCase().includes(search.toLowerCase())
      const matchPosicao = !posicao || a.posicao === posicao
      const matchEstado = !estado || a.estado === estado
      const matchCidade = !cidade || a.cidade === cidade
      return matchSearch && matchPosicao && matchEstado && matchCidade
    })
  }, [atletas, search, posicao, estado, cidade])

  const hasFilters = search || posicao || estado || cidade
  const clearFilters = () => { setSearch(''); setPosicao(''); setEstado(''); setCidade('') }

  const userFotoUrl = profile?.role === 'escolinha'
    ? (escolinha?.foto_url ?? profile?.foto_url ?? null)
    : (profile?.foto_url ?? null)

  return (
    <>
      {user && profile ? (
        <NavbarDashboard
          userName={profile.nome}
          userRole={profile.role}
          verificado={escolinha?.verificado ?? false}
          userId={user.id}
          userFotoUrl={userFotoUrl}
          isAdmin={profile?.is_admin}
        />
      ) : (
        <NavbarPublic />
      )}

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-5 sm:py-8 pb-24 md:pb-8">
        {/* Header */}
        <div className="mb-5 sm:mb-6 animate-in fade-in slide-in-from-top duration-500">
          <div className="flex items-center gap-3 mb-1">
            <Trophy size={22} className="text-amber-500" />
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-neutral-900 tracking-tight">
              RANKING
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-neutral-500 ml-9">
            Os atletas mais observados da plataforma — temporada 2025
          </p>
        </div>

        {/* Pills de pontuação */}
        <div className="flex flex-wrap gap-2 mb-5 sm:mb-6">
          {[
            { icon: <Star size={11} />, label: 'Favoritado', pts: '+10 pts', color: 'text-amber-600 bg-amber-50 border-amber-100' },
            { icon: <MessageCircle size={11} />, label: 'Interesse', pts: '+25 pts', color: 'text-blue-600 bg-blue-50 border-blue-100' },
            { icon: <TrendingUp size={11} />, label: 'Contato aceito', pts: '+50 pts', color: 'text-green-700 bg-green-50 border-green-100' },
          ].map(item => (
            <div
              key={item.label}
              className={cn('border rounded-full px-3 py-1.5 flex items-center gap-1.5 text-[10px] sm:text-xs font-medium', item.color)}
            >
              {item.icon}
              {item.label}
              <span className="font-bold">{item.pts}</span>
            </div>
          ))}
        </div>

        {/* Barra de busca + filtros */}
        <div className="flex flex-col gap-2 mb-4 sm:mb-5">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Buscar por nome ou cidade..."
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-neutral-200 rounded-xl bg-white outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <button
              onClick={() => setShowFilters(v => !v)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 text-sm font-medium border rounded-xl transition-colors flex-shrink-0',
                showFilters || posicao || estado || cidade
                  ? 'bg-green-700 text-white border-green-700'
                  : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300'
              )}
            >
              <SlidersHorizontal size={14} />
              <span className="hidden sm:inline">Filtros</span>
              {(posicao || estado || cidade) && (
                <span className="w-4 h-4 rounded-full bg-white/30 text-[9px] font-bold flex items-center justify-center">
                  {[posicao, estado, cidade].filter(Boolean).length}
                </span>
              )}
            </button>
          </div>

          {showFilters && (
            <div className="bg-white border border-neutral-200 rounded-xl p-4 flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="flex-1">
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Posição</p>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setPosicao('')}
                    className={cn(
                      'px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors',
                      !posicao
                        ? 'bg-green-700 text-white border-green-700'
                        : 'bg-white border-neutral-200 text-neutral-500 hover:border-neutral-300'
                    )}
                  >
                    Todas
                  </button>
                  {POSICOES.map(p => (
                    <button
                      key={p.value}
                      onClick={() => setPosicao(prev => prev === p.value ? '' : p.value)}
                      className={cn(
                        'px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors',
                        posicao === p.value
                          ? 'bg-green-700 text-white border-green-700'
                          : 'bg-white border-neutral-200 text-neutral-500 hover:border-neutral-300'
                      )}
                    >
                      {p.value}
                    </button>
                  ))}
                </div>
              </div>

              <div className="hidden sm:block w-px bg-neutral-100 self-stretch" />
              <div className="sm:hidden h-px bg-neutral-100" />

              <div className="flex flex-col sm:flex-row gap-4 sm:w-[350px]">
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Estado</p>
                  <select
                    value={estado}
                    onChange={e => { setEstado(e.target.value); setCidade('') }}
                    className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg bg-white outline-none focus:border-green-400 appearance-none cursor-pointer"
                  >
                    <option value="">Todos</option>
                    {ESTADOS.map(e => (
                      <option key={e.value} value={e.value}>{e.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-2">Cidade</p>
                  <CitySelect
                    estado={estado}
                    value={cidade}
                    onChange={e => setCidade(e.target.value)}
                    placeholder="Todas"
                    className="py-2"
                  />
                </div>
              </div>
            </div>
          )}

          {hasFilters && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] text-neutral-400">Filtros:</span>
              {search && <Tag label={`"${search}"`} onRemove={() => setSearch('')} />}
              {posicao && <Tag label={posicao} onRemove={() => setPosicao('')} />}
              {estado && <Tag label={estado} onRemove={() => setEstado('')} />}
              {cidade && <Tag label={cidade} onRemove={() => setCidade('')} />}
              <button
                onClick={clearFilters}
                className="text-[10px] text-neutral-400 hover:text-red-500 font-medium transition-colors"
              >
                Limpar tudo
              </button>
            </div>
          )}
        </div>

        {!loading && (
          <p className="text-xs text-neutral-500 mb-3">
            {hasFilters ? (
              <>
                <strong className="text-neutral-900">{filtered.length}</strong> resultado{filtered.length !== 1 ? 's' : ''}
                <span className="text-neutral-400"> de {atletas.length}</span>
              </>
            ) : (
              <><strong className="text-neutral-900">{atletas.length}</strong> atletas no ranking</>
            )}
          </p>
        )}

        {/* Tabela */}
        <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="hidden sm:grid grid-cols-[48px_1fr_80px_80px_80px] px-5 py-3 bg-neutral-50 border-b border-neutral-100">
            {[
              { label: '#', align: '' },
              { label: 'Atleta', align: '' },
              { label: 'Favs', align: 'text-center' },
              { label: 'Int.', align: 'text-center' },
              { label: 'Pontos', align: 'text-right' },
            ].map(h => (
              <div key={h.label} className={cn('text-[10px] font-bold text-neutral-400 uppercase tracking-widest', h.align)}>
                {h.label}
              </div>
            ))}
          </div>

          <div className="divide-y divide-neutral-50">
            {filtered.length === 0 ? (
              <div className="py-16 text-center">
                <Search size={28} className="text-neutral-200 mx-auto mb-3" />
                <p className="text-sm text-neutral-500 mb-2">
                  {hasFilters ? 'Nenhum atleta com esses filtros.' : 'Nenhum atleta no ranking ainda.'}
                </p>
                {hasFilters && (
                  <button onClick={clearFilters} className="text-xs text-green-600 hover:text-green-700 font-medium">
                    Limpar filtros
                  </button>
                )}
              </div>
            ) : (
              filtered.map((atleta, i) => {
                const rankGeral = initialAtletas.findIndex(a => a.id === atleta.id) + 1
                return (
                  <RankRow
                    key={atleta.id}
                    rank={rankGeral}
                    atleta={atleta}
                    loggedIn={!!user}
                    isFiltered={!!hasFilters}
                  />
                )
              })
            )}
          </div>
        </div>

        {filtered.length > 0 && (
          <p className="text-center text-[10px] text-neutral-400 mt-4">
            {hasFilters
              ? `Mostrando ${filtered.length} de ${atletas.length} atletas`
              : `Top ${atletas.length} atletas · temporada 2025`}
          </p>
        )}
      </main>
    </>
  )
}

function Tag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-[10px] font-medium px-2 py-0.5 rounded-full">
      {label}
      <button onClick={onRemove} className="hover:text-green-900 transition-colors">
        <X size={10} />
      </button>
    </span>
  )
}

function RankRow({
  rank,
  atleta,
  loggedIn,
  isFiltered,
}: {
  rank: number
  atleta: any
  loggedIn: boolean
  isFiltered: boolean
}) {
  const isPodium = rank <= 3 && !isFiltered

  return (
    <Link
      href={loggedIn ? `/perfil/${atleta.id}` : '/login'}
      className={cn(
        'flex items-center gap-3 sm:gap-0 sm:grid sm:grid-cols-[48px_1fr_80px_80px_80px]',
        'px-4 sm:px-5 py-3.5 transition-colors hover:bg-neutral-50 active:bg-neutral-100 group',
        isPodium && 'bg-amber-50/40 hover:bg-amber-50/80'
      )}
    >
      <div className="w-8 sm:w-auto flex-shrink-0 flex items-center">
        {isPodium ? (
          <span className="text-lg leading-none">{MEDALS[rank]}</span>
        ) : (
          <span className="font-display text-lg text-neutral-400 leading-none w-6 text-center group-hover:text-green-600 transition-colors">
            {rank}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
        <Avatar
          src={atleta.foto_url}
          nome={atleta.nome}
          size="sm"
          colorClass={isPodium ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}
          className="flex-shrink-0"
        />
        <div className="min-w-0">
          <div className="text-xs sm:text-sm font-semibold text-neutral-900 truncate group-hover:text-green-700 transition-colors">
            {atleta.nome}
          </div>
          <div className="text-[10px] text-neutral-400 truncate flex items-center gap-1.5">
            <span className="font-semibold text-neutral-500">{atleta.posicao}</span>
            <span className="text-neutral-300">·</span>
            <span>{atleta.cidade}, {atleta.estado}</span>
            {atleta.destaque_ativo && (
              <span className="text-amber-500 font-medium hidden sm:inline">✦ Destaque</span>
            )}
          </div>
        </div>
      </div>

      <div className="hidden sm:flex items-center justify-center gap-1 text-sm text-neutral-500">
        <Star size={11} className="text-amber-400" />
        {atleta.favoritos_count ?? 0}
      </div>

      <div className="hidden sm:flex items-center justify-center gap-1 text-sm text-neutral-500">
        <MessageCircle size={11} className="text-blue-400" />
        {atleta.interesses_count ?? 0}
      </div>

      <div className="flex-shrink-0 text-right ml-auto sm:ml-0">
        <span className={cn(
          'font-display text-xl sm:text-2xl leading-none',
          isPodium ? 'text-amber-600' : 'text-green-700'
        )}>
          {atleta.ranking_score}
        </span>
        <span className="text-[9px] text-neutral-400 ml-0.5 hidden sm:inline">pts</span>
      </div>
    </Link>
  )
}

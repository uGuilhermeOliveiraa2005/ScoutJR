'use client'

import { useEffect, useState } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase'
import { NavbarDashboard, NavbarPublic } from '@/components/layout/Navbar'
import { Trophy, TrendingUp, Star, Crown, Flame, ChevronUp, ChevronDown, Minus } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export default function RankingPage() {
  const [atletas, setAtletas] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [clube, setClube] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createSupabaseBrowser()

  useEffect(() => {
    async function init() {
      const { data: { user: u } } = await supabase.auth.getUser()
      setUser(u)

      if (u) {
        const { data: p } = await supabase.from('profiles').select('*').eq('user_id', u.id).single()
        setProfile(p)

        if (p?.role === 'clube') {
          const { data: c } = await supabase.from('clubes').select('verificado').eq('user_id', u.id).single()
          setClube(c)
        }
      }

      const { data } = await supabase
        .from('atletas')
        .select('id, nome, posicao, estado, cidade, ranking_score, favoritos_count, interesses_count, destaque_ativo, foto_url')
        .gt('ranking_score', 0)
        .order('ranking_score', { ascending: false })
        .order('favoritos_count', { ascending: false })
        .limit(50)

      setAtletas(data || [])
      setLoading(false)
    }
    init()
  }, [])

  const top3 = atletas.slice(0, 3)
  const remaining = atletas.slice(3)

  return (
    <>
      {user && profile ? (
        <NavbarDashboard userName={profile.nome} userRole={profile.role} verificado={clube?.verificado ?? false} userId={user.id} />
      ) : (
        <NavbarPublic />
      )}

      <div className="min-h-screen bg-neutral-900 text-white pb-24 md:pb-0">

        {/* ── HERO ── */}
        <div className="relative overflow-hidden">
          {/* Fundo com gradiente radial + linhas de grade */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(29,158,117,0.18),transparent)]" />
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)`,
                backgroundSize: '60px 60px',
              }}
            />
            {/* Glow verde embaixo do título */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-green-500/8 blur-[120px] rounded-full" />
          </div>

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-14 sm:pt-20 md:pt-28 pb-10 sm:pb-16 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-6 sm:mb-8">
              <Flame size={11} />
              Temporada 2025
            </div>

            <h1 className="font-display text-6xl sm:text-7xl md:text-9xl leading-none tracking-tight mb-4 sm:mb-6">
              <span className="text-white">RANKING</span>
              <br />
              <span
                className="text-transparent"
                style={{ WebkitTextStroke: '1px rgba(255,255,255,0.15)' }}
              >
                SCOUT
              </span>
              <span className="text-green-400">JR</span>
            </h1>

            <p className="text-neutral-500 text-sm sm:text-base md:text-lg max-w-lg mx-auto leading-relaxed">
              Os talentos mais observados do futebol jovem brasileiro, classificados em tempo real.
            </p>

            {/* Stats rápidos */}
            <div className="flex items-center justify-center gap-6 sm:gap-10 mt-8 sm:mt-10">
              {[
                { label: 'Atletas', value: String(atletas.length || '—') },
                { label: 'Pontos máx', value: String(atletas[0]?.ranking_score || '—') },
                { label: 'Temporada', value: '2025' },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <div className="font-display text-2xl sm:text-3xl text-white leading-none">{s.value}</div>
                  <div className="text-[10px] sm:text-xs text-neutral-600 uppercase tracking-widest mt-1 font-medium">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── CONTEÚDO ── */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 sm:pb-24">

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <div className="w-10 h-10 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin" />
              <p className="text-neutral-500 text-sm">Carregando ranking...</p>
            </div>
          ) : (
            <>
              {/* ── PÓDIO TOP 3 ── */}
              {top3.length > 0 && (
                <div className="mb-10 sm:mb-16">
                  <div className="flex items-center gap-2 mb-6 sm:mb-8">
                    <Crown size={16} className="text-amber-400" />
                    <span className="text-xs sm:text-sm font-bold text-neutral-400 uppercase tracking-[0.15em]">
                      Top 3 da temporada
                    </span>
                  </div>

                  {/* Desktop: 3 cards lado a lado com alturas diferentes */}
                  <div className="hidden md:grid grid-cols-3 gap-4 items-end">
                    {/* 2° lugar */}
                    {top3[1] && <PodiumCard place={2} athlete={top3[1]} height="h-[320px]" />}
                    {/* 1° lugar — mais alto */}
                    {top3[0] && <PodiumCard place={1} athlete={top3[0]} height="h-[380px]" isFirst />}
                    {/* 3° lugar */}
                    {top3[2] && <PodiumCard place={3} athlete={top3[2]} height="h-[280px]" />}
                  </div>

                  {/* Mobile: lista horizontal com scroll */}
                  <div className="md:hidden flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
                    {top3.map((athlete, i) => (
                      <MobilePodiumCard key={athlete.id} place={i + 1} athlete={athlete} />
                    ))}
                  </div>
                </div>
              )}

              {/* ── TABELA PRINCIPAL ── */}
              <div>
                <div className="flex items-center gap-2 mb-4 sm:mb-6">
                  <TrendingUp size={15} className="text-green-400" />
                  <span className="text-xs sm:text-sm font-bold text-neutral-400 uppercase tracking-[0.15em]">
                    Classificação geral
                  </span>
                </div>

                <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl overflow-hidden">
                  {/* Header da tabela — desktop */}
                  <div className="hidden sm:grid grid-cols-[56px_1fr_100px_100px_100px] gap-0 px-6 py-3 border-b border-white/[0.06]">
                    <div className="text-[10px] text-neutral-600 uppercase tracking-widest font-bold">#</div>
                    <div className="text-[10px] text-neutral-600 uppercase tracking-widest font-bold">Atleta</div>
                    <div className="text-[10px] text-neutral-600 uppercase tracking-widest font-bold text-center">Favoritos</div>
                    <div className="text-[10px] text-neutral-600 uppercase tracking-widest font-bold text-center">Interesses</div>
                    <div className="text-[10px] text-neutral-600 uppercase tracking-widest font-bold text-right">Pontos</div>
                  </div>

                  {/* Rows */}
                  {remaining.map((athlete, i) => (
                    <RankRow key={athlete.id} rank={i + 4} athlete={athlete} />
                  ))}

                  {remaining.length === 0 && (
                    <div className="py-16 text-center text-neutral-600 text-sm">
                      Nenhum atleta no ranking ainda.
                    </div>
                  )}
                </div>
              </div>

              {/* ── COMO FUNCIONA ── */}
              <div className="mt-12 sm:mt-20 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                {[
                  { icon: <Star size={18} className="text-amber-400" />, title: 'Favorito', pts: '+10 pts', desc: 'Quando um clube salva o atleta nos favoritos' },
                  { icon: <TrendingUp size={18} className="text-green-400" />, title: 'Interesse', pts: '+25 pts', desc: 'Quando um clube manifesta interesse oficial' },
                  { icon: <Trophy size={18} className="text-blue-400" />, title: 'Contato', pts: '+50 pts', desc: 'Quando o interesse é aceito e o contato é liberado' },
                ].map(item => (
                  <div key={item.title} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 sm:p-5 flex sm:flex-col items-center sm:items-start gap-4 sm:gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-0.5 sm:mb-1">
                        <span className="text-sm font-semibold text-white">{item.title}</span>
                        <span className="text-[10px] font-bold text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded-full">{item.pts}</span>
                      </div>
                      <p className="text-[10px] sm:text-xs text-neutral-500 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}

// ── PODIUM CARD (Desktop) ──────────────────────────────────────────────────

function PodiumCard({ place, athlete, height, isFirst }: {
  place: number
  athlete: any
  height: string
  isFirst?: boolean
}) {
  const initials = athlete.nome.split(' ').map((p: string) => p[0]).slice(0, 2).join('').toUpperCase()

  const config = {
    1: {
      border: 'border-amber-500/40',
      glow: 'shadow-[0_0_60px_-10px_rgba(245,158,11,0.25)]',
      badge: 'bg-amber-500 text-white',
      score: 'text-amber-400',
      crown: true,
    },
    2: {
      border: 'border-neutral-500/30',
      glow: 'shadow-[0_0_40px_-10px_rgba(115,115,115,0.2)]',
      badge: 'bg-neutral-500 text-white',
      score: 'text-neutral-300',
      crown: false,
    },
    3: {
      border: 'border-orange-700/30',
      glow: 'shadow-[0_0_40px_-10px_rgba(194,65,12,0.2)]',
      badge: 'bg-orange-700 text-white',
      score: 'text-orange-400',
      crown: false,
    },
  }[place] ?? { border: 'border-white/10', glow: '', badge: 'bg-neutral-700 text-white', score: 'text-white', crown: false }

  return (
    <Link href={`/perfil/${athlete.id}`} className="block group">
      <div className={cn(
        'relative flex flex-col justify-between rounded-2xl border p-6 transition-all duration-300 group-hover:scale-[1.02]',
        height,
        'bg-gradient-to-b from-white/[0.06] to-white/[0.02]',
        config.border,
        config.glow
      )}>
        {/* Badge posição */}
        <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center font-display text-xl self-start', config.badge)}>
          {place}°
        </div>

        {/* Crown para o 1° */}
        {config.crown && (
          <div className="absolute -top-5 left-1/2 -translate-x-1/2 text-amber-400">
            <Crown size={32} fill="currentColor" className="drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]" />
          </div>
        )}

        {/* Avatar */}
        <div className="flex flex-col items-center gap-3">
          <div className={cn(
            'w-16 h-16 rounded-2xl overflow-hidden bg-white/10 flex items-center justify-center font-display text-2xl text-white border',
            config.border
          )}>
            {athlete.foto_url
              ? <img src={athlete.foto_url} className="w-full h-full object-cover" alt={athlete.nome} />
              : initials
            }
          </div>
          {athlete.destaque_ativo && (
            <span className="text-[9px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
              <Flame size={8} /> Destaque
            </span>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="font-display text-xl text-white leading-tight mb-0.5 truncate">{athlete.nome.toUpperCase()}</div>
          <div className="text-xs text-neutral-500 mb-4">{athlete.posicao} · {athlete.cidade}, {athlete.estado}</div>
          <div className={cn('font-display text-4xl leading-none', config.score)}>
            {athlete.ranking_score}
            <span className="text-xs font-sans font-medium text-neutral-600 ml-1">pts</span>
          </div>
          <div className="flex gap-3 mt-3 text-xs text-neutral-600">
            <span>⭐ {athlete.favoritos_count} favs</span>
            <span>💬 {athlete.interesses_count} int.</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

// ── PODIUM CARD (Mobile) ──────────────────────────────────────────────────

function MobilePodiumCard({ place, athlete }: { place: number; athlete: any }) {
  const initials = athlete.nome.split(' ').map((p: string) => p[0]).slice(0, 2).join('').toUpperCase()
  const medals = ['🥇', '🥈', '🥉']
  const borders = ['border-amber-500/40', 'border-neutral-500/30', 'border-orange-700/30']
  const scores = ['text-amber-400', 'text-neutral-300', 'text-orange-400']

  return (
    <Link href={`/perfil/${athlete.id}`} className="flex-shrink-0 w-44">
      <div className={cn(
        'rounded-2xl border p-4 h-52 flex flex-col justify-between bg-gradient-to-b from-white/[0.06] to-white/[0.02]',
        borders[place - 1]
      )}>
        <div className="flex items-center justify-between">
          <span className="text-xl">{medals[place - 1]}</span>
          {athlete.destaque_ativo && (
            <span className="text-[8px] text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded-full font-bold">🔥</span>
          )}
        </div>

        <div className="w-12 h-12 rounded-xl overflow-hidden bg-white/10 flex items-center justify-center font-display text-xl text-white mx-auto">
          {athlete.foto_url
            ? <img src={athlete.foto_url} className="w-full h-full object-cover" alt={athlete.nome} />
            : initials
          }
        </div>

        <div>
          <div className="font-display text-base text-white leading-tight truncate">{athlete.nome.toUpperCase()}</div>
          <div className="text-[10px] text-neutral-500 mb-2 truncate">{athlete.posicao} · {athlete.estado}</div>
          <div className={cn('font-display text-3xl leading-none', scores[place - 1])}>
            {athlete.ranking_score}
            <span className="text-[10px] font-sans text-neutral-600 ml-0.5">pts</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

// ── RANK ROW ──────────────────────────────────────────────────────────────

function RankRow({ rank, athlete }: { rank: number; athlete: any }) {
  const initials = athlete.nome.split(' ').map((p: string) => p[0]).slice(0, 2).join('').toUpperCase()

  // Simulação de variação (em produção viria do banco)
  const variation = rank % 3 === 0 ? 'down' : rank % 5 === 0 ? 'same' : 'up'

  return (
    <Link
      href={`/perfil/${athlete.id}`}
      className="group flex items-center gap-3 sm:gap-0 sm:grid sm:grid-cols-[56px_1fr_100px_100px_100px] px-4 sm:px-6 py-3.5 sm:py-4 border-b border-white/[0.04] last:border-none hover:bg-white/[0.03] transition-colors"
    >
      {/* Rank */}
      <div className="flex items-center gap-1.5 sm:gap-2 w-10 sm:w-auto flex-shrink-0">
        <span className="font-display text-lg sm:text-xl text-neutral-600 group-hover:text-green-400 transition-colors leading-none w-7 text-center">
          {rank}
        </span>
        <span className="hidden sm:block">
          {variation === 'up' && <ChevronUp size={12} className="text-green-500" />}
          {variation === 'down' && <ChevronDown size={12} className="text-red-500" />}
          {variation === 'same' && <Minus size={12} className="text-neutral-600" />}
        </span>
      </div>

      {/* Atleta */}
      <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden bg-white/5 border border-white/[0.08] flex items-center justify-center font-bold text-xs text-neutral-500 flex-shrink-0 group-hover:border-green-500/30 transition-colors">
          {athlete.foto_url
            ? <img src={athlete.foto_url} className="w-full h-full object-cover" alt={athlete.nome} />
            : initials
          }
        </div>
        <div className="min-w-0">
          <div className="text-xs sm:text-sm font-semibold text-white truncate group-hover:text-green-400 transition-colors">
            {athlete.nome}
          </div>
          <div className="text-[10px] text-neutral-500 uppercase tracking-tight font-medium truncate">
            {athlete.posicao} · {athlete.cidade}/{athlete.estado}
          </div>
        </div>
        {athlete.destaque_ativo && (
          <span className="hidden sm:flex items-center gap-1 text-[9px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-1.5 py-0.5 rounded-full flex-shrink-0">
            <Flame size={8} /> Destaque
          </span>
        )}
      </div>

      {/* Favoritos */}
      <div className="hidden sm:block text-center text-sm font-medium text-neutral-400">
        {athlete.favoritos_count}
      </div>

      {/* Interesses */}
      <div className="hidden sm:block text-center text-sm font-medium text-neutral-400">
        {athlete.interesses_count}
      </div>

      {/* Pontos */}
      <div className="flex-shrink-0 text-right">
        <span className="font-display text-xl sm:text-2xl text-white group-hover:text-green-400 transition-colors">
          {athlete.ranking_score}
        </span>
        <span className="text-[9px] text-neutral-600 ml-0.5 hidden sm:inline uppercase tracking-widest">pts</span>
      </div>
    </Link>
  )
}
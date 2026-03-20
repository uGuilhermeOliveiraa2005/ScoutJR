'use client'

import { useEffect, useState } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase'
import { NavbarDashboard } from '@/components/layout/Navbar'
import { NavbarPublic } from '@/components/layout/Navbar'
import { Trophy, Medal, Star, TrendingUp, Users, Search, ArrowRight, ShieldCheck, Crown } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

export default function RankingPage() {
  const [atletas, setAtletas] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createSupabaseBrowser()

  useEffect(() => {
    async function init() {
      const { data: { user: u } } = await supabase.auth.getUser()
      setUser(u)

      if (u) {
        const { data: p } = await supabase.from('profiles').select('*').eq('user_id', u.id).single()
        setProfile(p)
      }

      const { data } = await supabase
        .from('atletas')
        .select('id, nome, posicao, estado, cidade, ranking_score, favoritos_count, interesses_count, destaque_ativo')
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
    <div className="min-h-screen bg-neutral-900 flex flex-col text-white pb-20">
      {user && profile ? (
        <NavbarDashboard userName={profile.nome} userRole={profile.role} />
      ) : (
        <NavbarPublic />
      )}

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-6 pt-12 md:pt-20 pb-8 md:pb-12 text-center">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-900/15 via-transparent to-transparent -z-10" />
        
        <div className="inline-flex items-center justify-center w-14 h-14 md:w-20 md:h-20 rounded-2xl md:rounded-3xl bg-green-500/10 text-green-500 mb-8 md:mb-10 shadow-sm border border-green-500/20 animate-pulse">
          <Trophy className="w-7 h-7 md:w-10 md:h-10" />
        </div>
        
        <h1 className="font-display text-5xl md:text-8xl text-white tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
          RANKING SCOUT<span className="text-green-500">JR</span>
        </h1>
        
        <p className="text-neutral-500 max-w-xl mx-auto text-sm md:text-xl px-6 leading-relaxed mb-16 md:mb-24">
          Os atletas mais promissores e observados do Brasil, ranqueados pela elite do futebol profissional.
        </p>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
             <div className="w-12 h-12 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin" />
             <p className="text-neutral-500 font-medium">Processando métricas...</p>
          </div>
        ) : (
          <>
            {/* Pedestal Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 items-end gap-6 mb-24 max-w-5xl mx-auto relative px-4">
              {/* 2nd Place */}
              {top3[1] && <TopAtletaCard place={2} athlete={top3[1]} delay="delay-150" color="silver" />}
              
              {/* 1st Place */}
              {top3[0] && <TopAtletaCard place={1} athlete={top3[0]} delay="delay-0" color="gold" isMain />}
              
              {/* 3rd Place */}
              {top3[2] && <TopAtletaCard place={3} athlete={top3[2]} delay="delay-300" color="bronze" />}
            </div>

            {/* Leaderboard Table */}
            <div className="bg-neutral-800/40 border border-white/5 rounded-3xl md:rounded-[2.5rem] overflow-hidden backdrop-blur-md self-stretch shadow-2xl">
              <div className="bg-white/[0.03] border-b border-white/5 px-6 md:px-10 py-5 flex items-center justify-between">
                <div className="flex items-center gap-3 text-neutral-400 uppercase text-[9px] md:text-[10px] font-bold tracking-[0.2em]">
                    <TrendingUp size={14} className="text-green-500" /> Performance Geral
                </div>
                <div className="hidden lg:flex items-center gap-12 font-bold uppercase tracking-widest text-neutral-500 text-[10px]">
                  <span className="w-16 text-center">Favs</span>
                  <span className="w-16 text-center">Interesse</span>
                  <span className="w-24 text-right">Pts</span>
                </div>
              </div>

              <div className="divide-y divide-white/[0.03]">
                {remaining.map((a, i) => (
                  <RankRow key={a.id} rank={i + 4} athlete={a} />
                ))}
              </div>
            </div>
            
            <div className="mt-16 text-center bg-gradient-to-br from-green-900/10 to-transparent border border-white/5 rounded-3xl p-12 max-w-3xl mx-auto">
               <div className="w-12 h-12 rounded-xl bg-green-500/20 text-green-400 flex items-center justify-center mx-auto mb-6">
                 <ShieldCheck size={24} />
               </div>
               <h3 className="font-display text-2xl mb-4 text-white">Como funciona o Ranking?</h3>
               <p className="text-neutral-400 leading-relaxed mb-8 text-sm">
                 Nossa tecnologia audita todas as interações e calcula o peso de cada ação. Cada vez que um clube favorita um atleta, ele ganha <span className="text-green-400 font-bold px-1.5 py-0.5 rounded bg-green-500/10">10 pontos</span>. Quando um clube manifesta interesse oficial, são <span className="text-green-400 font-bold px-1.5 py-0.5 rounded bg-green-500/10">25 pontos</span>. Mais pontos elevam sua posição e visibilidade nacional.
               </p>
               <Link href="/dashboard"><Button variant="dark" className="bg-green-600 hover:bg-green-700 text-white border-none px-8">Ver minha pontuação</Button></Link>
            </div>
          </>
        )}
      </main>
    </div>
  )
}

function TopAtletaCard({ place, athlete, color, isMain, delay }: any) {
  const initials = athlete.nome.split(' ').map((p: any) => p[0]).slice(0, 2).join('').toUpperCase()
  
  const colors = {
    gold: { 
        bg: 'from-amber-500/20 to-amber-500/5', 
        border: 'border-amber-500/30', 
        icon: 'text-amber-500', 
        badge: 'bg-amber-500', 
        shadow: 'shadow-amber-500/20',
        glow: 'after:bg-amber-500/15'
    },
    silver: { 
        bg: 'from-neutral-400/20 to-neutral-400/5', 
        border: 'border-neutral-400/30', 
        icon: 'text-neutral-300', 
        badge: 'bg-neutral-500',
        shadow: 'shadow-neutral-500/15',
        glow: 'after:bg-neutral-400/10'
    },
    bronze: { 
        bg: 'from-orange-800/30 to-orange-800/10', 
        border: 'border-orange-800/40', 
        icon: 'text-orange-500', 
        badge: 'bg-orange-800',
        shadow: 'shadow-orange-800/15',
        glow: 'after:bg-orange-800/10'
    }
  }[color as 'gold' | 'silver' | 'bronze']

  return (
    <div className={cn(
      "relative group animate-in slide-in-from-bottom-12 duration-1000 fill-mode-both p-1 rounded-[2.5rem]",
      delay,
      isMain ? 'md:order-2 order-1 transform md:-translate-y-8 h-[360px] md:h-[420px]' : (place === 2 ? 'md:order-1 order-2 h-[300px] md:h-[360px]' : 'md:order-3 order-3 h-[280px] md:h-[320px]')
    )}>
      <div className={cn(
        "h-full w-full rounded-[2.2rem] bg-gradient-to-b border flex flex-col items-center justify-between p-6 md:p-8 relative transition-all duration-500 group-hover:scale-[1.03] group-hover:shadow-[0_0_50px_-15px_rgba(255,255,255,0.15)]",
        colors.bg,
        colors.border,
        colors.shadow
      )}>
        {/* Glow effect - moved inside another relative to keep overflow-hidden if needed, or just let it blur */}
        <div className={cn("absolute inset-x-0 -bottom-24 h-48 blur-[80px] -z-10 opacity-50", colors.glow)} />

        <div className="relative">
            <div className={cn("w-20 h-20 md:w-28 md:h-28 rounded-3xl border-2 rotate-3 flex items-center justify-center font-display text-3xl md:text-4xl bg-neutral-900 overflow-hidden transition-transform group-hover:rotate-0 duration-500", colors.border)}>
               {athlete.foto_url ? <img src={athlete.foto_url} className="w-full h-full object-cover -rotate-3 group-hover:rotate-0 transition-transform duration-500" /> : initials}
            </div>
            {isMain && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-amber-500 -rotate-12 drop-shadow-[0_0_15px_rgba(245,158,11,0.6)] z-20 animate-pulse">
                    <Crown size={42} fill="currentColor" />
                </div>
            )}
            <div className={cn("absolute -top-3 -right-3 w-9 h-9 md:w-11 md:h-11 rounded-2xl flex items-center justify-center text-white font-bold text-lg md:text-xl shadow-2xl", colors.badge)}>
               {place}°
            </div>
        </div>
            {athlete.destaque_ativo && (
                <div className="absolute -top-2 -left-8 bg-amber-400 text-black font-bold text-[8px] uppercase tracking-tighter px-2 py-1 rounded-full -rotate-12 border-2 border-neutral-900">
                    DESTAQUE
                </div>
            )}

        <div className="text-center w-full z-10">
          <h3 className="font-display text-lg md:text-xl text-white mb-1 truncate px-2">{athlete.nome.toUpperCase()}</h3>
          <p className="text-[10px] text-neutral-400 uppercase tracking-[0.2em] font-medium">{athlete.posicao} • {athlete.estado}</p>
        </div>

        <div className="flex flex-col items-center gap-1 z-10">
          <div className={cn("text-3xl md:text-4xl font-display", colors.icon)}>{athlete.ranking_score}</div>
          <p className="text-[8px] font-bold text-neutral-500 uppercase tracking-widest">Pontos Pro</p>
        </div>
        
      </div>
    </div>
  )
}

function RankRow({ rank, athlete }: any) {
  const initials = athlete.nome.split(' ').map((p: any) => p[0]).slice(0, 2).join('').toUpperCase()
  
  return (
    <div className="flex items-center px-5 md:px-10 py-5 md:py-6 hover:bg-white/[0.02] transition-colors group relative overflow-hidden">
      <div className="w-8 md:w-12 font-display text-lg md:text-xl text-neutral-600 group-hover:text-green-500 transition-colors">#{rank}</div>
      
      <div className="flex items-center gap-4 md:gap-5 flex-1 ml-2 md:ml-4">
        <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-[10px] md:text-xs font-bold text-neutral-500 overflow-hidden group-hover:border-green-500/30 transition-colors">
           {athlete.foto_url ? <img src={athlete.foto_url} className="w-full h-full object-cover" /> : initials}
        </div>
        <div className="min-w-0">
          <h4 className="font-medium text-sm md:text-base text-white group-hover:text-green-400 transition-colors truncate">{athlete.nome}</h4>
          <p className="text-[9px] md:text-[10px] text-neutral-500 uppercase font-medium tracking-tight mt-0.5">{athlete.posicao} • {athlete.cidade}/{athlete.estado}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-12 ml-4">
        <div className="hidden sm:block w-12 md:w-16 text-center text-xs md:text-sm font-medium text-neutral-400">{athlete.favoritos_count}</div>
        <div className="hidden sm:block w-12 md:w-16 text-center text-xs md:text-sm font-medium text-neutral-400">{athlete.interesses_count}</div>
        <div className="w-20 md:w-24 text-right">
           <span className="text-white font-bold text-base md:text-lg">{athlete.ranking_score}</span>
           <span className="text-[7px] md:text-[8px] text-neutral-600 uppercase tracking-widest ml-1 font-bold">Pts</span>
        </div>
        <div className="hidden md:flex w-8 justify-end">
           <ArrowRight size={16} className="text-neutral-700 opacity-0 group-hover:opacity-100 group-hover:text-green-500 transition-all -translate-x-4 group-hover:translate-x-0" />
        </div>
      </div>
    </div>
  )
}

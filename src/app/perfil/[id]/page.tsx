import { createSupabaseServer } from '@/lib/supabase-server'
import { notFound, redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { NavbarPublic } from '@/components/layout/Navbar'
import { NavbarDashboard } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Navbar'
import { Badge, SkillBar } from '@/components/ui/index'
import { Avatar } from '@/components/ui/Avatar'
import { POSICAO_LABEL, ESTADO_LABEL, calcularIdade, cn } from '@/lib/utils'
import { MapPin, Landmark, Star, Send, Trophy, Target, Award, Play, BarChart2, ArrowLeft, Edit2, Scale, Ruler, Activity, Zap, Footprints, CircleDot } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { AthleteActions } from '@/components/atletas/AthleteActions'
import { MediaGallery } from '@/components/atletas/MediaGallery'

export default async function PerfilAtletaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: atleta } = await supabase
    .from('atletas')
    .select(`*, atleta_stats(*), atleta_videos(*), atleta_conquistas(*)`)
    .eq('id', id)
    .eq('visivel', true)
    .single()

  if (!atleta) notFound()

  // REGISTRAR VISITA (Robusta) — sem bloquear o render principal
  try {
    const heads = await headers()
    const ip = heads.get('x-forwarded-for')?.split(',')[0] || heads.get('x-real-ip') || '127.0.0.1'

    supabase.rpc('fn_registrar_visita', {
      p_page_path: `/perfil/${id}`,
      p_ip_address: ip,
      p_user_id: user?.id || null
    }).then(() => { })
  } catch (err) {
    console.error('Erro ao registrar visita:', err)
  }

  let profile = null
  let isEscolinha = false
  let escolinhaId = null
  let escolinha_data: any = null
  let initialIsFavorite = false
  let initialHasInterest = false

  if (user) {
    const { data: p } = await supabase.from('profiles').select('*').eq('user_id', user.id).single()
    profile = p

    // Strict Lockout for unverified users
    if (profile && profile.status !== 'ativo' && !profile.is_admin) {
      redirect('/aguardando-verificacao')
    }

    isEscolinha = p?.role === 'escolinha'

    if (isEscolinha) {
      const { data: c } = await supabase.from('escolinhas').select('id, foto_url').eq('user_id', user.id).single()
      if (c) {
        escolinhaId = c.id
        escolinha_data = c
        const { data: fav } = await supabase.from('favoritos').select('id').eq('atleta_id', id).eq('escolinha_id', c.id).single()
        initialIsFavorite = !!fav
        const { data: int } = await supabase.from('interesses').select('id').eq('atleta_id', id).eq('escolinha_id', c.id).single()
        initialHasInterest = !!int
      }
    }
  }

  const isOwner = user && profile && atleta.responsavel_id === profile.id

  const userFotoUrl = isEscolinha
    ? (escolinha_data?.foto_url ?? profile?.foto_url ?? null)
    : (profile?.foto_url ?? null)

  const idade = calcularIdade(atleta.data_nascimento)
  const statsAtual = atleta.atleta_stats?.sort((a: any, b: any) => b.temporada - a.temporada)[0]

  // Calcula o rank do atleta para possíveis medalhas
  const { data: topAtletas } = await supabase
    .from('atletas')
    .select('id')
    .eq('status', 'ativo')
    .gt('ranking_score', 0)
    .order('ranking_score', { ascending: false })
    .order('favoritos_count', { ascending: false })
    .limit(3)

  const rankIndex = topAtletas?.findIndex((a: any) => a.id === atleta.id) ?? -1
  const rankNumber = rankIndex !== -1 ? rankIndex + 1 : null

  const habilidades = [
    { label: 'Técnica', value: atleta.habilidade_tecnica, color: 'green' as const },
    { label: 'Velocidade', value: atleta.habilidade_velocidade, color: 'amber' as const },
    { label: 'Visão', value: atleta.habilidade_visao, color: 'green' as const },
    { label: 'Físico', value: atleta.habilidade_fisico, color: 'amber' as const },
    { label: 'Finalização', value: atleta.habilidade_finalizacao, color: 'green' as const },
    { label: 'Passes', value: atleta.habilidade_passes, color: 'green' as const },
  ]

  // IMC calculation
  const imc = atleta.altura_cm && atleta.peso_kg
    ? (atleta.peso_kg / ((atleta.altura_cm / 100) ** 2))
    : null
  const imcFormatted = imc ? imc.toFixed(1) : null
  const imcStatus = imc
    ? imc < 18.5 ? { label: 'Abaixo', color: 'text-blue-600 bg-blue-50 border-blue-200' }
      : imc < 25 ? { label: 'Normal', color: 'text-green-600 bg-green-50 border-green-200' }
        : imc < 30 ? { label: 'Acima', color: 'text-amber-600 bg-amber-50 border-amber-200' }
          : { label: 'Elevado', color: 'text-red-600 bg-red-50 border-red-200' }
    : null

  const peLabel = atleta.pe_dominante === 'destro' ? 'Destro' : atleta.pe_dominante === 'canhoto' ? 'Canhoto' : 'Ambidestro'

  const Navbar = user && profile
    ? <NavbarDashboard
      userName={profile.nome}
      userRole={profile.role}
      userId={user.id}
      userFotoUrl={userFotoUrl}
      isAdmin={profile.is_admin}
    />
    : <NavbarPublic />

  return (
    <>
      {Navbar}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 pb-32 lg:pb-8">

        <Link href="/busca" className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-neutral-400 hover:text-neutral-700 mb-4 transition-colors group">
          <ArrowLeft size={13} className="group-hover:-translate-x-1 transition-transform" /> Voltar para busca
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">

          {/* COLUNA 1: Perfil & Ações */}
          <aside className="flex flex-col gap-5 lg:self-start">

            {/* Card Principal de Perfil */}
            <div className="bg-white border border-neutral-200 rounded-3xl overflow-hidden shadow-sm animate-slide-up card-hover-lift">
              <div className="bg-gradient-to-br from-green-50 via-green-50/50 to-white px-6 py-8 flex items-center gap-6 relative overflow-hidden border-b border-green-100/50">
                <div className="relative">
                  <Avatar
                    src={atleta.foto_url}
                    nome={atleta.nome}
                    size="xl"
                    colorClass="bg-green-500 text-white"
                    className="z-10 border-4 border-white shadow-xl flex-shrink-0 scale-110 animate-pulse-glow"
                  />
                  {rankNumber === 1 && (
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 -rotate-[15deg] animate-float z-30 pointer-events-none drop-shadow-2xl">
                      <span className="text-[40px] block filter drop-shadow-[0_4px_10px_rgba(251,191,36,0.6)]" title="1º Lugar no Ranking Geral">👑</span>
                    </div>
                  )}
                  {rankNumber === 2 && (
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 -rotate-[15deg] animate-float z-30 pointer-events-none drop-shadow-2xl">
                      <span className="text-[40px] block filter drop-shadow-[0_4px_10px_rgba(156,163,175,0.6)]" title="2º Lugar no Ranking Geral">🥈</span>
                    </div>
                  )}
                  {rankNumber === 3 && (
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 -rotate-[15deg] animate-float z-30 pointer-events-none drop-shadow-2xl">
                      <span className="text-[40px] block filter drop-shadow-[0_4px_10px_rgba(180,83,9,0.6)]" title="3º Lugar no Ranking Geral">🥉</span>
                    </div>
                  )}
                </div>
                <div className="font-display text-8xl text-green-500/10 absolute right-4 -bottom-6 leading-none select-none pointer-events-none italic font-black">
                  {atleta.posicao}
                </div>
                <div className="flex-1 z-10 min-w-0">
                  <h1 className="font-display text-3xl text-neutral-900 leading-tight mb-1 tracking-tight pr-2 flex items-center gap-2 flex-wrap">
                    {atleta.nome}
                  </h1>
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <p className="text-[11px] text-neutral-500 font-black uppercase tracking-[0.2em] truncate">{POSICAO_LABEL[atleta.posicao]}</p>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-2 mb-4 items-center">
                  {rankNumber && rankNumber <= 3 && (
                    <Badge className={cn("px-3 py-[5px] text-[10px] sm:text-xs font-black uppercase tracking-widest text-white border-none shadow-md animate-pulse-glow flex items-center gap-1.5", 
                      rankNumber === 1 ? "bg-gradient-to-r from-amber-400 to-amber-600 shadow-amber-500/30" :
                      rankNumber === 2 ? "bg-gradient-to-r from-neutral-400 to-neutral-500 shadow-neutral-500/30" :
                      "bg-gradient-to-r from-orange-400 to-amber-700 shadow-orange-500/30"
                    )}>
                      <Trophy size={13} className="text-white/90" />
                      TOP {rankNumber} RANKING
                    </Badge>
                  )}
                  <Badge variant="outline" className="bg-neutral-50 px-3 py-1.5 text-xs font-semibold">{idade} anos</Badge>
                  {atleta.exibir_cidade && <Badge variant="outline" className="bg-neutral-50 px-3 py-1.5 text-xs font-semibold">{atleta.cidade}, {atleta.estado}</Badge>}
                </div>

                {/* Pé Dominante — Destaque Visual Separado */}
                <div className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-neutral-900 to-neutral-800 text-white relative overflow-hidden group transition-all hover:shadow-lg">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10 flex-shrink-0">
                      <Footprints size={22} className="text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-0.5">Pé Dominante</div>
                      <div className="text-lg font-black tracking-tight">{peLabel}</div>
                    </div>
                    <div className="flex gap-1.5">
                      {['E', 'D'].map(pe => (
                        <div
                          key={pe}
                          className={cn(
                            "w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black transition-all",
                            (pe === 'E' && atleta.pe_dominante === 'canhoto') || (pe === 'D' && atleta.pe_dominante === 'destro') || atleta.pe_dominante === 'ambidestro'
                              ? "bg-green-500 text-white shadow-lg shadow-green-500/30"
                              : "bg-white/5 text-neutral-500 border border-white/10"
                          )}
                        >
                          {pe}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {atleta.escolinha_atual && (
                  <div className="flex items-center gap-2 text-sm text-neutral-600 mb-5 bg-neutral-50 p-3 rounded-xl border border-neutral-100 font-bold uppercase tracking-tight">
                    <Landmark size={14} className="text-neutral-400" />
                    {atleta.escolinha_atual}
                  </div>
                )}

                {isEscolinha ? (
                  <div className="fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur-md border-t border-neutral-200 p-4 z-50 lg:relative lg:bottom-auto lg:inset-auto lg:bg-transparent lg:border-t-0 lg:p-0 lg:z-auto">
                    <div className="max-w-6xl mx-auto lg:max-w-none">
                      <AthleteActions
                        atletaId={atleta.id}
                        escolinhaId={escolinhaId}
                        initialIsFavorite={initialIsFavorite}
                        initialHasInterest={initialHasInterest}
                        aceitarMensagens={atleta.aceitar_mensagens}
                      />
                    </div>
                  </div>
                ) : !user ? (
                  <Link href="/login" className="block mt-4">
                    <Button variant="dark" className="w-full justify-center py-4 font-bold tracking-widest uppercase">ENTRAR PARA CONTATAR</Button>
                  </Link>
                ) : isOwner ? (
                  <Link href={`/perfil/${atleta.id}/editar`} className="block mt-4">
                    <Button variant="outline" className="w-full justify-center py-4 font-bold tracking-widest uppercase gap-2 border-green-200 text-green-700 bg-green-50/50 hover:bg-green-100 transition-all shadow-sm">
                      <Edit2 size={16} /> EDITAR MEU PERFIL
                    </Button>
                  </Link>
                ) : profile?.role === 'responsavel' ? (
                  <div className="bg-neutral-50 border border-neutral-100 rounded-2xl p-4 mt-4 text-center">
                    <p className="text-[10px] text-neutral-500 font-bold tracking-widest uppercase">
                      ACESSO RESTRITO A ESCOLINHAS 🛡️
                    </p>
                  </div>
                ) : null}
              </div>
            </div>

            {/* Stats Rápidas (Desktop Sidebar) */}
            {statsAtual && (
              <div className="hidden lg:block bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm animate-slide-up stagger-2 card-hover-lift">
                <div className="flex items-center gap-2 mb-5">
                  <BarChart2 size={16} className="text-green-600" />
                  <span className="text-xs font-bold uppercase tracking-widest text-neutral-500">Temporada {statsAtual.temporada}</span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    ['Jogos', statsAtual.jogos],
                    ['Gols', statsAtual.gols],
                    ['Assists', statsAtual.assistencias],
                    ['Nota média', statsAtual.nota_media],
                  ].map(([label, value], i) => (
                    <div key={label as string} className={`bg-neutral-50 rounded-2xl p-4 text-center border border-neutral-100 animate-scale-in stagger-${i + 1}`}>
                      <div className="font-display text-2xl text-green-700 leading-none">{value as number}</div>
                      <div className="text-[10px] text-neutral-400 mt-2 font-bold uppercase tracking-tighter">{label as string}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* COLUNA 2: Conteúdo Principal */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Foto de Capa */}
            {atleta.capa_url ? (
              <div className="relative aspect-video rounded-3xl overflow-hidden shadow-lg border border-neutral-200 bg-neutral-100 group animate-slide-up">
                <img src={atleta.capa_url} alt={`Capa de ${atleta.nome}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
              </div>
            ) : atleta.foto_url ? (
              <div className="relative aspect-video rounded-3xl overflow-hidden shadow-lg border border-neutral-200 bg-neutral-100 group animate-slide-up">
                <img src={atleta.foto_url} alt={`Capa de ${atleta.nome}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
              </div>
            ) : (
              <div className="aspect-video rounded-3xl border-2 border-dashed border-neutral-200 flex items-center justify-center bg-neutral-50 font-display text-neutral-300 animate-slide-up">
                SCJR
              </div>
            )}

            {/* Stats Mobile */}
            {statsAtual && (
              <div className="lg:hidden grid grid-cols-4 gap-2 bg-white border border-neutral-200 rounded-2xl p-4 animate-slide-up stagger-1">
                {[
                  ['Jogos', statsAtual.jogos],
                  ['Gols', statsAtual.gols],
                  ['Assist', statsAtual.assistencias],
                  ['Nota', statsAtual.nota_media],
                ].map(([label, value]) => (
                  <div key={label as string} className="text-center">
                    <div className="font-display text-2xl text-green-700 leading-none">{value as number}</div>
                    <div className="text-[9px] text-neutral-400 mt-0.5 uppercase font-bold tracking-tighter">{label as string}</div>
                  </div>
                ))}
              </div>
            )}

            {atleta.descricao && (
              <Section title="Sobre o atleta" delay="stagger-2">
                <p className="text-sm text-neutral-600 leading-relaxed text-justify">{atleta.descricao}</p>
              </Section>
            )}

            <Section title="Habilidades" delay="stagger-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-4">
                {habilidades.map(h => (
                  <SkillBar key={h.label} label={h.label} value={h.value} color={h.color} />
                ))}
              </div>
            </Section>

            {/* ── Avaliação Biométrica (APENAS Altura, Peso, IMC) ── */}
            {(atleta.altura_cm || atleta.peso_kg) && (
              <Section title="Avaliação Biométrica" icon={<Activity size={16} className="text-green-600" />} delay="stagger-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {atleta.altura_cm && (
                    <BiometricCard
                      icon={<Ruler size={22} />}
                      label="Altura"
                      value={`${atleta.altura_cm}`}
                      unit="cm"
                      color="green"
                      delay="stagger-1"
                    />
                  )}
                  {atleta.peso_kg && (
                    <BiometricCard
                      icon={<Scale size={22} />}
                      label="Peso"
                      value={`${atleta.peso_kg}`}
                      unit="kg"
                      color="amber"
                      delay="stagger-2"
                    />
                  )}
                  {imcFormatted && imcStatus && (
                    <div className="animate-slide-up stagger-3">
                      <div className="p-5 rounded-2xl border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-white flex flex-col gap-3 transition-all hover:scale-[1.02] hover:shadow-md">
                        <div className="flex items-center justify-between">
                          <div className="p-2 rounded-xl bg-white shadow-sm">
                            <Zap size={22} className="text-blue-600" />
                          </div>
                          <span className={cn("text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border", imcStatus.color)}>
                            {imcStatus.label}
                          </span>
                        </div>
                        <div>
                          <div className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-1">IMC Corporal</div>
                          <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black font-display tracking-tight leading-none text-blue-600">{imcFormatted}</span>
                            <span className="text-xs font-bold font-sans text-blue-400 uppercase tracking-tighter">Index</span>
                          </div>
                        </div>
                        {/* Mini progress bar */}
                        <div className="w-full h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-1000 animate-grow-width"
                            style={{
                              '--target-width': `${Math.min((imc! / 35) * 100, 100)}%`,
                              background: imc! < 18.5 ? '#3b82f6' : imc! < 25 ? '#16a34a' : imc! < 30 ? '#d97706' : '#dc2626'
                            } as any}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Status Técnico Bar */}
                <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-neutral-900 to-neutral-800 text-white flex items-center justify-between shadow-xl relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-amber-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
                      <Star size={20} className="text-amber-400" fill="currentColor" />
                    </div>
                    <div>
                      <div className="text-[10px] font-black uppercase tracking-widest text-neutral-400">Status Técnico</div>
                      <div className="text-sm font-bold">Atleta em Alta Performance</div>
                    </div>
                  </div>
                  <div className="text-right relative z-10">
                    <div className="text-[10px] font-black uppercase tracking-widest text-neutral-400 font-sans">Nível Local</div>
                    <div className="text-sm font-bold text-green-400">NÍVEL A</div>
                  </div>
                </div>
              </Section>
            )}

            <Section title="Galeria & Vídeos" delay="stagger-5">
              <MediaGallery
                photos={atleta.fotos_adicionais || []}
                videos={atleta.atleta_videos || []}
              />
            </Section>

            {atleta.atleta_conquistas && atleta.atleta_conquistas.length > 0 && (
              <Section title="Conquistas & Hall da Fama" delay="stagger-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {atleta.atleta_conquistas.map((c: any, i: number) => (
                    <div key={c.id} className={`group bg-amber-50/50 border border-amber-100 rounded-3xl p-5 flex gap-5 transition-all hover:shadow-xl hover:bg-white active:scale-[0.98] animate-slide-up stagger-${i + 1}`}>
                      <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0 group-hover:rotate-12 transition-transform shadow-inner">
                        <Trophy size={28} fill="currentColor" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-sm font-black text-neutral-900 leading-tight uppercase tracking-tighter">{c.titulo}</h3>
                          <span className="text-[10px] font-black text-white bg-amber-600 px-2 py-0.5 rounded-full shadow-sm">{c.ano}</span>
                        </div>
                        {c.descricao && (
                          <p className="text-xs text-neutral-500 leading-relaxed line-clamp-2">{c.descricao}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

function Section({ title, icon, children, delay = '' }: { title: string; icon?: React.ReactNode; children: React.ReactNode; delay?: string }) {
  return (
    <div className={cn(
      "bg-white border-2 border-neutral-100 rounded-3xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.05)] animate-slide-up",
      delay
    )}>
      <div className="px-6 py-5 border-b border-neutral-100 flex items-center gap-3 bg-neutral-50/30">
        {icon}
        <h2 className="text-[11px] font-black text-neutral-500 uppercase tracking-[0.2em]">{title}</h2>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

function BiometricCard({ icon, label, value, unit, color, delay = '' }: { icon: React.ReactNode; label: string; value: string; unit: string; color: 'green' | 'amber' | 'blue' | 'neutral'; delay?: string }) {
  const colors = {
    green: 'bg-gradient-to-br from-green-50 to-white text-green-600 border-green-100',
    amber: 'bg-gradient-to-br from-amber-50 to-white text-amber-600 border-amber-100',
    blue: 'bg-gradient-to-br from-blue-50 to-white text-blue-600 border-blue-100',
    neutral: 'bg-gradient-to-br from-neutral-50 to-white text-neutral-600 border-neutral-200'
  }

  return (
    <div className={cn("animate-slide-up", delay)}>
      <div className={cn("p-5 rounded-2xl border-2 flex flex-col gap-3 transition-all hover:scale-[1.02] hover:shadow-md", colors[color])}>
        <div className="flex items-center justify-between">
          <div className="p-2 rounded-xl bg-white shadow-sm">
            {icon}
          </div>
          <div className="text-[10px] font-black uppercase tracking-widest opacity-60 font-sans">{label}</div>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-black font-display tracking-tight leading-none">{value}</span>
          <span className="text-xs font-bold font-sans opacity-70 uppercase tracking-tighter">{unit}</span>
        </div>
      </div>
    </div>
  )
}

function DataItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-neutral-50 rounded-lg p-2.5 sm:p-3">
      <div className="text-[9px] sm:text-xs text-neutral-400 uppercase tracking-wide mb-0.5 sm:mb-1">{label}</div>
      <div className="text-xs sm:text-sm font-medium text-neutral-900">{value}</div>
    </div>
  )
}
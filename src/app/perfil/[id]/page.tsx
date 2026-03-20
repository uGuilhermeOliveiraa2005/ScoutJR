import { createSupabaseServer } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import { NavbarPublic } from '@/components/layout/Navbar'
import { NavbarDashboard } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Navbar'
import { Badge, SkillBar } from '@/components/ui/index'
import { POSICAO_LABEL, ESTADO_LABEL, calcularIdade } from '@/lib/utils'
import { MapPin, Landmark, Star, Send, Trophy, Target, Award, Play, BarChart2, ArrowLeft, Edit2 } from 'lucide-react'
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

  let profile = null
  let isClube = false
  let clubeId = null
  let initialIsFavorite = false
  let initialHasInterest = false

  if (user) {
    const { data: p } = await supabase.from('profiles').select('*').eq('user_id', user.id).single()
    profile = p
    isClube = p?.role === 'clube'

    if (isClube) {
      const { data: c } = await supabase.from('clubes').select('id').eq('user_id', user.id).single()
      if (c) {
        clubeId = c.id
        // Check favorite
        const { data: fav } = await supabase.from('favoritos').select('id').eq('atleta_id', id).eq('clube_id', c.id).single()
        initialIsFavorite = !!fav

        // Check interest
        const { data: int } = await supabase.from('interesses').select('id').eq('atleta_id', id).eq('clube_id', c.id).single()
        initialHasInterest = !!int
      }
    }
  }

  const isOwner = user && profile && atleta.responsavel_id === profile.id

  const idade = calcularIdade(atleta.data_nascimento)
  const statsAtual = atleta.atleta_stats?.sort((a: any, b: any) => b.temporada - a.temporada)[0]

  const habilidades = [
    { label: 'Técnica', value: atleta.habilidade_tecnica, color: 'green' as const },
    { label: 'Velocidade', value: atleta.habilidade_velocidade, color: 'amber' as const },
    { label: 'Visão', value: atleta.habilidade_visao, color: 'green' as const },
    { label: 'Físico', value: atleta.habilidade_fisico, color: 'amber' as const },
    { label: 'Finalização', value: atleta.habilidade_finalizacao, color: 'green' as const },
    { label: 'Passes', value: atleta.habilidade_passes, color: 'green' as const },
  ]

  const Navbar = user && profile
    ? <NavbarDashboard userName={profile.nome} userRole={profile.role} userId={user.id} />
    : <NavbarPublic />

  return (
    <>
      {Navbar}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-8 pb-24 md:pb-8">

        {/* Back */}
        <Link href="/busca" className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-neutral-400 hover:text-neutral-700 mb-4 sm:mb-6 transition-colors">
          <ArrowLeft size={13} /> Voltar para busca
        </Link>

        {/* Mobile: Profile card no topo (layout diferente) */}
        <div className="lg:hidden mb-4">
          <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
            {/* Hero strip */}
            <div className="bg-green-100 px-4 pt-5 pb-3 flex items-end gap-3 relative min-h-[100px]">
              <div className="w-14 h-14 rounded-full bg-green-400 text-white flex items-center justify-center font-display text-2xl flex-shrink-0 z-10">
                {atleta.nome.split(' ').map((p: string) => p[0]).slice(0, 2).join('').toUpperCase()}
              </div>
              <div className="font-display text-7xl text-green-400/20 absolute right-4 bottom-0 leading-none select-none">
                {atleta.posicao}
              </div>
              <div className="flex-1 z-10">
                <h1 className="font-display text-xl text-neutral-900 leading-tight">{atleta.nome}</h1>
                <p className="text-xs text-neutral-500 uppercase tracking-wider font-bold">{POSICAO_LABEL[atleta.posicao]}</p>
              </div>
            </div>

            <div className="p-4">
              {/* Info chips */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                <Badge variant="outline" className="bg-neutral-50">{idade} anos</Badge>
                {atleta.exibir_cidade && (
                  <Badge variant="outline" className="bg-neutral-50">{atleta.cidade}, {atleta.estado}</Badge>
                )}
                <Badge variant="outline" className="bg-neutral-50">
                  {atleta.pe_dominante === 'destro' ? 'Destro' : atleta.pe_dominante === 'canhoto' ? 'Canhoto' : 'Ambidestro'}
                </Badge>
                {atleta.destaque_ativo && <Badge variant="amber">Em destaque</Badge>}
              </div>

              {atleta.clube_atual && (
                <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-3 bg-neutral-50 p-2 rounded-lg border border-neutral-100">
                  <Landmark size={12} className="text-neutral-400" />
                  <span className="font-semibold uppercase tracking-tight">{atleta.clube_atual}</span>
                </div>
              )}

              {/* Stats rápidos (mobile) */}
              {statsAtual && (
                <div className="grid grid-cols-4 gap-2 mb-3 py-3 border-y border-neutral-100">
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

              {/* CTA mobile */}
              {isClube ? (
                <AthleteActions
                  atletaId={atleta.id}
                  clubeId={clubeId}
                  initialIsFavorite={initialIsFavorite}
                  initialHasInterest={initialHasInterest}
                  aceitarMensagens={atleta.aceitar_mensagens}
                  size="sm"
                />
              ) : !user ? (
                <Link href="/login" className="block">
                  <Button variant="dark" className="w-full justify-center text-sm py-3">ENTRAR PARA CONTATAR</Button>
                </Link>
              ) : isOwner ? (
                <Link href={`/perfil/${atleta.id}/editar`} className="block">
                  <Button variant="outline" className="w-full justify-center text-sm py-3 gap-2 font-bold uppercase tracking-widest border-green-200 text-green-700 bg-green-50/50">
                    <Edit2 size={14} /> EDITAR MEU PERFIL
                  </Button>
                </Link>
              ) : profile?.role === 'responsavel' ? (
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-center">
                  <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">
                    RESTRITO PARA CLUBES 🛡️
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

          {/* Sidebar — desktop only */}
          <aside className="hidden lg:flex lg:col-span-1 flex-col gap-6">
            <div className="bg-white border border-neutral-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="bg-green-100 px-5 pt-6 pb-3 flex items-end gap-3 relative min-h-[120px]">
                <div className="w-16 h-16 rounded-full bg-green-400 text-white flex items-center justify-center font-display text-2xl flex-shrink-0 z-10 border-2 border-white shadow-sm">
                  {atleta.nome.split(' ').map((p: string) => p[0]).slice(0, 2).join('').toUpperCase()}
                </div>
                <div className="font-display text-8xl text-green-400/20 absolute right-4 bottom-[-10px] leading-none select-none">
                  {atleta.posicao}
                </div>
                <div className="flex-1 z-10">
                  <h1 className="font-display text-2xl text-neutral-900 leading-tight mb-0.5">{atleta.nome}</h1>
                  <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest">{POSICAO_LABEL[atleta.posicao]}</p>
                </div>
              </div>
              <div className="p-6">
                <div className="flex flex-wrap gap-2 mb-4">
                  <Badge variant="outline" className="bg-neutral-50 px-3 py-1 text-xs">{idade} anos</Badge>
                  {atleta.exibir_cidade && <Badge variant="outline" className="bg-neutral-50 px-3 py-1 text-xs">{atleta.cidade}, {atleta.estado}</Badge>}
                  <Badge variant="outline" className="bg-neutral-50 px-3 py-1 text-xs">{atleta.pe_dominante === 'destro' ? 'Destro' : atleta.pe_dominante === 'canhoto' ? 'Canhoto' : 'Ambidestro'}</Badge>
                </div>
                {atleta.clube_atual && (
                  <div className="flex items-center gap-2 text-sm text-neutral-600 mb-5 bg-neutral-50 p-3 rounded-xl border border-neutral-100 font-bold uppercase tracking-tight">
                    <Landmark size={14} className="text-neutral-400" />
                    {atleta.clube_atual}
                  </div>
                )}
                {atleta.destaque_ativo && <Badge variant="amber" className="mb-6 w-full justify-center py-1.5 text-xs font-bold ring-4 ring-amber-500/10 uppercase tracking-widest">ATLETA EM DESTAQUE 💎</Badge>}

                {isClube ? (
                  <AthleteActions
                    atletaId={atleta.id}
                    clubeId={clubeId}
                    initialIsFavorite={initialIsFavorite}
                    initialHasInterest={initialHasInterest}
                    aceitarMensagens={atleta.aceitar_mensagens}
                  />
                ) : isOwner ? (
                  <Link href={`/perfil/${atleta.id}/editar`} className="block mt-4">
                    <Button variant="outline" className="w-full justify-center py-4 font-bold tracking-widest uppercase gap-2 border-green-200 text-green-700 bg-green-50/50 hover:bg-green-100 transition-all shadow-sm">
                      <Edit2 size={16} /> EDITAR MEU PERFIL
                    </Button>
                  </Link>
                ) : profile?.role === 'responsavel' ? (
                  <div className="bg-neutral-50 border border-neutral-100 rounded-2xl p-5 mt-4 text-center">
                    <p className="text-xs text-neutral-500 font-bold tracking-widest uppercase mb-1">
                      PAINEL DO ATLETA 🛡️
                    </p>
                    <p className="text-[10px] text-neutral-400 leading-relaxed uppercase tracking-tighter">
                      Apenas perfis de clubes podem favoritar ou demonstrar interesse.
                    </p>
                  </div>
                ) : null}
              </div>
            </div>

            {statsAtual && (
              <div className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm">
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
                  ].map(([label, value]) => (
                    <div key={label as string} className="bg-neutral-50 rounded-2xl p-4 text-center border border-neutral-100">
                      <div className="font-display text-2xl text-green-700 leading-none">{value as number}</div>
                      <div className="text-[10px] text-neutral-400 mt-2 font-bold uppercase tracking-tighter">{label as string}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* Main content */}
          <main className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Cover Photo - Fixed at top */}
            {atleta.foto_url ? (
              <div className="relative aspect-video rounded-3xl overflow-hidden shadow-lg border border-neutral-200 bg-neutral-100 group">
                <img src={atleta.foto_url} alt={`Capa de ${atleta.nome}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
              </div>
            ) : (
              <div className="aspect-video rounded-3xl border-2 border-dashed border-neutral-200 flex items-center justify-center bg-neutral-50">
                <p className="text-xs text-neutral-400 font-bold uppercase tracking-widest">Sem foto de capa</p>
              </div>
            )}

            {atleta.descricao && (
              <Section title="Sobre o atleta">
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed text-justify">{atleta.descricao}</p>
              </Section>
            )}

            {/* Habilidades */}
            <Section title="Habilidades">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-4">
                {habilidades.map(h => (
                  <SkillBar key={h.label} label={h.label} value={h.value} color={h.color} />
                ))}
              </div>
            </Section>

            {/* Dados físicos */}
            {(atleta.altura_cm || atleta.peso_kg) && (
              <Section title="Dados físicos">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {atleta.altura_cm && <DataItem label="Altura" value={`${atleta.altura_cm}cm`} />}
                  {atleta.peso_kg && <DataItem label="Peso" value={`${atleta.peso_kg}kg`} />}
                  <DataItem label="Pé" value={atleta.pe_dominante === 'destro' ? 'Destro' : atleta.pe_dominante === 'canhoto' ? 'Canhoto' : 'Ambidestro'} />
                  {atleta.posicao_secundaria && <DataItem label="Posição sec." value={POSICAO_LABEL[atleta.posicao_secundaria]} />}
                </div>
              </Section>
            )}

            {/* Media Gallery (Additional Photos & Videos) */}
            {(atleta.fotos_adicionais?.length > 0 || atleta.atleta_videos?.length > 0) && (
              <Section title="Galeria & Vídeos">
                <MediaGallery 
                  photos={atleta.fotos_adicionais || []} 
                  videos={atleta.atleta_videos || []} 
                />
              </Section>
            )}

            {/* Conquistas / Hall da Fama */}
            {atleta.atleta_conquistas && atleta.atleta_conquistas.length > 0 && (
              <Section title="Conquistas & Hall da Fama">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {atleta.atleta_conquistas.map((c: any, i: number) => (
                    <div key={c.id} className="group bg-amber-50/50 border border-amber-100 rounded-3xl p-5 flex gap-5 transition-all hover:shadow-xl hover:bg-white active:scale-[0.98]">
                      <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0 group-hover:rotate-12 transition-transform shadow-inner">
                        <Trophy size={28} fill="currentColor" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-sm font-black text-neutral-900 leading-tight uppercase tracking-tighter">{c.titulo}</h3>
                          <span className="text-[10px] font-black text-white bg-amber-600 px-2 py-0.5 rounded-full shadow-sm">{c.ano}</span>
                        </div>
                        {c.descricao && (
                          <p className="text-xs text-neutral-500 leading-relaxed line-clamp-2">
                            {c.descricao}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}
            {/* Gate para não logados */}
            {!user && (
              <div className="bg-green-700 rounded-xl p-5 sm:p-6 text-center text-white">
                <h3 className="font-display text-xl sm:text-2xl mb-2">QUER CONTATAR ESTE ATLETA?</h3>
                <p className="text-xs sm:text-sm text-white/70 mb-4">Crie uma conta de clube para entrar em contato.</p>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
                  <Link href="/cadastro?tipo=clube">
                    <Button variant="amber" className="w-full sm:w-auto justify-center">Criar conta de clube</Button>
                  </Link>
                  <Link href="/login">
                    <Button variant="outline" className="w-full sm:w-auto justify-center text-white border-white/30 hover:bg-white/10">Já tenho conta</Button>
                  </Link>
                </div>
              </div>
            )}

          </main>
        </div>
      </main>
      <Footer />
    </>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
      <div className="px-4 sm:px-5 py-3 sm:py-3.5 border-b border-neutral-100">
        <h2 className="text-xs sm:text-sm font-medium text-neutral-700">{title}</h2>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
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
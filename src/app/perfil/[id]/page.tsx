import { createSupabaseServer } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import { NavbarPublic } from '@/components/layout/Navbar'
import { NavbarDashboard } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Navbar'
import { Badge, SkillBar } from '@/components/ui/index'
import { POSICAO_LABEL, ESTADO_LABEL, calcularIdade } from '@/lib/utils'
import { MapPin, Landmark, Star, Send, Trophy, Target, Award, Play, BarChart2, ArrowLeft } from 'lucide-react'
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
          <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
            {/* Hero strip */}
            <div className="bg-green-100 px-4 pt-5 pb-3 flex items-end gap-3 relative">
              <div className="w-14 h-14 rounded-full bg-green-400 text-white flex items-center justify-center font-display text-2xl flex-shrink-0">
                {atleta.nome.split(' ').map((p: string) => p[0]).slice(0, 2).join('').toUpperCase()}
              </div>
              <div className="font-display text-7xl text-green-400/20 absolute right-4 bottom-0 leading-none">
                {atleta.posicao}
              </div>
              <div className="flex-1">
                <h1 className="font-display text-xl text-neutral-900 leading-tight">{atleta.nome}</h1>
                <p className="text-xs text-neutral-500">{POSICAO_LABEL[atleta.posicao]}</p>
              </div>
            </div>

            <div className="p-4">
              {/* Info chips */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                <Badge variant="outline">{idade} anos</Badge>
                {atleta.exibir_cidade && (
                  <Badge variant="outline">{atleta.cidade}, {atleta.estado}</Badge>
                )}
                <Badge variant="outline">
                  {atleta.pe_dominante === 'destro' ? 'Destro' : atleta.pe_dominante === 'canhoto' ? 'Canhoto' : 'Ambidestro'}
                </Badge>
                {atleta.destaque_ativo && <Badge variant="amber">Em destaque</Badge>}
              </div>

              {atleta.clube_atual && (
                <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-3">
                  <Landmark size={12} className="text-neutral-400" />
                  {atleta.clube_atual}
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
                      <div className="font-display text-xl text-green-700 leading-none">{value as number}</div>
                      <div className="text-[9px] text-neutral-400 mt-0.5">{label as string}</div>
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
                  <Button variant="dark" className="w-full justify-center text-sm">Entrar para contatar</Button>
                </Link>
              ) : profile?.role === 'responsavel' ? (
                <div className="bg-neutral-50 border border-neutral-100 rounded-lg p-3 text-center">
                  <p className="text-[10px] text-neutral-500 font-medium">
                    Favoritos e Interesse são ferramentas exclusivas para Clubes.
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

          {/* Sidebar — desktop only */}
          <aside className="hidden lg:flex lg:col-span-1 flex-col gap-4">
            <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
              <div className="bg-green-100 px-5 pt-6 pb-3 flex items-end gap-3 relative min-h-[100px]">
                <div className="w-16 h-16 rounded-full bg-green-400 text-white flex items-center justify-center font-display text-2xl flex-shrink-0">
                  {atleta.nome.split(' ').map((p: string) => p[0]).slice(0, 2).join('').toUpperCase()}
                </div>
                <div className="font-display text-8xl text-green-400/20 absolute right-4 bottom-0 leading-none">
                  {atleta.posicao}
                </div>
              </div>
              <div className="p-5">
                <h1 className="font-display text-2xl text-neutral-900 leading-tight mb-0.5">{atleta.nome}</h1>
                <p className="text-sm text-neutral-500 mb-3">{POSICAO_LABEL[atleta.posicao]}</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="outline">{idade} anos</Badge>
                  {atleta.exibir_cidade && <Badge variant="outline">{atleta.cidade}, {atleta.estado}</Badge>}
                  <Badge variant="outline">{atleta.pe_dominante === 'destro' ? 'Destro' : atleta.pe_dominante === 'canhoto' ? 'Canhoto' : 'Ambidestro'}</Badge>
                </div>
                {atleta.clube_atual && (
                  <div className="flex items-center gap-1.5 text-sm text-neutral-500 mb-3">
                    <Landmark size={13} className="text-neutral-400" />
                    {atleta.clube_atual}
                  </div>
                )}
                {atleta.destaque_ativo && <Badge variant="amber" className="mb-4">Em destaque</Badge>}

                {isClube ? (
                  <AthleteActions
                    atletaId={atleta.id}
                    clubeId={clubeId}
                    initialIsFavorite={initialIsFavorite}
                    initialHasInterest={initialHasInterest}
                    aceitarMensagens={atleta.aceitar_mensagens}
                  />
                ) : !user ? (
                  <Link href="/login" className="block mt-4">
                    <Button variant="dark" className="w-full justify-center">Entrar para contatar</Button>
                  </Link>
                ) : profile?.role === 'responsavel' ? (
                  <div className="bg-neutral-50 border border-neutral-100 rounded-lg p-4 mt-4 text-center">
                    <p className="text-xs text-neutral-500 font-display">
                      INTERAÇÕES RESTRITAS A CLUBES 🛡️
                    </p>
                    <p className="text-[10px] text-neutral-400 mt-1 leading-relaxed">
                      Apenas perfis de clubes podem favoritar ou demonstrar interesse em atletas.
                    </p>
                  </div>
                ) : null}
              </div>
            </div>

            {statsAtual && (
              <div className="bg-white border border-neutral-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart2 size={15} className="text-neutral-400" />
                  <span className="text-sm font-medium">Temporada {statsAtual.temporada}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ['Jogos', statsAtual.jogos],
                    ['Gols', statsAtual.gols],
                    ['Assists', statsAtual.assistencias],
                    ['Nota média', statsAtual.nota_media],
                  ].map(([label, value]) => (
                    <div key={label as string} className="bg-neutral-50 rounded-lg p-3 text-center">
                      <div className="font-display text-2xl text-green-700 leading-none">{value as number}</div>
                      <div className="text-xs text-neutral-400 mt-1">{label as string}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* Main content */}
          <main className="lg:col-span-2 flex flex-col gap-4 sm:gap-6">
            
            {/* Gallery Section */}
            {(atleta.foto_url || (atleta.fotos_adicionais?.length > 0) || (atleta.atleta_videos?.length > 0)) && (
              <MediaGallery 
                photos={[atleta.foto_url, ...(atleta.fotos_adicionais || [])]} 
                videos={atleta.atleta_videos || []} 
              />
            )}

            {atleta.descricao && (
              <Section title="Sobre o atleta">
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">{atleta.descricao}</p>
              </Section>
            )}

            {/* Habilidades */}
            <Section title="Habilidades">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 sm:gap-x-8 gap-y-2.5 sm:gap-y-3">
                {habilidades.map(h => (
                  <SkillBar key={h.label} label={h.label} value={h.value} color={h.color} />
                ))}
              </div>
            </Section>

            {/* Dados físicos */}
            {(atleta.altura_cm || atleta.peso_kg) && (
              <Section title="Dados físicos">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  {atleta.altura_cm && <DataItem label="Altura" value={`${atleta.altura_cm}cm`} />}
                  {atleta.peso_kg && <DataItem label="Peso" value={`${atleta.peso_kg}kg`} />}
                  <DataItem label="Pé" value={atleta.pe_dominante === 'destro' ? 'Destro' : atleta.pe_dominante === 'canhoto' ? 'Canhoto' : 'Ambidestro'} />
                  {atleta.posicao_secundaria && <DataItem label="Posição sec." value={POSICAO_LABEL[atleta.posicao_secundaria]} />}
                </div>
              </Section>
            )}

            {/* Conquistas / Hall da Fama */}
            {atleta.atleta_conquistas && atleta.atleta_conquistas.length > 0 && (
              <Section title="Conquistas & Hall da Fama">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {atleta.atleta_conquistas.map((c: any, i: number) => (
                    <div key={c.id} className="group bg-amber-50/50 border border-amber-100 rounded-2xl p-4 flex gap-4 transition-all hover:shadow-md active:scale-[0.98]">
                      <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <Trophy size={22} fill="currentColor" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="text-sm font-bold text-neutral-900 leading-tight uppercase tracking-tight">{c.titulo}</h3>
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">{c.ano}</span>
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

            {/* Vídeos */}
            {atleta.atleta_videos && atleta.atleta_videos.length > 0 && (
              <Section title="Vídeos de jogos">
                <div className="flex flex-col gap-2.5 sm:gap-3">
                  {atleta.atleta_videos.map((v: any) => (
                    <a
                      key={v.id}
                      href={v.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 border border-neutral-200 rounded-lg p-2.5 sm:p-3 hover:bg-neutral-50 transition-colors active:bg-neutral-100"
                    >
                      <div className="w-12 h-9 sm:w-16 sm:h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-700 flex-shrink-0">
                        <Play size={16} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs sm:text-sm font-medium text-neutral-900 truncate">{v.titulo}</div>
                        {v.duracao_segundos && (
                          <div className="text-[10px] sm:text-xs text-neutral-400 mt-0.5">
                            {Math.floor(v.duracao_segundos / 60)}:{String(v.duracao_segundos % 60).padStart(2, '0')}
                          </div>
                        )}
                      </div>
                    </a>
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
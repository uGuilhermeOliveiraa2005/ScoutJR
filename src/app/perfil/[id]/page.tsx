import { createSupabaseServer } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import { NavbarPublic } from '@/components/layout/Navbar'
import { NavbarDashboard } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Navbar'
import { Badge, SkillBar } from '@/components/ui/index'
import { Avatar } from '@/components/ui/Avatar'
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
  let isEscolinha = false
  let escolinhaId = null
  let escolinha_data: any = null
  let initialIsFavorite = false
  let initialHasInterest = false

  if (user) {
    const { data: p } = await supabase.from('profiles').select('*').eq('user_id', user.id).single()
    profile = p
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

  const habilidades = [
    { label: 'Técnica', value: atleta.habilidade_tecnica, color: 'green' as const },
    { label: 'Velocidade', value: atleta.habilidade_velocidade, color: 'amber' as const },
    { label: 'Visão', value: atleta.habilidade_visao, color: 'green' as const },
    { label: 'Físico', value: atleta.habilidade_fisico, color: 'amber' as const },
    { label: 'Finalização', value: atleta.habilidade_finalizacao, color: 'green' as const },
    { label: 'Passes', value: atleta.habilidade_passes, color: 'green' as const },
  ]

  const Navbar = user && profile
    ? <NavbarDashboard
      userName={profile.nome}
      userRole={profile.role}
      userId={user.id}
      userFotoUrl={userFotoUrl}
    />
    : <NavbarPublic />

  return (
    <>
      {Navbar}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-5 sm:py-8 pb-32 lg:pb-8">
        
        <Link href="/busca" className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-neutral-400 hover:text-neutral-700 mb-6 transition-colors">
          <ArrowLeft size={13} /> Voltar para busca
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          
          {/* COLUNA 1: Perfil & Ações (Sidebar no desktop, Topo no mobile) */}
          <aside className="flex flex-col gap-6 lg:sticky lg:top-24">
            
            {/* Card Principal de Perfil */}
            <div className="bg-white border border-neutral-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="bg-green-100 px-5 pt-6 pb-3 flex items-end gap-3 relative min-h-[120px]">
                <Avatar
                  src={atleta.foto_url}
                  nome={atleta.nome}
                  size="xl"
                  colorClass="bg-green-400 text-white"
                  className="z-10 border-2 border-white shadow-sm"
                />
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
                {atleta.escolinha_atual && (
                  <div className="flex items-center gap-2 text-sm text-neutral-600 mb-5 bg-neutral-50 p-3 rounded-xl border border-neutral-100 font-bold uppercase tracking-tight">
                    <Landmark size={14} className="text-neutral-400" />
                    {atleta.escolinha_atual}
                  </div>
                )}
                
                {/* 
                  AÇÕES DO ATLETA: Renderizado apenas uma vez.
                  No mobile vira um rodapé fixo para melhor acessibilidade.
                  No desktop fica aqui na sidebar.
                */}
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
              <div className="hidden lg:block bg-white border border-neutral-200 rounded-3xl p-6 shadow-sm">
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

          {/* COLUNA 2: Conteúdo Principal */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Foto de Capa / Galeria de Destaque */}
            {atleta.foto_url ? (
              <div className="relative aspect-video rounded-3xl overflow-hidden shadow-lg border border-neutral-200 bg-neutral-100 group">
                <img src={atleta.foto_url} alt={`Capa de ${atleta.nome}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
              </div>
            ) : (
              <div className="aspect-video rounded-3xl border-2 border-dashed border-neutral-200 flex items-center justify-center bg-neutral-50 font-display text-neutral-300">
                SCJR
              </div>
            )}

            {/* Info Mobile Mobile (Stats que no desktop ficam na sidebar) */}
            {statsAtual && (
              <div className="lg:hidden grid grid-cols-4 gap-2 bg-white border border-neutral-200 rounded-2xl p-4">
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
              <Section title="Sobre o atleta">
                <p className="text-sm text-neutral-600 leading-relaxed text-justify">{atleta.descricao}</p>
              </Section>
            )}

            <Section title="Habilidades">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-4">
                {habilidades.map(h => (
                  <SkillBar key={h.label} label={h.label} value={h.value} color={h.color} />
                ))}
              </div>
            </Section>

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

            <Section title="Galeria & Vídeos">
              <MediaGallery
                photos={atleta.fotos_adicionais || []}
                videos={atleta.atleta_videos || []}
              />
            </Section>

            {atleta.atleta_conquistas && atleta.atleta_conquistas.length > 0 && (
              <Section title="Conquistas & Hall da Fama">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {atleta.atleta_conquistas.map((c: any) => (
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
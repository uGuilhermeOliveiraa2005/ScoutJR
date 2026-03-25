'use client'

import { Badge, SkillBar } from '@/components/ui/index'
import { POSICAO_LABEL, calcularIdade } from '@/lib/utils'
import { Landmark, Trophy, Monitor, Smartphone, ArrowLeft, ArrowRight, Star, Send, Heart, ImageIcon } from 'lucide-react'
import { MediaGallery } from '@/components/atletas/MediaGallery'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface PreviewData {
  nomeAtleta: string
  descricao: string
  dataNascimento: string
  estado: string
  cidade: string
  posicao: string
  peDominante: string
  escolinhaAtual?: string
  habilidades: number[]
  fotoPerfilUrl?: string
  fotoPerfilPreview?: string
  fotoCapaUrl?: string
  fotoCapaPreview?: string
  fotosAdicionais: string[]
  videos: { url: string; titulo: string }[]
  conquistas: { titulo: string; ano: string; descricao: string }[]
  visivel: boolean
  exibirCidade: boolean
  mensagens: boolean
}

export function AthleteProfilePreview({ 
  data, 
  onBack, 
  onNext 
}: { 
  data: PreviewData; 
  onBack?: () => void; 
  onNext?: () => void;
}) {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop')
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true); return () => setMounted(false) }, [])

  const idade = data.dataNascimento ? calcularIdade(data.dataNascimento) : '?'
  
  const habilidades = [
    { label: 'Técnica', value: data.habilidades[0], color: 'green' as const },
    { label: 'Velocidade', value: data.habilidades[1], color: 'amber' as const },
    { label: 'Visão', value: data.habilidades[2], color: 'green' as const },
    { label: 'Físico', value: data.habilidades[3], color: 'amber' as const },
    { label: 'Finalização', value: data.habilidades[4], color: 'green' as const },
    { label: 'Passes', value: data.habilidades[5], color: 'green' as const },
  ]

  const fotoPerfilSrc = data.fotoPerfilPreview || (typeof data.fotoPerfilUrl === 'string' ? data.fotoPerfilUrl : '')
  const fotoCapaSrc = data.fotoCapaPreview || (typeof data.fotoCapaUrl === 'string' ? data.fotoCapaUrl : '')

  const initials = data.nomeAtleta 
    ? data.nomeAtleta.split(' ').map((p: string) => p[0]).slice(0, 2).join('').toUpperCase() 
    : '?'

  const content = (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-neutral-950" style={{ isolation: 'isolate' }}>
      
      {/* ── Top Bar ───────────────────────────────────────────── */}
      <div className="flex-none bg-neutral-900 border-b border-neutral-800 px-4 sm:px-6 py-3 flex items-center justify-between z-50">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-xs font-medium"
          >
            <ArrowLeft size={16} /> <span className="hidden sm:inline">Voltar e editar</span>
          </button>
          <div className="w-px h-5 bg-neutral-700 hidden sm:block" />
          <div className="flex items-center gap-1 p-0.5 bg-neutral-800 rounded-lg">
            <button 
              onClick={() => setViewMode('desktop')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all",
                viewMode === 'desktop' ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-300"
              )}
            >
              <Monitor size={13} /> <span className="hidden sm:inline">Desktop</span>
            </button>
            <button 
              onClick={() => setViewMode('mobile')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all",
                viewMode === 'mobile' ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-300"
              )}
            >
              <Smartphone size={13} /> <span className="hidden sm:inline">Mobile</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden lg:inline text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
            Visualização em Tempo Real
          </span>
          <button 
            onClick={onNext}
            className="bg-green-600 text-white px-4 sm:px-5 py-2 rounded-lg font-bold text-xs hover:bg-green-500 transition-all flex items-center gap-2 shadow-lg shadow-green-600/20"
          >
            Tudo certo <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* ── Preview Body ──────────────────────────────────────── */}
      <div className={cn(
        "flex-1 overflow-y-auto transition-all duration-500",
        viewMode === 'mobile' ? "bg-neutral-900 flex items-start justify-center pt-8 pb-16" : "bg-neutral-100"
      )}>
        {viewMode === 'mobile' ? (
          /* ── Mobile Frame ── */
          <div className="w-[375px] bg-white rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/50 border-[8px] border-neutral-800 flex flex-col" style={{ height: '780px' }}>
            {/* Status bar */}
            <div className="flex-none h-10 bg-neutral-900 flex items-center justify-center">
              <div className="w-28 h-7 bg-neutral-800 rounded-full" />
            </div>
            {/* Content */}
            <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">
              <MobileProfileView data={data} habilidades={habilidades} idade={idade} fotoPerfilSrc={fotoPerfilSrc} fotoCapaSrc={fotoCapaSrc} initials={initials} />
            </div>
            {/* Home indicator */}
            <div className="flex-none h-6 bg-white flex items-center justify-center">
              <div className="w-32 h-1 bg-neutral-300 rounded-full" />
            </div>
          </div>
        ) : (
          /* ── Desktop View (Full-width, exact replica of the real page) ── */
          <div className="bg-white min-h-full">
            {/* Fake Navbar */}
            <div className="bg-white border-b border-neutral-200">
              <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                <span className="font-display text-xl tracking-widest text-green-700">SCOUT<span className="text-amber-500">JR</span></span>
                <div className="flex items-center gap-6 text-xs text-neutral-400 font-medium">
                  <span>Dashboard</span>
                  <span>Busca</span>
                  <span>Ranking</span>
                </div>
              </div>
            </div>

            {/* Real profile content — exact copy of perfil/[id]/page.tsx */}
            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 pb-16">

              <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-neutral-400 mb-4">
                <ArrowLeft size={13} /> Voltar para busca
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">

                {/* COLUNA 1: Perfil & Ações */}
                <aside className="flex flex-col gap-6 lg:self-start">
                  <div className="bg-white border border-neutral-200 rounded-3xl overflow-hidden shadow-sm">
                    <div className="bg-green-100 px-5 py-6 flex items-center gap-4 relative overflow-hidden">
                      {fotoPerfilSrc ? (
                        <img src={fotoPerfilSrc} alt={data.nomeAtleta} className="w-16 h-16 rounded-full object-cover z-10 border-2 border-white shadow-sm flex-shrink-0" />
                      ) : (
                        <div className="w-16 h-16 rounded-full bg-green-400 text-white flex items-center justify-center font-display text-2xl flex-shrink-0 z-10 border-2 border-white shadow-sm">
                          {initials}
                        </div>
                      )}
                      <div className="font-display text-7xl text-green-400/20 absolute right-4 -bottom-4 leading-none select-none pointer-events-none">
                        {data.posicao}
                      </div>
                      <div className="flex-1 z-10 min-w-0">
                        <h1 className="font-display text-2xl text-neutral-900 leading-tight mb-0.5 truncate">{data.nomeAtleta || 'Nome do Atleta'}</h1>
                        <p className="text-[10px] sm:text-xs text-neutral-500 font-bold uppercase tracking-widest truncate">{POSICAO_LABEL[data.posicao]}</p>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex flex-wrap gap-2 mb-4">
                        <Badge variant="outline" className="bg-neutral-50 px-3 py-1 text-xs">{idade} anos</Badge>
                        {data.exibirCidade && (
                          <Badge variant="outline" className="bg-neutral-50 px-3 py-1 text-xs">
                            {data.cidade || 'Cidade'}, {data.estado || 'UF'}
                          </Badge>
                        )}
                        <Badge variant="outline" className="bg-neutral-50 px-3 py-1 text-xs">
                          {data.peDominante === 'destro' ? 'Destro' : data.peDominante === 'canhoto' ? 'Canhoto' : 'Ambidestro'}
                        </Badge>
                      </div>
                      {data.escolinhaAtual && (
                        <div className="flex items-center gap-2 text-sm text-neutral-600 mb-5 bg-neutral-50 p-3 rounded-xl border border-neutral-100 font-bold uppercase tracking-tight">
                          <Landmark size={14} className="text-neutral-400" />
                          {data.escolinhaAtual}
                        </div>
                      )}

                      {/* Mock Actions — disabled visually */}
                      <div className="flex flex-col gap-2 mt-2 opacity-40 pointer-events-none select-none">
                        <button className="w-full py-3.5 bg-green-800 text-white font-bold text-xs uppercase tracking-widest rounded-lg flex items-center justify-center gap-2">
                          <Send size={14} /> Demonstrar Interesse
                        </button>
                        <button className="w-full py-3.5 border border-neutral-200 text-neutral-700 font-bold text-xs uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 bg-white">
                          <Heart size={14} /> Salvar nos Favoritos
                        </button>
                      </div>
                    </div>
                  </div>
                </aside>

                {/* COLUNA 2: Conteúdo Principal */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                  
                  {/* Capa */}
                  {fotoCapaSrc ? (
                    <div className="relative aspect-video rounded-3xl overflow-hidden shadow-lg border border-neutral-200 bg-neutral-100 group">
                      <img src={fotoCapaSrc} alt="Capa" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                    </div>
                  ) : (
                    <div className="aspect-video rounded-3xl border-2 border-dashed border-neutral-200 flex items-center justify-center bg-neutral-50 font-display text-neutral-300 text-lg">
                      SEM FOTO DE CAPA
                    </div>
                  )}

                  {/* Sobre */}
                  {data.descricao && (
                    <Section title="Sobre o atleta">
                      <p className="text-sm text-neutral-600 leading-relaxed text-justify">{data.descricao}</p>
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

                  {/* Galeria & Vídeos */}
                  {(data.fotosAdicionais.some((f: any) => f) || data.videos.some((v: any) => v.url)) && (
                    <Section title="Galeria & Vídeos">
                      <MediaGallery 
                        photos={data.fotosAdicionais.filter((f: any) => f)} 
                        videos={data.videos.filter((v: any) => v.url)} 
                      />
                    </Section>
                  )}

                  {/* Conquistas */}
                  {data.conquistas.length > 0 && (
                    <Section title="Conquistas & Hall da Fama">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {data.conquistas.map((c, i) => (
                          <div key={i} className="group bg-amber-50/50 border border-amber-100 rounded-3xl p-5 flex gap-5 transition-all hover:shadow-xl hover:bg-white">
                            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0 group-hover:rotate-12 transition-transform shadow-inner">
                              <Trophy size={28} fill="currentColor" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="text-sm font-black text-neutral-900 leading-tight uppercase tracking-tighter">{c.titulo || 'Nova Conquista'}</h3>
                                <span className="text-[10px] font-black text-white bg-amber-600 px-2 py-0.5 rounded-full shadow-sm">{c.ano || '2024'}</span>
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
          </div>
        )}
      </div>
    </div>
  )

  if (!mounted) return null;
  return createPortal(content, document.body)
}


// ── Mobile Profile View (Stacked, single-column) ─────────────
function MobileProfileView({ data, habilidades, idade, fotoPerfilSrc, fotoCapaSrc, initials }: any) {
  return (
    <div className="bg-white pb-8">
      {/* Profile Card */}
      <div className="bg-green-100 px-4 py-5 flex items-center gap-3 relative overflow-hidden">
        {fotoPerfilSrc ? (
          <img src={fotoPerfilSrc} alt={data.nomeAtleta} className="w-14 h-14 rounded-full object-cover z-10 border-2 border-white shadow-sm flex-shrink-0" />
        ) : (
          <div className="w-14 h-14 rounded-full bg-green-400 text-white flex items-center justify-center font-display text-xl flex-shrink-0 z-10 border-2 border-white shadow-sm">
            {initials}
          </div>
        )}
        <div className="font-display text-5xl text-green-400/20 absolute right-3 -bottom-3 leading-none select-none pointer-events-none">
          {data.posicao}
        </div>
        <div className="flex-1 z-10 min-w-0">
          <h1 className="font-display text-lg text-neutral-900 leading-tight mb-0.5 truncate">{data.nomeAtleta || 'Nome'}</h1>
          <p className="text-[9px] text-neutral-500 font-bold uppercase tracking-widest truncate">{POSICAO_LABEL[data.posicao]}</p>
        </div>
      </div>

      <div className="px-4 pt-4">
        {/* Badges */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          <Badge variant="outline" className="bg-neutral-50 px-2 py-0.5 text-[10px]">{idade} anos</Badge>
          {data.exibirCidade && (
            <Badge variant="outline" className="bg-neutral-50 px-2 py-0.5 text-[10px]">
              {data.cidade || 'Cidade'}, {data.estado || 'UF'}
            </Badge>
          )}
          <Badge variant="outline" className="bg-neutral-50 px-2 py-0.5 text-[10px]">
            {data.peDominante === 'destro' ? 'Destro' : data.peDominante === 'canhoto' ? 'Canhoto' : 'Ambidestro'}
          </Badge>
        </div>

        {data.escolinhaAtual && (
          <div className="flex items-center gap-2 text-xs text-neutral-600 mb-3 bg-neutral-50 p-2.5 rounded-lg border border-neutral-100 font-bold uppercase tracking-tight">
            <Landmark size={12} className="text-neutral-400" />
            {data.escolinhaAtual}
          </div>
        )}

        {/* Capa */}
        <div className="mb-4">
          {fotoCapaSrc ? (
            <div className="relative aspect-video rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-100">
              <img src={fotoCapaSrc} alt="Capa" className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="aspect-video rounded-2xl border-2 border-dashed border-neutral-200 flex items-center justify-center bg-neutral-50">
              <span className="text-[10px] text-neutral-300 font-bold uppercase tracking-widest">Sem capa</span>
            </div>
          )}
        </div>

        {/* Sobre */}
        {data.descricao && (
          <MobileSection title="Sobre o atleta">
            <p className="text-[11px] text-neutral-600 leading-relaxed">{data.descricao}</p>
          </MobileSection>
        )}

        {/* Habilidades */}
        <MobileSection title="Habilidades">
          <div className="flex flex-col gap-3">
            {habilidades.map((h: any) => (
              <SkillBar key={h.label} label={h.label} value={h.value} color={h.color} />
            ))}
          </div>
        </MobileSection>

        {/* Galeria */}
        {(data.fotosAdicionais.some((f: any) => f) || data.videos.some((v: any) => v.url)) && (
          <MobileSection title="Galeria & Vídeos">
            <MediaGallery 
              photos={data.fotosAdicionais.filter((f: any) => f)} 
              videos={data.videos.filter((v: any) => v.url)} 
            />
          </MobileSection>
        )}

        {/* Conquistas */}
        {data.conquistas.length > 0 && (
          <MobileSection title="Conquistas">
            <div className="flex flex-col gap-3">
              {data.conquistas.map((c: any, i: number) => (
                <div key={i} className="bg-amber-50/50 border border-amber-100 rounded-2xl p-3.5 flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                    <Trophy size={20} fill="currentColor" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-[10px] font-black text-neutral-900 leading-tight uppercase tracking-tighter truncate">{c.titulo || 'Conquista'}</h3>
                      <span className="text-[8px] font-black text-white bg-amber-600 px-1.5 py-0.5 rounded-full shrink-0 ml-1">{c.ano || '2024'}</span>
                    </div>
                    {c.descricao && (
                      <p className="text-[9px] text-neutral-500 leading-snug line-clamp-1">{c.descricao}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </MobileSection>
        )}
      </div>
    </div>
  )
}


// ── Section Helpers (matching the real site exactly) ──────────
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

function MobileSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden mb-3">
      <div className="px-3 py-2.5 border-b border-neutral-100">
        <h2 className="text-[10px] font-medium text-neutral-700">{title}</h2>
      </div>
      <div className="p-3">{children}</div>
    </div>
  )
}

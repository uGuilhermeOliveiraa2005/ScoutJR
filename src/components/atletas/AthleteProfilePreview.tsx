'use client'

import { Badge, SkillBar } from '@/components/ui/index'
import { POSICAO_LABEL, calcularIdade } from '@/lib/utils'
import { Landmark, Trophy, Monitor, Smartphone, ArrowLeft, ArrowRight } from 'lucide-react'
import { MediaGallery } from '@/components/atletas/MediaGallery'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'

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
  fotoUrl?: string
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

  const idade = data.dataNascimento ? calcularIdade(data.dataNascimento) : '?'
  
  const habilidades = [
    { label: 'Técnica', value: data.habilidades[0], color: 'green' as const },
    { label: 'Velocidade', value: data.habilidades[1], color: 'amber' as const },
    { label: 'Visão', value: data.habilidades[2], color: 'green' as const },
    { label: 'Físico', value: data.habilidades[3], color: 'amber' as const },
    { label: 'Finalização', value: data.habilidades[4], color: 'green' as const },
    { label: 'Passes', value: data.habilidades[5], color: 'green' as const },
  ]

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-white overflow-hidden">
      {/* Sticky Preview Header */}
      <div className="flex-none bg-white border-b border-neutral-200 px-4 sm:px-8 py-4 flex items-center justify-between gap-4 shadow-sm z-50">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-2 sm:px-4 sm:py-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50 rounded-xl transition-all flex items-center gap-2 text-xs font-bold uppercase tracking-widest border border-transparent hover:border-neutral-200"
          >
            <ArrowLeft size={16} /> <span className="hidden sm:inline">Voltar e Editar</span>
          </button>
          <div className="w-px h-6 bg-neutral-200 mx-2 hidden sm:block" />
          <div className="flex items-center gap-2 p-1 bg-neutral-100 rounded-xl">
            <button 
              onClick={() => setViewMode('desktop')}
              className={cn(
                "hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black transition-all uppercase tracking-widest",
                viewMode === 'desktop' ? "bg-white shadow-sm text-green-700" : "text-neutral-500 hover:text-neutral-700"
              )}
            >
              <Monitor size={14} /> DESKTOP
            </button>
            <button 
              onClick={() => setViewMode('mobile')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-black transition-all uppercase tracking-widest",
                viewMode === 'mobile' ? "bg-white shadow-sm text-green-700" : "text-neutral-500 hover:text-neutral-700"
              )}
            >
              <Smartphone size={14} /> MOBILE
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <p className="hidden md:block text-[10px] font-bold text-neutral-400 uppercase tracking-[0.2em]">Visualização em Tempo Real</p>
           <button 
            onClick={onNext}
            className="bg-green-700 text-white px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-green-800 transition-all flex items-center gap-2 shadow-lg shadow-green-700/20 active:scale-95"
          >
            Tudo certo! Continuar <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Preview Container */}
      <div className={cn(
        "flex-1 overflow-y-auto transition-all duration-700",
        viewMode === 'mobile' ? "bg-neutral-100 py-12" : "bg-white"
      )}>
        <div className="w-full h-full">
          {viewMode === 'mobile' ? (
            /* Mobile Device Frame */
            <div className="w-[360px] h-[740px] bg-white border-[12px] border-neutral-900 rounded-[3.5rem] overflow-hidden mx-auto shadow-2xl relative flex flex-col font-sans">
               <div className="flex-none h-6 bg-neutral-900 flex items-center justify-center z-[60]">
                  <div className="w-12 h-1 bg-neutral-800 rounded-full" />
               </div>
               <div className="flex-1 overflow-y-auto bg-white pt-6 custom-scrollbar">
                  <ProfileContent data={data} viewMode="mobile" habilidades={habilidades} idade={idade} />
               </div>
            </div>
          ) : (
            /* Desktop Real View (No frame) */
            <div className="w-full bg-white h-full overflow-y-auto custom-scrollbar">
               <ProfileContent data={data} viewMode="desktop" habilidades={habilidades} idade={idade} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ProfileContent({ data, viewMode, habilidades, idade }: { data: any, viewMode: 'desktop' | 'mobile', habilidades: any[], idade: any }) {
  return (
    <div className="bg-white min-h-full pb-20">
      <main className={cn("mx-auto px-4 py-6 sm:py-8", viewMode === 'desktop' ? "max-w-6xl" : "max-w-full")}>
        
        {/* Layout Grid */}
        <div className={cn(
          "grid grid-cols-1 gap-4 sm:gap-6",
          viewMode === 'desktop' ? "lg:grid-cols-3" : "grid-cols-1"
        )}>
          
          {/* Header/Sidebar Info */}
          <div className={cn(
             viewMode === 'desktop' ? "lg:col-span-1" : "col-span-1"
          )}>
            <div className={cn(
              "bg-white border border-neutral-200 rounded-3xl overflow-hidden shadow-sm",
              viewMode === 'desktop' ? "sticky top-8" : ""
            )}>
              <div className="bg-green-100 px-5 pt-6 pb-3 flex items-end gap-3 relative min-h-[120px]">
                <div className="w-16 h-16 rounded-full bg-green-400 text-white flex items-center justify-center font-display text-2xl flex-shrink-0 z-10 border-2 border-white shadow-sm">
                  {data.nomeAtleta ? data.nomeAtleta.split(' ').map((p: any) => p[0]).slice(0, 2).join('').toUpperCase() : '?'}
                </div>
                <div className="font-display text-8xl text-green-400/20 absolute right-4 bottom-[-10px] leading-none select-none tracking-tighter">
                  {data.posicao}
                </div>
                <div className="flex-1 z-10">
                  <h1 className="font-display text-2xl text-neutral-900 leading-tight mb-0.5">{data.nomeAtleta || 'Nome do Atleta'}</h1>
                  <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest">{POSICAO_LABEL[data.posicao]}</p>
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
                
                {/* Mock Athlete Actions - Matching real site actions */}
                <div className="flex flex-col gap-2 mt-4 opacity-50">
                  <Button variant="dark" className="w-full justify-center pointer-events-none text-xs uppercase font-bold tracking-widest py-3">
                     Demonstrar Interesse
                  </Button>
                  <Button variant="outline" className="w-full justify-center pointer-events-none text-xs uppercase font-bold tracking-widest py-3">
                     Salvar nos favoritos
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className={cn(
            viewMode === 'desktop' ? "lg:col-span-2" : "col-span-1",
            "flex flex-col gap-6"
          )}>
            
            {/* Cover Photo */}
            {data.fotoUrl ? (
              <div className="relative aspect-video rounded-3xl overflow-hidden shadow-lg border border-neutral-200 bg-neutral-100 group">
                <img src={data.fotoUrl} alt="Cover" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
              </div>
            ) : (
              <div className="aspect-video rounded-3xl border-2 border-dashed border-neutral-200 flex items-center justify-center bg-neutral-50">
                <p className="text-sm text-neutral-300 font-bold uppercase tracking-widest">Sem foto de capa</p>
              </div>
            )}

            {/* Content sections */}
            {data.descricao && (
              <PreviewSection title="Sobre o atleta">
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed text-justify whitespace-pre-wrap">{data.descricao}</p>
              </PreviewSection>
            )}

            <PreviewSection title="Habilidades">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-4">
                {habilidades.map(h => (
                  <SkillBar key={h.label} label={h.label} value={h.value} color={h.color} />
                ))}
              </div>
            </PreviewSection>

            {/* Media Gallery Section */}
            {(data.fotosAdicionais.some((f: any) => f) || data.videos.some((v: any) => v.url)) && (
              <PreviewSection title="Galeria & Vídeos">
                  <MediaGallery 
                  photos={data.fotosAdicionais.filter((f: any) => f)} 
                  videos={data.videos.filter((v: any) => v.url)} 
                />
              </PreviewSection>
            )}

            {data.conquistas.length > 0 && (
              <PreviewSection title="Conquistas & Hall da Fama">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {data.conquistas.map((c: any, i: number) => (
                    <div key={i} className="group bg-amber-50/50 border border-amber-100 rounded-3xl p-5 flex gap-5 transition-all hover:bg-white">
                      <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0 group-hover:rotate-12 transition-transform shadow-inner">
                        <Trophy size={28} fill="currentColor" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-sm font-black text-neutral-900 leading-tight uppercase tracking-tighter">{c.titulo || 'Título de Conquista'}</h3>
                          <span className="text-[10px] font-black text-white bg-amber-600 px-2 py-0.5 rounded-full shadow-sm">{c.ano || '2024'}</span>
                        </div>
                        {c.descricao && <p className="text-xs text-neutral-500 leading-relaxed line-clamp-2">{c.descricao}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </PreviewSection>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}

function PreviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
      <div className="px-4 sm:px-5 py-3 sm:py-3.5 border-b border-neutral-100">
        <h2 className="text-xs sm:text-sm font-medium text-neutral-700">{title}</h2>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { 
  ArrowLeft, Check, X, Mail, Phone, Calendar, 
  MapPin, Landmark, Shield, User, 
  TrendingUp, Activity, Award, Play, 
  Smartphone, Hash, FileText, Info, Clock
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { SkillBar } from '@/components/ui'
import { cn, POSICAO_LABEL, calcularIdade } from '@/lib/utils'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { aprovarPerfil, rejeitarPerfil } from '../actions'

export function DetailViewClient({ data, tipo }: { data: any; tipo: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  const handleApprove = async () => {
    setLoading(true)
    const id = tipo === 'atleta' ? data.responsavel_id : data.id
    const res = await aprovarPerfil(id)
    if (res.success) {
      toast.success('Aprovado com sucesso!')
      router.push('/admin')
    } else {
      toast.error(res.error || 'Erro ao aprovar')
    }
    setLoading(false)
  }

  const handleReject = async () => {
    if (!confirm('Rejeitar este perfil irá excluí-lo permanentemente. Continuar?')) return
    setLoading(true)
    const id = tipo === 'atleta' ? data.responsavel_id : data.id
    const res = await rejeitarPerfil(id)
    if (res.success) {
      toast.info('Perfil rejeitado e excluído.')
      router.push('/admin')
    } else {
      toast.error(res.error || 'Erro ao rejeitar')
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col gap-8 pb-20 animate-in fade-in duration-500">
      
      {/* ── HEADER DE AÇÃO ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-30 bg-neutral-50/80 backdrop-blur-md py-4 border-b border-neutral-200 -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => router.back()}
            className="p-2.5 rounded-xl bg-white border border-neutral-200 hover:bg-neutral-50 transition-all shadow-sm"
          >
            <ArrowLeft size={18} className="text-neutral-500" />
          </button>
          <div>
            <h1 className="text-xs font-bold text-neutral-400 uppercase tracking-widest leading-none mb-1">Ficha de Verificação</h1>
            <p className="font-display text-xl text-neutral-900 truncate max-w-[200px] sm:max-w-none uppercase">
              {tipo === 'atleta' ? `Atleta: ${data.nome}` : data.nome}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleReject} 
            disabled={loading}
            className="flex-1 sm:flex-initial bg-white border-red-200 text-red-600 hover:bg-red-50"
          >
            <X size={16} /> Rejeitar
          </Button>
          <Button 
            variant="dark" 
            onClick={handleApprove} 
            loading={loading}
            className="flex-1 sm:flex-initial"
          >
            <Check size={16} /> Aprovar Agora
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ── COLUNA LATERAL: IDENTIDADE & CONTATO ── */}
        <div className="flex flex-col gap-6">
          <Section icon={<User className="text-green-600" />} title="Identidade">
            <div className="flex flex-col items-center text-center p-4 bg-neutral-50 rounded-2xl border border-neutral-100 mb-4">
              <Avatar src={data.foto_url || data.avatar_url} nome={data.nome} size="xl" className="mb-4 border-4 border-white shadow-md" />
              <h2 className="font-display text-lg text-neutral-900 uppercase">{data.nome}</h2>
              <span className={cn(
                "mt-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                data.status === 'ativo' ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700 border border-amber-200"
              )}>
                Status: {data.status}
              </span>
            </div>
            
            <div className="flex flex-col gap-3">
              <InfoRow icon={<Mail size={16} />} label="E-mail" value={data.email} />
              <InfoRow icon={<Smartphone size={16} />} label="Tel/WhatsApp" value={data.telefone || "Não informado"} />
              <InfoRow icon={<Clock size={16} />} label="Membro desde" value={new Date(data.created_at).toLocaleDateString()} />
              <InfoRow icon={<Shield size={16} />} label="Perfil" value={data.role || (tipo === 'atleta' ? 'Atleta' : 'Responsável')} />
            </div>
          </Section>

          {tipo === 'atleta' && data.responsavel && (
            <Section icon={<Info className="text-blue-600" />} title="Responsável Legal">
              <div className="flex items-center gap-3 p-3 bg-blue-50/50 border border-blue-100 rounded-xl">
                 <Avatar src={data.responsavel.foto_url} nome={data.responsavel.nome} size="sm" />
                 <div>
                   <p className="text-xs font-bold text-blue-900 uppercase leading-none">{data.responsavel.nome}</p>
                   <p className="text-[10px] text-blue-600 mt-1">{data.responsavel.email}</p>
                 </div>
              </div>
            </Section>
          )}
        </div>

        {/* ── COLUNA PRINCIPAL: DADOS TÉCNICOS & CONTEÚDO ── */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          
          {/* VISUALIZAÇÃO PARA ATLETAS */}
          {tipo === 'atleta' && (
            <>
              <Section icon={<TrendingUp className="text-green-600" />} title="Habilidades e Dados Técnicos">
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <StatItem label="Posição" value={POSICAO_LABEL[data.posicao] || data.posicao} color="green" />
                  <StatItem label="Idade" value={`${calcularIdade(data.data_nascimento)} anos`} color="amber" />
                  <StatItem label="Pé" value={data.pe_dominante} color="blue" />
                  <StatItem label="Local" value={`${data.cidade}/${data.estado}`} color="neutral" />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-4 pt-4 border-t border-neutral-50">
                  <SkillBar label="Técnica" value={data.habilidade_tecnica} color="green" />
                  <SkillBar label="Velocidade" value={data.habilidade_velocidade} color="amber" />
                  <SkillBar label="Visão" value={data.habilidade_visao} color="green" />
                  <SkillBar label="Físico" value={data.habilidade_fisico} color="amber" />
                  <SkillBar label="Finalização" value={data.habilidade_finalizacao} color="green" />
                  <SkillBar label="Passes" value={data.habilidade_passes} color="green" />
                </div>
              </Section>

              {data.descricao && (
                <Section icon={<FileText className="text-neutral-500" />} title="Descrição / Bio">
                  <p className="text-sm text-neutral-600 leading-relaxed italic">"{data.descricao}"</p>
                </Section>
              )}

              {data.videos?.length > 0 && (
                <Section icon={<Play className="text-red-600" />} title="Vídeos de Performance">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {data.videos.map((v: any) => (
                      <a key={v.id} href={v.url} target="_blank" className="p-3 bg-neutral-900 text-white rounded-xl flex items-center gap-3 hover:bg-black transition-colors">
                        <Play size={16} className="fill-white" />
                        <span className="text-xs font-bold truncate">{v.titulo}</span>
                      </a>
                    ))}
                  </div>
                </Section>
              )}
            </>
          )}

          {/* VISUALIZAÇÃO PARA ESCOLINHAS */}
          {tipo === 'escolinha' && data.escolinha && (
            <>
              <Section icon={<Landmark className="text-amber-600" />} title="Dados da Escolinha">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <InfoRow icon={<Hash />} label="CNPJ" value={data.escolinha.cnpj || "Não informado"} />
                  <InfoRow icon={<MapPin />} label="Localização" value={`${data.escolinha.cidade}, ${data.escolinha.estado}`} />
                  <InfoRow icon={<Award />} label="Plano" value={data.escolinha.plano || "Gratuito"} />
                  <InfoRow icon={<Calendar />} label="Cadastrada em" value={new Date(data.escolinha.created_at).toLocaleDateString()} />
                </div>
              </Section>
              
              {data.escolinha.descricao && (
                <Section title="Sobre a Escolinha">
                  <p className="text-sm text-neutral-600 leading-relaxed">{data.escolinha.descricao}</p>
                </Section>
              )}
            </>
          )}

          {/* VISUALIZAÇÃO PARA RESPONSÁVEIS (FILHOS) */}
          {tipo === 'responsavel' && (
            <Section icon={<Activity className="text-green-600" />} title="Atletas Vinculados">
              {data.atletas?.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {data.atletas.map((atleta: any) => (
                    <div key={atleta.id} className="p-4 bg-white border border-neutral-200 rounded-2xl flex items-center gap-4 hover:shadow-md transition-all">
                      <Avatar src={atleta.foto_url} nome={atleta.nome} size="md" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-neutral-900 uppercase truncate">{atleta.nome}</p>
                        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">{POSICAO_LABEL[atleta.posicao]}</p>
                      </div>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase",
                        atleta.status === 'ativo' ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                      )}>
                        {atleta.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-neutral-400 bg-neutral-50 rounded-2xl border-2 border-dashed border-neutral-200">
                  Nenhum atleta vinculado a esta conta.
                </div>
              )}
            </Section>
          )}
        </div>
      </div>
    </div>
  )
}

function Section({ icon, title, children }: any) {
  return (
    <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm h-full flex flex-col">
      <div className="px-6 py-4 border-b border-neutral-50 flex items-center gap-3">
        {icon}
        <h2 className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{title}</h2>
      </div>
      <div className="p-6 flex-1">
        {children}
      </div>
    </div>
  )
}

function InfoRow({ icon, label, value }: any) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 text-neutral-300">{icon}</div>
      <div>
        <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-tighter leading-none mb-1">{label}</p>
        <p className="text-sm text-neutral-700 font-medium break-all">{value}</p>
      </div>
    </div>
  )
}

function StatItem({ label, value, color }: any) {
  const colors: any = {
    green: 'bg-green-100 text-green-700',
    amber: 'bg-amber-100 text-amber-700',
    blue: 'bg-blue-100 text-blue-700',
    neutral: 'bg-neutral-100 text-neutral-700'
  }
  return (
    <div className={cn("p-4 rounded-2xl flex flex-col gap-1 items-center text-center", colors[color])}>
      <span className="text-[9px] font-bold uppercase tracking-widest opacity-60">{label}</span>
      <span className="text-sm font-bold uppercase truncate w-full">{value}</span>
    </div>
  )
}

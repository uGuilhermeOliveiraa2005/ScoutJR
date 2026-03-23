'use client'

import { useState } from 'react'
import { Check, X, User, Landmark, Clock, Eye, MessageCircle, MapPin, Calendar, Smartphone, Mail, Activity, Images, Link as LinkIcon, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { aprovarPerfil, rejeitarPerfil } from './actions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function VerificationClient({ initialData }: any) {
  const [data, setData] = useState(initialData)
  const [tab, setTab] = useState<'atletas' | 'escolinhas'>('atletas')
  const [loading, setLoading] = useState<string | null>(null)
  
  // State for Confirm Action Modal
  const [confirmAction, setConfirmAction] = useState<{ id: string, tipo: 'profile'|'atleta', action: 'aprovar'|'rejeitar' } | null>(null)

  const handleAction = async () => {
    if (!confirmAction) return
    const { id, tipo, action } = confirmAction
    
    setLoading(id)
    setConfirmAction(null)
    
    const res = action === 'aprovar' 
      ? await aprovarPerfil(id, tipo) 
      : await rejeitarPerfil(id, tipo)
      
    setLoading(null)
    
    if (res?.success) {
      toast.success(action === 'aprovar' ? 'Aprovado com sucesso!' : 'Rejeitado com sucesso!')
      setData((prev: any) => ({
        ...prev,
        [tipo === 'atleta' ? 'atletas' : 'profiles']: prev[tipo === 'atleta' ? 'atletas' : 'profiles'].filter((item: any) => item.id !== id)
      }))
    } else {
      toast.error(res?.error || `Erro ao ${action}`)
    }
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 relative">
      <div className="flex items-center gap-2 p-1.5 bg-white border border-neutral-200 rounded-xl w-fit shadow-sm">
        <button
          onClick={() => setTab('atletas')}
          className={cn(
            "px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
            tab === 'atletas' ? "bg-neutral-100 text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50"
          )}
        >
          <User size={16} /> Atletas Pendentes ({data.atletas.length})
        </button>
        <button
          onClick={() => setTab('escolinhas')}
          className={cn(
            "px-6 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
            tab === 'escolinhas' ? "bg-neutral-100 text-neutral-900 shadow-sm" : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50"
          )}
        >
          <Landmark size={16} /> Escolinhas Pendentes ({data.profiles.length})
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {tab === 'atletas' ? (
          data.atletas.length === 0 ? (
            <EmptyState message="Nenhum atleta aguardando aprovação no momento." icon={<User size={32} />} />
          ) : (
            data.atletas.map((atleta: any) => (
              <AtletaCard
                key={atleta.id}
                atleta={atleta}
                onApprove={() => setConfirmAction({ id: atleta.id, tipo: 'atleta', action: 'aprovar' })}
                onReject={() => setConfirmAction({ id: atleta.id, tipo: 'atleta', action: 'rejeitar' })}
                loading={loading === atleta.id}
              />
            ))
          )
        ) : (
          data.profiles.length === 0 ? (
            <EmptyState message="Nenhuma escolinha aguardando aprovação no momento." icon={<Landmark size={32} />} />
          ) : (
            data.profiles.map((profile: any) => (
              <EscolinhaCard
                key={profile.id}
                profile={profile}
                onApprove={() => setConfirmAction({ id: profile.id, tipo: 'profile', action: 'aprovar' })}
                onReject={() => setConfirmAction({ id: profile.id, tipo: 'profile', action: 'rejeitar' })}
                loading={loading === profile.id}
              />
            ))
          )
        )}
      </div>

      {/* Confimation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className={cn("w-12 h-12 rounded-full flex items-center justify-center mb-4", confirmAction.action === 'aprovar' ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600")}>
              {confirmAction.action === 'aprovar' ? <Check size={24} /> : <AlertTriangle size={24} />}
            </div>
            <h3 className="text-xl font-display text-neutral-900 mb-2">
              Confirmar {confirmAction.action === 'aprovar' ? 'Aprovação' : 'Rejeição'}
            </h3>
            <p className="text-neutral-500 text-sm mb-6">
              Você tem certeza que deseja {confirmAction.action} este perfil no sistema? A ação não poderá ser desfeita facilmente.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="ghost" onClick={() => setConfirmAction(null)}>Cancelar</Button>
              <Button 
                variant={confirmAction.action === 'aprovar' ? 'primary' : 'danger'} 
                onClick={handleAction}
              >
                Sim, {confirmAction.action}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function AtletaCard({ atleta, onApprove, onReject, loading }: any) {
  const fotos = atleta.fotos_adicionais || []

  return (
    <div className={cn("bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm transition-opacity", loading && "opacity-60 pointer-events-none")}>
      <div className="p-6 flex flex-col gap-6">
        
        {/* Cabeçalho */}
        <div className="flex items-center gap-4 border-b border-neutral-100 pb-4">
          <Avatar src={atleta.foto_url} nome={atleta.nome} size="xl" />
          <div className="flex-1 min-w-0">
            <h3 className="text-2xl font-display text-neutral-900 uppercase leading-none mb-1 truncate">{atleta.nome}</h3>
            <p className="text-sm text-neutral-500 truncate">{atleta.cidade}, {atleta.estado} • {new Date(atleta.data_nascimento).toLocaleDateString('pt-BR')}</p>
          </div>
          <div className="bg-amber-500 text-white text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm flex-shrink-0">
            Pendente
          </div>
        </div>

        {/* Dados do Atleta */}
        <div className="flex flex-col gap-6">
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider text-neutral-400 font-bold flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-neutral-100 text-neutral-500 flex items-center justify-center text-[10px]">1</span> 
              Dados Físicos e Posição
            </h4>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-neutral-50 p-5 rounded-xl border border-neutral-100">
              <InfoBadge label="Posição" value={atleta.posicao} align="col" />
              <InfoBadge label="Pé Prefer" value={atleta.pe_dominante} align="col" />
              <InfoBadge label="Altura" value={atleta.altura_cm ? `${atleta.altura_cm}cm` : 'N/A'} align="col" />
              <InfoBadge label="Peso" value={atleta.peso_kg ? `${atleta.peso_kg}kg` : 'N/A'} align="col" />
            </div>
          </div>

          <div className="space-y-3">
             <h4 className="text-xs uppercase tracking-wider text-neutral-400 font-bold flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-neutral-100 text-neutral-500 flex items-center justify-center text-[10px]">2</span> 
              Bio / Descrição
            </h4>
            <div className="bg-neutral-50 p-5 rounded-xl border border-neutral-100">
              <p className="text-sm text-neutral-700 italic leading-relaxed">"{atleta.descricao || 'Sem descrição informada.'}"</p>
            </div>
          </div>

          <div className="space-y-3">
             <h4 className="text-xs uppercase tracking-wider text-neutral-400 font-bold flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-neutral-100 text-neutral-500 flex items-center justify-center text-[10px]">3</span> 
              Habilidades Adicionadas
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5 bg-neutral-50 p-5 rounded-xl border border-neutral-100">
              <SkillBar label="Técnica" value={atleta.habilidade_tecnica} />
              <SkillBar label="Físico" value={atleta.habilidade_fisico} />
              <SkillBar label="Velocidade" value={atleta.habilidade_velocidade} />
              <SkillBar label="Passe" value={atleta.habilidade_passes} />
              <SkillBar label="Visão" value={atleta.habilidade_visao} />
              <SkillBar label="Finalização" value={atleta.habilidade_finalizacao} />
            </div>
          </div>

          <div className="space-y-3">
             <h4 className="text-xs uppercase tracking-wider text-neutral-400 font-bold flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-neutral-100 text-neutral-500 flex items-center justify-center text-[10px]">4</span> 
              Fotos Adicionais
            </h4>
            <div className="flex flex-wrap gap-4 bg-neutral-50 p-5 rounded-xl border border-neutral-100">
               {fotos.length > 0 ? fotos.map((f: string, i: number) => (
                  <div key={i} className="w-24 h-24 sm:w-32 sm:h-32 bg-neutral-100 rounded-lg overflow-hidden border border-neutral-200">
                    <img src={f} className="w-full h-full object-cover" alt="Adicional" />
                  </div>
                )) : (
                  <span className="text-sm text-neutral-400">Nenhuma foto extra informada.</span>
                )}
            </div>
          </div>

          <div className="space-y-3">
             <h4 className="text-xs uppercase tracking-wider text-neutral-400 font-bold flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-neutral-100 text-neutral-500 flex items-center justify-center text-[10px]">5</span> 
              Dados Autenticados (Responsável)
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 bg-white border border-neutral-200 p-5 rounded-xl">
               <InfoItem icon={<User size={14} />} label="Nome" value={atleta.responsavel?.nome} />
               <InfoItem icon={<Smartphone size={14} />} label="Fone" value={atleta.responsavel?.telefone || 'N/A'} />
               <InfoItem icon={<Mail size={14} />} label="E-mail" value={atleta.responsavel?.email || 'N/A'} />
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-6 border-t border-neutral-100 mt-2">
          <Button variant="danger" onClick={onReject} disabled={loading} className="w-full sm:w-auto bg-red-50 text-red-600 hover:bg-red-100 h-12 px-8">
            <X size={18} /> Rejeitar
          </Button>
          <Button variant="dark" onClick={onApprove} loading={loading} className="w-full sm:w-auto h-12 px-8">
            <Check size={18} /> Aprovar Perfil
          </Button>
        </div>

      </div>
    </div>
  )
}

function EscolinhaCard({ profile, onApprove, onReject, loading }: any) {
  const esc = profile.escolinha

  return (
    <div className={cn("bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm transition-opacity", loading && "opacity-60 pointer-events-none")}>
      <div className="p-6 flex flex-col gap-6">
        
        {/* Cabeçalho */}
        <div className="flex items-center gap-4 border-b border-neutral-100 pb-4">
          <div className="w-16 h-16 bg-neutral-50 rounded-xl overflow-hidden border border-neutral-200 flex items-center justify-center flex-shrink-0">
             {esc?.logo_url ? <img src={esc.logo_url} className="w-full h-full object-cover" alt="Logo" /> : <Landmark size={24} className="text-neutral-300" />}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-2xl font-display text-neutral-900 uppercase leading-none mb-1 truncate">{profile.nome}</h3>
            <p className="text-sm text-neutral-500 truncate">{esc?.cidade || 'Pendente'}, {esc?.estado || 'Pendente'}</p>
          </div>
          <div className="bg-amber-500 text-white text-[10px] sm:text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm flex-shrink-0">
            Pendente
          </div>
        </div>

        {/* Dados da Escolinha */}
        <div className="flex flex-col gap-6">
          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider text-neutral-400 font-bold flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-neutral-100 text-neutral-500 flex items-center justify-center text-[10px]">1</span> 
              Bio / Descrição Corporativa
            </h4>
            <div className="bg-neutral-50 p-5 rounded-xl border border-neutral-100">
              <p className="text-sm text-neutral-700 italic leading-relaxed">"{esc?.descricao || 'Nenhuma apresentação fornecida.'}"</p>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs uppercase tracking-wider text-neutral-400 font-bold flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-neutral-100 text-neutral-500 flex items-center justify-center text-[10px]">2</span> 
              Dados Autenticados (Crucial)
            </h4>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 bg-white border border-neutral-200 p-5 rounded-xl">
               <InfoItem icon={<Activity size={14} />} label="CNPJ" value={esc?.cnpj || 'Não informado'} />
               <InfoItem icon={<Clock size={14} />} label="Registro" value={new Date(profile.created_at).toLocaleDateString('pt-BR')} />
               <InfoItem icon={<Smartphone size={14} />} label="Telefone" value={profile.telefone || 'N/A'} />
               <InfoItem icon={<Mail size={14} />} label="E-mail Auth" value={profile.email} />
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-6 border-t border-neutral-100 mt-2">
          <Button variant="danger" onClick={onReject} disabled={loading} className="w-full sm:w-auto bg-red-50 text-red-600 hover:bg-red-100 h-12 px-8">
            <X size={18} /> Rejeitar
          </Button>
          <Button variant="dark" onClick={onApprove} loading={loading} className="w-full sm:w-auto h-12 px-8">
            <Check size={18} /> Aprovar Escolinha
          </Button>
        </div>

      </div>
    </div>
  )
}

function InfoBadge({ label, value, align = 'row' }: { label: string, value: string, align?: 'row' | 'col' }) {
  if (align === 'col') {
    return (
      <div className="flex flex-col gap-0.5">
        <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-medium">{label}</span>
        <span className="text-sm font-medium text-neutral-900">{value}</span>
      </div>
    )
  }
  return (
    <div className="flex items-center gap-2 bg-neutral-100 px-3 py-1.5 rounded-lg">
      <span className="text-[10px] uppercase tracking-wider text-neutral-500 font-medium">{label}</span>
      <span className="text-sm font-medium text-neutral-900">{value}</span>
    </div>
  )
}

function InfoItem({ icon, label, value }: any) {
  return (
    <div className="flex items-center gap-2 min-w-0">
      <span className="text-neutral-400 flex-shrink-0">{icon}</span>
      <div className="flex flex-col">
        <span className="text-[10px] text-neutral-400 uppercase tracking-wider font-medium leading-none">{label}</span>
        <span className="text-sm text-neutral-800 font-medium truncate leading-tight mt-0.5">{value}</span>
      </div>
    </div>
  )
}

function SkillBar({ label, value }: { label: string, value: number }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs">
        <span className="text-neutral-600 font-medium">{label}</span>
        <span className="text-neutral-900 font-bold">{value}</span>
      </div>
      <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-green-500 rounded-full" 
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  )
}

function EmptyState({ message, icon }: { message: string, icon: React.ReactNode }) {
  return (
    <div className="p-16 border-2 border-dashed border-neutral-200 bg-neutral-50/50 rounded-2xl flex flex-col items-center justify-center text-neutral-400">
      <div className="text-neutral-300 mb-4">{icon}</div>
      <p className="text-base font-medium text-neutral-500">{message}</p>
    </div>
  )
}

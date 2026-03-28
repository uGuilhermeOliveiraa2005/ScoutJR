'use client'

import { useState } from 'react'
import { Check, X, User, Landmark, Clock, Eye, MapPin, Calendar, Smartphone, Mail, Activity, AlertTriangle, Users, Image as ImageIcon, Trophy, Footprints, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { aprovarPerfil, rejeitarPerfil } from './actions'
import { toast } from 'sonner'
import { cn, POSICAO_LABEL } from '@/lib/utils'

export function VerificationClient({ initialData }: any) {
  const [data, setData] = useState(initialData)
  const [tab, setTab] = useState<'responsaveis' | 'escolinhas'>('responsaveis')
  const [loading, setLoading] = useState<string | null>(null)
  const [confirmAction, setConfirmAction] = useState<{ id: string, action: 'aprovar'|'rejeitar', nome: string } | null>(null)

  const handleAction = async () => {
    if (!confirmAction) return
    const { id, action } = confirmAction
    
    setLoading(id)
    setConfirmAction(null)
    
    const res = action === 'aprovar' 
      ? await aprovarPerfil(id) 
      : await rejeitarPerfil(id)
      
    setLoading(null)
    
    if (res?.success) {
      toast.success(action === 'aprovar' ? 'Aprovado com sucesso!' : 'Rejeitado com sucesso!')
      // Remove from local state
      if (tab === 'responsaveis') {
        setData((prev: any) => ({
          ...prev,
          responsaveis: prev.responsaveis.filter((item: any) => item.id !== id)
        }))
      } else {
        setData((prev: any) => ({
          ...prev,
          escolinhas: prev.escolinhas.filter((item: any) => item.id !== id)
        }))
      }
    } else {
      toast.error(res?.error || `Erro ao ${action}`)
    }
  }

  const totalResp = data.responsaveis?.length || 0
  const totalEsc = data.escolinhas?.length || 0

  return (
    <div className="flex flex-col gap-4 sm:gap-6 animate-in fade-in duration-500 relative">
      <div className="flex items-center gap-1.5 p-1 bg-white border border-neutral-200 rounded-xl w-full sm:w-fit shadow-sm overflow-x-auto no-scrollbar">
        <button
          onClick={() => setTab('responsaveis')}
          className={cn(
            "flex-1 sm:flex-initial px-4 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap",
            tab === 'responsaveis' ? "bg-green-600 text-white shadow-sm" : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50"
          )}
        >
          <Users size={16} /> <span className="hidden xs:inline">Responsáveis</span> ({totalResp})
        </button>
        <button
          onClick={() => setTab('escolinhas')}
          className={cn(
            "flex-1 sm:flex-initial px-4 sm:px-6 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap",
            tab === 'escolinhas' ? "bg-green-600 text-white shadow-sm" : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50"
          )}
        >
          <Landmark size={16} /> <span className="hidden xs:inline">Escolinhas</span> ({totalEsc})
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {tab === 'responsaveis' ? (
          totalResp === 0 ? (
            <EmptyState message="Nenhum responsável aguardando aprovação." icon={<Users size={32} />} />
          ) : (
            data.responsaveis.map((resp: any) => (
              <ResponsavelCard
                key={resp.id}
                responsavel={resp}
                onApprove={() => setConfirmAction({ id: resp.id, action: 'aprovar', nome: resp.nome })}
                onReject={() => setConfirmAction({ id: resp.id, action: 'rejeitar', nome: resp.nome })}
                loading={loading === resp.id}
              />
            ))
          )
        ) : (
          totalEsc === 0 ? (
            <EmptyState message="Nenhuma escolinha aguardando aprovação." icon={<Landmark size={32} />} />
          ) : (
            data.escolinhas.map((esc: any) => (
              <EscolinhaCard
                key={esc.id}
                profile={esc}
                onApprove={() => setConfirmAction({ id: esc.id, action: 'aprovar', nome: esc.nome })}
                onReject={() => setConfirmAction({ id: esc.id, action: 'rejeitar', nome: esc.nome })}
                loading={loading === esc.id}
              />
            ))
          )
        )}
      </div>

      {/* Confirmation Modal */}
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
              {confirmAction.action === 'aprovar'
                ? `Você deseja aprovar "${confirmAction.nome}"? O profile e todos os atletas vinculados serão ativados.`
                : `Você deseja rejeitar "${confirmAction.nome}"? O profile e todos os atletas vinculados serão rejeitados.`
              }
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


// ═══════════════════════════════════════════════════════════════
// RESPONSÁVEL + ATLETA(S) —— Card Unificado
// ═══════════════════════════════════════════════════════════════
function ResponsavelCard({ responsavel, onApprove, onReject, loading }: any) {
  const atletas = responsavel.atletas || []

  return (
    <div className={cn("bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm transition-opacity", loading && "opacity-60 pointer-events-none")}>

      {/* ── Seção 1: Responsável ── */}
      <div className="border-b border-neutral-100">
        <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-white flex items-center gap-4">
          <Avatar src={responsavel.foto_url} nome={responsavel.nome} size="xl" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full uppercase tracking-widest">Responsável</span>
              <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full uppercase tracking-widest">Pendente</span>
            </div>
            <h3 className="text-xl font-display text-neutral-900 uppercase leading-none mb-1 truncate">{responsavel.nome}</h3>
            <div className="flex flex-col sm:flex-row flex-wrap gap-x-4 gap-y-2 text-[11px] sm:text-xs text-neutral-500">
              <span className="flex items-center gap-1.5"><Mail size={12} className="shrink-0" /> <span className="truncate">{responsavel.email}</span></span>
              <span className="flex items-center gap-1.5"><Smartphone size={12} className="shrink-0" /> {responsavel.telefone || 'N/A'}</span>
              <span className="flex items-center gap-1.5"><Clock size={12} className="shrink-0" /> {new Date(responsavel.created_at).toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Seção 2: Atleta(s) ── */}
      {atletas.length > 0 && (
        <div className="px-6 py-5">
          <h4 className="text-xs uppercase tracking-wider text-neutral-400 font-bold flex items-center gap-2 mb-4">
            <Sparkles size={14} className="text-green-500" /> Atleta(s) Vinculado(s) ({atletas.length})
          </h4>

          <div className="flex flex-col gap-6">
            {atletas.map((atleta: any) => (
              <AtletaSection key={atleta.id} atleta={atleta} />
            ))}
          </div>
        </div>
      )}

      {atletas.length === 0 && (
        <div className="px-6 py-5">
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-center">
            <p className="text-xs text-amber-700 font-medium">⚠️ Nenhum atleta cadastrado para este responsável.</p>
          </div>
        </div>
      )}

      {/* ── Ações ── */}
      <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-end gap-3">
        <Button variant="danger" onClick={onReject} disabled={loading} className="w-full sm:w-auto bg-red-50 text-red-600 hover:bg-red-100 h-11 px-8">
          <X size={16} /> Rejeitar
        </Button>
        <Button variant="dark" onClick={onApprove} loading={loading} className="w-full sm:w-auto h-11 px-8">
          <Check size={16} /> Aprovar Tudo
        </Button>
      </div>
    </div>
  )
}


// ── Seção de Atleta Detalhada (dentro do Card do Responsável) ──
function AtletaSection({ atleta }: { atleta: any }) {
  const fotos = atleta.fotos_adicionais || []

  return (
    <div className="bg-neutral-50 border border-neutral-100 rounded-xl overflow-hidden">
      {/* Header do Atleta */}
      <div className="px-5 py-4 flex items-center gap-4 border-b border-neutral-100 bg-white">
        <Avatar src={atleta.foto_url} nome={atleta.nome} size="lg" colorClass="bg-green-400 text-white" />
        <div className="flex-1 min-w-0">
          <h5 className="text-lg font-display text-neutral-900 uppercase leading-tight truncate">{atleta.nome}</h5>
          <p className="text-xs text-neutral-500">
            {atleta.cidade}, {atleta.estado} • {new Date(atleta.data_nascimento).toLocaleDateString('pt-BR')}
          </p>
        </div>
        {atleta.capa_url && (
          <div className="hidden sm:block w-24 h-14 rounded-lg overflow-hidden border border-neutral-200 flex-shrink-0">
            <img src={atleta.capa_url} className="w-full h-full object-cover" alt="Capa" />
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col gap-5">
        {/* Grid de dados */}
        <div>
          <SectionLabel label="Dados Físicos & Posição" num={1} />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 bg-white p-3 sm:p-4 rounded-lg border border-neutral-100">
            <InfoBadge label="Posição" value={POSICAO_LABEL?.[atleta.posicao] || atleta.posicao} />
            <InfoBadge label="Pé" value={atleta.pe_dominante} />
            <InfoBadge label="Altura" value={atleta.altura_cm ? `${atleta.altura_cm}cm` : 'N/A'} />
            <InfoBadge label="Peso" value={atleta.peso_kg ? `${atleta.peso_kg}kg` : 'N/A'} />
          </div>
        </div>

        {/* Descrição */}
        <div>
          <SectionLabel label="Descrição" num={2} />
          <div className="bg-white p-4 rounded-lg border border-neutral-100">
            <p className="text-sm text-neutral-700 italic leading-relaxed">"{atleta.descricao || 'Sem descrição informada.'}"</p>
          </div>
        </div>

        {/* Habilidades */}
        <div>
          <SectionLabel label="Habilidades" num={3} />
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4 bg-white p-4 rounded-lg border border-neutral-100">
            <SkillBar label="Técnica" value={atleta.habilidade_tecnica} />
            <SkillBar label="Físico" value={atleta.habilidade_fisico} />
            <SkillBar label="Velocidade" value={atleta.habilidade_velocidade} />
            <SkillBar label="Passe" value={atleta.habilidade_passes} />
            <SkillBar label="Visão" value={atleta.habilidade_visao} />
            <SkillBar label="Finalização" value={atleta.habilidade_finalizacao} />
          </div>
        </div>

        {/* Fotos */}
        <div>
          <SectionLabel label="Fotos" num={4} />
          <div className="flex flex-wrap gap-3 bg-white p-4 rounded-lg border border-neutral-100">
            {atleta.foto_url && (
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-green-200 flex-shrink-0">
                <img src={atleta.foto_url} className="w-full h-full object-cover" alt="Perfil" />
              </div>
            )}
            {atleta.capa_url && (
              <div className="w-32 h-20 rounded-xl overflow-hidden border border-neutral-200 flex-shrink-0">
                <img src={atleta.capa_url} className="w-full h-full object-cover" alt="Capa" />
              </div>
            )}
            {fotos.length > 0 ? fotos.map((f: string, i: number) => (
              <div key={i} className="w-20 h-20 bg-neutral-100 rounded-lg overflow-hidden border border-neutral-200">
                <img src={f} className="w-full h-full object-cover" alt="Extra" />
              </div>
            )) : !atleta.foto_url && !atleta.capa_url && (
              <span className="text-sm text-neutral-400">Nenhuma foto informada.</span>
            )}
          </div>
        </div>

        {/* Config de Privacidade */}
        <div>
          <SectionLabel label="Configurações" num={5} />
          <div className="grid grid-cols-1 xs:grid-cols-3 gap-2 sm:gap-3 bg-white p-3 sm:p-4 rounded-lg border border-neutral-100">
            <ConfigBadge label="Visível" active={atleta.visivel} />
            <ConfigBadge label="Exibe Cidade" active={atleta.exibir_cidade} />
            <ConfigBadge label="Mensagens" active={atleta.aceitar_mensagens} />
          </div>
        </div>
      </div>
    </div>
  )
}


// ═══════════════════════════════════════════════════════════════
// ESCOLINHA —— Card
// ═══════════════════════════════════════════════════════════════
function EscolinhaCard({ profile, onApprove, onReject, loading }: any) {
  const esc = profile.escolinha

  return (
    <div className={cn("bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm transition-opacity", loading && "opacity-60 pointer-events-none")}>
      <div className="px-6 py-4 bg-gradient-to-r from-amber-50 to-white flex items-center gap-4 border-b border-neutral-100">
        <div className="w-16 h-16 bg-white rounded-xl overflow-hidden border border-neutral-200 flex items-center justify-center flex-shrink-0 shadow-sm">
          {esc?.logo_url ? <img src={esc.logo_url} className="w-full h-full object-cover" alt="Logo" /> : <Landmark size={24} className="text-neutral-300" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[9px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full uppercase tracking-widest">Escolinha</span>
            <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full uppercase tracking-widest">Pendente</span>
          </div>
          <h3 className="text-xl font-display text-neutral-900 uppercase leading-none mb-1 truncate">{profile.nome}</h3>
          <p className="text-xs text-neutral-500">{esc?.cidade || 'Pendente'}, {esc?.estado || '--'}</p>
        </div>
      </div>

      <div className="p-6 flex flex-col gap-5">
        {/* Dados corporativos */}
        <div>
          <SectionLabel label="Dados Corporativos" num={1} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 bg-neutral-50 p-4 rounded-lg border border-neutral-100">
            <InfoItem icon={<Activity size={14} />} label="CNPJ" value={esc?.cnpj || 'Não informado'} />
            <InfoItem icon={<Clock size={14} />} label="Registro" value={new Date(profile.created_at).toLocaleDateString('pt-BR')} />
            <InfoItem icon={<Smartphone size={14} />} label="Telefone" value={profile.telefone || 'N/A'} />
            <InfoItem icon={<Mail size={14} />} label="E-mail" value={profile.email} />
          </div>
        </div>

        {/* Descrição */}
        <div>
          <SectionLabel label="Descrição" num={2} />
          <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-100">
            <p className="text-sm text-neutral-700 italic leading-relaxed">"{esc?.descricao || 'Nenhuma apresentação fornecida.'}"</p>
          </div>
        </div>

        {/* Fotos */}
        {(esc?.foto_url || (esc?.fotos_adicionais && esc.fotos_adicionais.length > 0)) && (
          <div>
            <SectionLabel label="Fotos" num={3} />
            <div className="flex flex-wrap gap-3 bg-neutral-50 p-4 rounded-lg border border-neutral-100">
              {esc.foto_url && (
                <div className="w-20 h-20 rounded-xl overflow-hidden border border-neutral-200">
                  <img src={esc.foto_url} className="w-full h-full object-cover" alt="Foto" />
                </div>
              )}
              {esc.fotos_adicionais?.map((f: string, i: number) => (
                <div key={i} className="w-20 h-20 rounded-xl overflow-hidden border border-neutral-200">
                  <img src={f} className="w-full h-full object-cover" alt="Extra" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Ações */}
      <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-100 flex flex-col sm:flex-row items-center justify-end gap-3">
        <Button variant="danger" onClick={onReject} disabled={loading} className="w-full sm:w-auto bg-red-50 text-red-600 hover:bg-red-100 h-11 px-8">
          <X size={16} /> Rejeitar
        </Button>
        <Button variant="dark" onClick={onApprove} loading={loading} className="w-full sm:w-auto h-11 px-8">
          <Check size={16} /> Aprovar Escolinha
        </Button>
      </div>
    </div>
  )
}


// ═══════════════════════════════════════════════════════════════
// Helper Components
// ═══════════════════════════════════════════════════════════════

function SectionLabel({ label, num }: { label: string; num: number }) {
  return (
    <h4 className="text-xs uppercase tracking-wider text-neutral-400 font-bold flex items-center gap-2 mb-3">
      <span className="w-5 h-5 rounded-full bg-neutral-200 text-neutral-600 flex items-center justify-center text-[10px] font-black">{num}</span>
      {label}
    </h4>
  )
}

function InfoBadge({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-medium">{label}</span>
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

function SkillBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs">
        <span className="text-neutral-600 font-medium">{label}</span>
        <span className="text-neutral-900 font-bold">{value}</span>
      </div>
      <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
        <div 
          className="h-full bg-green-500 rounded-full transition-all" 
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  )
}

function ConfigBadge({ label, active }: { label: string; active: boolean }) {
  return (
    <div className={cn(
      "flex items-center justify-center gap-1.5 px-2 py-2 rounded-lg text-xs font-medium border",
      active ? "bg-green-50 text-green-700 border-green-200" : "bg-neutral-50 text-neutral-400 border-neutral-200"
    )}>
      <div className={cn("w-2 h-2 rounded-full", active ? "bg-green-500" : "bg-neutral-300")} />
      {label}
    </div>
  )
}

function EmptyState({ message, icon }: { message: string; icon: React.ReactNode }) {
  return (
    <div className="p-16 border-2 border-dashed border-neutral-200 bg-neutral-50/50 rounded-2xl flex flex-col items-center justify-center text-neutral-400">
      <div className="text-neutral-300 mb-4">{icon}</div>
      <p className="text-base font-medium text-neutral-500">{message}</p>
    </div>
  )
}

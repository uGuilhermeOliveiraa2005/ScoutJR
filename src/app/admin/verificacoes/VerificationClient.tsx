'use client'

import { useState } from 'react'
import { Check, X, User, Landmark, Clock, Eye, MessageCircle, MapPin, Calendar, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { aprovarPerfil, rejeitarPerfil } from './actions'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

export function VerificationClient({ initialData }: any) {
  const [data, setData] = useState(initialData)
  const [tab, setTab] = useState<'atletas' | 'escolinhas'>('atletas')
  const [loading, setLoading] = useState<string | null>(null)

  const handleAprovar = async (id: string, tipo: 'profile' | 'atleta') => {
    setLoading(id)
    const res = await aprovarPerfil(id, tipo)
    setLoading(null)
    if (res?.success) {
      toast.success('Aprovado com sucesso!')
      setData((prev: any) => ({
        ...prev,
        [tipo === 'atleta' ? 'atletas' : 'profiles']: prev[tipo === 'atleta' ? 'atletas' : 'profiles'].filter((item: any) => item.id !== id)
      }))
    } else {
      toast.error(res?.error || 'Erro ao aprovar')
    }
  }

  const handleRejeitar = async (id: string, tipo: 'profile' | 'atleta') => {
    if (!confirm('Tem certeza que deseja rejeitar?')) return
    setLoading(id)
    const res = await rejeitarPerfil(id, tipo)
    setLoading(null)
    if (res?.success) {
      toast.error('Rejeitado com sucesso')
      setData((prev: any) => ({
        ...prev,
        [tipo === 'atleta' ? 'atletas' : 'profiles']: prev[tipo === 'atleta' ? 'atletas' : 'profiles'].filter((item: any) => item.id !== id)
      }))
    } else {
      toast.error(res?.error || 'Erro ao rejeitar')
    }
  }

  const pendingCount = (data.atletas.length + data.profiles.length)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2 p-1 bg-neutral-200/50 rounded-xl w-fit">
        <button
          onClick={() => setTab('atletas')}
          className={cn(
            "px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
            tab === 'atletas' ? "bg-white text-green-700 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
          )}
        >
          <User size={16} /> Atletas ({data.atletas.length})
        </button>
        <button
          onClick={() => setTab('escolinhas')}
          className={cn(
            "px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2",
            tab === 'escolinhas' ? "bg-white text-green-700 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
          )}
        >
          <Landmark size={16} /> Escolinhas ({data.profiles.length})
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {tab === 'atletas' ? (
          data.atletas.length === 0 ? (
            <EmptyState message="Nenhum atleta pendente." />
          ) : (
            data.atletas.map((atleta: any) => (
              <AtletaCard
                key={atleta.id}
                atleta={atleta}
                onApprove={() => handleAprovar(atleta.id, 'atleta')}
                onReject={() => handleRejeitar(atleta.id, 'atleta')}
                loading={loading === atleta.id}
              />
            ))
          )
        ) : (
          data.profiles.length === 0 ? (
            <EmptyState message="Nenhuma escolinha pendente." />
          ) : (
            data.profiles.map((profile: any) => (
              <EscolinhaCard
                key={profile.id}
                profile={profile}
                onApprove={() => handleAprovar(profile.id, 'profile')}
                onReject={() => handleRejeitar(profile.id, 'profile')}
                loading={loading === profile.id}
              />
            ))
          )
        )}
      </div>
    </div>
  )
}

function AtletaCard({ atleta, onApprove, onReject, loading }: any) {
  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row gap-6 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex-1 flex flex-col sm:flex-row gap-5">
        <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 border border-neutral-100">
          <img src={atleta.foto_url} className="w-full h-full object-cover" alt={atleta.nome} />
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-display text-green-700 uppercase">{atleta.nome}</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold uppercase tracking-wider">Pendente</span>
            </div>
            <p className="text-sm text-neutral-500 line-clamp-2 italic">"{atleta.descricao}"</p>
          </div>
          
          <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
            <InfoItem icon={<Calendar size={12} />} label="Nascimento" value={atleta.data_nascimento} />
            <InfoItem icon={<MapPin size={12} />} label="Local" value={`${atleta.cidade}, ${atleta.estado}`} />
            <InfoItem icon={<User size={12} />} label="Posição" value={atleta.posicao} />
            <InfoItem icon={<Smartphone size={12} />} label="Fone Pai" value={atleta.responsavel?.telefone} />
          </div>
        </div>
      </div>
      
      <div className="flex flex-row md:flex-col gap-3 justify-end md:justify-center border-t md:border-t-0 md:border-l border-neutral-100 pt-4 md:pt-0 md:pl-6">
        <Button variant="dark" onClick={onApprove} loading={loading} className="px-8 bg-green-700 hover:bg-green-800">
          <Check size={16} /> Aprovar
        </Button>
        <Button variant="outline" onClick={onReject} disabled={loading} className="text-red-500 hover:bg-red-50 hover:text-red-600 border-red-100">
          <X size={16} /> Rejeitar
        </Button>
      </div>
    </div>
  )
}

function EscolinhaCard({ profile, onApprove, onReject, loading }: any) {
  const esc = profile.escolinha
  return (
    <div className="bg-white border border-neutral-200 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col md:flex-row gap-6 animate-in fade-in slide-in-from-bottom-2">
      <div className="flex-1 flex flex-col sm:flex-row gap-5">
        <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 border border-neutral-100 bg-neutral-50 flex items-center justify-center text-neutral-300">
          {esc?.foto_url ? <img src={esc.foto_url} className="w-full h-full object-cover" alt={profile.nome} /> : <Landmark size={40} />}
        </div>
        <div className="flex-1 space-y-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-display text-green-700 uppercase">{profile.nome}</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold uppercase tracking-wider">Pendente</span>
            </div>
            <p className="text-sm text-neutral-500 line-clamp-2 italic">"{esc?.descricao || 'Sem descrição'}"</p>
          </div>
          
          <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
            <InfoItem icon={<MapPin size={12} />} label="Local" value={`${esc?.cidade || '—'}, ${esc?.estado || '—'}`} />
            <InfoItem icon={<Smartphone size={12} />} label="Telefone" value={profile.telefone} />
            <InfoItem icon={<Clock size={12} />} label="Criado em" value={new Date(profile.created_at).toLocaleDateString()} />
          </div>
        </div>
      </div>
      
      <div className="flex flex-row md:flex-col gap-3 justify-end md:justify-center border-t md:border-t-0 md:border-l border-neutral-100 pt-4 md:pt-0 md:pl-6">
        <Button variant="dark" onClick={onApprove} loading={loading} className="px-8 bg-green-700 hover:bg-green-800">
          <Check size={16} /> Aprovar
        </Button>
        <Button variant="outline" onClick={onReject} disabled={loading} className="text-red-500 hover:bg-red-50 hover:text-red-600 border-red-100">
          <X size={16} /> Rejeitar
        </Button>
      </div>
    </div>
  )
}

function InfoItem({ icon, label, value }: any) {
  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <span className="text-neutral-400 flex-shrink-0">{icon}</span>
      <span className="text-neutral-500">{label}:</span>
      <span className="text-neutral-800 font-medium truncate">{value}</span>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="p-12 border-2 border-dashed border-neutral-200 rounded-2xl flex flex-col items-center justify-center text-neutral-400">
      <Clock size={32} className="mb-2 opacity-20" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  )
}

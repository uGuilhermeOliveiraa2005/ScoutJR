'use client'

import { useState, useEffect } from 'react'
import { 
  Users, Landmark, ShieldCheck, TrendingUp, Search, 
  ArrowRight, Mail, Clock, Check, X, 
  AlertTriangle, Filter, LayoutDashboard, UserPlus, 
  ChevronRight, Activity, Smartphone, Eye, Trophy
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { 
  getAdminDashboardData, 
  getAdminPendentes, 
  getAdminUsersList, 
  getAdminAtletasList,
  aprovarPerfil,
  rejeitarPerfil
} from './actions'

type Tab = 'overview' | 'verificacoes' | 'usuarios' | 'atletas'

export function AdminClient({ initialData }: any) {
  const [tab, setTab] = useState<Tab>('overview')
  const [dashboardData, setDashboardData] = useState(initialData.dashboard)
  const [pendentes, setPendentes] = useState(initialData.pendentes)
  const [users, setUsers] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  // ═══════════════════════════════════════════════════════════════
  // REFRESH DATA
  // ═══════════════════════════════════════════════════════════════
  
  const refreshPendentes = async () => {
    const res = await getAdminPendentes()
    if ('responsaveis' in res) setPendentes(res)
  }

  const refreshDashboard = async () => {
    const res = await getAdminDashboardData()
    if ('stats' in res) setDashboardData(res)
  }

  const loadUsers = async (q: string) => {
    setLoading(true)
    const res = await getAdminUsersList(q)
    if (res && 'users' in res) setUsers(res.users || [])
    setLoading(false)
  }

  useEffect(() => {
    if (tab === 'usuarios') loadUsers(search)
  }, [tab, search])

  // ═══════════════════════════════════════════════════════════════
  // ACTIONS
  // ═══════════════════════════════════════════════════════════════
  
  const handleApprove = async (id: string, nome: string) => {
    setActionLoading(id)
    const res = await aprovarPerfil(id)
    if (res.success) {
      toast.success(`${nome} aprovado com sucesso!`)
      refreshPendentes()
      refreshDashboard()
    } else {
      toast.error(res.error || 'Erro ao aprovar')
    }
    setActionLoading(null)
  }

  const handleReject = async (id: string, nome: string) => {
    if (!confirm(`Tem certeza que deseja REJEITAR e EXCLUIR permanentemente ${nome}?`)) return
    setActionLoading(id)
    const res = await rejeitarPerfil(id)
    if (res.success) {
      toast.error(`${nome} removido do sistema.`)
      refreshPendentes()
      refreshDashboard()
    } else {
      toast.error(res.error || 'Erro ao excluir')
    }
    setActionLoading(null)
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-700">
      
      {/* ── Tabs de Navegação (Ultra Responsivo) ── */}
      <div className="flex items-center gap-1.5 p-1 bg-white border border-neutral-200 rounded-xl w-full sm:w-fit shadow-sm overflow-x-auto no-scrollbar">
        <TabButton active={tab === 'overview'} onClick={() => setTab('overview')} label="Geral" icon={<LayoutDashboard size={14} />} />
        <TabButton 
          active={tab === 'verificacoes'} 
          onClick={() => setTab('verificacoes')} 
          label="Verificações" 
          icon={<ShieldCheck size={14} />} 
          count={dashboardData.stats.totalPendentes} 
        />
        <TabButton active={tab === 'usuarios'} onClick={() => setTab('usuarios')} label="Membros" icon={<Users size={14} />} />
        <TabButton active={tab === 'atletas'} onClick={() => setTab('atletas')} label="Base de Atletas" icon={<TrendingUp size={14} />} />
      </div>

      {/* ── Conteúdo das Abas ── */}
      <div className="min-h-[60vh]">
        {tab === 'overview' && (
          <OverviewTab stats={dashboardData.stats} recentUsers={dashboardData.recentUsers} />
        )}

        {tab === 'verificacoes' && (
          <VerificacoesTab 
            data={pendentes} 
            onApprove={handleApprove} 
            onReject={handleReject} 
            loadingId={actionLoading} 
          />
        )}

        {tab === 'usuarios' && (
          <UsersTab 
            users={users} 
            search={search} 
            setSearch={setSearch} 
            loading={loading} 
          />
        )}

        {tab === 'atletas' && (
          <div className="p-8 text-center bg-white border border-neutral-200 rounded-2xl">
            <Trophy size={48} className="mx-auto text-neutral-200 mb-4" />
            <h3 className="text-lg font-display text-neutral-900">Base Completa de Atletas</h3>
            <p className="text-sm text-neutral-500 max-w-sm mx-auto mt-2">
              Em breve: Busca avançada e relatórios de desempenho de todos os {dashboardData.stats.totalAtletas} atletas da plataforma.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════════════════════════════
// SUB-COMPONENTES DE INTERFACE
// ═══════════════════════════════════════════════════════════════

function TabButton({ active, onClick, label, icon, count }: any) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex-1 sm:flex-initial px-4 sm:px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 whitespace-nowrap",
        active 
          ? "bg-green-600 text-white shadow-md scale-[1.02]" 
          : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
      )}
    >
      {icon} {label}
      {count > 0 && <span className={cn("ml-1 px-1.5 py-0.5 rounded-full text-[10px]", active ? "bg-white/20 text-white" : "bg-red-500 text-white")}>{count}</span>}
    </button>
  )
}

// ── Aba 1: Visão Geral ──
function OverviewTab({ stats, recentUsers }: any) {
  return (
    <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* Grid de Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Membros" value={stats.totalUsers} icon={<Users />} color="green" />
        <StatCard label="Atletas" value={stats.totalAtletas} icon={<TrendingUp />} color="amber" />
        <StatCard label="Escolinhas" value={stats.totalEscolinhas} icon={<Landmark />} color="blue" />
        <StatCard label="Pendências" value={stats.totalPendentes} icon={<ShieldCheck />} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-2">
        {/* Atividade Recente */}
        <div className="lg:col-span-2 bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-lg text-neutral-900 flex items-center gap-2">
              <Activity size={18} className="text-green-500" /> Cadastros Recentes
            </h3>
            <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-widest">Últimos 5</span>
          </div>
          
          <div className="flex flex-col gap-4">
            {recentUsers.map((u: any) => (
              <div key={u.id} className="flex items-center gap-4 p-3 hover:bg-neutral-50 rounded-xl transition-colors border border-transparent hover:border-neutral-100">
                <Avatar src={u.foto_url} nome={u.nome} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-neutral-900 truncate uppercase">{u.nome}</p>
                  <p className="text-xs text-neutral-500 truncate">{u.email} • {u.role}</p>
                </div>
                <div className="text-right flex flex-col items-end gap-1">
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tighter",
                    u.status === 'ativo' ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                  )}>
                    {u.status}
                  </span>
                  <span className="text-[10px] text-neutral-400">{new Date(u.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Info Direcional */}
        <div className="bg-green-900 text-white rounded-2xl p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="font-display text-xl mb-3 leading-tight text-green-100">Bem-vindo ao Painel ScoutJR</h3>
            <p className="text-sm text-green-300 leading-relaxed">
              Aqui você tem controle total sobre a base de talentos. Analise pendências com rigor para manter a qualidade da plataforma.
            </p>
          </div>
          <div className="mt-8 pt-6 border-t border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <ShieldCheck className="text-amber-400" />
              </div>
              <div>
                <p className="text-xs font-bold text-green-100 uppercase tracking-widest">Status Sistema</p>
                <p className="text-xs text-green-400">Ambiente Produção 100% OK</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Aba 2: Verificações ──
function VerificacoesTab({ data, onApprove, onReject, loadingId }: any) {
  const total = (data.responsaveis?.length || 0) + (data.escolinhas?.length || 0)

  if (total === 0) {
    return (
      <div className="p-20 border-2 border-dashed border-neutral-200 rounded-2xl flex flex-col items-center justify-center text-center bg-white">
        <ShieldCheck size={48} className="text-neutral-200 mb-4" />
        <h3 className="text-lg font-display text-neutral-900">Tudo em dia!</h3>
        <p className="text-sm text-neutral-500">Não há solicitações de verificação pendentes no momento.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8 animate-in slide-in-from-right-4 duration-500">
      {/* Renderizar Responsáveis */}
      {data.responsaveis.map((resp: any) => (
        <AdminCard key={resp.id} item={resp} type="responsavel" onApprove={onApprove} onReject={onReject} loading={loadingId === resp.id} />
      ))}
      {/* Renderizar Escolinhas */}
      {data.escolinhas.map((esc: any) => (
        <AdminCard key={esc.id} item={esc} type="escolinha" onApprove={onApprove} onReject={onReject} loading={loadingId === esc.id} />
      ))}
    </div>
  )
}

// ── Aba 3: Membros (Lista Total) ──
function UsersTab({ users, search, setSearch, loading }: any) {
  return (
    <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden animate-in slide-in-from-left-4 duration-500">
      <div className="p-5 border-b border-neutral-100 flex flex-col sm:flex-row items-center gap-4 bg-neutral-50/50">
        <div className="relative flex-1 w-full">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input 
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-neutral-200 rounded-xl outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 bg-white"
            placeholder="Buscar por nome ou e-mail..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{users.length} Encontrados</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-100 text-[10px] uppercase tracking-widest text-neutral-400 font-bold">
              <th className="px-6 py-4">Membro</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Criado em</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50">
            {loading ? (
              [1,2,3,4,5].map(i => <tr key={i} className="animate-pulse"><td colSpan={5} className="h-16 bg-neutral-50/10"></td></tr>)
            ) : users.map((u: any) => (
              <tr key={u.id} className="hover:bg-neutral-50 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar src={u.foto_url} nome={u.nome} size="sm" />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-neutral-900 group-hover:text-green-700 transition-colors truncate">{u.nome}</p>
                      <p className="text-[10px] text-neutral-400 truncate">{u.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest",
                    u.role === 'admin' ? "bg-purple-100 text-purple-700" : 
                    u.role === 'clube' ? "bg-blue-100 text-blue-700" : "bg-neutral-100 text-neutral-600"
                  )}>
                    {u.role}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5">
                    <div className={cn("w-1.5 h-1.5 rounded-full", u.status === 'ativo' ? "bg-green-500" : "bg-amber-400")} />
                    <span className="text-xs text-neutral-600 capitalize">{u.status}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-xs text-neutral-500">
                  {new Date(u.created_at).toLocaleDateString('pt-BR')}
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 text-neutral-300 hover:text-green-600 transition-colors">
                    <Eye size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ── Helpers Gerais ──

function StatCard({ label, value, icon, color }: any) {
  const colors: any = {
    green: 'bg-green-100 text-green-700',
    amber: 'bg-amber-100 text-amber-700',
    blue: 'bg-blue-100 text-blue-700',
    red: 'bg-red-100 text-red-700'
  }
  return (
    <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-sm flex flex-col gap-2">
      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", colors[color])}>
        {icon}
      </div>
      <div>
        <div className="text-2xl font-display text-neutral-900">{value}</div>
        <div className="text-[10px] uppercase font-bold text-neutral-400 tracking-widest">{label}</div>
      </div>
    </div>
  )
}

// Card unificado para as Verificações (simplificado do original)
function AdminCard({ item, type, onApprove, onReject, loading }: any) {
  const isEscolinha = type === 'escolinha'
  return (
    <div className={cn("bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm transition-all", loading && "opacity-60 scale-[0.98]")}>
       <div className={cn("px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4", isEscolinha ? "bg-amber-50/50" : "bg-green-50/50")}>
          <Avatar src={item.foto_url} nome={item.nome} size="xl" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
               <span className={cn("text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-widest", isEscolinha ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700")}>
                 {isEscolinha ? 'Escolinha' : 'Responsável'}
               </span>
               {item.status === 'pendente' && <span className="text-[9px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full uppercase tracking-widest">Aprovação Necessária</span>}
            </div>
            <h3 className="text-xl font-display text-neutral-900 uppercase truncate">{item.nome}</h3>
            <p className="text-xs text-neutral-500">{item.email} • {new Date(item.created_at).toLocaleDateString()}</p>
          </div>
          <div className="flex items-center gap-2">
             <Button variant="danger" size="sm" onClick={() => onReject(item.id, item.nome)} disabled={loading} className="bg-red-50 text-red-600 hover:bg-red-100 border-none">
               <X size={16} /> Rejeitar
             </Button>
             <Button variant="dark" size="sm" onClick={() => onApprove(item.id, item.nome)} loading={loading}>
               <Check size={16} /> Aprovar Permanente
             </Button>
          </div>
       </div>
       
       {!isEscolinha && item.atletas?.length > 0 && (
         <div className="px-6 py-4 border-t border-neutral-100 bg-white flex flex-col gap-3">
            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Atletas Vinculados</p>
            {item.atletas.map((atleta: any) => (
              <div key={atleta.id} className="flex items-center gap-3 p-2 bg-neutral-50 rounded-lg border border-neutral-100">
                <Avatar src={atleta.foto_url} nome={atleta.nome} size="sm" />
                <div className="flex-1">
                  <p className="text-xs font-bold text-neutral-700">{atleta.nome.toUpperCase()}</p>
                  <p className="text-[10px] text-neutral-500">{atleta.posicao} • {atleta.status}</p>
                </div>
              </div>
            ))}
         </div>
       )}
    </div>
  )
}

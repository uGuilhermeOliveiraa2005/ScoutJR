'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase'
import { Bell, Star, Send, ArrowRight } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import Link from 'next/link'

export function RecentActivity({ userId, limit = 5 }: { userId: string; limit?: number }) {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createSupabaseBrowser()

  useEffect(() => {
    if (!userId) return
    async function fetch() {
      const { data } = await supabase
        .from('notificacoes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)
      setNotifications(data ?? [])
      setLoading(false)
    }
    fetch()
    
    // 2. Escuta eventos do useRealtimeNotifications
    const handleNewNotif = (e: any) => {
      const n = e.detail
      if (n) {
        setNotifications(prev => [n, ...prev].slice(0, limit))
      }
    }

    window.addEventListener('scoutjr:notification', handleNewNotif as any)
    return () => {
      window.removeEventListener('scoutjr:notification', handleNewNotif as any)
    }
  }, [userId, limit])

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="w-8 h-8 rounded-lg bg-neutral-100 flex-shrink-0" />
            <div className="flex-1 space-y-1.5 py-0.5">
              <div className="h-3 bg-neutral-100 rounded w-3/4" />
              <div className="h-2.5 bg-neutral-100 rounded w-full" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <div className="py-8 text-center">
        <Bell size={24} className="text-neutral-200 mx-auto mb-2" />
        <p className="text-xs text-neutral-400">Nenhuma atividade ainda.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-1">
      {notifications.map(n => {
        const atletaId = n.metadata?.atleta_id
        const escolinhaId = n.metadata?.escolinha_id

        // Responsável recebeu (favorito/interesse) → vai para a escolinha
        // Escolinha recebeu (novo atleta na posição) → vai para o atleta
        const verPerfilHref = escolinhaId
          ? `/escolinha/${escolinhaId}`
          : atletaId
            ? `/perfil/${atletaId}`
            : null

        const iconMap: Record<string, React.ReactNode> = {
          favorito: <Star size={13} fill="currentColor" />,
          interesse: <Send size={13} />,
          sistema: <Bell size={13} />,
        }
        const colorMap: Record<string, string> = {
          favorito: 'bg-amber-100 text-amber-600',
          interesse: 'bg-blue-100  text-blue-600',
          sistema: 'bg-green-100 text-green-600',
        }

        return (
          <div key={n.id} className={cn(
            'flex gap-3 p-3 rounded-xl transition-colors hover:bg-neutral-50',
            !n.lida && 'bg-green-50/40'
          )}>
            {/* Ícone */}
            <div className={cn(
              'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
              colorMap[n.tipo] ?? 'bg-neutral-100 text-neutral-500'
            )}>
              {iconMap[n.tipo] ?? <Bell size={13} />}
            </div>

            {/* Texto */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-neutral-900 leading-tight">
                {n.titulo}
              </p>
              <p className="text-[11px] text-neutral-500 mt-0.5 leading-normal line-clamp-2">
                {n.mensagem}
              </p>

              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-[9px] text-neutral-400">
                  {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: ptBR })}
                </span>

                {/* Botão Ver perfil */}
                {verPerfilHref && (
                  <Link
                    href={verPerfilHref}
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 px-2 py-0.5 rounded-full transition-colors"
                  >
                    Ver perfil <ArrowRight size={9} />
                  </Link>
                )}
              </div>
            </div>

            {/* Indicador não lida */}
            {!n.lida && (
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0 mt-1" />
            )}
          </div>
        )
      })}

      <div className="pt-1 text-center">
        <Link
          href="/notificacoes"
          className="text-[10px] font-bold text-green-700 uppercase tracking-widest hover:text-green-800 transition-colors"
        >
          Ver todas →
        </Link>
      </div>
    </div>
  )
}
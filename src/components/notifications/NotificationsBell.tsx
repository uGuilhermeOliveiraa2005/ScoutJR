'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase'
import { Bell, Star, Send, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import Link from 'next/link'

export function NotificationsBell({ userId }: { userId: string }) {
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const supabase = createSupabaseBrowser()

  useEffect(() => {
    if (!userId) return
    async function fetch() {
      const { data } = await supabase
        .from('notificacoes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10)
      if (data) {
        setNotifications(data)
        setUnreadCount(data.filter((n: any) => !n.lida).length)
      }
    }
    fetch()

    // 2. Escuta eventos do useRealtimeNotifications (para evitar conexão duplicada)
    const handleNewNotif = (e: any) => {
      const n = e.detail
      if (n) {
        setNotifications(prev => [n, ...prev].slice(0, 10))
        setUnreadCount(prev => prev + 1)
      }
    }

    window.addEventListener('scoutjr:notification', handleNewNotif as any)
    return () => {
      window.removeEventListener('scoutjr:notification', handleNewNotif as any)
    }
  }, [userId, supabase])

  async function markAsRead() {
    if (unreadCount === 0) return
    await supabase.from('notificacoes').update({ lida: true }).eq('user_id', userId).eq('lida', false)
    setUnreadCount(0)
    setNotifications(prev => prev.map((n: any) => ({ ...n, lida: true })))
  }

  return (
    <div className="relative">
      <button
        onClick={() => { setIsOpen(v => !v); if (!isOpen) markAsRead() }}
        className="p-2 rounded-lg hover:bg-neutral-100 transition-colors relative"
        aria-label="Notificações"
      >
        <Bell size={20} className="text-neutral-500" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 text-white text-[7px] flex items-center justify-center rounded-full font-bold ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] md:bg-transparent md:backdrop-blur-0"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-x-4 top-20 md:absolute md:inset-auto md:right-0 md:top-full mt-2 md:w-80 bg-white border border-neutral-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">

            <div className="p-4 border-b border-neutral-100 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-neutral-900">Notificações</h3>
              {unreadCount > 0 && (
                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                  {unreadCount} nova{unreadCount > 1 ? 's' : ''}
                </span>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto scrollbar-hide">
              {notifications.length > 0
                ? notifications.map(n => (
                  <NotificationItem key={n.id} n={n} onClose={() => setIsOpen(false)} />
                ))
                : (
                  <div className="py-12 text-center">
                    <Bell size={24} className="text-neutral-200 mx-auto mb-2" />
                    <p className="text-xs text-neutral-400">Nenhuma notificação por enquanto.</p>
                  </div>
                )
              }
            </div>

            <div className="p-3 bg-neutral-50 border-t border-neutral-100 text-center">
              <Link href="/notificacoes" onClick={() => setIsOpen(false)}
                className="text-[10px] font-bold text-green-700 uppercase tracking-widest hover:text-green-800 transition-colors block w-full py-1">
                Ver todas as notificações
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// ── Item de notificação ─────────────────────────────────────────

function NotificationItem({ n, onClose }: { n: any; onClose: () => void }) {
  const atletaId = n.metadata?.atleta_id
  const escolinhaId = n.metadata?.escolinha_id

  // Destino do botão "Ver perfil":
  // - tem escolinha_id → responsável recebeu (favorito/interesse) → vai para a escolinha
  // - tem atleta_id mas não escolinha_id → escolinha recebeu (novo atleta) → vai para o atleta
  const verPerfilHref = escolinhaId
    ? `/escolinha/${escolinhaId}`
    : atletaId
      ? `/perfil/${atletaId}`
      : null

  const iconMap: Record<string, React.ReactNode> = {
    favorito: <Star size={14} fill="currentColor" />,
    interesse: <Send size={14} />,
    sistema: <Bell size={14} />,
  }
  const colorMap: Record<string, string> = {
    favorito: 'bg-amber-100 text-amber-600',
    interesse: 'bg-blue-100 text-blue-600',
    sistema: 'bg-green-100 text-green-600',
  }

  return (
    <div className={cn(
      'p-4 border-b border-neutral-50 last:border-none hover:bg-neutral-50 transition-colors',
      !n.lida && 'bg-green-50/30'
    )}>
      <div className="flex gap-3">
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0', colorMap[n.tipo] ?? 'bg-neutral-100 text-neutral-500')}>
          {iconMap[n.tipo] ?? <Bell size={14} />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-neutral-900 leading-tight mb-0.5">
            {n.titulo}
          </p>
          <p className="text-[11px] text-neutral-500 leading-normal line-clamp-2">
            {n.mensagem}
          </p>
          <p className="text-[9px] text-neutral-400 mt-1.5">
            {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: ptBR })}
          </p>

          {/* Botão Ver perfil */}
          {verPerfilHref && (
            <Link
              href={verPerfilHref}
              onClick={onClose}
              className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 px-2.5 py-1 rounded-full transition-colors"
            >
              Ver perfil <ArrowRight size={10} />
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
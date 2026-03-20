'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase'
import { Bell, Star, MessageCircle, Send, Check } from 'lucide-react'
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

    // Fetch initial notifications
    async function fetchNotifications() {
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

    fetchNotifications()

    // Subscribe to new notifications
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notificacoes',
          filter: `user_id=eq.${userId}`
        },
        (payload: any) => {
          setNotifications(prev => [payload.new, ...prev].slice(0, 10))
          setUnreadCount(prev => prev + 1)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  async function markAsRead() {
    if (unreadCount === 0) return

    const { error } = await supabase
      .from('notificacoes')
      .update({ lida: true })
      .eq('user_id', userId)
      .eq('lida', false)

    if (!error) {
      setUnreadCount(0)
      setNotifications(prev => prev.map((n: any) => ({ ...n, lida: true })))
    }
  }

  const toggleOpen = () => {
    setIsOpen(!isOpen)
    if (!isOpen) markAsRead()
  }

  return (
    <div className="relative">
      <button
        onClick={toggleOpen}
        className="p-2 rounded-lg hover:bg-neutral-100 transition-colors relative"
        aria-label="Notificações"
      >
        <Bell size={20} className="text-neutral-500" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 text-white text-[7px] flex items-center justify-center rounded-full font-bold animate-in zoom-in duration-300 ring-2 ring-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] md:bg-transparent md:backdrop-blur-0" onClick={() => setIsOpen(false)} />
          <div className="fixed inset-x-4 top-20 md:absolute md:inset-auto md:right-0 md:top-full mt-2 md:w-80 bg-white border border-neutral-200 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="p-4 border-b border-neutral-100 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-neutral-900">Notificações</h3>
              {unreadCount > 0 && (
                <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">
                  Novas
                </span>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto scrollbar-hide">
              {notifications.length > 0 ? (
                notifications.map((n: any) => (
                  <div
                    key={n.id}
                    className={cn(
                      "p-4 border-b border-neutral-50 last:border-none hover:bg-neutral-50 transition-colors cursor-default",
                      !n.lida && "bg-green-50/30"
                    )}
                  >
                    <div className="flex gap-3">
                      <div className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                        n.tipo === 'favorito' ? 'bg-amber-100 text-amber-600' :
                          n.tipo === 'interesse' ? 'bg-blue-100 text-blue-600' :
                            'bg-green-100 text-green-600'
                      )}>
                        {n.tipo === 'favorito' && <Star size={14} fill="currentColor" />}
                        {n.tipo === 'interesse' && <Send size={14} />}
                        {n.tipo === 'sistema' && <Bell size={14} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-neutral-900 leading-tight mb-1">
                          {n.titulo}
                        </p>
                        <p className="text-[11px] text-neutral-500 leading-normal">
                          {n.mensagem}
                        </p>
                        <p className="text-[9px] text-neutral-400 mt-2">
                          {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center">
                  <Bell size={24} className="text-neutral-200 mx-auto mb-2" />
                  <p className="text-xs text-neutral-400">Nenhuma notificação por enquanto.</p>
                </div>
              )}
            </div>

            <div className="p-3 bg-neutral-50 border-t border-neutral-100 text-center">
              <Link
                href="/notificacoes"
                onClick={() => setIsOpen(false)}
                className="text-[10px] font-bold text-green-700 uppercase tracking-widest hover:text-green-800 transition-colors block w-full py-1"
              >
                Ver todas as notificações
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
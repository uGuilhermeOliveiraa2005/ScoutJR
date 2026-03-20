'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase'
import { Star, Send, Bell, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function RecentActivity({ userId, limit = 5 }: { userId: string, limit?: number }) {
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createSupabaseBrowser()

  useEffect(() => {
    if (!userId) return

    async function fetchActivity() {
      const { data } = await supabase
        .from('notificacoes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)
      
      if (data) setNotifications(data)
      setLoading(false)
    }

    fetchActivity()

    // Real-time
    const channel = supabase
      .channel('dashboard-activity')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notificacoes',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          setNotifications(prev => [payload.new, ...prev].slice(0, limit))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId])

  if (loading) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-16 bg-neutral-50 animate-pulse rounded-lg" />
        ))}
      </div>
    )
  }

  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-neutral-300">
        <TrendingUp size={28} />
        <p className="text-xs sm:text-sm mt-2 font-medium">Nenhuma atividade recente</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {notifications.map((n) => (
        <div key={n.id} className="flex items-start gap-3 p-3 rounded-xl border border-neutral-100 hover:border-neutral-200 transition-colors bg-neutral-50/50">
          <div className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
            n.tipo === 'favorito' ? 'bg-amber-100 text-amber-600' :
            n.tipo === 'interesse' ? 'bg-blue-100 text-blue-600' :
            'bg-green-100 text-green-600'
          )}>
            {n.tipo === 'favorito' && <Star size={14} fill="currentColor" />}
            {n.tipo === 'interesse' && <Send size={14} />}
            {n.tipo === 'sistema' && <Bell size={14} />}
            {n.tipo === 'contato' && <TrendingUp size={14} />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-neutral-900 leading-tight">
              {n.titulo}
            </p>
            <p className="text-[11px] text-neutral-500 mt-1">
              {n.mensagem}
            </p>
            <p className="text-[9px] text-neutral-400 mt-1.5 font-medium">
              {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: ptBR })}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

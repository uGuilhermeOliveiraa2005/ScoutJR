'use client'

import { useEffect, useRef, useCallback } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase'
import { useNotificationToast } from '@/components/notifications/NotificationToastProvider'

export function useRealtimeNotifications(userId: string | null) {
    const supabase = createSupabaseBrowser()
    const { showToast } = useNotificationToast()
    const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

    const playSound = useCallback(() => {
        try {
            const audio = new Audio('/sounds/notification.mp3')
            audio.volume = 0.5
            audio.play().catch(() => {
                // Autoplay bloqueado pelo browser — ignora silenciosamente
            })
        } catch {
            // Sem suporte a Audio API
        }
    }, [])

    useEffect(() => {
        if (!userId) return

        // Evita canais duplicados em StrictMode
        if (channelRef.current) {
            supabase.removeChannel(channelRef.current)
        }

        const channel = supabase
            .channel(`realtime-notif-${userId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notificacoes',
                    filter: `user_id=eq.${userId}`,
                },
                (payload: any) => {
                    const n = payload.new
                    playSound()
                    showToast({
                        id: n.id,
                        tipo: n.tipo,
                        titulo: n.titulo,
                        mensagem: n.mensagem,
                        metadata: n.metadata,
                        createdAt: n.created_at,
                    })
                }
            )
            .subscribe()

        channelRef.current = channel

        return () => {
            supabase.removeChannel(channel)
            channelRef.current = null
        }
    }, [userId])
}
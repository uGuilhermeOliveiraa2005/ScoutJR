'use client'

import { useEffect, useRef, useCallback } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase'
import { useNotificationToast } from '@/components/notifications/NotificationToastProvider'

export function useRealtimeNotifications(userId: string | null) {
    const supabase = createSupabaseBrowser()
    const { showToast } = useNotificationToast()
    const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

    const audioRef = useRef<HTMLAudioElement | null>(null)

    const playSound = useCallback(() => {
        try {
            if (!audioRef.current) {
                audioRef.current = new Audio('/sounds/notification.mp3')
            }
            const audio = audioRef.current
            audio.volume = 0.6
            audio.currentTime = 0
            audio.play().catch(err => {
                console.info('[ScoutJR] Som bloqueado ou erro:', err.message)
            })
        } catch {
            console.warn('[ScoutJR] Audio API não suportada')
        }
    }, [])

    useEffect(() => {
        if (!userId) {
            console.info('[ScoutJR Realtime] Sem userId — canal não aberto.')
            return
        }

        // Se já existe um canal, não abre outro
        if (channelRef.current) return

        const channelName = `notif-user-${userId}`
        console.info(`[ScoutJR Realtime] Inscrito: ${channelName}`)

        const channel = supabase
            .channel(channelName)
            .on(
                'postgres_changes' as any,
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notificacoes',
                    filter: `user_id=eq.${userId}`,
                },
                (payload: any) => {
                    const n = payload.new
                    if (!n) return

                    console.info('[ScoutJR Realtime] ✅ Evento recebido:', n.id)
                    
                    // 1. Toca o som
                    playSound()

                    // 2. Mostra o Toast
                    showToast({
                        id: n.id ?? String(Date.now()),
                        tipo: n.tipo ?? 'sistema',
                        titulo: n.titulo ?? 'Nova notificação',
                        mensagem: n.mensagem ?? '',
                        metadata: n.metadata ?? {},
                        createdAt: n.created_at ?? new Date().toISOString(),
                    })

                    // 3. Avisa outros componentes (como o Bell) via Custom Event
                    window.dispatchEvent(new CustomEvent('scoutjr:notification', { detail: n }))
                }
            )
            .subscribe((status: string) => {
                console.info(`[ScoutJR Realtime] Canal status: ${status}`)
            })

        channelRef.current = channel

        return () => {
            console.info('[ScoutJR Realtime] Logout/Cleanup canal:', channelName)
            supabase.removeChannel(channel)
            channelRef.current = null
        }
    }, [userId, playSound, showToast, supabase])
}
// src/hooks/useRealtimeNotifications.ts
'use client'

import { useEffect, useRef } from 'react'
import { useNotificationToast } from '@/components/notifications/NotificationToastProvider'
import { subscribeToNotifications, unsubscribeFromNotifications } from '@/lib/realtimeChannel'

export function useRealtimeNotifications(userId: string | null) {
    const { showToast } = useNotificationToast()
    // Ref para evitar closure stale no handler
    const showToastRef = useRef(showToast)
    showToastRef.current = showToast

    useEffect(() => {
        if (!userId) {
            unsubscribeFromNotifications()
            return
        }

        subscribeToNotifications(userId, (n) => {
            // Toca som — novo elemento a cada vez garante replay
            try {
                const audio = new Audio('/sounds/notification.mp3')
                audio.volume = 0.6
                audio.play().catch(() => { })
            } catch { }

            // Mostra toast
            showToastRef.current({
                id: n.id,
                tipo: n.tipo ?? 'sistema',
                titulo: n.titulo ?? 'Nova notificação',
                mensagem: n.mensagem ?? '',
                metadata: n.metadata ?? {},
                createdAt: n.created_at ?? new Date().toISOString(),
            })

            // Avisa Bell e RecentActivity
            window.dispatchEvent(
                new CustomEvent('scoutjr:notification', { detail: n })
            )
        })

        // Não fechamos o canal no cleanup do StrictMode
        // Só fechamos quando userId vira null (logout)
    }, [userId])
}
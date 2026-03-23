// src/hooks/useRealtimeNotifications.ts
'use client'

import { useEffect, useRef } from 'react'
import { useNotificationToast } from '@/components/notifications/NotificationToastProvider'
import { subscribeToNotifications, unsubscribeFromNotifications } from '@/lib/realtimeChannel'

function playNotificationSound() {
    try {
        // Cria um novo elemento a cada vez E usa src com timestamp para burlar cache
        const audio = new Audio()
        audio.src = `/sounds/notification.mp3?t=${Date.now()}`
        audio.volume = 0.6
        audio.load()

        const playPromise = audio.play()
        if (playPromise !== undefined) {
            playPromise.catch(() => {
                // Fallback: tenta novamente após breve delay (útil em alguns browsers)
                setTimeout(() => {
                    const retry = new Audio(`/sounds/notification.mp3?t=${Date.now()}`)
                    retry.volume = 0.6
                    retry.play().catch(() => { })
                }, 100)
            })
        }
    } catch {
        // Silencioso — áudio não é crítico
    }
}

export function useRealtimeNotifications(userId: string | null) {
    const { showToast } = useNotificationToast()
    const showToastRef = useRef(showToast)
    showToastRef.current = showToast

    useEffect(() => {
        if (!userId) {
            unsubscribeFromNotifications()
            return
        }

        subscribeToNotifications(userId, (n) => {
            playNotificationSound()

            showToastRef.current({
                id: n.id,
                tipo: n.tipo ?? 'sistema',
                titulo: n.titulo ?? 'Nova notificação',
                mensagem: n.mensagem ?? '',
                metadata: n.metadata ?? {},
                createdAt: n.created_at ?? new Date().toISOString(),
            })

            window.dispatchEvent(
                new CustomEvent('scoutjr:notification', { detail: n })
            )
        })
    }, [userId])
}
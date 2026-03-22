'use client'

import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications'

/**
 * Montado uma vez no RootLayout (client boundary).
 * Ativa o canal Supabase Realtime e os toasts de notificação.
 */
export function RealtimeInit({ userId }: { userId: string | null }) {
    useRealtimeNotifications(userId)
    return null
}
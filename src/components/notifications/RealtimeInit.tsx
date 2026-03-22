// src/components/notifications/RealtimeInit.tsx
'use client'

import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications'

/**
 * Componente client montado uma única vez no RootLayout.
 * Não renderiza nada — só abre o canal Supabase Realtime.
 */
export function RealtimeInit({ userId }: { userId: string | null }) {
    useRealtimeNotifications(userId)
    return null
}
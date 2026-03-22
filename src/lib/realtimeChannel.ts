// src/lib/realtimeChannel.ts
// Singleton verdadeiro — vive no escopo do módulo, fora do React
// Garante canal único mesmo com StrictMode montando 2x

import { createSupabaseBrowser } from '@/lib/supabase'

type NotifHandler = (payload: any) => void

let channelInstance: ReturnType<ReturnType<typeof createSupabaseBrowser>['channel']> | null = null
let subscribedUserId: string | null = null
let handler: NotifHandler | null = null
const processedIds = new Set<string>()

export function subscribeToNotifications(userId: string, onNotification: NotifHandler) {
    // Já inscrito para esse usuário — não faz nada
    if (channelInstance && subscribedUserId === userId) {
        // Atualiza o handler caso tenha mudado (e.g. StrictMode remount)
        handler = onNotification
        return
    }

    // Limpa canal anterior se existir
    if (channelInstance) {
        unsubscribeFromNotifications()
    }

    const supabase = createSupabaseBrowser()
    handler = onNotification
    subscribedUserId = userId

    const channel = supabase
        .channel(`notif-${userId}`, { config: { broadcast: { self: false } } })
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
                if (!n?.id) return

                // Deduplica por ID — ignora se já processamos
                if (processedIds.has(n.id)) return
                processedIds.add(n.id)

                // Limpa o ID do set após 60s para não crescer indefinidamente
                setTimeout(() => processedIds.delete(n.id), 60_000)

                // Chama o handler atual (pode ter mudado por remount)
                handler?.(n)
            }
        )
        .subscribe()

    channelInstance = channel
}

export function unsubscribeFromNotifications() {
    if (!channelInstance) return
    const supabase = createSupabaseBrowser()
    supabase.removeChannel(channelInstance)
    channelInstance = null
    subscribedUserId = null
    handler = null
    processedIds.clear()
}
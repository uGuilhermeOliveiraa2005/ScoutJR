'use client'

import {
    createContext,
    useContext,
    useState,
    useCallback,
    useRef,
    useEffect,
} from 'react'
import { createPortal } from 'react-dom'
import { Star, Send, Bell, X, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// ── Tipos ─────────────────────────────────────────────────────

export interface NotifToast {
    id: string
    tipo: string
    titulo: string
    mensagem: string
    metadata?: { atleta_id?: string; escolinha_id?: string }
    createdAt: string
}

interface ToastCtx {
    showToast: (n: NotifToast) => void
}

const ToastContext = createContext<ToastCtx>({ showToast: () => { } })

export function useNotificationToast() {
    return useContext(ToastContext)
}

// ── Constantes ────────────────────────────────────────────────

const DURATION = 5000  // ms
const MAX_VISIBLE = 4

// ── Provider ──────────────────────────────────────────────────

export function NotificationToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<(NotifToast & { visible: boolean })[]>([])
    const [mounted, setMounted] = useState(false)
    const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

    useEffect(() => { setMounted(true) }, [])

    const dismiss = useCallback((id: string) => {
        // 1. Marca invisible → anima saída
        setToasts(prev => prev.map(t => t.id === id ? { ...t, visible: false } : t))
        // 2. Remove da lista após a animação
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 400)
        // 3. Cancela timer
        const t = timers.current.get(id)
        if (t) { clearTimeout(t); timers.current.delete(id) }
    }, [])

    const showToast = useCallback((n: NotifToast) => {
        setToasts(prev => {
            // Evita duplicatas
            if (prev.some(t => t.id === n.id)) return prev
            return [{ ...n, visible: true }, ...prev].slice(0, MAX_VISIBLE)
        })
        const t = setTimeout(() => dismiss(n.id), DURATION)
        timers.current.set(n.id, t)
    }, [dismiss])

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            {mounted && createPortal(
                <ToastStack toasts={toasts} onDismiss={dismiss} />,
                document.body
            )}
        </ToastContext.Provider>
    )
}

// ── Stack ─────────────────────────────────────────────────────

function ToastStack({
    toasts,
    onDismiss,
}: {
    toasts: (NotifToast & { visible: boolean })[]
    onDismiss: (id: string) => void
}) {
    if (toasts.length === 0) return null

    return (
        <div
            className={cn(
                'fixed z-[9999] flex flex-col gap-2.5 pointer-events-none',
                // Mobile: topo, margem lateral
                'top-4 left-3 right-3',
                // Desktop: canto inferior direito, largura fixa
                'sm:top-auto sm:left-auto sm:bottom-6 sm:right-5 sm:w-[360px]',
            )}
            aria-live="polite"
        >
            {toasts.map(t => (
                <NotifToastItem key={t.id} toast={t} onDismiss={onDismiss} />
            ))}
        </div>
    )
}

// ── Item ──────────────────────────────────────────────────────

const TIPO_CFG: Record<string, {
    icon: React.ReactNode
    iconBg: string
    barColor: string
    badge: string
}> = {
    favorito: {
        icon: <Star size={15} fill="currentColor" />,
        iconBg: 'bg-amber-100 text-amber-500',
        barColor: 'bg-amber-400',
        badge: '⭐ Favorito',
    },
    interesse: {
        icon: <Send size={15} />,
        iconBg: 'bg-blue-100 text-blue-500',
        barColor: 'bg-blue-400',
        badge: '🎯 Interesse',
    },
    sistema: {
        icon: <Bell size={15} />,
        iconBg: 'bg-green-100 text-green-600',
        barColor: 'bg-green-500',
        badge: '🔔 Sistema',
    },
    contato: {
        icon: <Bell size={15} />,
        iconBg: 'bg-purple-100 text-purple-600',
        barColor: 'bg-purple-400',
        badge: '💬 Mensagem',
    },
}

function NotifToastItem({
    toast,
    onDismiss,
}: {
    toast: NotifToast & { visible: boolean }
    onDismiss: (id: string) => void
}) {
    const cfg = TIPO_CFG[toast.tipo] ?? TIPO_CFG['sistema']

    const escolinhaId = toast.metadata?.escolinha_id
    const atletaId = toast.metadata?.atleta_id

    const href = escolinhaId
        ? `/escolinha/${escolinhaId}`
        : atletaId
            ? `/perfil/${atletaId}`
            : null

    return (
        <div
            style={{
                transition: 'opacity 0.3s ease, transform 0.3s ease',
                opacity: toast.visible ? 1 : 0,
                transform: toast.visible ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.97)',
            }}
            className={cn(
                'pointer-events-auto relative overflow-hidden',
                'bg-white border border-neutral-200/80 rounded-2xl',
                'shadow-[0_8px_30px_rgba(0,0,0,0.12)]',
                'w-full',
            )}
            role="alert"
        >
            {/* Barra de progresso no topo */}
            <div className="h-0.5 bg-neutral-100 overflow-hidden">
                <div
                    className={cn('h-full', cfg.barColor)}
                    style={{ animation: `scoutjr-shrink ${DURATION}ms linear forwards` }}
                />
            </div>

            <div className="flex items-start gap-3 px-4 py-3.5">
                {/* Ícone tipo */}
                <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5', cfg.iconBg)}>
                    {cfg.icon}
                </div>

                {/* Conteúdo */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={cn('text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full', cfg.iconBg)}>
                            {cfg.badge}
                        </span>
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-neutral-900 leading-snug">
                        {toast.titulo}
                    </p>
                    <p className="text-[11px] text-neutral-500 mt-0.5 leading-normal line-clamp-2">
                        {toast.mensagem}
                    </p>

                    {href && (
                        <Link
                            href={href}
                            onClick={() => onDismiss(toast.id)}
                            className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 px-2.5 py-1 rounded-full transition-colors"
                        >
                            Ver perfil <ArrowRight size={9} />
                        </Link>
                    )}
                </div>

                {/* Botão fechar */}
                <button
                    onClick={() => onDismiss(toast.id)}
                    className="p-1.5 -mr-1 -mt-0.5 rounded-lg text-neutral-300 hover:text-neutral-600 hover:bg-neutral-100 transition-colors flex-shrink-0"
                    aria-label="Fechar notificação"
                >
                    <X size={13} />
                </button>
            </div>

            {/* Keyframe global — injetado inline para não depender do globals.css */}
            <style>{`
        @keyframes scoutjr-shrink {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
        </div>
    )
}
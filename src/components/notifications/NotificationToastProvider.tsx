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

// ── Tipos ────────────────────────────────────────────────────────────────────

export interface NotifToast {
    id: string
    tipo: string
    titulo: string
    mensagem: string
    metadata?: { atleta_id?: string; escolinha_id?: string }
    createdAt: string
}

interface ToastContextValue {
    showToast: (n: NotifToast) => void
}

// ── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue>({ showToast: () => { } })

export function useNotificationToast() {
    return useContext(ToastContext)
}

// ── Provider ─────────────────────────────────────────────────────────────────

const DURATION = 5000   // ms visível
const MAX_VISIBLE = 4      // máximo simultâneo

export function NotificationToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<(NotifToast & { visible: boolean })[]>([])
    const [mounted, setMounted] = useState(false)
    const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

    useEffect(() => { setMounted(true) }, [])

    const dismiss = useCallback((id: string) => {
        setToasts(prev => prev.map(t => t.id === id ? { ...t, visible: false } : t))
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 350)
        const timer = timersRef.current.get(id)
        if (timer) { clearTimeout(timer); timersRef.current.delete(id) }
    }, [])

    const showToast = useCallback((n: NotifToast) => {
        setToasts(prev => {
            const next = [{ ...n, visible: true }, ...prev].slice(0, MAX_VISIBLE)
            return next
        })

        const timer = setTimeout(() => dismiss(n.id), DURATION)
        timersRef.current.set(n.id, timer)
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

// ── Stack ─────────────────────────────────────────────────────────────────────

function ToastStack({
    toasts,
    onDismiss,
}: {
    toasts: (NotifToast & { visible: boolean })[]
    onDismiss: (id: string) => void
}) {
    if (toasts.length === 0) return null

    return (
        // Canto inferior direito no desktop, topo centralizado no mobile
        <div
            className={cn(
                'fixed z-[9999] flex flex-col gap-2.5 pointer-events-none',
                // mobile: topo, largura quase total, centralizado
                'top-4 left-4 right-4',
                // desktop: canto inferior direito, largura fixa
                'sm:top-auto sm:left-auto sm:bottom-6 sm:right-6 sm:w-[360px]',
            )}
            aria-live="polite"
            aria-atomic="false"
        >
            {toasts.map(t => (
                <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />
            ))}
        </div>
    )
}

// ── Item ──────────────────────────────────────────────────────────────────────

const TIPO_CONFIG: Record<string, {
    icon: React.ReactNode
    iconClass: string
    barClass: string
    badge: string
}> = {
    favorito: {
        icon: <Star size={16} fill="currentColor" />,
        iconClass: 'bg-amber-100 text-amber-500',
        barClass: 'bg-amber-400',
        badge: 'Favorito',
    },
    interesse: {
        icon: <Send size={16} />,
        iconClass: 'bg-blue-100 text-blue-500',
        barClass: 'bg-blue-400',
        badge: 'Interesse',
    },
    sistema: {
        icon: <Bell size={16} />,
        iconClass: 'bg-green-100 text-green-600',
        barClass: 'bg-green-400',
        badge: 'Sistema',
    },
}

function ToastItem({
    toast,
    onDismiss,
}: {
    toast: NotifToast & { visible: boolean }
    onDismiss: (id: string) => void
}) {
    const cfg = TIPO_CONFIG[toast.tipo] ?? TIPO_CONFIG['sistema']

    const escolinhaId = toast.metadata?.escolinha_id
    const atletaId = toast.metadata?.atleta_id

    const verPerfilHref = escolinhaId
        ? `/escolinha/${escolinhaId}`
        : atletaId
            ? `/perfil/${atletaId}`
            : null

    return (
        <div
            className={cn(
                // Base
                'pointer-events-auto relative overflow-hidden',
                'bg-white border border-neutral-200 rounded-2xl shadow-2xl shadow-neutral-900/10',
                'w-full',
                // Animação entrada/saída
                'transition-all duration-300 ease-out',
                toast.visible
                    ? 'opacity-100 translate-y-0 scale-100'
                    : 'opacity-0 translate-y-3 scale-95',
            )}
            role="alert"
        >
            {/* Barra de progresso no topo */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-neutral-100">
                <div
                    className={cn('h-full', cfg.barClass)}
                    style={{
                        animation: `shrink ${DURATION}ms linear forwards`,
                    }}
                />
            </div>

            <div className="flex items-start gap-3 p-4 pt-5">
                {/* Ícone */}
                <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0', cfg.iconClass)}>
                    {cfg.icon}
                </div>

                {/* Conteúdo */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className={cn(
                            'text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full',
                            cfg.iconClass
                        )}>
                            {cfg.badge}
                        </span>
                    </div>
                    <p className="text-xs sm:text-sm font-semibold text-neutral-900 leading-tight">
                        {toast.titulo}
                    </p>
                    <p className="text-[11px] text-neutral-500 mt-0.5 leading-normal line-clamp-2">
                        {toast.mensagem}
                    </p>

                    {verPerfilHref && (
                        <Link
                            href={verPerfilHref}
                            onClick={() => onDismiss(toast.id)}
                            className="inline-flex items-center gap-1 mt-2 text-[10px] font-bold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 px-2.5 py-1 rounded-full transition-colors"
                        >
                            Ver perfil <ArrowRight size={9} />
                        </Link>
                    )}
                </div>

                {/* Fechar */}
                <button
                    onClick={() => onDismiss(toast.id)}
                    className="p-1 -mr-1 -mt-0.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors flex-shrink-0"
                    aria-label="Fechar"
                >
                    <X size={14} />
                </button>
            </div>

            {/* CSS da barra */}
            <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to   { width: 0%; }
        }
      `}</style>
        </div>
    )
}
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabase'
import { signOutAction } from './actions'
import { Clock, ShieldCheck, Mail, LogOut, XCircle, RefreshCw, CheckCircle2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { cn } from '@/lib/utils'

export function WaitingClient({ profileId, nome, status: initialStatus }: {
  profileId: string
  nome: string
  status: string
}) {
  const router = useRouter()
  const [status, setStatus] = useState(initialStatus)
  const [transitioning, setTransitioning] = useState(false)

  useEffect(() => {
    if (!profileId) return

    const supabase = createSupabaseBrowser()

    // Subscribe to realtime changes on this profile's row
    const channel = supabase
      .channel(`profile-status-${profileId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Escutar UPDATE e DELETE
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${profileId}`,
        },
        (payload: any) => {
          if (payload.eventType === 'DELETE') {
            setStatus('rejeitado')
            return
          }

          const newStatus = payload.new?.status
          if (newStatus && newStatus !== status) {
            setStatus(newStatus)

            if (newStatus === 'ativo') {
              setTransitioning(true)
              // Small delay so the user sees the success animation
              setTimeout(() => {
                router.push('/dashboard')
                router.refresh()
              }, 2500)
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [profileId, router, status])

  // ── APROVADO (transitioning to dashboard) ──
  if (status === 'ativo' || transitioning) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center px-4 text-center">
        <div className="max-w-md w-full bg-white border border-neutral-200 rounded-3xl p-8 sm:p-10 shadow-xl animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <CheckCircle2 size={40} className="animate-bounce" />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl text-neutral-900 mb-3 tracking-tight">
            CONTA APROVADA! 🎉
          </h1>
          <p className="text-neutral-500 text-sm sm:text-base leading-relaxed mb-8">
            Parabéns, <span className="font-bold text-neutral-800">{nome}</span>!
            Sua conta foi aprovada com sucesso. Você está sendo redirecionado ao painel...
          </p>
          <div className="flex items-center justify-center gap-2 text-green-600">
            <Sparkles size={16} className="animate-spin" />
            <span className="text-sm font-bold uppercase tracking-widest animate-pulse">Entrando...</span>
          </div>
        </div>
      </div>
    )
  }

  // ── REJEITADO ──
  if (status === 'rejeitado') {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center px-4 text-center">
        <div className="max-w-md w-full bg-white border border-neutral-200 rounded-3xl p-8 sm:p-10 shadow-xl animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <XCircle size={40} />
          </div>
          <h1 className="font-display text-2xl sm:text-3xl text-neutral-900 mb-3 tracking-tight">
            VERIFICAÇÃO NÃO APROVADA
          </h1>
          <p className="text-neutral-500 text-sm sm:text-base leading-relaxed mb-6">
            Olá, <span className="font-bold text-neutral-800">{nome}</span>.
            Infelizmente, sua solicitação de cadastro não foi aprovada neste momento.
          </p>

          <div className="bg-red-50 border border-red-100 rounded-2xl p-4 mb-8 text-left">
            <p className="text-xs text-red-700 leading-relaxed font-medium">
              ⚠️ Isso pode acontecer por dados incompletos, informações inconsistentes, ou não conformidade com nossos termos.
              Entre em contato com o suporte se acredita que houve um engano.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Link href="/">
              <Button variant="dark" className="w-full justify-center py-5 text-base">
                Página inicial
              </Button>
            </Link>
            <form action={signOutAction}>
              <Button type="submit" variant="outline" className="w-full justify-center text-neutral-500 hover:text-red-500 hover:bg-neutral-50">
                <LogOut size={16} /> Sair da conta
              </Button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  // ── PENDENTE (aguardando análise) ──
  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center px-4 text-center">
      <div className="max-w-md w-full bg-white border border-neutral-200 rounded-3xl p-8 sm:p-10 shadow-xl animate-in fade-in zoom-in duration-500">
        
        <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
          <Clock size={40} className="animate-pulse" />
        </div>

        <h1 className="font-display text-2xl sm:text-3xl text-neutral-900 mb-3 tracking-tight">
          CONTA EM ANÁLISE
        </h1>
        
        <p className="text-neutral-500 text-sm sm:text-base leading-relaxed mb-8">
          Olá, <span className="font-bold text-neutral-800">{nome}</span>! 
          Recebemos sua solicitação de cadastro. Para garantir a segurança de todos os atletas e clubes, 
          realizamos uma revisão manual de cada perfil.
        </p>

        <div className="space-y-4 mb-8">
          <FeatureItem icon={<ShieldCheck size={18} className="text-green-600" />} text="Segurança garantida para menores" />
          <FeatureItem icon={<Mail size={18} className="text-blue-600" />} text="Notificação por e-mail após aprovação" />
          <FeatureItem icon={<RefreshCw size={18} className="text-purple-600" />} text="Esta página atualiza em tempo real" />
        </div>

        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-8 text-left">
          <p className="text-xs text-amber-700 leading-relaxed font-medium">
            💡 Isso geralmente leva menos de 24 horas úteis. 
            Fique nesta tela — ela será atualizada automaticamente quando houver uma decisão!
          </p>
        </div>

        {/* Realtime indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">Conectado em tempo real</span>
        </div>

        <div className="flex flex-col gap-3">
          <Link href="/">
            <Button variant="dark" className="w-full justify-center py-6 text-base">
              Página inicial
            </Button>
          </Link>
          
          <form action={signOutAction}>
            <Button type="submit" variant="outline" className="w-full justify-center text-neutral-500 hover:text-red-500 hover:bg-neutral-50">
               <LogOut size={16} /> Sair da conta
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

function FeatureItem({ icon, text }: { icon: React.ReactNode, text: string }) {
  return (
    <div className="flex items-center gap-3 text-left bg-neutral-50 p-3 rounded-xl border border-neutral-100">
      <span className="flex-shrink-0">{icon}</span>
      <span className="text-xs sm:text-sm text-neutral-600 font-medium">{text}</span>
    </div>
  )
}

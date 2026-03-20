'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Bell, BellOff, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface PositionAlertButtonProps {
  clubeId: string | null
  posicao: string
}

export function PositionAlertButton({ clubeId, posicao }: PositionAlertButtonProps) {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const supabase = createSupabaseBrowser()
  const router = useRouter()

  useEffect(() => {
    if (!clubeId || !posicao) {
      setChecking(false)
      return
    }

    async function checkSubscription() {
      const { data } = await supabase
        .from('clube_interesses_posicoes')
        .select('id')
        .eq('clube_id', clubeId)
        .eq('posicao', posicao)
        .single()
      
      setIsSubscribed(!!data)
      setChecking(false)
    }

    checkSubscription()
  }, [clubeId, posicao])

  async function toggleAlert() {
    if (!clubeId || !posicao) return
    setLoading(true)

    try {
      if (isSubscribed) {
        await supabase
          .from('clube_interesses_posicoes')
          .delete()
          .eq('clube_id', clubeId)
          .eq('posicao', posicao)
        setIsSubscribed(false)
      } else {
        await supabase
          .from('clube_interesses_posicoes')
          .insert({ clube_id: clubeId, posicao })
        setIsSubscribed(true)
      }
    } catch (error) {
      console.error('Error toggling position alert:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!clubeId || checking) return null

  return (
    <Button
      variant={isSubscribed ? 'amber' : 'outline'}
      size="sm"
      className="gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-wider h-8 sm:h-9"
      onClick={toggleAlert}
      loading={loading}
    >
      {isSubscribed ? <BellOff size={14} /> : <Bell size={14} />}
      {isSubscribed ? `Sair do alerta de ${posicao}` : `Me avise sobre novos ${posicao}s`}
    </Button>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Bell, BellOff, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface PositionAlertButtonProps {
  escolinhaId: string | null
  posicao: string
}

export function PositionAlertButton({ escolinhaId, posicao }: PositionAlertButtonProps) {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const supabase = createSupabaseBrowser()
  const router = useRouter()

  useEffect(() => {
    if (!escolinhaId || !posicao) {
      setChecking(false)
      return
    }

    async function checkSubscription() {
      const { data } = await supabase
        .from('escolinha_interesses_posicoes')
        .select('id')
        .eq('escolinha_id', escolinhaId)
        .eq('posicao', posicao)
        .single()
      
      setIsSubscribed(!!data)
      setChecking(false)
    }

    checkSubscription()
  }, [escolinhaId, posicao])

  async function toggleAlert() {
    if (!escolinhaId || !posicao) return
    setLoading(true)

    try {
      if (isSubscribed) {
        await supabase
          .from('escolinha_interesses_posicoes')
          .delete()
          .eq('escolinha_id', escolinhaId)
          .eq('posicao', posicao)
        setIsSubscribed(false)
      } else {
        await supabase
          .from('escolinha_interesses_posicoes')
          .insert({ escolinha_id: escolinhaId, posicao })
        setIsSubscribed(true)
      }
    } catch (error) {
      console.error('Error toggling position alert:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!escolinhaId || checking) return null

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

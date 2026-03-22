// src/components/atletas/AthleteActions.tsx
'use client'

import { useState } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Star, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface AthleteActionsProps {
  atletaId: string
  escolinhaId: string | null
  initialIsFavorite: boolean
  initialHasInterest: boolean
  aceitarMensagens: boolean
  size?: 'sm' | 'md'
}

export function AthleteActions({
  atletaId,
  escolinhaId,
  initialIsFavorite,
  initialHasInterest,
  aceitarMensagens,
  size = 'md',
}: AthleteActionsProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite)
  const [hasInterest, setHasInterest] = useState(initialHasInterest)
  const [loadingFav, setLoadingFav] = useState(false)
  const [loadingInt, setLoadingInt] = useState(false)
  const supabase = createSupabaseBrowser()
  const router = useRouter()

  async function toggleFavorite() {
    if (!escolinhaId || loadingFav) return
    setLoadingFav(true)

    try {
      if (isFavorite) {
        // Remove favorito — sem notificação ao desfavoritar
        await supabase
          .from('favoritos')
          .delete()
          .eq('atleta_id', atletaId)
          .eq('escolinha_id', escolinhaId)
        setIsFavorite(false)
      } else {
        // Adiciona favorito
        const { error } = await supabase
          .from('favoritos')
          .insert({ atleta_id: atletaId, escolinha_id: escolinhaId })

        if (!error) {
          setIsFavorite(true)
        }
      }
      router.refresh()
    } catch {
      // silencioso
    } finally {
      setLoadingFav(false)
    }
  }

  async function handleInterest() {
    if (!escolinhaId || hasInterest) return
    setLoadingInt(true)

    try {
      const { error } = await supabase.from('interesses').insert({
        atleta_id: atletaId,
        escolinha_id: escolinhaId,
        status: 'pendente',
      })

      if (!error) {
        setHasInterest(true)
        router.refresh()
      }
    } catch {
      // silencioso
    } finally {
      setLoadingInt(false)
    }
  }

  if (!escolinhaId) return null

  return (
    <div className={size === 'sm' ? 'flex gap-2' : 'flex flex-col gap-2 mt-4'}>
      {hasInterest ? (
        <Button
          variant="outline"
          size={size}
          className="flex-1 justify-center border-green-500 text-green-700 bg-green-50"
          disabled
        >
          <Check size={size === 'sm' ? 12 : 14} />
          {size === 'sm' ? 'Enviado' : 'Interesse já enviado'}
        </Button>
      ) : (
        <Button
          variant="dark"
          size={size}
          className="flex-1 justify-center"
          onClick={handleInterest}
          loading={loadingInt}
        >
          <Star size={size === 'sm' ? 12 : 14} />
          {size === 'sm' ? 'Interesse' : 'Demonstrar Interesse'}
        </Button>
      )}

      <Button
        variant={isFavorite ? 'amber' : 'outline'}
        size={size}
        className="flex-1 justify-center"
        onClick={toggleFavorite}
        loading={loadingFav}
      >
        <Star size={size === 'sm' ? 12 : 14} fill={isFavorite ? 'currentColor' : 'none'} />
        {size === 'sm'
          ? isFavorite ? 'Salvo' : 'Favorito'
          : isFavorite ? 'Salvo nos favoritos' : 'Salvar nos favoritos'}
      </Button>
    </div>
  )
}
'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'

interface StripeButtonProps {
  tipo: 'assinatura' | 'destaque' | 'verificacao' | 'portal'
  plano?: string
  label: string
  variant?: 'primary' | 'dark' | 'outline' | 'amber'
}

export function StripeButton({ tipo, plano, label, variant = 'primary' }: StripeButtonProps) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    try {
      if (tipo === 'portal') {
        const res = await fetch('/api/stripe/portal', { method: 'POST' })
        const { url } = await res.json()
        if (url) window.location.href = url
      } else {
        const res = await fetch('/api/stripe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tipo, plano }),
        })
        const { url, error } = await res.json()
        if (error) { alert(error); return }
        if (url) window.location.href = url
      }
    } catch {
      alert('Erro ao processar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant={variant} loading={loading} onClick={handleClick} className="w-full justify-center">
      {label}
    </Button>
  )
}

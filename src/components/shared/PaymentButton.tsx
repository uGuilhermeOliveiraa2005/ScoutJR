'use client'
import { useState } from 'react'
import { CheckoutModal } from './CheckoutModal'
import { Button } from '@/components/ui/Button'
import { PLANOS_MP, PRODUTOS_MP } from '@/lib/mercadopago'

interface PaymentButtonProps {
  tipo: 'assinatura' | 'destaque' | 'verificacao'
  plano?: 'starter' | 'pro' | 'enterprise'
  label: string
  variant?: 'primary' | 'dark' | 'outline' | 'amber'
  className?: string
}

export function PaymentButton({
  tipo,
  plano,
  label,
  variant = 'primary',
  className,
}: PaymentButtonProps) {
  const [open, setOpen] = useState(false)

  function getInfo() {
    if (tipo === 'assinatura' && plano) {
      const p = PLANOS_MP[plano]
      return { titulo: p.nome, valor: p.preco, descricao: p.descricao }
    }
    if (tipo === 'destaque') {
      return {
        titulo: PRODUTOS_MP.destaque.nome,
        valor: PRODUTOS_MP.destaque.preco,
        descricao: PRODUTOS_MP.destaque.descricao,
      }
    }
    return {
      titulo: PRODUTOS_MP.verificacao.nome,
      valor: PRODUTOS_MP.verificacao.preco,
      descricao: PRODUTOS_MP.verificacao.descricao,
    }
  }

  const { titulo, valor, descricao } = getInfo()

  return (
    <>
      <Button
        variant={variant}
        className={className}
        onClick={() => setOpen(true)}
      >
        {label}
      </Button>

      <CheckoutModal
        isOpen={open}
        onClose={() => setOpen(false)}
        tipo={tipo}
        plano={plano}
        titulo={titulo}
        valor={valor}
        descricao={descricao}
      />
    </>
  )
}
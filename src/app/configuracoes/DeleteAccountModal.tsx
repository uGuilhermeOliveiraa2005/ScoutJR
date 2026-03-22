'use client'

import { useState } from 'react'
import { AlertTriangle, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import * as Dialog from '@radix-ui/react-dialog'
import { deleteAccount } from './actions'
import { useRouter } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabase'
import { toast } from 'sonner'

export function DeleteAccountModal({ hasAssinatura, isVerificado }: { hasAssinatura: boolean, isVerificado: boolean }) {
  const [open, setOpen] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createSupabaseBrowser()

  const isConfirmed = confirmText === 'deletar minha conta'

  async function handleDelete() {
    if (!isConfirmed) return
    setLoading(true)
    const res = await deleteAccount()
    if (res?.error) {
       toast.error(res.error)
       setLoading(false)
       return
    }
    toast.success('Sua conta foi excluída permanentemente.')
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const hasPerks = hasAssinatura || isVerificado

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors w-full sm:w-auto">
          Excluir conta
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 data-[state=open]:animate-fade-in" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl border border-neutral-100 p-6 data-[state=open]:animate-fade-up">
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center flex-shrink-0">
              <AlertTriangle size={24} />
            </div>
            <Dialog.Close className="text-neutral-400 hover:text-neutral-600 transition-colors">
              <X size={20} />
            </Dialog.Close>
          </div>

          <Dialog.Title className="font-display text-xl sm:text-2xl text-neutral-900 mb-2">
            Excluir conta definitivamente?
          </Dialog.Title>
          <Dialog.Description className="text-xs sm:text-sm text-neutral-500 mb-6 leading-relaxed">
            Esta ação é irreversível. Todos os seus dados, perfis de atletas e interações serão permanentemente removidos de nossos servidores.
          </Dialog.Description>

          {hasPerks && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <p className="text-xs sm:text-sm font-medium text-amber-800 mb-2">Atenção!</p>
              <ul className="list-disc list-inside text-xs sm:text-sm text-amber-700 space-y-1">
                {hasAssinatura && <li>Sua assinatura recorrente será cancelada imediatamente.</li>}
                {isVerificado && <li>Você perderá o selo de verificação oficial.</li>}
              </ul>
              <p className="text-[10px] sm:text-xs text-amber-600 mt-2">Deseja prosseguir mesmo assim?</p>
            </div>
          )}

          <div className="mb-6">
            <label className="block text-[10px] sm:text-xs font-medium text-neutral-600 mb-2">
              Para confirmar, digite <strong>deletar minha conta</strong> abaixo:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={e => setConfirmText(e.target.value)}
              placeholder="deletar minha conta"
              className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-lg bg-white outline-none focus:border-red-400 focus:ring-2 focus:ring-red-100"
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3">
            <Dialog.Close asChild>
              <Button variant="outline" className="w-full justify-center">Cancelar</Button>
            </Dialog.Close>
            <Button 
              variant="dark" 
              className={`w-full justify-center bg-red-600 hover:bg-red-700 ${!isConfirmed ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleDelete}
              loading={loading}
              disabled={!isConfirmed || loading}
            >
              <Trash2 size={16} className="mr-2" /> Excluir Conta
            </Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

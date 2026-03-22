'use client'

import { useState } from 'react'
import { KeyRound } from 'lucide-react'
import { updatePassword } from './actions'
import { toast } from 'sonner'

export function PasswordChangeForm() {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    
    const fd = new FormData(e.currentTarget)
    const res = await updatePassword(fd)
    if (res?.error) {
       toast.error(res.error)
    } else {
       toast.success('Senha alterada com sucesso!')
       e.currentTarget.reset()
       setTimeout(() => setIsOpen(false), 2000)
    }
    setLoading(false)
  }

  if (!isOpen) {
    return (
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs sm:text-sm font-medium">Alterar senha</div>
          <div className="text-[10px] sm:text-xs text-neutral-400">Recomendamos trocar periodicamente</div>
        </div>
        <button onClick={() => setIsOpen(true)} className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors flex-shrink-0">
          Alterar
        </button>
      </div>
    )
  }

  return (
    <div className="border border-neutral-200 rounded-lg p-4 bg-neutral-50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-sm font-medium"><KeyRound size={16} /> Nova Senha</div>
        <button onClick={() => setIsOpen(false)} className="text-xs text-neutral-500 hover:text-neutral-700">Cancelar</button>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div>
           <label className="block text-[10px] sm:text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Nova Senha</label>
           <input type="password" name="password" required className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg outline-none focus:border-green-400" />
        </div>
        <div>
           <label className="block text-[10px] sm:text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1">Confirmar Nova Senha</label>
           <input type="password" name="confirm" required className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg outline-none focus:border-green-400" />
        </div>
        <button disabled={loading} type="submit" className="mt-2 w-full px-4 py-2 bg-neutral-900 text-white text-sm rounded-lg hover:bg-black transition-colors disabled:opacity-50">
          {loading ? 'Salvando...' : 'Confirmar Alteração'}
        </button>
      </form>
    </div>
  )
}

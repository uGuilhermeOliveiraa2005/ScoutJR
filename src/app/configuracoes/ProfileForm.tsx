'use client'

import { useState, useRef } from 'react'
import { User, Camera } from 'lucide-react'
import { formatPhone } from '@/lib/utils'
import { updateProfile } from './actions'
import { toast } from 'sonner'

export function ProfileForm({ profile, escolinha, isEscolinha }: any) {
  const [preview, setPreview] = useState('')
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentFoto = isEscolinha ? escolinha?.foto_url : profile?.foto_url
  const validCurrentFoto = (currentFoto && currentFoto !== 'null' && currentFoto !== 'undefined') ? currentFoto : ''

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => setPreview(event.target?.result as string)
      reader.readAsDataURL(file)
    } else {
      setPreview('')
    }
  }

  return (
    <form action={async (fd) => { 
      setLoading(true)
      const res = await updateProfile(fd)
      setLoading(false)
      if (res?.error) {
        toast.error(res.error)
      } else {
        toast.success('Perfil atualizado com sucesso!')
        setPreview('')
        if (fileInputRef.current) fileInputRef.current.value = ''
      }
    }}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div className="sm:col-span-2">
          <label className="block text-[10px] sm:text-xs font-medium text-neutral-400 uppercase tracking-wide mb-3">Foto / Logo (Clique para alterar)</label>
          <div className="flex justify-start">
            <div className="group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
               <div className="relative w-20 h-20 rounded-full bg-neutral-100 border-2 border-dashed border-neutral-300 overflow-hidden flex-shrink-0 flex items-center justify-center transition-colors group-hover:border-green-400 text-neutral-400">
                 {preview || validCurrentFoto ? <img src={preview || validCurrentFoto} className="w-full h-full object-cover"/> : <User size={28} className="text-neutral-400"/>}
                 <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <Camera size={20} className="text-white" />
                 </div>
               </div>
               <input ref={fileInputRef} type="file" accept="image/*" name="foto_url" className="hidden" onChange={handleFileChange} />
               <input type="hidden" name="current_foto_url" value={validCurrentFoto} />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[10px] sm:text-xs font-medium text-neutral-400 uppercase tracking-wide mb-1 sm:mb-1.5">Nome</label>
          <input name="nome" defaultValue={profile.nome} className="w-full px-3 py-2 sm:py-2.5 text-sm border border-neutral-200 rounded-lg bg-white outline-none focus:border-green-400" />
        </div>
        <div>
          <label className="block text-[10px] sm:text-xs font-medium text-neutral-400 uppercase tracking-wide mb-1 sm:mb-1.5">E-mail</label>
          <input defaultValue={profile.email} disabled className="w-full px-3 py-2 sm:py-2.5 text-sm border border-neutral-200 rounded-lg bg-neutral-50 text-neutral-400 cursor-not-allowed" />
        </div>
        <div className="sm:col-span-2">
          <label className="block text-[10px] sm:text-xs font-medium text-neutral-400 uppercase tracking-wide mb-1 sm:mb-1.5">Telefone</label>
          <input name="telefone" defaultValue={formatPhone(profile.telefone || '')} onChange={(e) => e.target.value = formatPhone(e.target.value)} className="w-full px-3 py-2 sm:py-2.5 text-sm border border-neutral-200 rounded-lg bg-white outline-none focus:border-green-400" />
        </div>
        {isEscolinha && (
          <div className="sm:col-span-2">
            <label className="block text-[10px] sm:text-xs font-medium text-neutral-400 uppercase tracking-wide mb-1 sm:mb-1.5">Descrição / Bio da Escolinha</label>
            <textarea name="descricao" defaultValue={escolinha?.descricao || ''} rows={3} className="w-full px-3 py-2 sm:py-2.5 text-sm border border-neutral-200 rounded-lg bg-white outline-none focus:border-green-400 resize-none" placeholder="Conte um pouco sobre a escolinha, estrutura, campeonatos..." />
          </div>
        )}
      </div>
      <button type="submit" disabled={loading} className="mt-4 w-full sm:w-auto px-5 py-2.5 text-sm bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors font-medium disabled:opacity-50">
        {loading ? 'Salvando...' : 'Salvar alterações'}
      </button>
    </form>
  )
}

'use client'

import { useState, useRef, useEffect } from 'react'
import { User, Camera, Loader2 } from 'lucide-react'
import { formatPhone } from '@/lib/utils'
import { updateProfile } from './actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function ProfileForm({ profile, escolinha, isEscolinha }: any) {
  const router = useRouter()
  const [preview, setPreview] = useState('')
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Campos controlados para garantir que reflitam os dados atuais
  const [nome, setNome] = useState(profile?.nome ?? '')
  const [telefone, setTelefone] = useState(formatPhone(profile?.telefone ?? ''))
  const [descricao, setDescricao] = useState(escolinha?.descricao ?? '')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Atualiza state se as props mudarem (após revalidação do servidor)
  useEffect(() => {
    setNome(profile?.nome ?? '')
    setTelefone(formatPhone(profile?.telefone ?? ''))
    setDescricao(escolinha?.descricao ?? '')
    setPreview('')
    setSelectedFile(null)
  }, [profile?.nome, profile?.telefone, profile?.foto_url, escolinha?.descricao])

  const currentFoto = isEscolinha ? escolinha?.foto_url : profile?.foto_url
  const validCurrentFoto = currentFoto && currentFoto !== 'null' && currentFoto !== 'undefined'
    ? currentFoto
    : ''

  const displayFoto = preview || validCurrentFoto

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (event) => setPreview(event.target?.result as string)
      reader.readAsDataURL(file)
    } else {
      setSelectedFile(null)
      setPreview('')
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const fd = new FormData()
    fd.append('nome', nome)
    fd.append('telefone', telefone)
    fd.append('descricao', descricao)
    fd.append('current_foto_url', validCurrentFoto)

    if (selectedFile) {
      fd.append('foto_url', selectedFile)
    }

    const res = await updateProfile(fd)
    setLoading(false)

    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success('Perfil atualizado com sucesso!')
      setSelectedFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
      // Força re-fetch dos dados do servidor
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">

        {/* Foto */}
        <div className="sm:col-span-2">
          <label className="block text-[10px] sm:text-xs font-medium text-neutral-400 uppercase tracking-wide mb-3">
            Foto / Logo (Clique para alterar)
          </label>
          <div className="flex justify-start">
            <div
              className="group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="relative w-20 h-20 rounded-full bg-neutral-100 border-2 border-dashed border-neutral-300 overflow-hidden flex-shrink-0 flex items-center justify-center transition-colors group-hover:border-green-400 text-neutral-400">
                {displayFoto
                  ? <img src={displayFoto} className="w-full h-full object-cover" alt="Avatar" />
                  : <User size={28} className="text-neutral-400" />
                }
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera size={20} className="text-white" />
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          </div>
          {selectedFile && (
            <p className="text-[10px] text-green-600 mt-2 font-medium">
              📎 {selectedFile.name} selecionada — salve para confirmar
            </p>
          )}
        </div>

        {/* Nome */}
        <div>
          <label className="block text-[10px] sm:text-xs font-medium text-neutral-400 uppercase tracking-wide mb-1 sm:mb-1.5">
            Nome
          </label>
          <input
            value={nome}
            onChange={e => setNome(e.target.value)}
            className="w-full px-3 py-2 sm:py-2.5 text-sm border border-neutral-200 rounded-lg bg-white outline-none focus:border-green-400"
          />
        </div>

        {/* E-mail (readonly) */}
        <div>
          <label className="block text-[10px] sm:text-xs font-medium text-neutral-400 uppercase tracking-wide mb-1 sm:mb-1.5">
            E-mail
          </label>
          <input
            defaultValue={profile?.email ?? ''}
            disabled
            className="w-full px-3 py-2 sm:py-2.5 text-sm border border-neutral-200 rounded-lg bg-neutral-50 text-neutral-400 cursor-not-allowed"
          />
        </div>

        {/* Telefone */}
        <div className="sm:col-span-2">
          <label className="block text-[10px] sm:text-xs font-medium text-neutral-400 uppercase tracking-wide mb-1 sm:mb-1.5">
            Telefone
          </label>
          <input
            value={telefone}
            onChange={e => setTelefone(formatPhone(e.target.value))}
            className="w-full px-3 py-2 sm:py-2.5 text-sm border border-neutral-200 rounded-lg bg-white outline-none focus:border-green-400"
          />
        </div>

        {/* Descrição (escolinha) */}
        {isEscolinha && (
          <div className="sm:col-span-2">
            <label className="block text-[10px] sm:text-xs font-medium text-neutral-400 uppercase tracking-wide mb-1 sm:mb-1.5">
              Descrição / Bio da Escolinha
            </label>
            <textarea
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 sm:py-2.5 text-sm border border-neutral-200 rounded-lg bg-white outline-none focus:border-green-400 resize-none"
              placeholder="Conte um pouco sobre a escolinha, estrutura, campeonatos..."
            />
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-4 w-full sm:w-auto px-5 py-2.5 text-sm bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
      >
        {loading && <Loader2 size={14} className="animate-spin" />}
        {loading ? 'Salvando...' : 'Salvar alterações'}
      </button>
    </form>
  )
}
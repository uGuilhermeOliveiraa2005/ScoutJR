'use client'

import { useState, useRef, useEffect } from 'react'
import { Camera, Loader2, User, ImageIcon, Trash2 } from 'lucide-react'
import { formatPhone, formatCNPJ, ESTADOS, translateAuthError } from '@/lib/utils'
import { updateProfile, updateEscolinhaLocalizacao, updateEscolinhaFotos } from './actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { CitySelect } from '@/components/ui/CitySelect'
import { Input, Select, Label, Textarea, FieldGroup } from '@/components/ui/Form'
import { Button } from '@/components/ui/Button'

export function ProfileForm({ profile, escolinha, isEscolinha }: any) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingLoc, setLoadingLoc] = useState(false)
  const [loadingFotos, setLoadingFotos] = useState(false)

  // Campos controlados
  const [nome, setNome] = useState(profile?.nome ?? '')
  const [telefone, setTelefone] = useState(formatPhone(profile?.telefone ?? ''))
  const [descricao, setDescricao] = useState(escolinha?.descricao ?? '')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Localização escolinha
  const [estado, setEstado] = useState(escolinha?.estado ?? '')
  const [cidade, setCidade] = useState(escolinha?.cidade ?? '')
  const [cnpj, setCnpj] = useState(escolinha?.cnpj ?? '')

  // Fotos adicionais
  const [fotosExistentes, setFotosExistentes] = useState<string[]>(
    Array.isArray(escolinha?.fotos_adicionais) ? escolinha.fotos_adicionais.filter(Boolean) : []
  )
  const [novasFotos, setNovasFotos] = useState<{ file: File; preview: string }[]>([])

  useEffect(() => {
    setNome(profile?.nome ?? '')
    setTelefone(formatPhone(profile?.telefone ?? ''))
    setDescricao(escolinha?.descricao ?? '')
    setEstado(escolinha?.estado ?? '')
    setCidade(escolinha?.cidade ?? '')
    setCnpj(escolinha?.cnpj ?? '')
    setFotosExistentes(Array.isArray(escolinha?.fotos_adicionais) ? escolinha.fotos_adicionais.filter(Boolean) : [])
    setPreview('')
    setSelectedFile(null)
  }, [profile?.nome, profile?.telefone, escolinha?.descricao, escolinha?.estado, escolinha?.cidade])

  const currentFoto = isEscolinha ? (escolinha?.foto_url ?? profile?.foto_url) : profile?.foto_url
  const validFoto = currentFoto && currentFoto !== 'null' ? currentFoto : ''
  const displayFoto = preview || validFoto

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = ev => setPreview(ev.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  // Submit dados básicos
  const handleSubmitBasico = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const fd = new FormData()
    fd.append('nome', nome)
    fd.append('telefone', telefone)
    fd.append('descricao', descricao)
    fd.append('current_foto_url', validFoto)
    if (selectedFile) fd.append('foto_url', selectedFile)
    const res = await updateProfile(fd)
    setLoading(false)
    if (res?.error) { toast.error(translateAuthError(res.error)) }
    else { toast.success('Dados atualizados!'); setSelectedFile(null); router.refresh() }
  }

  // Submit localização escolinha
  const handleSubmitLocalizacao = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoadingLoc(true)
    const fd = new FormData()
    fd.append('estado', estado)
    fd.append('cidade', cidade)
    fd.append('cnpj', cnpj)
    const res = await updateEscolinhaLocalizacao(fd)
    setLoadingLoc(false)
    if (res?.error) toast.error(translateAuthError(res.error))
    else { toast.success('Localização atualizada!'); router.refresh() }
  }

  // Adicionar nova foto
  const handleNovaFoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    const totalAtual = fotosExistentes.length + novasFotos.length
    const disponiveis = 3 - totalAtual
    if (disponiveis <= 0) { toast.error('Máximo de 3 fotos atingido.'); return }
    const selecionadas = files.slice(0, disponiveis)
    selecionadas.forEach(file => {
      const reader = new FileReader()
      reader.onload = ev => {
        setNovasFotos(prev => [...prev, { file, preview: ev.target?.result as string }])
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  // Remover foto existente
  const removerFotoExistente = (index: number) => {
    setFotosExistentes(prev => prev.filter((_, i) => i !== index))
  }

  // Remover nova foto (antes de salvar)
  const removerNovaFoto = (index: number) => {
    setNovasFotos(prev => prev.filter((_, i) => i !== index))
  }

  // Submit fotos
  const handleSubmitFotos = async () => {
    setLoadingFotos(true)
    const fd = new FormData()
    fd.append('fotos_adicionais', JSON.stringify(fotosExistentes))
    novasFotos.forEach((f, i) => fd.append(`foto_nova_${i}`, f.file))
    const res = await updateEscolinhaFotos(fd)
    setLoadingFotos(false)
    if (res?.error) toast.error(translateAuthError(res.error))
    else { toast.success('Fotos atualizadas!'); setNovasFotos([]); router.refresh() }
  }

  const totalFotos = fotosExistentes.length + novasFotos.length

  return (
    <div className="flex flex-col gap-6">

      {/* ── Dados básicos ── */}
      <form onSubmit={handleSubmitBasico} className="flex flex-col gap-5">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-1.5 h-6 bg-green-500 rounded-full" />
          <h3 className="text-sm font-black uppercase tracking-widest text-neutral-800">Dados principais</h3>
        </div>

        {/* Foto */}
        <div className="flex items-center gap-6 p-4 bg-gradient-to-r from-neutral-50 to-white rounded-2xl border border-neutral-200 shadow-sm">
          <div
            className="relative w-24 h-24 rounded-2xl bg-white border-2 border-neutral-200 overflow-hidden cursor-pointer group flex-shrink-0 shadow-sm transition-all hover:border-green-400 hover:shadow-lg"
            onClick={() => fileInputRef.current?.click()}
          >
            {displayFoto
              ? <img src={displayFoto} className="w-full h-full object-cover" alt="Foto" />
              : <User size={28} className="absolute inset-0 m-auto text-neutral-300" />}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
              <Camera size={20} className="text-white" />
            </div>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          <div className="flex-1">
            <h4 className="text-sm font-bold text-neutral-800 mb-1">
              {isEscolinha ? 'Logo da escolinha' : 'Foto de perfil'}
            </h4>
            <p className="text-xs text-neutral-500 font-medium font-sans mb-2">
              {selectedFile ? `📎 ${selectedFile.name}` : 'A imagem deve ser quadrada (1:1) para melhor exibição.'}
            </p>
            <button type="button" onClick={() => fileInputRef.current?.click()}
              className="text-[10px] font-black uppercase tracking-widest text-green-600 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-all">
              Alterar foto
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FieldGroup>
            <Label>Nome</Label>
            <Input
              value={nome}
              onChange={e => setNome(e.target.value)}
              placeholder="Seu nome completo"
            />
          </FieldGroup>
          <FieldGroup>
            <Label>E-mail</Label>
            <Input
              defaultValue={profile?.email ?? ''}
              disabled
              className="bg-neutral-100/50 text-neutral-400 font-sans"
            />
          </FieldGroup>
          <FieldGroup className="sm:col-span-2">
            <Label>Telefone / WhatsApp</Label>
            <Input
              value={telefone}
              onChange={e => setTelefone(formatPhone(e.target.value))}
              placeholder="(51) 9 9999-9999"
            />
          </FieldGroup>

          {/* Descrição só para escolinha */}
          {isEscolinha && (
            <FieldGroup className="sm:col-span-2">
              <Label>Descrição / Bio</Label>
              <Textarea
                value={descricao}
                onChange={e => setDescricao(e.target.value)}
                placeholder="Conte sobre a escolinha, estrutura, campeonatos..."
              />
            </FieldGroup>
          )}
        </div>

        <div className="flex justify-end pt-2">
          <Button variant="dark" loading={loading} type="submit" className="px-8 font-black tracking-widest uppercase text-xs h-12 shadow-lg shadow-black/10">
            SALVAR ALTERAÇÕES
          </Button>
        </div>
      </form>

      {/* ── Localização (escolinha) ── */}
      {isEscolinha && (
        <>
          <Divider />
          <form onSubmit={handleSubmitLocalizacao} className="flex flex-col gap-5">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-1.5 h-6 bg-green-500 rounded-full" />
              <h3 className="text-sm font-black uppercase tracking-widest text-neutral-800">
                Localização & CNPJ
              </h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <FieldGroup>
                <Label>CNPJ</Label>
                <Input
                  value={cnpj}
                  onChange={e => setCnpj(formatCNPJ(e.target.value))}
                  placeholder="00.000.000/0000-00"
                />
              </FieldGroup>
              <FieldGroup>
                <Label>Estado</Label>
                <Select
                  value={estado}
                  onChange={e => { setEstado(e.target.value); setCidade('') }}
                  options={ESTADOS}
                  placeholder="Selecione"
                />
              </FieldGroup>
              <FieldGroup>
                <Label>Cidade</Label>
                <CitySelect
                  estado={estado}
                  value={cidade}
                  onChange={e => setCidade(e.target.value)}
                  placeholder="Selecione a cidade"
                />
              </FieldGroup>
            </div>
            <div className="flex justify-end">
              <Button variant="dark" loading={loadingLoc} type="submit" className="px-8 font-black tracking-widest uppercase text-xs h-12 shadow-lg shadow-black/10">
                ATUALIZAR LOCALIZAÇÃO
              </Button>
            </div>
          </form>
        </>
      )}

      {/* ── Fotos adicionais (escolinha) ── */}
      {isEscolinha && (
        <>
          <Divider />
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">
                Fotos da estrutura <span className="text-neutral-300 font-normal">({totalFotos}/3)</span>
              </h3>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {/* Fotos já salvas */}
              {fotosExistentes.map((url, i) => (
                <div key={`existente-${i}`} className="relative group aspect-square">
                  <img src={url} className="w-full h-full object-cover rounded-xl border border-neutral-200" alt={`Foto ${i + 1}`} />
                  <button
                    type="button"
                    onClick={() => removerFotoExistente(i)}
                    className="absolute top-1.5 right-1.5 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}

              {/* Novas fotos (preview local) */}
              {novasFotos.map((f, i) => (
                <div key={`nova-${i}`} className="relative group aspect-square">
                  <img src={f.preview} className="w-full h-full object-cover rounded-xl border-2 border-dashed border-green-300" alt={`Nova ${i + 1}`} />
                  <div className="absolute top-1.5 left-1.5 bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md">
                    Nova
                  </div>
                  <button
                    type="button"
                    onClick={() => removerNovaFoto(i)}
                    className="absolute top-1.5 right-1.5 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}

              {/* Slot para adicionar */}
              {totalFotos < 3 && (
                <label className="aspect-square border-2 border-dashed border-neutral-200 rounded-xl flex flex-col items-center justify-center gap-1.5 text-neutral-400 hover:border-green-400 hover:text-green-500 hover:bg-green-50/30 transition-all cursor-pointer">
                  <ImageIcon size={20} />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Adicionar</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleNovaFoto} />
                </label>
              )}
            </div>

            {(novasFotos.length > 0 || fotosExistentes.length !== (Array.isArray(escolinha?.fotos_adicionais) ? escolinha.fotos_adicionais.filter(Boolean).length : 0)) && (
              <div className="flex justify-end">
                <SubmitButton loading={loadingFotos} label="Salvar fotos" onClick={handleSubmitFotos} />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

// ── Helpers ──────────────────────────────────────────────────

function Divider() {
  return <div className="h-px w-full bg-gradient-to-r from-neutral-200 to-transparent my-4" />
}

function SubmitButton({ loading, label, onClick }: { loading: boolean; label: string; onClick?: () => void }) {
  return (
    <button
      type={onClick ? 'button' : 'submit'}
      onClick={onClick}
      disabled={loading}
      className="px-8 py-3 text-xs bg-neutral-900 text-white rounded-xl hover:bg-neutral-800 transition-all font-black disabled:opacity-50 flex items-center gap-2 uppercase tracking-widest shadow-lg shadow-black/10 hover:shadow-xl hover:-translate-y-0.5"
    >
      {loading && <Loader2 size={14} className="animate-spin" />}
      {loading ? 'Salvando...' : label}
    </button>
  )
}
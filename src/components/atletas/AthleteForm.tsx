'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input, Select, Label, FieldGroup, Textarea } from '@/components/ui/Form'
import { ESTADOS } from '@/lib/utils'
import { toast } from 'sonner'
import {
  ArrowLeft, ArrowRight, Eye, MapPin,
  MessageCircle, CircleCheckBig,
  Users, Trash2, Trophy, Image as ImageIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AthleteProfilePreview } from '@/components/atletas/AthleteProfilePreview'
import { CitySelect } from '@/components/ui/CitySelect'

const STEP_LABELS = ['Dados', 'Habilidades', 'Mídia', 'Conquistas', 'Visualizar', 'Privacidade']

const posicoes = [
  { value: 'GOL', label: 'Goleiro', sub: 'GK' },
  { value: 'ZAG', label: 'Zagueiro', sub: 'CB' },
  { value: 'LD', label: 'L. Direito', sub: 'RB' },
  { value: 'LE', label: 'L. Esquerdo', sub: 'LB' },
  { value: 'VOL', label: 'Volante', sub: 'CDM' },
  { value: 'MC', label: 'Meia Central', sub: 'CM' },
  { value: 'MEI', label: 'Meia Atacante', sub: 'CAM' },
  { value: 'PD', label: 'Ponta Direita', sub: 'RW' },
  { value: 'PE', label: 'Ponta Esquerda', sub: 'LW' },
  { value: 'ATA', label: 'Atacante', sub: 'ST' },
  { value: 'CA', label: 'Centroavante', sub: 'CF' }
]

const habilidades = [
  'Técnica (Passe/Drible)',
  'Velocidade',
  'Visão de Jogo',
  'Físico (Força/Resistência)',
  'Finalização',
  'Passes Curto/Longo'
]

interface AthleteFormProps {
  initialData?: any
  athleteId?: string
  mode: 'create' | 'edit'
  onSubmit: (data: any) => Promise<{ success?: boolean; error?: string; id?: string }>
}

export function AthleteForm({ initialData, athleteId, mode, onSubmit }: AthleteFormProps) {
  const [step, setStep] = useState(1)
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  const [data, setData] = useState({
    nomeAtleta: initialData?.nome || '',
    descricao: initialData?.descricao || '',
    dataNascimento: initialData?.data_nascimento || '',
    estado: initialData?.estado || '',
    cidade: initialData?.cidade || '',
    posicao: initialData?.posicao || 'MEI',
    peDominante: initialData?.pe_dominante || 'destro',
    altura_cm: initialData?.altura_cm || '',
    peso_kg: initialData?.peso_kg || '',
    escolinhaAtual: initialData?.escolinha_atual || '',
    habilidades: [
      initialData?.habilidade_tecnica ?? 75,
      initialData?.habilidade_velocidade ?? 68,
      initialData?.habilidade_visao ?? 82,
      initialData?.habilidade_fisico ?? 60,
      initialData?.habilidade_finalizacao ?? 71,
      initialData?.habilidade_passes ?? 79,
    ],
    fotoPerfilUrl: initialData?.foto_url || null,
    fotoPerfilPreview: initialData?.foto_url || '',
    fotoCapaUrl: initialData?.capa_url || null,
    fotoCapaPreview: initialData?.capa_url || '',
    fotosAdicionais: initialData?.fotos_adicionais || [],
    videos: initialData?.atleta_videos?.map((v: any) => ({ url: v.url, titulo: v.titulo })) || [],
    conquistas: initialData?.atleta_conquistas?.map((c: any) => ({
      titulo: c.titulo,
      ano: c.ano.toString(),
      descricao: c.descricao,
    })) || [],
    visivel: initialData?.visivel ?? true,
    exibirCidade: initialData?.exibir_cidade ?? true,
    mensagens: initialData?.aceitar_mensagens ?? false,
  })

  async function handleSubmit() {
    setLoading(true)
    setServerError('')
    try {
      const { uploadImage, uploadImages } = await import('@/lib/storage')
      
      const fotosAdd = data.fotosAdicionais.filter((f: any) => typeof f === 'string' ? true : (f && f instanceof File))
      
      const fotoPerfil = data.fotoPerfilUrl instanceof File ? await uploadImage(data.fotoPerfilUrl, 'atleta') : (data.fotoPerfilUrl ?? null)
      const fotoCapa = data.fotoCapaUrl instanceof File ? await uploadImage(data.fotoCapaUrl, 'atleta_capa') : (data.fotoCapaUrl ?? null)
      const fotosUrls = await uploadImages(fotosAdd, 'atleta_galeria')

      const payload = {
        ...data,
        fotoUrl: fotoPerfil,
        capaUrl: fotoCapa,
        fotosAdicionais: fotosUrls,
      }

      const res = await onSubmit(payload)
      if (res.error) {
        setServerError(res.error)
      } else {
        setDone(true)
      }
    } catch (e: any) {
      console.error(e)
      setServerError('Erro ao fazer upload das imagens. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (done) return <SuccessScreen mode={mode} athleteId={athleteId || ''} />

  const progressPercent = ((step - 1) / (STEP_LABELS.length - 1)) * 100

  return (
    <div className="w-full max-w-lg">
      <div className="text-center mb-6 sm:mb-8">
        <Link href="/dashboard" className="font-display text-3xl tracking-widest text-green-700 inline-block mb-2">
          SCOUT<span className="text-amber-500">JR</span>
        </Link>
        <h1 className="text-neutral-500 text-sm font-medium uppercase tracking-widest">
          {mode === 'create' ? 'Novo Atleta' : 'Editar Atleta'}
        </h1>
      </div>

      {/* Progress */}
      <div className="mb-8 sm:mb-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest bg-green-50 px-2.5 py-1 rounded-lg border border-green-100">
            Etapa {step} de {STEP_LABELS.length}
          </span>
          <div className="w-12 h-12 rounded-2xl bg-neutral-900 flex items-center justify-center">
            <span className="text-lg font-display text-green-400 tracking-tighter">{Math.round(progressPercent)}%</span>
          </div>
        </div>
        <div className="relative h-2.5 bg-neutral-100 rounded-full mb-4 overflow-hidden border border-neutral-200/50">
          <div
            className="h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full transition-all duration-700"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="flex items-center justify-between" style={{ gridTemplateColumns: `repeat(${STEP_LABELS.length}, 1fr)` }}>
          {STEP_LABELS.map((l, i) => (
            <div
              key={l}
              className={cn(
                'flex flex-col items-center gap-1 transition-all duration-300',
                i + 1 === step ? 'opacity-100 scale-110' : i + 1 < step ? 'opacity-80' : 'opacity-30'
              )}
            >
              <div className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-black transition-all',
                i + 1 < step ? 'bg-green-500 text-white shadow-[0_0_8px_rgba(34,197,94,0.3)]' : i + 1 === step ? 'bg-green-100 text-green-700 border-2 border-green-400' : 'bg-neutral-100 text-neutral-400'
              )}>
                {i + 1 < step ? '✓' : i + 1}
              </div>
              <span className='text-[8px] sm:text-[9px] font-bold uppercase tracking-tighter text-center leading-tight'>
                {l}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border-2 border-neutral-100 rounded-3xl p-6 sm:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all animate-slide-up">
        {step === 1 && <Step1 data={data} setData={setData} setStep={setStep} />}
        {step === 2 && <Step2 data={data} setData={setData} setStep={setStep} />}
        {step === 3 && <Step3 data={data} setData={setData} setStep={setStep} />}
        {step === 4 && <Step4 data={data} setData={setData} setStep={setStep} />}
        {step === 5 && (
          <div className="flex flex-col gap-5 sm:gap-6">
            <div>
              <div className="font-display text-3xl sm:text-4xl text-neutral-400 mb-1.5 leading-none">05</div>
              <h2 className="text-lg sm:text-xl font-medium mb-1">Visualizar Perfil</h2>
              <p className="text-xs sm:text-sm text-neutral-500 mb-4 sm:mb-6">Veja como as escolinhas verão seu perfil.</p>
            </div>
            <AthleteProfilePreview data={data} onBack={() => setStep(4)} onNext={() => setStep(6)} />
          </div>
        )}
        {step === 6 && <Step6 data={data} setData={setData} setStep={setStep} handleSubmit={handleSubmit} loading={loading} serverError={serverError} />}
      </div>

      <div className="mt-8 text-center pb-8 border-t border-neutral-200/50 pt-8">
        <Link
          href={mode === 'create' ? '/dashboard' : `/perfil/${athleteId}`}
          className="text-sm font-bold text-neutral-400 hover:text-neutral-600 transition-colors uppercase tracking-widest"
        >
          Cancelar e Voltar
        </Link>
      </div>
    </div>
  )
}

function SuccessScreen({ mode, athleteId }: { mode: 'create' | 'edit'; athleteId?: string }) {
  return (
    <div className="w-full max-w-md text-center py-12 animate-in fade-in zoom-in-95 duration-500 bg-white border border-neutral-200 rounded-3xl p-8 shadow-sm">
      <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <CircleCheckBig size={40} />
      </div>
      <h2 className="font-display text-3xl text-neutral-900 mb-2">
        {mode === 'create' ? 'Atleta Cadastrado!' : 'Perfil Atualizado!'}
      </h2>
      <p className="text-neutral-500 mb-8">
        {mode === 'create'
          ? 'O perfil do atleta já está ativo e visível para escolinhas na plataforma.'
          : 'As informações foram atualizadas e salvas com sucesso.'}
      </p>
      <Link href={mode === 'create' ? '/dashboard' : `/perfil/${athleteId}`}>
        <Button variant="dark" className="w-full h-12 text-base font-bold shadow-lg justify-center uppercase tracking-widest">
          DASHBOARD INICIAL
        </Button>
      </Link>
    </div>
  )
}

function Step1({ data, setData, setStep, handleSubmit, loading, serverError }: any) {
return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <div>
        <div className="font-display text-5xl sm:text-6xl text-neutral-200/60 mb-2 leading-none select-none">03</div>
        <h2 className="font-display text-2xl sm:text-3xl text-neutral-900 mb-1 tracking-tight">Dados do atleta</h2>
        <p className="text-xs sm:text-sm text-neutral-500 font-medium font-sans">Apenas cidade e estado são exibidos publicamente.</p>
      </div>
      <div className="h-px w-full bg-gradient-to-r from-neutral-200 to-transparent" />
      <div className="flex flex-col gap-4 sm:gap-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <FieldGroup>
            <Label>Nome do atleta</Label>
            <Input placeholder="Gabriel Silva" value={data.nomeAtleta} onChange={(e: any) => setData({ ...data, nomeAtleta: e.target.value })} />
          </FieldGroup>
          <FieldGroup>
            <Label>Data de nascimento</Label>
            <Input type="date" value={data.dataNascimento} onChange={(e: any) => setData({ ...data, dataNascimento: e.target.value })} />
          </FieldGroup>
        </div>
        <FieldGroup>
          <Label>Descrição / Bio (Obrigatório)</Label>
          <Textarea placeholder="Conte a história do atleta, pontos fortes e trajetória..."
            value={data.descricao} onChange={(e: any) => setData({ ...data, descricao: e.target.value })} className="min-h-[100px]" />
        </FieldGroup>
        <div className="grid grid-cols-2 gap-3">
          <FieldGroup>
            <Label>Estado</Label>
            <Select options={ESTADOS} placeholder="Selecione" value={data.estado} 
              onChange={(e: any) => setData({ ...data, estado: e.target.value, cidade: '' })} />
          </FieldGroup>
          <FieldGroup>
            <Label>Cidade</Label>
            <CitySelect
              estado={data.estado}
              value={data.cidade}
              onChange={(e: any) => setData({ ...data, cidade: e.target.value })}
              placeholder="Porto Alegre"
            />
          </FieldGroup>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FieldGroup>
            <Label>Altura (cm)</Label>
            <Input type="number" min="100" max="220" placeholder="Ex: 175" value={data.altura_cm} onChange={(e: any) => setData({ ...data, altura_cm: e.target.value })} />
          </FieldGroup>
          <FieldGroup>
            <Label>Peso (kg)</Label>
            <Input type="number" min="20" max="120" placeholder="Ex: 68" value={data.peso_kg} onChange={(e: any) => setData({ ...data, peso_kg: e.target.value })} />
          </FieldGroup>
        </div>
        <FieldGroup>
          <Label>Posição Principal</Label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mt-2">
            {posicoes.map(p => {
              const active = data.posicao === p.value
              return (
                <button key={p.value} type="button" onClick={() => setData({ ...data, posicao: p.value })}
                  className={cn(
                    'p-3 sm:p-4 border-2 rounded-2xl text-center transition-all duration-300 relative overflow-hidden group outline-none focus-visible:ring-4 focus-visible:ring-green-500/20',
                    active 
                      ? 'border-green-500 bg-green-50 shadow-[0_4px_15px_-3px_rgba(34,197,94,0.2)]' 
                      : 'border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50 shadow-sm'
                  )}>
                  {active && <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-transparent pointer-events-none" />}
                  <div className={cn("text-xs sm:text-sm font-bold transition-colors relative z-10", active ? "text-green-800" : "text-neutral-700 group-hover:text-neutral-900")}>{p.label}</div>
                  <div className={cn("text-[10px] font-black uppercase tracking-widest transition-colors mt-0.5 relative z-10", active ? "text-green-600" : "text-neutral-400")}>{p.sub}</div>
                </button>
              )
            })}
          </div>
        </FieldGroup>
      </div>
      <div className="flex justify-between mt-6 sm:mt-8 pt-6 border-t border-neutral-100">
        <Button variant="outline" type="button" onClick={() => setStep(0)}><ArrowLeft size={14} /> Voltar</Button>
        <Button variant="dark" type="button"
          disabled={!data.nomeAtleta || !data.dataNascimento || !data.estado || !data.cidade || !data.descricao}
          onClick={() => setStep(2)}>
          Continuar <ArrowRight size={14} />
        </Button>
      </div>
    </div>
  )
}

function Step2({ data, setData, setStep, handleSubmit, loading, serverError }: any) {
return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <div>
        <div className="font-display text-5xl sm:text-6xl text-neutral-200/60 mb-2 leading-none select-none">04</div>
        <h2 className="font-display text-2xl sm:text-3xl text-neutral-900 mb-1 tracking-tight">Habilidades</h2>
        <p className="text-xs sm:text-sm text-neutral-500 font-medium font-sans">Seja honesto. Escolinhas valorizam evolução e sinceridade.</p>
      </div>
      <div className="h-px w-full bg-gradient-to-r from-neutral-200 to-transparent" />
      <div className="flex flex-col gap-6 sm:gap-8 mt-2">
        {habilidades.map((h, i) => (
          <div key={h} className="flex items-center gap-3 sm:gap-4">
            <div className="w-24 sm:w-28 flex-shrink-0 text-xs sm:text-sm font-medium">{h}</div>
            <input type="range" min={1} max={99} value={data.habilidades[i]}
              onChange={e => { const n = [...data.habilidades]; n[i] = +e.target.value; setData({ ...data, habilidades: n }) }}
              className="flex-1 accent-green-500" />
            <div className="w-8 h-7 sm:w-9 sm:h-8 bg-green-100 text-green-700 rounded-lg flex items-center justify-center text-xs sm:text-sm font-medium flex-shrink-0">
              {data.habilidades[i]}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-6 sm:mt-8 pt-6 border-t border-neutral-100">
        <Button variant="outline" type="button" onClick={() => setStep(1)}><ArrowLeft size={14} /> Voltar</Button>
        <Button variant="dark" type="button" onClick={() => setStep(3)}>Continuar <ArrowRight size={14} /></Button>
      </div>
    </div>
  )
}

function Step3({ data, setData, setStep, handleSubmit, loading, serverError }: any) {

    const addVideo = () => setData({ ...data, videos: [...data.videos, { url: '', titulo: '' }] })
    const updateVideo = (i: number, field: string, val: string) => {
      const next = [...data.videos]; next[i] = { ...next[i], [field]: val }; setData({ ...data, videos: next })
    }
    const removeVideo = (i: number) => setData({ ...data, videos: data.videos.filter((_: any, idx: number) => idx !== i) })

    return (
      <div className="flex flex-col gap-5 sm:gap-6">
        <div>
          <div className="font-display text-5xl sm:text-6xl text-neutral-200/60 mb-2 leading-none select-none">05</div>
          <h2 className="font-display text-2xl sm:text-3xl text-neutral-900 mb-1 tracking-tight">Fotos e vídeos</h2>
          <p className="text-xs sm:text-sm text-neutral-500 font-medium font-sans">Perfis com vídeos e fotos chamam muito mais atenção dos olheiros.</p>
        </div>
        <div className="h-px w-full bg-gradient-to-r from-neutral-200 to-transparent" />

        {/* Foto de Perfil */}
        <FieldGroup>
          <Label className="flex items-center gap-2"><ImageIcon size={14} /> Foto de Perfil (Avatar)</Label>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-neutral-100 border-2 border-dashed border-neutral-200 flex-shrink-0 overflow-hidden flex items-center justify-center text-neutral-400">
              {data.fotoPerfilPreview
                ? <img src={data.fotoPerfilPreview} alt="Perfil" className="w-full h-full object-cover" />
                : <Users size={24} />}
            </div>
            <div className="flex-1">
              <Input
                type="file"
                accept="image/*"
                className="pt-2"
                onChange={e => {
                  const file = e.target.files?.[0]
                  if (file) {
                    const reader = new FileReader()
                    reader.onload = ev => {
                      setData((prev: any) => ({
                        ...prev,
                        fotoPerfilUrl: file,
                        fotoPerfilPreview: ev.target?.result as string,
                      }))
                    }
                    reader.readAsDataURL(file)
                  } else {
                    setData((prev: any) => ({ ...prev, fotoPerfilUrl: null, fotoPerfilPreview: '' }))
                  }
                }}
              />
              <p className="text-[10px] text-neutral-400 mt-1">Aparece na moldura de perfil (Quadrado/Redondo)</p>
            </div>
          </div>
        </FieldGroup>

        {/* Foto de Capa */}
        <FieldGroup>
          <Label className="flex items-center gap-2"><ImageIcon size={14} /> Foto de Capa (Banner)</Label>
          <div className="flex items-center gap-4">
            <div className="w-32 h-20 rounded-xl bg-neutral-100 border-2 border-dashed border-neutral-200 flex-shrink-0 overflow-hidden flex items-center justify-center text-neutral-400">
              {data.fotoCapaPreview
                ? <img src={data.fotoCapaPreview} alt="Capa" className="w-full h-full object-cover" />
                : <ImageIcon size={24} />}
            </div>
            <div className="flex-1">
              <Input
                type="file"
                accept="image/*"
                className="pt-2"
                onChange={e => {
                  const file = e.target.files?.[0]
                  if (file) {
                    const reader = new FileReader()
                    reader.onload = ev => {
                      setData((prev: any) => ({
                        ...prev,
                        fotoCapaUrl: file,
                        fotoCapaPreview: ev.target?.result as string,
                      }))
                    }
                    reader.readAsDataURL(file)
                  } else {
                    setData((prev: any) => ({ ...prev, fotoCapaUrl: null, fotoCapaPreview: '' }))
                  }
                }}
              />
              <p className="text-[10px] text-neutral-400 mt-1">Resolução recomendada: 1280×720 (16:9)</p>
            </div>
          </div>
        </FieldGroup>

        {/* Fotos adicionais */}
        <div className="space-y-3">
          <Label>Fotos Adicionais (Galeria)</Label>
          <Input type="file" accept="image/*" multiple className="pt-2" onChange={async e => {
            if (e.target.files && e.target.files.length > 0) {
              const newFiles = Array.from(e.target.files)
              const remainingSlots = 3 - data.fotosAdicionais.length
              if (remainingSlots <= 0) {
                toast.error('Máximo de 3 fotos atingido')
                return
              }
              const selected = newFiles.slice(0, remainingSlots)
              const withPreview = await Promise.all(selected.map(f => new Promise(resolve => {
                const reader = new FileReader()
                reader.onload = ev => resolve(Object.assign(f, { preview: ev.target?.result as string }))
                reader.readAsDataURL(f)
              })))
              setData({ ...data, fotosAdicionais: [...data.fotosAdicionais, ...withPreview] as any[] })
            }
          }} />
          {data.fotosAdicionais.length > 0 && (
            <div className="flex gap-3 mt-2 flex-wrap">
              {data.fotosAdicionais.map((file: any, i: number) => (
                <div key={i} className="relative group">
                  <img src={file.preview || file} className="w-16 h-16 rounded-lg object-cover border border-neutral-200" alt="Extra" />
                  <button type="button"
                    onClick={() => setData({ ...data, fotosAdicionais: data.fotosAdicionais.filter((_: any, idx: number) => idx !== i) })}
                    className="absolute top-1 right-1 bg-white/90 text-red-500 rounded-md p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Vídeos */}
        <div className="space-y-2">
          <Label className="text-red-600">Vídeos YouTube</Label>
          {data.videos.map((v: any, i: number) => (
            <div key={i} className="bg-neutral-50 p-2 rounded-lg border border-neutral-100 space-y-2">
              <Input placeholder="Link..." value={v.url} onChange={(e: any) => updateVideo(i, 'url', e.target.value)} />
              <div className="flex gap-2">
                <Input placeholder="Título..." value={v.titulo} onChange={(e: any) => updateVideo(i, 'titulo', e.target.value)} />
                <button type="button" onClick={() => removeVideo(i)} className="text-red-400"><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
          {data.videos.length < 2 && (
            <button type="button" onClick={addVideo}
              className="w-full py-2 border border-dashed border-red-200 rounded-lg text-[10px] text-red-500 font-medium">
              + Vídeo YouTube
            </button>
          )}
        </div>

        <div className="flex justify-between mt-4">
          <Button variant="outline" type="button" onClick={() => setStep(2)}><ArrowLeft size={14} /> Voltar</Button>
          <Button variant="dark" type="button" onClick={() => setStep(4)}>Continuar <ArrowRight size={14} /></Button>
        </div>
      </div>
    )
  }
function Step4({ data, setData, setStep, handleSubmit, loading, serverError }: any) {

    const addConquista = () => setData({ ...data, conquistas: [...data.conquistas, { titulo: '', ano: '', descricao: '' }] })
    const updateConquista = (i: number, f: string, v: string) => {
      const next = [...data.conquistas]; next[i] = { ...next[i], [f]: v }; setData({ ...data, conquistas: next })
    }
    const removeConquista = (i: number) => setData({ ...data, conquistas: data.conquistas.filter((_: any, idx: number) => idx !== i) })

    return (
      <div className="flex flex-col gap-5 sm:gap-6">
        <div>
          <div className="font-display text-5xl sm:text-6xl text-neutral-200/60 mb-2 leading-none select-none">06</div>
          <h2 className="font-display text-2xl sm:text-3xl text-neutral-900 mb-1 tracking-tight">Conquistas & História</h2>
          <p className="text-xs sm:text-sm text-neutral-500 font-medium font-sans">Torneios e prêmios de destaque da carreira do atleta. (Opcional)</p>
        </div>
        <div className="h-px w-full bg-gradient-to-r from-neutral-200 to-transparent" />
        <div className="space-y-4">
          {data.conquistas.map((c: any, i: number) => (
            <div key={i} className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-3 mb-3">
                <div className="flex-1">
                  <Label>Nome do Título/Torneio</Label>
                  <Input placeholder="Ex: Campeão Gaúcho Sub-15" value={c.titulo} onChange={(e: any) => updateConquista(i, 'titulo', e.target.value)} className="bg-white" />
                </div>
                <div className="w-full sm:w-24">
                  <Label>Ano</Label>
                  <div className="flex gap-2">
                    <Input placeholder="2024" value={c.ano} onChange={(e: any) => updateConquista(i, 'ano', e.target.value)} className="bg-white" />
                    <button type="button" onClick={() => removeConquista(i)}
                      className="sm:hidden p-2 text-amber-400 hover:text-red-500 bg-white border border-neutral-200 rounded-lg flex-shrink-0">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
                <button type="button" onClick={() => removeConquista(i)}
                  className="hidden sm:flex mt-6 p-2 text-amber-400 hover:text-red-500 bg-white border border-neutral-200 rounded-lg items-center justify-center self-start">
                  <Trash2 size={18} />
                </button>
              </div>
              <div>
                <Label>Descrição Curta</Label>
                <Input placeholder="Destaque da competição..." value={c.descricao} onChange={(e: any) => updateConquista(i, 'descricao', e.target.value)} className="bg-white w-full" />
              </div>
            </div>
          ))}
          <Button variant="outline" type="button" onClick={addConquista}
            className="w-full border-dashed border-amber-200 text-amber-600 text-[10px] gap-2 py-3 bg-amber-50/30 font-bold">
            <Trophy size={14} /> ADICIONAR CONQUISTA / TÍTULO
          </Button>
        </div>
        <div className="flex justify-between mt-4">
          <Button variant="outline" type="button" onClick={() => setStep(3)}><ArrowLeft size={14} /> Voltar</Button>
          <Button variant="dark" type="button" onClick={() => setStep(5)}>Continuar <ArrowRight size={14} /></Button>
        </div>
      </div>
    )
  }



function Step6({ data, setData, setStep, handleSubmit, loading, serverError }: any) {

    const toggle = (key: string) => setData({ ...data, [key]: !data[key] })
    const items = [
      { key: 'visivel', icon: <Eye size={14} />, title: 'Perfil visível para escolinhas', sub: 'Apenas escolinhas aprovadas podem ver' },
      { key: 'exibirCidade', icon: <MapPin size={14} />, title: 'Exibir cidade e estado', sub: 'Nunca endereço completo' },
      { key: 'mensagens', icon: <MessageCircle size={14} />, title: 'Receber mensagens', sub: 'Contato direto das escolinhas' },
    ]
    return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <div>
        <div className="font-display text-5xl sm:text-6xl text-neutral-200/60 mb-2 leading-none select-none">08</div>
        <h2 className="font-display text-2xl sm:text-3xl text-neutral-900 mb-1 tracking-tight">Privacidade</h2>
        <p className="text-xs sm:text-sm text-neutral-500 font-medium font-sans">Você tem o controle total. Altere sempre que quiser.</p>
      </div>
      <div className="h-px w-full bg-gradient-to-r from-neutral-200 to-transparent" />
      <div className="border border-neutral-200 rounded-2xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] mb-2 mt-2">
          {items.map((item, i) => (
            <div key={item.key} className={cn('flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4', i < items.length - 1 && 'border-b border-neutral-100')}>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-neutral-100 text-neutral-500 flex items-center justify-center flex-shrink-0">{item.icon}</div>
              <div className="flex-1">
                <div className="text-xs sm:text-sm font-medium">{item.title}</div>
                <div className="text-[10px] sm:text-xs text-neutral-400 mt-0.5">{item.sub}</div>
              </div>
              <button type="button" onClick={() => toggle(item.key)}
                className={cn('relative w-9 sm:w-10 h-5 sm:h-6 rounded-full transition-colors flex-shrink-0', data[item.key] ? 'bg-green-400' : 'bg-neutral-300')}>
                <span className={cn('absolute top-0.5 sm:top-1 w-3.5 sm:w-4 h-3.5 sm:h-4 bg-white rounded-full shadow transition-all', data[item.key] ? 'left-4 sm:left-5' : 'left-0.5 sm:left-1')} />
              </button>
            </div>
          ))}
        </div>
        {serverError && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs sm:text-sm rounded-lg px-3 sm:px-4 py-2.5 mb-4">{serverError}</div>
        )}
        <div className="flex justify-between">
          <Button variant="outline" type="button" onClick={() => setStep(5)}><ArrowLeft size={14} /> Voltar</Button>
          <Button variant="dark" loading={loading} onClick={handleSubmit}>Publicar perfil <ArrowRight size={14} /></Button>
        </div>
      </div>
    )
  }



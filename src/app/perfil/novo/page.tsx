'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input, Select, Label, FieldGroup, Textarea } from '@/components/ui/Form'
import { ESTADOS } from '@/lib/utils'
import { 
  ArrowLeft, ArrowRight, Eye, MapPin, Video, 
  MessageCircle, CircleCheckBig, TrendingUp,
  Plus, Trash2, Trophy, Youtube, Image as ImageIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createAthlete } from './actions'

const STEP_LABELS = ['Dados', 'Habilidades', 'Mídia', 'Conquistas', 'Privacidade']

export default function NovoAtletaPage() {
  const [step, setStep] = useState(1)
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')
  const router = useRouter()

  const [data, setData] = useState({
    nomeAtleta: '',
    descricao: '',
    dataNascimento: '',
    estado: '',
    cidade: '',
    posicao: 'MEI',
    peDominante: 'destro',
    clubeAtual: '',
    habilidades: [75, 68, 82, 60, 71, 79],
    fotoUrl: '',
    fotosAdicionais: [] as string[],
    videos: [] as { url: string; titulo: string }[],
    conquistas: [] as { titulo: string; ano: string; descricao: string }[],
    visivel: true,
    exibirCidade: true,
    mensagens: false
  })

  async function handleSubmit() {
    setLoading(true)
    setServerError('')
    
    const res = await createAthlete(data)
    
    setLoading(false)
    if (res.error) {
      setServerError(res.error)
    } else {
      setDone(true)
    }
  }

  if (done) return <SuccessScreen />

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col items-center justify-start px-4 py-8 sm:py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-6 sm:mb-8">
          <Link href="/dashboard" className="font-display text-3xl tracking-widest text-green-700 inline-block mb-2">
            SCOUT<span className="text-amber-500">JR</span>
          </Link>
          <h1 className="text-neutral-500 text-sm font-medium uppercase tracking-widest">Novo Atleta</h1>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="h-1.5 bg-neutral-200 rounded-full mb-3 overflow-hidden">
            <div className="h-full bg-green-400 rounded-full transition-all duration-500" style={{ width: `${(step / 5) * 100}%` }} />
          </div>
          <div className="flex justify-between">
            {STEP_LABELS.map((l, i) => (
              <span key={l} className={cn('text-[9px] sm:text-[10px] font-bold uppercase tracking-tighter', 
                i + 1 === step ? 'text-green-700' : i + 1 < step ? 'text-green-400' : 'text-neutral-300'
              )}>
                {l}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          {step === 1 && <Step1 data={data} setData={setData} onNext={() => setStep(2)} />}
          {step === 2 && <Step2 data={data} setData={setData} onBack={() => setStep(1)} onNext={() => setStep(3)} />}
          {step === 3 && <Step3 data={data} setData={setData} onBack={() => setStep(2)} onNext={() => setStep(4)} />}
          {step === 4 && <Step4 data={data} setData={setData} onBack={() => setStep(3)} onNext={() => setStep(5)} />}
          {step === 5 && (
            <Step5 
              data={data} 
              setData={setData} 
              onBack={() => setStep(4)} 
              onSubmit={handleSubmit} 
              loading={loading}
              error={serverError}
            />
          )}
        </div>

        <div className="mt-8 text-center pb-8">
          <Link href="/dashboard" className="text-sm text-neutral-400 hover:text-neutral-600 flex items-center justify-center gap-1 transition-colors">
            <ArrowLeft size={14} /> Cancelar e voltar ao dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}

function Step1({ data, setData, onNext }: any) {
  const posicoes = [
    { value: 'GK', label: 'GK', sub: 'Goleiro' },
    { value: 'LD', label: 'LD', sub: 'Lat. Dir.' },
    { value: 'LE', label: 'LE', sub: 'Lat. Esq.' },
    { value: 'ZAG', label: 'ZAG', sub: 'Zagueiro' },
    { value: 'VOL', label: 'VOL', sub: 'Volante' },
    { value: 'MEI', label: 'MEI', sub: 'Meia' },
    { value: 'EXT', label: 'EXT', sub: 'Extremo' },
    { value: 'SA', label: 'SA', sub: '2° Ataq.' },
    { value: 'CA', label: 'CA', sub: 'C. Avante' },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="mb-2">
        <h2 className="text-xl font-medium">Dados básicos</h2>
        <p className="text-xs text-neutral-400">Comece com as informações principais do atleta.</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FieldGroup>
          <Label>Nome do atleta</Label>
          <Input value={data.nomeAtleta} onChange={e => setData({ ...data, nomeAtleta: e.target.value })} placeholder="Ex: Gabriel Silva" />
        </FieldGroup>
        <FieldGroup>
          <Label>Data de nascimento</Label>
          <Input type="date" value={data.dataNascimento} onChange={e => setData({ ...data, dataNascimento: e.target.value })} />
        </FieldGroup>
      </div>

      <FieldGroup>
        <Label>Descrição / Bio (Obrigatório)</Label>
        <Textarea 
          placeholder="Conte a história do atleta, pontos fortes e trajetória..." 
          value={data.descricao}
          onChange={e => setData({ ...data, descricao: e.target.value })}
          className="min-h-[120px]"
        />
        <p className="text-[10px] text-neutral-400 text-right">{data.descricao.length}/3000</p>
      </FieldGroup>

      <div className="grid grid-cols-2 gap-3">
        <FieldGroup>
          <Label>Estado</Label>
          <Select options={ESTADOS} value={data.estado} onChange={e => setData({ ...data, estado: e.target.value })} placeholder="Selecione" />
        </FieldGroup>
        <FieldGroup>
          <Label>Cidade</Label>
          <Input value={data.cidade} onChange={e => setData({ ...data, cidade: e.target.value })} placeholder="Ex: Porto Alegre" />
        </FieldGroup>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FieldGroup>
          <Label>Pé dominante</Label>
          <Select options={[{ value: 'destro', label: 'Destro' }, { value: 'canhoto', label: 'Canhoto' }, { value: 'ambidestro', label: 'Ambidestro' }]} value={data.peDominante} onChange={e => setData({ ...data, peDominante: e.target.value })} />
        </FieldGroup>
        <FieldGroup>
          <Label>Clube atual</Label>
          <Input value={data.clubeAtual} onChange={e => setData({ ...data, clubeAtual: e.target.value })} placeholder="Opcional" />
        </FieldGroup>
      </div>
      <FieldGroup>
        <Label>Posição Principal</Label>
        <div className="grid grid-cols-3 gap-2">
          {posicoes.map(p => (
            <button key={p.value} type="button" onClick={() => setData({ ...data, posicao: p.value })}
              className={cn('p-2 border rounded-lg text-center transition-all',
                data.posicao === p.value ? 'border-green-400 bg-green-50 text-green-700' : 'border-neutral-100 hover:border-neutral-300'
              )}>
              <div className="text-sm font-medium">{p.label}</div>
              <div className="text-[10px] text-neutral-400">{p.sub}</div>
            </button>
          ))}
        </div>
      </FieldGroup>
      <div className="flex justify-end mt-4">
        <Button variant="dark" onClick={onNext} disabled={!data.nomeAtleta || !data.dataNascimento || !data.estado || !data.cidade || !data.descricao}>
          Continuar <ArrowRight size={15} />
        </Button>
      </div>
    </div>
  )
}

function Step2({ data, setData, onBack, onNext }: any) {
  const habilidades = ['Técnica', 'Velocidade', 'Visão de jogo', 'Físico', 'Finalização', 'Passes']
  return (
    <div className="flex flex-col gap-6">
      <div className="mb-2">
        <h2 className="text-xl font-medium">Habilidades</h2>
        <p className="text-xs text-neutral-400">Defina o nível atual do atleta em cada fundamento (1 a 99).</p>
      </div>
      <div className="flex flex-col gap-5">
        {habilidades.map((h, i) => (
          <div key={h} className="flex items-center gap-4">
            <div className="w-24 flex-shrink-0 text-sm font-medium">{h}</div>
            <input type="range" min={1} max={99} value={data.habilidades[i]}
              onChange={e => {
                const n = [...data.habilidades]
                n[i] = +e.target.value
                setData({ ...data, habilidades: n })
              }}
              className="flex-1 accent-green-500" />
            <div className="w-9 h-8 bg-green-100 text-green-700 rounded-lg flex items-center justify-center text-sm font-medium">
              {data.habilidades[i]}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-4">
        <Button variant="outline" onClick={onBack}><ArrowLeft size={15} /> Voltar</Button>
        <Button variant="dark" onClick={onNext}>Continuar <ArrowRight size={15} /></Button>
      </div>
    </div>
  )
}

function Step3({ data, setData, onBack, onNext }: any) {
  const addPhoto = () => setData({ ...data, fotosAdicionais: [...data.fotosAdicionais, ''] })
  const updatePhoto = (index: number, val: string) => {
    const next = [...data.fotosAdicionais]
    next[index] = val
    setData({ ...data, fotosAdicionais: next })
  }
  const removePhoto = (index: number) => {
    setData({ ...data, fotosAdicionais: data.fotosAdicionais.filter((_: any, i: number) => i !== index) })
  }

  const addVideo = () => setData({ ...data, videos: [...data.videos, { url: '', titulo: '' }] })
  const updateVideo = (index: number, field: string, val: string) => {
    const next = [...data.videos]
    next[index] = { ...next[index], [field]: val }
    setData({ ...data, videos: next })
  }
  const removeVideo = (index: number) => {
    setData({ ...data, videos: data.videos.filter((_: any, i: number) => i !== index) })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="mb-2">
        <h2 className="text-xl font-medium">Mídia</h2>
        <p className="text-xs text-neutral-400">Adicione fotos e links de vídeos para impressionar os clubes.</p>
      </div>

      {/* Main Photo */}
      <FieldGroup>
        <Label className="flex items-center gap-2"><ImageIcon size={14} /> Foto de Perfil (URL)</Label>
        <Input 
          placeholder="https://exemplo.com/foto.jpg" 
          value={data.fotoUrl}
          onChange={e => setData({ ...data, fotoUrl: e.target.value })}
        />
        <p className="text-[10px] text-neutral-400 italic">Insira o link de uma foto hospedada.</p>
      </FieldGroup>

      {/* Additional Photos */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2"><ImageIcon size={14} /> Fotos Adicionais</Label>
        {data.fotosAdicionais.map((url: string, i: number) => (
          <div key={i} className="flex gap-2">
            <Input 
              placeholder="URL da foto..." 
              value={url}
              onChange={e => updatePhoto(i, e.target.value)}
            />
            <button onClick={() => removePhoto(i)} className="p-2 text-red-400 hover:text-red-500 transition-colors">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
        {data.fotosAdicionais.length < 4 && (
          <button 
            onClick={addPhoto}
            className="w-full py-2 border border-dashed border-neutral-300 rounded-lg text-xs text-neutral-500 hover:border-green-400 hover:text-green-600 transition-all flex items-center justify-center gap-1"
          >
            <Plus size={14} /> Adicionar outra foto
          </button>
        )}
      </div>

      {/* YouTube Videos */}
      <div className="space-y-3">
        <Label className="flex items-center gap-2 text-red-600"><Youtube size={14} /> Vídeos do YouTube (Links)</Label>
        {data.videos.map((v: any, i: number) => (
          <div key={i} className="bg-neutral-50 p-3 rounded-xl border border-neutral-100 space-y-2">
            <Input 
              placeholder="https://youtube.com/watch?v=..." 
              value={v.url}
              onChange={e => updateVideo(i, 'url', e.target.value)}
            />
            <div className="flex gap-2">
              <Input 
                placeholder="Título (ex: Melhores Momentos)" 
                value={v.titulo}
                onChange={e => updateVideo(i, 'titulo', e.target.value)}
              />
              <button onClick={() => removeVideo(i)} className="p-2 text-red-400 hover:text-red-500">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
        {data.videos.length < 2 && (
          <button 
            onClick={addVideo}
            className="w-full py-2 border border-dashed border-red-200 rounded-lg text-xs text-red-500 hover:border-red-400 hover:text-red-600 transition-all flex items-center justify-center gap-1"
          >
            <Plus size={14} /> Adicionar vídeo do YouTube
          </button>
        )}
      </div>

      <div className="flex justify-between mt-4">
        <Button variant="outline" onClick={onBack}><ArrowLeft size={15} /> Voltar</Button>
        <Button variant="dark" onClick={onNext}>Continuar <ArrowRight size={15} /></Button>
      </div>
    </div>
  )
}

function Step4({ data, setData, onBack, onNext }: any) {
  const addConquista = () => setData({ ...data, conquistas: [...data.conquistas, { titulo: '', ano: '', descricao: '' }] })
  
  const updateConquista = (index: number, field: string, val: string) => {
    const next = [...data.conquistas]
    next[index] = { ...next[index], [field]: val }
    setData({ ...data, conquistas: next })
  }

  const removeConquista = (index: number) => {
    setData({ ...data, conquistas: data.conquistas.filter((_: any, i: number) => i !== index) })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="mb-2">
        <h2 className="text-xl font-medium">Conquistas & Títulos</h2>
        <p className="text-xs text-neutral-400">Registre torneios e prêmios do atleta.</p>
      </div>

      <div className="space-y-4">
        {data.conquistas.map((c: any, i: number) => (
          <div key={i} className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 relative shadow-sm animate-in fade-in slide-in-from-right duration-300">
            <div className="flex flex-col sm:flex-row gap-3 mb-3">
              <div className="flex-1">
                <Label>Nome do Título/Torneio</Label>
                <Input 
                  placeholder="Ex: Campeão Gaúcho Sub-15" 
                  value={c.titulo}
                  onChange={e => updateConquista(i, 'titulo', e.target.value)}
                  className="bg-white"
                />
              </div>
              <div className="w-full sm:w-24">
                <Label>Ano</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="2024" 
                    value={c.ano}
                    onChange={e => updateConquista(i, 'ano', e.target.value)}
                    className="bg-white"
                  />
                  <button 
                    onClick={() => removeConquista(i)} 
                    className="sm:hidden p-2 text-amber-400 hover:text-red-500 transition-colors bg-white border border-neutral-200 rounded-lg flex-shrink-0"
                    title="Excluir"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              {/* Desktop Delete Button */}
              <button 
                onClick={() => removeConquista(i)} 
                className="hidden sm:flex mt-6 p-2 text-amber-400 hover:text-red-500 transition-colors bg-white border border-neutral-200 rounded-lg items-center justify-center self-start"
                title="Excluir"
              >
                <Trash2 size={18} />
              </button>
            </div>
            
            <div>
              <Label>Descrição Curta</Label>
              <Input 
                placeholder="Destaque da competição ou artilheiro..." 
                value={c.descricao}
                onChange={e => updateConquista(i, 'descricao', e.target.value)}
                className="bg-white w-full"
              />
            </div>
          </div>
        ))}

        {data.conquistas.length === 0 && (
          <div className="py-8 text-center bg-neutral-50 border border-dashed border-neutral-200 rounded-xl">
             <Trophy size={32} className="mx-auto text-neutral-200 mb-2" />
             <p className="text-xs text-neutral-400">Nenhuma conquista registrada ainda.</p>
          </div>
        )}

        <button 
          onClick={addConquista}
          className="w-full py-3 border border-dashed border-amber-300 rounded-xl text-xs text-amber-700 bg-amber-50 hover:bg-amber-100 transition-all flex items-center justify-center gap-1 font-bold"
        >
          <Trophy size={14} /> ADICIONAR CONQUISTA / TÍTULO
        </button>
      </div>

      <div className="flex justify-between mt-4">
        <Button variant="outline" onClick={onBack}><ArrowLeft size={15} /> Voltar</Button>
        <Button variant="dark" onClick={onNext}>Continuar <ArrowRight size={15} /></Button>
      </div>
    </div>
  )
}

function Step5({ data, setData, onBack, onSubmit, loading, error }: any) {
  const items = [
    { key: 'visivel', icon: <Eye size={16} />, title: 'Perfil visível para clubes', sub: 'Apenas clubes aprovados podem ver' },
    { key: 'exibirCidade', icon: <MapPin size={16} />, title: 'Exibir cidade e estado', sub: 'Privacidade de localização' },
    { key: 'mensagens', icon: <MessageCircle size={16} />, title: 'Receber mensagens', sub: 'Clubes podem solicitar contato direto' },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="mb-2">
        <h2 className="text-xl font-medium">Privacidade</h2>
        <p className="text-xs text-neutral-400">Controle quem pode ver e contatar o atleta.</p>
      </div>

      <div className="border border-neutral-200 rounded-xl overflow-hidden shadow-sm">
        {items.map((item, i) => (
          <div key={item.key} className={cn('flex items-center gap-4 p-4', i < items.length - 1 && 'border-b border-neutral-100')}>
            <div className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-500 flex items-center justify-center">{item.icon}</div>
            <div className="flex-1">
              <div className="text-sm font-medium leading-none mb-1">{item.title}</div>
              <div className="text-[10px] text-neutral-400">{item.sub}</div>
            </div>
            <button type="button" onClick={() => setData({ ...data, [item.key]: !data[item.key] })}
              className={cn('relative w-10 h-6 rounded-full transition-colors', data[item.key] ? 'bg-green-400' : 'bg-neutral-300')}>
              <span className={cn('absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all', data[item.key] ? 'left-5' : 'left-1')} />
            </button>
          </div>
        ))}
      </div>
      {error && <div className="text-red-500 text-xs bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>}
      <div className="flex justify-between mt-4">
        <Button variant="outline" onClick={onBack}><ArrowLeft size={15} /> Voltar</Button>
        <Button variant="dark" loading={loading} onClick={onSubmit}>Publicar perfil <ArrowRight size={15} /></Button>
      </div>
    </div>
  )
}

function SuccessScreen() {
  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-neutral-200 rounded-3xl p-10 text-center shadow-sm">
        <div className="text-green-400 flex justify-center mb-6">
          <CircleCheckBig size={64} />
        </div>
        <h2 className="font-display text-4xl text-green-700 mb-3 tracking-tight">PERFIL PUBLICADO!</h2>
        <p className="text-sm text-neutral-500 mb-8 leading-relaxed">Parabéns! O perfil do seu atleta está completo e pronto para ser descoberto pelos melhores clubes do Brasil.</p>
        <Link href="/dashboard" className="block"><Button variant="dark" className="w-full py-4 text-base">Ir para o Dashboard</Button></Link>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input, Select, Label, FieldGroup } from '@/components/ui/Form'
import { ESTADOS } from '@/lib/utils'
import { ArrowLeft, ArrowRight, Eye, MapPin, Video, MessageCircle, CircleCheckBig, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createAthlete } from './actions'

const STEP_LABELS = ['Dados', 'Habilidades', 'Mídia', 'Privacidade']

export default function NovoAtletaPage() {
  const [step, setStep] = useState(1)
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')
  const router = useRouter()

  const [data, setData] = useState({
    nomeAtleta: '',
    dataNascimento: '',
    estado: '',
    cidade: '',
    posicao: 'MEI',
    peDominante: 'destro',
    clubeAtual: '',
    habilidades: [75, 68, 82, 60, 71, 79],
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
    <div className="min-h-screen bg-neutral-100 flex flex-col items-center justify-start px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/dashboard" className="font-display text-3xl tracking-widest text-green-700 inline-block mb-2">
            SCOUT<span className="text-amber-500">JR</span>
          </Link>
          <h1 className="text-neutral-500 text-sm font-medium uppercase tracking-widest">Novo Atleta</h1>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="h-1 bg-neutral-200 rounded-full mb-3 overflow-hidden">
            <div className="h-full bg-green-400 rounded-full transition-all duration-400" style={{ width: `${(step / 4) * 100}%` }} />
          </div>
          <div className="flex justify-between">
            {STEP_LABELS.map((l, i) => (
              <span key={l} className={cn('text-[10px] font-medium', i + 1 === step ? 'text-green-700' : i + 1 < step ? 'text-green-400' : 'text-neutral-400')}>
                {l}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-8 shadow-sm">
          {step === 1 && <Step1 data={data} setData={setData} onNext={() => setStep(2)} />}
          {step === 2 && <Step2 data={data} setData={setData} onBack={() => setStep(1)} onNext={() => setStep(3)} />}
          {step === 3 && <Step3 data={data} setData={setData} onBack={() => setStep(2)} onNext={() => setStep(4)} />}
          {step === 4 && (
            <Step4 
              data={data} 
              setData={setData} 
              onBack={() => setStep(3)} 
              onSubmit={handleSubmit} 
              loading={loading}
              error={serverError}
            />
          )}
        </div>

        <div className="mt-8 text-center">
          <Link href="/dashboard" className="text-sm text-neutral-400 hover:text-neutral-600 flex items-center justify-center gap-1">
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
      <h2 className="text-xl font-medium mb-1">Dados básicos</h2>
      <div className="grid grid-cols-2 gap-3">
        <FieldGroup>
          <Label>Nome do atleta</Label>
          <Input value={data.nomeAtleta} onChange={e => setData({ ...data, nomeAtleta: e.target.value })} placeholder="Gabriel Silva" />
        </FieldGroup>
        <FieldGroup>
          <Label>Data de nascimento</Label>
          <Input type="date" value={data.dataNascimento} onChange={e => setData({ ...data, dataNascimento: e.target.value })} />
        </FieldGroup>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FieldGroup>
          <Label>Estado</Label>
          <Select options={ESTADOS} value={data.estado} onChange={e => setData({ ...data, estado: e.target.value })} placeholder="Selecione" />
        </FieldGroup>
        <FieldGroup>
          <Label>Cidade</Label>
          <Input value={data.cidade} onChange={e => setData({ ...data, cidade: e.target.value })} placeholder="Porto Alegre" />
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
        <Label>Posição</Label>
        <div className="grid grid-cols-3 gap-2">
          {posicoes.map(p => (
            <button key={p.value} type="button" onClick={() => setData({ ...data, posicao: p.value })}
              className={cn('p-2 border rounded-lg text-center transition-all',
                data.posicao === p.value ? 'border-green-400 bg-green-50 text-green-700' : 'border-neutral-200 hover:border-neutral-300'
              )}>
              <div className="text-sm font-medium">{p.label}</div>
              <div className="text-[10px] text-neutral-400">{p.sub}</div>
            </button>
          ))}
        </div>
      </FieldGroup>
      <div className="flex justify-end mt-4">
        <Button variant="dark" onClick={onNext} disabled={!data.nomeAtleta || !data.dataNascimento || !data.estado || !data.cidade}>
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
      <h2 className="text-xl font-medium mb-1">Habilidades</h2>
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

function Step3({ onBack, onNext }: any) {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-medium mb-1">Mídia (Opcional)</h2>
      <div className="border-2 border-dashed border-neutral-200 rounded-xl p-8 text-center hover:border-green-400 transition-colors cursor-pointer">
        <div className="text-neutral-300 mb-2 flex justify-center"><Video size={32} /></div>
        <div className="text-sm font-medium text-neutral-600 mb-1">Foto do atleta</div>
        <div className="text-xs text-neutral-400">Pode ser adicionado depois no perfil</div>
      </div>
      <div className="flex justify-between mt-4">
        <Button variant="outline" onClick={onBack}><ArrowLeft size={15} /> Voltar</Button>
        <Button variant="dark" onClick={onNext}>Continuar <ArrowRight size={15} /></Button>
      </div>
    </div>
  )
}

function Step4({ data, setData, onBack, onSubmit, loading, error }: any) {
  const items = [
    { key: 'visivel', icon: <Eye size={16} />, title: 'Perfil visível para clubes', sub: 'Apenas clubes aprovados podem ver' },
    { key: 'exibirCidade', icon: <MapPin size={16} />, title: 'Exibir cidade e estado', sub: 'Privacidade de localização' },
    { key: 'mensagens', icon: <MessageCircle size={16} />, title: 'Receber mensagens', sub: 'Contato direto via plataforma' },
  ]

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-medium mb-1">Privacidade</h2>
      <div className="border border-neutral-200 rounded-xl overflow-hidden">
        {items.map((item, i) => (
          <div key={item.key} className={cn('flex items-center gap-4 p-4', i < items.length - 1 && 'border-b border-neutral-100')}>
            <div className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-500 flex items-center justify-center">{item.icon}</div>
            <div className="flex-1">
              <div className="text-sm font-medium">{item.title}</div>
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
      <div className="w-full max-w-md bg-white border border-neutral-200 rounded-2xl p-10 text-center shadow-sm">
        <div className="text-green-400 flex justify-center mb-4">
          <CircleCheckBig size={56} />
        </div>
        <h2 className="font-display text-4xl text-green-700 mb-3">CONCLUÍDO!</h2>
        <p className="text-sm text-neutral-500 mb-8">O perfil do seu atleta foi criado com sucesso e já está disponível para os clubes.</p>
        <Link href="/dashboard"><Button variant="dark" className="w-full">Ir para o Dashboard</Button></Link>
      </div>
    </div>
  )
}

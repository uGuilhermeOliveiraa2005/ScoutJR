'use client'
// ============================================
// CAMINHO: src/app/cadastro/page.tsx
// ============================================

import Link from 'next/link'
import React, { Suspense, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { cadastroResponsavelSchema, cadastroClubeSchema, type CadastroResponsavelInput, type CadastroClubeInput } from '@/lib/validations'
import { createSupabaseBrowser } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input, Select, Label, FieldGroup, Textarea } from '@/components/ui/Form'
import { ESTADOS } from '@/lib/utils'
import { 
  Users, Landmark, ArrowLeft, ArrowRight, Eye, MapPin, 
  Video, MessageCircle, CircleCheckBig, Plus, Trash2, 
  Trophy, Youtube, Image as ImageIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AthleteProfilePreview } from '@/components/atletas/AthleteProfilePreview'

type Tipo = 'responsavel' | 'clube'

const STEP_LABELS_RESP = ['Tipo', 'Conta', 'Atleta', 'Habilidades', 'Mídia', 'Conquistas', 'Visualizar', 'Privacidade']
const STEP_LABELS_CLUBE = ['Tipo', 'Conta', 'Verificação']



export default function CadastroPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-100 flex items-center justify-center">Carregando...</div>}>
      <CadastroForm />
    </Suspense>
  )
}

function CadastroForm() {
  const [tipo, setTipo] = useState<Tipo>('responsavel')
  const [step, setStep] = useState(1)
  const [done, setDone] = useState(false)
  const [serverError, setServerError] = useState('')
  const supabase = createSupabaseBrowser()

  const [atletaData, setAtletaData] = useState({
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

  const totalSteps = tipo === 'responsavel' ? 7 : 3
  const labels = tipo === 'responsavel' ? STEP_LABELS_RESP : STEP_LABELS_CLUBE

  const formResp = useForm<CadastroResponsavelInput>({ resolver: zodResolver(cadastroResponsavelSchema) })
  const formClube = useForm<CadastroClubeInput>({ resolver: zodResolver(cadastroClubeSchema) })

  async function submitResponsavel(data: CadastroResponsavelInput) {
    setServerError('')
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          nome: data.nome, role: 'responsavel', telefone: data.telefone,
          atleta_nome: atletaData.nomeAtleta, 
          atleta_descricao: atletaData.descricao,
          atleta_nascimento: atletaData.dataNascimento,
          atleta_estado: atletaData.estado, atleta_cidade: atletaData.cidade,
          atleta_posicao: atletaData.posicao, atleta_pe: atletaData.peDominante,
          atleta_clube: atletaData.clubeAtual, atleta_habilidades: atletaData.habilidades,
          atleta_foto_url: atletaData.fotoUrl,
          atleta_fotos_adicionais: atletaData.fotosAdicionais,
          atleta_videos: atletaData.videos,
          atleta_conquistas: atletaData.conquistas,
          atleta_visivel: atletaData.visivel, atleta_exibir_cidade: atletaData.exibirCidade,
          atleta_mensagens: atletaData.mensagens,
        },
      },
    })
    if (error) { setServerError(error.message); return }
    setDone(true)
  }

  async function submitClube(data: CadastroClubeInput) {
    setServerError('')
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          nome: data.nome, role: 'clube', telefone: data.telefone,
          estado: data.estado, cidade: data.cidade, cnpj: data.cnpj ?? null,
        },
      },
    })
    if (error) { setServerError(error.message); return }
    setDone(true)
  }

  if (done) return <SuccessScreen tipo={tipo} />

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col items-center justify-start px-4 py-8 sm:py-12">
      <div className="w-full max-w-lg">

        <div className="text-center mb-6 sm:mb-8">
          <Link href="/" className="font-display text-2xl sm:text-3xl tracking-widest text-green-700 inline-block mb-1 sm:mb-2">
            SCOUT<span className="text-amber-500">JR</span>
          </Link>
        </div>

        {/* Progress */}
        <div className="mb-5 sm:mb-6">
          <div className="h-1.5 bg-neutral-200 rounded-full mb-2.5 sm:mb-3 overflow-hidden">
            <div
              className="h-full bg-green-400 rounded-full transition-all duration-500"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
          <div className="flex justify-between">
            {labels.map((l, i) => (
              <span
                key={l}
                className={cn(
                  'text-[8px] sm:text-[10px] font-bold uppercase tracking-tight',
                  i + 1 === step ? 'text-green-700' : i + 1 < step ? 'text-green-400' : 'text-neutral-300'
                )}
              >
                {l}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-5 sm:p-8 shadow-sm">

          {/* STEP 1 — Tipo */}
          {step === 1 && (
            <div>
              <div className="font-display text-3xl sm:text-4xl text-neutral-400 mb-1.5 sm:mb-2 leading-none">01</div>
              <h2 className="text-lg sm:text-xl font-medium mb-1">Que tipo de conta?</h2>
              <p className="text-xs sm:text-sm text-neutral-500 mb-5 sm:mb-6">Escolha o perfil que se aplica.</p>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
                {([
                  { val: 'responsavel', icon: <Users size={22} />, title: 'Sou responsável', sub: 'Quero cadastrar meu filho(a) como atleta' },
                  { val: 'clube', icon: <Landmark size={22} />, title: 'Sou um clube', sub: 'Quero buscar e recrutar jovens talentos' },
                ] as const).map(opt => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => setTipo(opt.val)}
                    className={cn(
                      'p-4 sm:p-5 border-2 rounded-xl text-left transition-all',
                      tipo === opt.val ? 'border-green-400 bg-green-50' : 'border-neutral-200 hover:border-neutral-300'
                    )}
                  >
                    <div className={cn('mb-2 sm:mb-3', tipo === opt.val ? 'text-green-600' : 'text-neutral-400')}>
                      {opt.icon}
                    </div>
                    <div className="text-xs sm:text-sm font-medium mb-0.5 sm:mb-1">{opt.title}</div>
                    <div className="text-[10px] sm:text-xs text-neutral-400 leading-snug">{opt.sub}</div>
                  </button>
                ))}
              </div>
              <div className="flex justify-end">
                <Button variant="dark" onClick={() => setStep(2)}>
                  Continuar <ArrowRight size={14} />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2 — Dados responsável */}
          {step === 2 && tipo === 'responsavel' && (
            <form onSubmit={formResp.handleSubmit(() => setStep(3))}>
              <div className="font-display text-3xl sm:text-4xl text-neutral-400 mb-1.5 sm:mb-2 leading-none">02</div>
              <h2 className="text-lg sm:text-xl font-medium mb-1">Seus dados de contato</h2>
              <p className="text-xs sm:text-sm text-neutral-500 mb-4 sm:mb-6">Nunca aparecem no perfil público do atleta.</p>
              <div className="flex flex-col gap-3 sm:gap-4">
                <FieldGroup>
                  <Label>Nome completo</Label>
                  <Input placeholder="João da Silva" error={formResp.formState.errors.nome?.message} {...formResp.register('nome')} />
                </FieldGroup>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FieldGroup>
                    <Label>E-mail</Label>
                    <Input type="email" placeholder="joao@email.com" error={formResp.formState.errors.email?.message} {...formResp.register('email')} />
                  </FieldGroup>
                  <FieldGroup>
                    <Label>Telefone / WhatsApp</Label>
                    <Input type="tel" placeholder="(51) 9 9999-9999" error={formResp.formState.errors.telefone?.message} {...formResp.register('telefone')} />
                  </FieldGroup>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <FieldGroup>
                    <Label>Senha</Label>
                    <Input type="password" placeholder="Mín. 8 caracteres" error={formResp.formState.errors.password?.message} {...formResp.register('password')} />
                  </FieldGroup>
                  <FieldGroup>
                    <Label>Confirmar senha</Label>
                    <Input type="password" placeholder="Repita a senha" error={formResp.formState.errors.confirmPassword?.message} {...formResp.register('confirmPassword')} />
                  </FieldGroup>
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-xs text-amber-700 leading-relaxed">
                  Ao criar uma conta você confirma ser o responsável legal e concorda com os{' '}
                  <Link href="/termos" className="underline">Termos de Uso</Link>.
                </div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" className="mt-0.5 accent-green-500" {...formResp.register('aceito_termos')} />
                  <span className="text-xs text-neutral-500">Li e aceito os termos de uso e política de privacidade</span>
                </label>
                {formResp.formState.errors.aceito_termos && (
                  <p className="text-xs text-red-500">{formResp.formState.errors.aceito_termos.message}</p>
                )}
              </div>
              <div className="flex justify-between mt-5 sm:mt-6">
                <Button variant="outline" type="button" onClick={() => setStep(1)}>
                  <ArrowLeft size={14} /> Voltar
                </Button>
                <Button variant="dark" type="submit">Continuar <ArrowRight size={14} /></Button>
              </div>
            </form>
          )}

          {step >= 3 && step <= 8 && tipo === 'responsavel' && (
            <AtletaSteps 
              step={step} 
              setStep={setStep} 
              data={atletaData} 
              setData={setAtletaData} 
              loading={formResp.formState.isSubmitting}
              serverError={serverError}
              onSubmit={formResp.handleSubmit(submitResponsavel)}
            />
          )}

          {/* STEP 2 — Dados clube */}
          {step === 2 && tipo === 'clube' && (
            <form onSubmit={formClube.handleSubmit(() => setStep(3))}>
              <div className="font-display text-3xl sm:text-4xl text-neutral-400 mb-1.5 sm:mb-2 leading-none">02</div>
              <h2 className="text-lg sm:text-xl font-medium mb-1">Dados do clube</h2>
              <p className="text-xs sm:text-sm text-neutral-500 mb-4 sm:mb-6">Informações do clube ou escolinha.</p>
              <div className="flex flex-col gap-3 sm:gap-4">
                <FieldGroup>
                  <Label>Nome do clube / escolinha</Label>
                  <Input placeholder="Ex: Escolinha Grêmio FBPA" error={formClube.formState.errors.nome?.message} {...formClube.register('nome')} />
                </FieldGroup>
                <FieldGroup>
                  <Label>CNPJ (opcional)</Label>
                  <Input placeholder="00.000.000/0000-00" error={formClube.formState.errors.cnpj?.message} {...formClube.register('cnpj')} />
                </FieldGroup>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FieldGroup>
                    <Label>E-mail</Label>
                    <Input type="email" placeholder="contato@clube.com.br" error={formClube.formState.errors.email?.message} {...formClube.register('email')} />
                  </FieldGroup>
                  <FieldGroup>
                    <Label>Telefone</Label>
                    <Input type="tel" placeholder="(51) 3333-3333" error={formClube.formState.errors.telefone?.message} {...formClube.register('telefone')} />
                  </FieldGroup>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <FieldGroup>
                    <Label>Estado</Label>
                    <Select options={ESTADOS} placeholder="Selecione" error={formClube.formState.errors.estado?.message} {...formClube.register('estado')} />
                  </FieldGroup>
                  <FieldGroup>
                    <Label>Cidade</Label>
                    <Input placeholder="Porto Alegre" error={formClube.formState.errors.cidade?.message} {...formClube.register('cidade')} />
                  </FieldGroup>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <FieldGroup>
                    <Label>Senha</Label>
                    <Input type="password" placeholder="Mín. 8 caracteres" error={formClube.formState.errors.password?.message} {...formClube.register('password')} />
                  </FieldGroup>
                  <FieldGroup>
                    <Label>Confirmar</Label>
                    <Input type="password" error={formClube.formState.errors.confirmPassword?.message} {...formClube.register('confirmPassword')} />
                  </FieldGroup>
                </div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" className="mt-0.5 accent-green-500" {...formClube.register('aceito_termos')} />
                  <span className="text-xs text-neutral-500">Li e aceito os termos de uso e política de privacidade</span>
                </label>
                {formClube.formState.errors.aceito_termos && (
                  <p className="text-xs text-red-500">{formClube.formState.errors.aceito_termos.message}</p>
                )}
              </div>
              <div className="flex justify-between mt-5 sm:mt-6">
                <Button variant="outline" type="button" onClick={() => setStep(1)}>
                  <ArrowLeft size={14} /> Voltar
                </Button>
                <Button variant="dark" type="submit">Continuar <ArrowRight size={14} /></Button>
              </div>
            </form>
          )}

          {step === 3 && tipo === 'clube' && (
            <div>
              <div className="font-display text-3xl sm:text-4xl text-neutral-400 mb-1.5 sm:mb-2 leading-none">03</div>
              <h2 className="text-lg sm:text-xl font-medium mb-1">Verificação de clube</h2>
              <p className="text-xs sm:text-sm text-neutral-500 mb-4 sm:mb-6">O que você ganha com a verificação.</p>
              <div className="border border-neutral-200 rounded-xl overflow-hidden mb-5 sm:mb-6">
                {[
                  { icon: <Eye size={15} />, title: 'Acesso a todos os perfis', sub: 'Visualize perfis completos com stats e vídeos' },
                  { icon: <MapPin size={15} />, title: 'Filtros avançados', sub: 'Posição, idade, cidade, habilidades e mais' },
                  { icon: <MessageCircle size={15} />, title: 'Contato direto', sub: 'Envie mensagens para as famílias' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4 border-b border-neutral-100 last:border-none">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-green-100 text-green-700 flex items-center justify-center flex-shrink-0">{item.icon}</div>
                    <div>
                      <div className="text-xs sm:text-sm font-medium">{item.title}</div>
                      <div className="text-[10px] sm:text-xs text-neutral-400">{item.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
              {serverError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-xs sm:text-sm rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 mb-4">{serverError}</div>
              )}
              <div className="flex justify-between">
                <Button variant="outline" type="button" onClick={() => setStep(2)}>
                  <ArrowLeft size={14} /> Voltar
                </Button>
                <Button variant="dark" loading={formClube.formState.isSubmitting} onClick={formClube.handleSubmit(submitClube)}>
                  Criar conta <ArrowRight size={14} />
                </Button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs sm:text-sm text-neutral-400 mt-5 sm:mt-6">
          Já tem conta?{' '}
          <Link href="/login" className="text-green-600 hover:text-green-700 font-medium">Entrar</Link>
        </p>
      </div>
    </div>
  )
}

function AtletaSteps({ step, setStep, data, setData, loading, serverError, onSubmit }: any) {
  const posicoes = [
    { value: 'GK', label: 'GK', sub: 'Goleiro' }, { value: 'LD', label: 'LD', sub: 'Lat. Dir.' },
    { value: 'LE', label: 'LE', sub: 'Lat. Esq.' }, { value: 'ZAG', label: 'ZAG', sub: 'Zagueiro' },
    { value: 'VOL', label: 'VOL', sub: 'Volante' }, { value: 'MEI', label: 'MEI', sub: 'Meia' },
    { value: 'EXT', label: 'EXT', sub: 'Extremo' }, { value: 'SA', label: 'SA', sub: '2° Ataq.' },
    { value: 'CA', label: 'CA', sub: 'C. Avante' },
  ]
  const habilidades = ['Técnica', 'Velocidade', 'Visão de jogo', 'Físico', 'Finalização', 'Passes']
  
  if (step === 3) return (
    <div className="flex flex-col gap-4">
      <div className="font-display text-3xl sm:text-4xl text-neutral-400 mb-1.5 sm:mb-2 leading-none">03</div>
      <h2 className="text-lg sm:text-xl font-medium mb-1">Dados do atleta</h2>
      <p className="text-xs sm:text-sm text-neutral-500 mb-4 sm:mb-6">Apenas cidade e estado são exibidos publicamente.</p>
      <div className="flex flex-col gap-3 sm:gap-4">
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
          <Textarea 
            placeholder="Conte a história do atleta, pontos fortes e trajetória..." 
            value={data.descricao}
            onChange={e => setData({ ...data, descricao: e.target.value })}
            className="min-h-[100px]"
          />
        </FieldGroup>

        <div className="grid grid-cols-2 gap-3">
          <FieldGroup>
            <Label>Estado</Label>
            <Select options={ESTADOS} placeholder="Selecione" value={data.estado} onChange={(e: any) => setData({ ...data, estado: e.target.value })} />
          </FieldGroup>
          <FieldGroup>
            <Label>Cidade</Label>
            <Input placeholder="Porto Alegre" value={data.cidade} onChange={(e: any) => setData({ ...data, city: e.target.value, cidade: e.target.value })} />
          </FieldGroup>
        </div>
        <FieldGroup>
          <Label>Posição Principal</Label>
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mt-1">
            {posicoes.map(p => (
              <button key={p.value} type="button" onClick={() => setData({ ...data, posicao: p.value })}
                className={cn('p-2 border rounded-lg text-center transition-all',
                  data.posicao === p.value ? 'border-green-400 bg-green-50 text-green-700' : 'border-neutral-200 hover:border-neutral-300'
                )}>
                <div className="text-xs sm:text-sm font-medium">{p.label}</div>
                <div className="text-[9px] sm:text-[10px] text-neutral-400">{p.sub}</div>
              </button>
            ))}
          </div>
        </FieldGroup>
      </div>
      <div className="flex justify-between mt-5 sm:mt-6">
        <Button variant="outline" onClick={() => setStep(2)}><ArrowLeft size={14} /> Voltar</Button>
        <Button variant="dark" onClick={() => setStep(4)} disabled={!data.nomeAtleta || !data.dataNascimento || !data.estado || !data.cidade || !data.descricao}>
          Continuar <ArrowRight size={14} />
        </Button>
      </div>
    </div>
  )

  if (step === 4) return (
    <div>
      <div className="font-display text-3xl sm:text-4xl text-neutral-400 mb-1.5 sm:mb-2 leading-none">04</div>
      <h2 className="text-lg sm:text-xl font-medium mb-1">Habilidades</h2>
      <p className="text-xs sm:text-sm text-neutral-500 mb-4 sm:mb-6">Seja honesto. Clubes valorizam evolução.</p>
      <div className="flex flex-col gap-4 sm:gap-5">
        {habilidades.map((h, i) => (
          <div key={h} className="flex items-center gap-3 sm:gap-4">
            <div className="w-24 sm:w-28 flex-shrink-0 text-xs sm:text-sm font-medium">{h}</div>
            <input type="range" min={1} max={99} value={data.habilidades[i]}
              onChange={e => {
                const n = [...data.habilidades]
                n[i] = +e.target.value
                setData({ ...data, habilidades: n })
              }}
              className="flex-1 accent-green-500" />
            <div className="w-8 h-7 sm:w-9 sm:h-8 bg-green-100 text-green-700 rounded-lg flex items-center justify-center text-xs sm:text-sm font-medium flex-shrink-0">
              {data.habilidades[i]}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-5 sm:mt-6">
        <Button variant="outline" onClick={() => setStep(3)}><ArrowLeft size={14} /> Voltar</Button>
        <Button variant="dark" onClick={() => setStep(5)}>Continuar <ArrowRight size={14} /></Button>
      </div>
    </div>
  )

  if (step === 5) {
    const addPhoto = () => setData({ ...data, fotosAdicionais: [...data.fotosAdicionais, ''] })
    const updatePhoto = (i: number, val: string) => {
      const next = [...data.fotosAdicionais]
      next[i] = val
      setData({ ...data, fotosAdicionais: next })
    }
    const removePhoto = (i: number) => setData({ ...data, fotosAdicionais: data.fotosAdicionais.filter((_:any, idx:number) => idx !== i) })

    const addVideo = () => setData({ ...data, videos: [...data.videos, { url: '', titulo: '' }] })
    const updateVideo = (i: number, field: string, val: string) => {
      const next = [...data.videos]
      next[i] = { ...next[i], [field]: val }
      setData({ ...data, videos: next })
    }
    const removeVideo = (i: number) => setData({ ...data, videos: data.videos.filter((_:any, idx:number) => idx !== i) })

    return (
      <div className="flex flex-col gap-6">
        <div>
          <div className="font-display text-3xl sm:text-4xl text-neutral-400 mb-1.5 sm:mb-2 leading-none">05</div>
          <h2 className="text-lg sm:text-xl font-medium mb-1">Fotos e vídeos</h2>
          <p className="text-xs sm:text-sm text-neutral-500 mb-4 sm:mb-6">Perfis com vídeos recebem até 8× mais interesse.</p>
        </div>

        <FieldGroup>
          <Label className="flex items-center gap-2"><ImageIcon size={14} /> Foto de Capa / Perfil (URL)</Label>
          <Input placeholder="URL da foto..." value={data.fotoUrl} onChange={e => setData({ ...data, fotoUrl: e.target.value })} />
          <p className="text-[10px] text-neutral-400 italic">Resolução recomendada: 1280x720 (16:9).</p>
        </FieldGroup>

        <div className="space-y-2">
          <Label>Fotos Adicionais</Label>
          {data.fotosAdicionais.map((url:string, i:number) => (
            <div key={i} className="flex gap-2">
              <Input placeholder="URL..." value={url} onChange={e => updatePhoto(i, e.target.value)} />
              <button onClick={() => removePhoto(i)} className="text-red-400"><Trash2 size={18} /></button>
            </div>
          ))}
          {data.fotosAdicionais.length < 3 && (
            <button onClick={addPhoto} className="w-full py-2 border border-dashed border-neutral-200 rounded-lg text-[10px] text-neutral-400">+ Foto</button>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-red-600">Vídeos YouTube</Label>
          {data.videos.map((v:any, i:number) => (
            <div key={i} className="bg-neutral-50 p-2 rounded-lg border border-neutral-100 space-y-2">
              <Input placeholder="Link..." value={v.url} onChange={e => updateVideo(i, 'url', e.target.value)} />
              <div className="flex gap-2">
                <Input placeholder="Título..." value={v.titulo} onChange={e => updateVideo(i, 'titulo', e.target.value)} />
                <button onClick={() => removeVideo(i)} className="text-red-400"><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
          {data.videos.length < 2 && (
            <button onClick={addVideo} className="w-full py-2 border border-dashed border-red-200 rounded-lg text-[10px] text-red-500 font-medium">+ Vídeo YouTube</button>
          )}
        </div>

        <div className="flex justify-between mt-4">
          <Button variant="outline" onClick={() => setStep(4)}><ArrowLeft size={14} /> Voltar</Button>
          <Button variant="dark" onClick={() => setStep(6)}>Continuar <ArrowRight size={14} /></Button>
        </div>
      </div>
    )
  }

  // Step 6: Conquistas
  const addConquista = () => setData({ ...data, conquistas: [...data.conquistas, { titulo: '', ano: '', descricao: '' }] })
  const updateConquista = (i: number, f: string, v: string) => {
    const next = [...data.conquistas]
    next[i] = { ...next[i], [f]: v }
    setData({ ...data, conquistas: next })
  }
  const removeConquista = (i: number) => setData({ ...data, conquistas: data.conquistas.filter((_:any, idx:number) => idx !== i) })

  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="font-display text-3xl sm:text-4xl text-neutral-400 mb-1.5 sm:mb-2 leading-none">06</div>
        <h2 className="text-lg sm:text-xl font-medium mb-1">Conquistas</h2>
        <p className="text-xs sm:text-sm text-neutral-500 mb-4 sm:mb-6">Torneios e prêmios que o atleta ganhou.</p>
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
        <Button variant="outline" onClick={addConquista} className="w-full border-dashed border-amber-200 text-amber-600 text-[10px] gap-2 py-3 bg-amber-50/30 font-bold">
          <Trophy size={14} /> ADICIONAR CONQUISTA / TÍTULO
        </Button>
      </div>

      <div className="flex justify-between mt-4">
        <Button variant="outline" onClick={() => setStep(5)}><ArrowLeft size={14} /> Voltar</Button>
        <Button variant="dark" onClick={() => setStep(7)}>Continuar <ArrowRight size={14} /></Button>
      </div>
    </div>
  )

  if (step === 7) return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <div>
        <div className="font-display text-3xl sm:text-4xl text-neutral-400 mb-1.5 sm:mb-2 leading-none">07</div>
        <h2 className="text-lg sm:text-xl font-medium mb-1">Visualizar Perfil</h2>
        <p className="text-xs sm:text-sm text-neutral-500 mb-4 sm:mb-6">Veja como os clubes verão seu perfil.</p>
      </div>

      <div className="border border-neutral-200 rounded-2xl p-3 sm:p-4 bg-neutral-50/50">
        <AthleteProfilePreview data={data} />
      </div>

      <div className="flex justify-between mt-4">
        <Button variant="outline" onClick={() => setStep(6)}><ArrowLeft size={14} /> Voltar e Editar</Button>
        <Button variant="dark" onClick={() => setStep(8)}>Tudo certo! Continuar <ArrowRight size={14} /></Button>
      </div>
    </div>
  )

  if (step === 8) return (
    <PrivacidadeStep 
      data={data} 
      setData={setData} 
      onBack={() => setStep(7)} 
      onSubmit={onSubmit} 
      loading={loading} 
      error={serverError}
    />
  )
}

function PrivacidadeStep({ data, setData, onBack, onSubmit, loading, error }: any) {
  const toggle = (key: string) => setData({ ...data, [key]: !data[key] })
  const items = [
    { key: 'visivel', icon: <Eye size={14} />, title: 'Perfil visível para clubes', sub: 'Apenas clubes aprovados podem ver' },
    { key: 'exibirCidade', icon: <MapPin size={14} />, title: 'Exibir cidade e estado', sub: 'Nunca endereço completo' },
    { key: 'mensagens', icon: <MessageCircle size={14} />, title: 'Receber mensagens', sub: 'Contato direto de clubes' },
  ]

  return (
    <div>
      <div className="font-display text-3xl sm:text-4xl text-neutral-400 mb-1.5 sm:mb-2 leading-none">08</div>
      <h2 className="text-lg sm:text-xl font-medium mb-1">Privacidade</h2>
      <p className="text-xs sm:text-sm text-neutral-500 mb-4 sm:mb-6">Você controla tudo. Pode alterar a qualquer momento.</p>
      <div className="border border-neutral-200 rounded-xl overflow-hidden mb-5 sm:mb-6">
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
      {error && <div className="bg-red-50 border border-red-200 text-red-600 text-xs sm:text-sm rounded-lg px-3 sm:px-4 py-2.5 sm:py-3 mb-4">{error}</div>}
      <div className="flex justify-between">
        <Button variant="outline" type="button" onClick={onBack}><ArrowLeft size={14} /> Voltar</Button>
        <Button variant="dark" loading={loading} onClick={onSubmit}>Publicar perfil <ArrowRight size={14} /></Button>
      </div>
    </div>
  )
}

function SuccessScreen({ tipo }: { tipo: Tipo }) {
  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-neutral-200 rounded-2xl p-8 sm:p-10 text-center shadow-sm">
        <div className="text-green-400 flex justify-center mb-4">
          <CircleCheckBig size={48} />
        </div>
        <h2 className="font-display text-3xl sm:text-4xl text-green-700 mb-3 text-center">
          {tipo === 'responsavel' ? 'PERFIL PUBLICADO!' : 'CONTA CRIADA!'}
        </h2>
        <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed mb-2 text-center">
          {tipo === 'responsavel'
            ? 'O atleta já está visível para os clubes verificados.'
            : 'Sua conta de clube foi criada com sucesso.'}
        </p>
        <p className="text-[10px] sm:text-xs text-neutral-400 mb-6 sm:mb-8 text-center">Verifique sua caixa de entrada para confirmar o e-mail.</p>
        <div className="flex flex-col gap-2.5 sm:gap-3">
          <Link href="/login"><Button variant="dark" className="w-full justify-center">Fazer login</Button></Link>
          <Link href="/"><Button variant="outline" className="w-full justify-center">Voltar ao início</Button></Link>
        </div>
      </div>
    </div>
  )
}
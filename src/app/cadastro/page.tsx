'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { cadastroResponsavelSchema, cadastroClubeSchema, type CadastroResponsavelInput, type CadastroClubeInput } from '@/lib/validations'
import { createSupabaseBrowser } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input, Select, Label, FieldGroup } from '@/components/ui/Form'
import { ESTADOS } from '@/lib/utils'
import { Users, Landmark, ArrowLeft, ArrowRight, Eye, MapPin, Video, MessageCircle, CircleCheckBig } from 'lucide-react'
import { cn } from '@/lib/utils'

type Tipo = 'responsavel' | 'clube'

const STEP_LABELS_RESP = ['Tipo','Conta','Atleta','Habilidades','Mídia','Privacidade']
const STEP_LABELS_CLUBE = ['Tipo','Conta','Verificação']

export default function CadastroPage() {
  const [tipo, setTipo] = useState<Tipo>('responsavel')
  const [step, setStep] = useState(1)
  const [done, setDone] = useState(false)
  const [serverError, setServerError] = useState('')
  const router = useRouter()
  const supabase = createSupabaseBrowser()

  const totalSteps = tipo === 'responsavel' ? 6 : 3
  const labels = tipo === 'responsavel' ? STEP_LABELS_RESP : STEP_LABELS_CLUBE

  const formResp = useForm<CadastroResponsavelInput>({ resolver: zodResolver(cadastroResponsavelSchema) })
  const formClube = useForm<CadastroClubeInput>({ resolver: zodResolver(cadastroClubeSchema) })

  async function submitResponsavel(data: CadastroResponsavelInput) {
    console.log('Iniciando cadastro de Responsável...', data.email)
    setServerError('')
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { nome: data.nome, role: 'responsavel', telefone: data.telefone } },
    })
    if (error) {
      console.error('Erro no cadastro de Responsável:', error)
      setServerError(error.message)
      return
    }
    console.log('Cadastro de Responsável concluído com sucesso.')
    setDone(true)
  }

  async function submitClube(data: CadastroClubeInput) {
    console.log('Iniciando cadastro de Clube...', data.email)
    setServerError('')
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: { data: { nome: data.nome, role: 'clube', telefone: data.telefone } },
    })
    if (error) {
      console.error('Erro no cadastro de Clube:', error)
      setServerError(error.message)
      return
    }
    console.log('Cadastro de Clube concluído com sucesso.')
    setDone(true)
  }

  if (done) return <SuccessScreen tipo={tipo} />

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col items-center justify-start px-4 py-12">
      <div className="w-full max-w-lg">

        <div className="text-center mb-8">
          <Link href="/" className="font-display text-3xl tracking-widest text-green-700 inline-block mb-2">
            SCOUT<span className="text-amber-500">JR</span>
          </Link>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="h-1 bg-neutral-200 rounded-full mb-3 overflow-hidden">
            <div className="h-full bg-green-400 rounded-full transition-all duration-400" style={{ width: `${(step / totalSteps) * 100}%` }} />
          </div>
          <div className="flex justify-between">
            {labels.map((l, i) => (
              <span key={l} className={cn('text-[10px] font-medium', i + 1 === step ? 'text-green-700' : i + 1 < step ? 'text-green-400' : 'text-neutral-400')}>
                {l}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-8 shadow-sm">

          {/* STEP 1 — Tipo */}
          {step === 1 && (
            <div>
              <div className="font-display text-4xl text-neutral-400 mb-2 leading-none">01</div>
              <h2 className="text-xl font-medium mb-1">Que tipo de conta?</h2>
              <p className="text-sm text-neutral-500 mb-6">Escolha o perfil que se aplica à sua situação.</p>
              <div className="grid grid-cols-2 gap-4 mb-8">
                {([
                  { val: 'responsavel', icon: <Users size={26} />, title: 'Sou responsável', sub: 'Quero cadastrar meu filho(a) como atleta' },
                  { val: 'clube', icon: <Landmark size={26} />, title: 'Sou um clube', sub: 'Quero buscar e recrutar jovens talentos' },
                ] as const).map(opt => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => setTipo(opt.val)}
                    className={cn(
                      'p-5 border-2 rounded-xl text-left transition-all',
                      tipo === opt.val ? 'border-green-400 bg-green-50' : 'border-neutral-200 hover:border-neutral-300'
                    )}
                  >
                    <div className={cn('mb-3', tipo === opt.val ? 'text-green-600' : 'text-neutral-400')}>{opt.icon}</div>
                    <div className="text-sm font-medium mb-1">{opt.title}</div>
                    <div className="text-xs text-neutral-400 leading-snug">{opt.sub}</div>
                  </button>
                ))}
              </div>
              <div className="flex justify-end">
                <Button variant="dark" onClick={() => setStep(2)}>Continuar <ArrowRight size={15} /></Button>
              </div>
            </div>
          )}

          {/* STEP 2 — Dados da conta (responsável) */}
          {step === 2 && tipo === 'responsavel' && (
            <form onSubmit={formResp.handleSubmit(() => setStep(3))}>
              <div className="font-display text-4xl text-neutral-400 mb-2 leading-none">02</div>
              <h2 className="text-xl font-medium mb-1">Seus dados de contato</h2>
              <p className="text-sm text-neutral-500 mb-6">Nunca aparecem no perfil público do atleta.</p>
              <div className="flex flex-col gap-4">
                <FieldGroup>
                  <Label>Nome completo</Label>
                  <Input placeholder="João da Silva" error={formResp.formState.errors.nome?.message} {...formResp.register('nome')} />
                </FieldGroup>
                <div className="grid grid-cols-2 gap-3">
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
                    <Input type="password" placeholder="Mínimo 8 caracteres" error={formResp.formState.errors.password?.message} {...formResp.register('password')} />
                  </FieldGroup>
                  <FieldGroup>
                    <Label>Confirmar senha</Label>
                    <Input type="password" placeholder="Repita a senha" error={formResp.formState.errors.confirmPassword?.message} {...formResp.register('confirmPassword')} />
                  </FieldGroup>
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 text-xs text-amber-700 leading-relaxed">
                  Ao criar uma conta você confirma ser o responsável legal pelo atleta e concorda com os <Link href="/termos" className="underline">Termos de Uso</Link> e <Link href="/privacidade" className="underline">Política de Privacidade</Link>.
                </div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" className="mt-0.5 accent-green-500" {...formResp.register('aceito_termos')} />
                  <span className="text-xs text-neutral-500">Li e aceito os termos de uso e política de privacidade</span>
                </label>
                {formResp.formState.errors.aceito_termos && <p className="text-xs text-red-500">{formResp.formState.errors.aceito_termos.message}</p>}
              </div>
              <div className="flex justify-between mt-6">
                <Button variant="outline" type="button" onClick={() => setStep(1)}><ArrowLeft size={15} /> Voltar</Button>
                <Button variant="dark" type="submit">Continuar <ArrowRight size={15} /></Button>
              </div>
            </form>
          )}

          {/* STEP 3–5 — Atleta info */}
          {step >= 3 && step <= 5 && tipo === 'responsavel' && (
            <AtletaSteps step={step} setStep={setStep} />
          )}

          {/* STEP 6 — Privacidade */}
          {step === 6 && tipo === 'responsavel' && (
            <PrivacidadeStep
              onBack={() => setStep(5)}
              onSubmit={formResp.handleSubmit(submitResponsavel)}
              loading={formResp.formState.isSubmitting}
              error={serverError}
            />
          )}

          {/* STEP 2 — Dados clube */}
          {step === 2 && tipo === 'clube' && (
            <form onSubmit={formClube.handleSubmit(() => setStep(3))}>
              <div className="font-display text-4xl text-neutral-400 mb-2 leading-none">02</div>
              <h2 className="text-xl font-medium mb-1">Dados do clube</h2>
              <p className="text-sm text-neutral-500 mb-6">Informações do clube ou escolinha.</p>
              <div className="flex flex-col gap-4">
                <FieldGroup>
                  <Label>Nome do clube / escolinha</Label>
                  <Input placeholder="Ex: Escolinha Grêmio FBPA" error={formClube.formState.errors.nome?.message} {...formClube.register('nome')} />
                </FieldGroup>
                <FieldGroup>
                  <Label>CNPJ (opcional)</Label>
                  <Input placeholder="00.000.000/0000-00" error={formClube.formState.errors.cnpj?.message} {...formClube.register('cnpj')} />
                </FieldGroup>
                <div className="grid grid-cols-2 gap-3">
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
                    <Input type="password" placeholder="Mínimo 8 caracteres" error={formClube.formState.errors.password?.message} {...formClube.register('password')} />
                  </FieldGroup>
                  <FieldGroup>
                    <Label>Confirmar senha</Label>
                    <Input type="password" error={formClube.formState.errors.confirmPassword?.message} {...formClube.register('confirmPassword')} />
                  </FieldGroup>
                </div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" className="mt-0.5 accent-green-500" {...formClube.register('aceito_termos')} />
                  <span className="text-xs text-neutral-500">Li e aceito os termos de uso e política de privacidade</span>
                </label>
                {formClube.formState.errors.aceito_termos && <p className="text-xs text-red-500">{formClube.formState.errors.aceito_termos.message}</p>}
              </div>
              <div className="flex justify-between mt-6">
                <Button variant="outline" type="button" onClick={() => setStep(1)}><ArrowLeft size={15} /> Voltar</Button>
                <Button variant="dark" type="submit">Continuar <ArrowRight size={15} /></Button>
              </div>
            </form>
          )}

          {/* STEP 3 clube — verificação */}
          {step === 3 && tipo === 'clube' && (
            <div>
              <div className="font-display text-4xl text-neutral-400 mb-2 leading-none">03</div>
              <h2 className="text-xl font-medium mb-1">Verificação de clube</h2>
              <p className="text-sm text-neutral-500 mb-6">Obtenha o selo verificado e acesso completo à plataforma.</p>
              <div className="border border-neutral-200 rounded-xl overflow-hidden mb-6">
                {[
                  { icon: <Eye size={16} />, title: 'Acesso a todos os perfis de atletas', sub: 'Visualize perfis completos com stats e vídeos' },
                  { icon: <MapPin size={16} />, title: 'Filtros avançados de busca', sub: 'Posição, idade, cidade, habilidades e mais' },
                  { icon: <MessageCircle size={16} />, title: 'Contato direto com responsáveis', sub: 'Envie mensagens e negocie com as famílias' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 border-b border-neutral-100 last:border-none">
                    <div className="w-9 h-9 rounded-lg bg-green-100 text-green-700 flex items-center justify-center flex-shrink-0">{item.icon}</div>
                    <div>
                      <div className="text-sm font-medium">{item.title}</div>
                      <div className="text-xs text-neutral-400">{item.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
              {serverError && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">{serverError}</div>}
              <div className="flex justify-between">
                <Button variant="outline" type="button" onClick={() => setStep(2)}><ArrowLeft size={15} /> Voltar</Button>
                <Button variant="dark" loading={formClube.formState.isSubmitting} onClick={formClube.handleSubmit(submitClube)}>
                  Criar conta <ArrowRight size={15} />
                </Button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-neutral-400 mt-6">
          Já tem conta? <Link href="/login" className="text-green-600 hover:text-green-700 font-medium">Entrar</Link>
        </p>
      </div>
    </div>
  )
}

// -----------------------------------------------
// Atleta steps (3-5) — simplified inline
// -----------------------------------------------
function AtletaSteps({ step, setStep }: { step: number; setStep: (n: number) => void }) {
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
  const [selectedPos, setSelectedPos] = useState('MEI')
  const habilidades = ['Técnica','Velocidade','Visão de jogo','Físico','Finalização','Passes']
  const [skills, setSkills] = useState([75,68,82,60,71,79])

  if (step === 3) return (
    <div>
      <div className="font-display text-4xl text-neutral-400 mb-2 leading-none">03</div>
      <h2 className="text-xl font-medium mb-1">Dados do atleta</h2>
      <p className="text-sm text-neutral-500 mb-6">Localização exata nunca é exibida — apenas cidade e estado.</p>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <FieldGroup><Label>Nome do atleta</Label><Input placeholder="Gabriel Silva" /></FieldGroup>
          <FieldGroup><Label>Data de nascimento</Label><Input type="date" /></FieldGroup>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FieldGroup><Label>Estado</Label><Select options={ESTADOS} placeholder="Selecione" /></FieldGroup>
          <FieldGroup><Label>Cidade</Label><Input placeholder="Porto Alegre" /></FieldGroup>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FieldGroup>
            <Label>Pé dominante</Label>
            <Select options={[{value:'destro',label:'Destro'},{value:'canhoto',label:'Canhoto'},{value:'ambidestro',label:'Ambidestro'}]} />
          </FieldGroup>
          <FieldGroup><Label>Clube / Escolinha atual</Label><Input placeholder="Opcional" /></FieldGroup>
        </div>
        <FieldGroup>
          <Label>Posição em campo</Label>
          <div className="grid grid-cols-3 gap-2 mt-1">
            {posicoes.map(p => (
              <button key={p.value} type="button" onClick={() => setSelectedPos(p.value)}
                className={cn('p-2 border rounded-lg text-center transition-all', selectedPos === p.value ? 'border-green-400 bg-green-50 text-green-700' : 'border-neutral-200 hover:border-neutral-300')}>
                <div className="text-sm font-medium">{p.label}</div>
                <div className="text-[10px] text-neutral-400">{p.sub}</div>
              </button>
            ))}
          </div>
        </FieldGroup>
      </div>
      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={() => setStep(2)}><ArrowLeft size={15} /> Voltar</Button>
        <Button variant="dark" onClick={() => setStep(4)}>Continuar <ArrowRight size={15} /></Button>
      </div>
    </div>
  )

  if (step === 4) return (
    <div>
      <div className="font-display text-4xl text-neutral-400 mb-2 leading-none">04</div>
      <h2 className="text-xl font-medium mb-1">Habilidades do atleta</h2>
      <p className="text-sm text-neutral-500 mb-6">Seja honesto. Clubes valorizam evolução, não perfeição.</p>
      <div className="flex flex-col gap-5">
        {habilidades.map((h, i) => (
          <div key={h} className="flex items-center gap-4">
            <div className="w-28 flex-shrink-0">
              <div className="text-sm font-medium">{h}</div>
            </div>
            <input type="range" min={1} max={99} value={skills[i]}
              onChange={e => { const n = [...skills]; n[i] = +e.target.value; setSkills(n) }}
              className="flex-1 accent-green-500" />
            <div className="w-9 h-8 bg-green-100 text-green-700 rounded-lg flex items-center justify-center text-sm font-medium flex-shrink-0">
              {skills[i]}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={() => setStep(3)}><ArrowLeft size={15} /> Voltar</Button>
        <Button variant="dark" onClick={() => setStep(5)}>Continuar <ArrowRight size={15} /></Button>
      </div>
    </div>
  )

  return (
    <div>
      <div className="font-display text-4xl text-neutral-400 mb-2 leading-none">05</div>
      <h2 className="text-xl font-medium mb-1">Fotos e vídeos</h2>
      <p className="text-sm text-neutral-500 mb-6">Perfis com vídeos recebem até 8× mais interesse de clubes.</p>
      <div className="border-2 border-dashed border-neutral-200 rounded-xl p-8 text-center mb-4 hover:border-green-400 transition-colors cursor-pointer">
        <div className="text-neutral-300 mb-2 flex justify-center">
          <Video size={32} />
        </div>
        <div className="text-sm font-medium text-neutral-600 mb-1">Foto do atleta</div>
        <div className="text-xs text-neutral-400">Clique para selecionar · JPG, PNG — máx. 5MB</div>
      </div>
      <div className="mb-4">
        <Label>Links de vídeos</Label>
        <div className="flex gap-2 mt-1">
          <Input placeholder="YouTube, Google Drive ou Vimeo" />
          <Button size="sm" variant="outline" type="button">Adicionar</Button>
        </div>
        <p className="text-xs text-neutral-400 mt-1">Você pode adicionar quantos links quiser</p>
      </div>
      <div className="flex justify-between mt-6">
        <Button variant="outline" onClick={() => setStep(4)}><ArrowLeft size={15} /> Voltar</Button>
        <Button variant="dark" onClick={() => setStep(6)}>Continuar <ArrowRight size={15} /></Button>
      </div>
    </div>
  )
}

// -----------------------------------------------
// Privacy step
// -----------------------------------------------
function PrivacidadeStep({ onBack, onSubmit, loading, error }: { onBack: () => void; onSubmit: () => void; loading: boolean; error: string }) {
  const [settings, setSettings] = useState({ visivel: true, exibirCidade: true, videos: true, mensagens: false })
  const toggle = (key: keyof typeof settings) => setSettings(s => ({ ...s, [key]: !s[key] }))

  const items = [
    { key: 'visivel' as const, icon: <Eye size={16} />, title: 'Perfil visível para clubes verificados', sub: 'Apenas clubes aprovados podem ver o perfil completo' },
    { key: 'exibirCidade' as const, icon: <MapPin size={16} />, title: 'Exibir cidade e estado', sub: 'Nunca endereço completo — apenas cidade e UF' },
    { key: 'videos' as const, icon: <Video size={16} />, title: 'Vídeos visíveis para clubes', sub: 'Clubes podem assistir os vídeos cadastrados' },
    { key: 'mensagens' as const, icon: <MessageCircle size={16} />, title: 'Receber mensagens de clubes', sub: 'Quando desativado, clubes apenas marcam interesse' },
  ]

  return (
    <div>
      <div className="font-display text-4xl text-neutral-400 mb-2 leading-none">06</div>
      <h2 className="text-xl font-medium mb-1">Privacidade</h2>
      <p className="text-sm text-neutral-500 mb-6">Você controla tudo. Pode alterar a qualquer momento.</p>
      <div className="border border-neutral-200 rounded-xl overflow-hidden mb-6">
        {items.map((item, i) => (
          <div key={item.key} className={cn('flex items-center gap-4 p-4', i < items.length - 1 && 'border-b border-neutral-100')}>
            <div className="w-9 h-9 rounded-lg bg-neutral-100 text-neutral-500 flex items-center justify-center flex-shrink-0">{item.icon}</div>
            <div className="flex-1">
              <div className="text-sm font-medium">{item.title}</div>
              <div className="text-xs text-neutral-400 mt-0.5">{item.sub}</div>
            </div>
            <button type="button" onClick={() => toggle(item.key)}
              className={cn('relative w-10 h-6 rounded-full transition-colors flex-shrink-0', settings[item.key] ? 'bg-green-400' : 'bg-neutral-300')}>
              <span className={cn('absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all', settings[item.key] ? 'left-5' : 'left-1')} />
            </button>
          </div>
        ))}
      </div>
      {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3 mb-4">{error}</div>}
      <div className="flex justify-between">
        <Button variant="outline" type="button" onClick={onBack}><ArrowLeft size={15} /> Voltar</Button>
        <Button variant="dark" loading={loading} onClick={onSubmit}>Publicar perfil <ArrowRight size={15} /></Button>
      </div>
    </div>
  )
}

// -----------------------------------------------
// Success screen
// -----------------------------------------------
function SuccessScreen({ tipo }: { tipo: Tipo }) {
  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-neutral-200 rounded-2xl p-10 text-center shadow-sm">
        <div className="text-green-400 flex justify-center mb-4 animate-bounce">
          <CircleCheckBig size={56} />
        </div>
        <h2 className="font-display text-4xl text-green-700 mb-3">
          {tipo === 'responsavel' ? 'PERFIL PUBLICADO!' : 'CONTA CRIADA!'}
        </h2>
        <p className="text-sm text-neutral-500 leading-relaxed mb-2">
          {tipo === 'responsavel'
            ? 'O atleta já está visível para os clubes verificados. Você receberá uma notificação quando houver interesse.'
            : 'Sua conta de clube foi criada. Confirme seu e-mail para acessar a plataforma.'}
        </p>
        <p className="text-xs text-neutral-400 mb-8">Verifique sua caixa de entrada para confirmar o e-mail.</p>
        <div className="flex flex-col gap-3">
          <Link href="/login"><Button variant="dark" className="w-full">Fazer login</Button></Link>
          <Link href="/"><Button variant="outline" className="w-full">Voltar ao início</Button></Link>
        </div>
      </div>
    </div>
  )
}

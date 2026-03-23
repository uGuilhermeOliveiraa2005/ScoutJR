'use client'

import Link from 'next/link'
import React, { Suspense, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  cadastroResponsavelSchema,
  cadastroEscolinhaSchema,
  type CadastroResponsavelInput,
  type CadastroEscolinhaInput,
} from '@/lib/validations'
import { createSupabaseBrowser } from '@/lib/supabase'
import { uploadImage, uploadImages } from '@/lib/storage'
import { Button } from '@/components/ui/Button'
import { Input, Select, Label, FieldGroup, Textarea } from '@/components/ui/Form'
import { ESTADOS } from '@/lib/utils'
import {
  Users, Landmark, ArrowLeft, ArrowRight, Eye, MapPin,
  MessageCircle, CircleCheckBig, Plus, Trash2, Trophy, Image as ImageIcon,
  Clock,
} from 'lucide-react'
import { cn, formatPhone, formatCNPJ } from '@/lib/utils'
import { toast } from 'sonner'
import { AthleteProfilePreview } from '@/components/atletas/AthleteProfilePreview'
import { CitySelect } from '@/components/ui/CitySelect'

type Tipo = 'responsavel' | 'escolinha'

const STEP_LABELS_RESP = ['Tipo', 'Conta', 'Atleta', 'Habilidades', 'Mídia', 'Conquistas', 'Visualizar', 'Privacidade']
const STEP_LABELS_ESCOLINHA = ['Tipo', 'Conta', 'Sobre', 'Finalizar']

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
  const [isUploading, setIsUploading] = useState(false)
  const supabase = createSupabaseBrowser()

  const [atletaData, setAtletaData] = useState({
    nomeAtleta: '', descricao: '', dataNascimento: '',
    estado: '', cidade: '', posicao: 'MEI', peDominante: 'destro',
    escolinhaAtual: '',
    habilidades: [75, 68, 82, 60, 71, 79],
    // fotoUrl pode ser File (selecionado) ou string (URL já enviada)
    fotoUrl: null as File | string | null,
    fotoPreview: '',          // ← URL de preview local (sempre string)
    fotosAdicionais: [] as any[],
    videos: [] as { url: string; titulo: string }[],
    conquistas: [] as { titulo: string; ano: string; descricao: string }[],
    visivel: true, exibirCidade: true, mensagens: false,
  })

  const [escolinhaFotos, setEscolinhaFotos] = useState<any[]>([])
  const [responsavelPreview, setResponsavelPreview] = useState('')
  const [escolinhaPreview, setEscolinhaPreview] = useState('')

  const labels = tipo === 'responsavel' ? STEP_LABELS_RESP : STEP_LABELS_ESCOLINHA
  const totalSteps = labels.length
  const progressPercent = ((step - 1) / (totalSteps - 1)) * 100

  const formResp = useForm<CadastroResponsavelInput>({ resolver: zodResolver(cadastroResponsavelSchema) })
  const formEscolinha = useForm<CadastroEscolinhaInput>({ resolver: zodResolver(cadastroEscolinhaSchema) })

  // ── Submit responsável ──────────────────────────────────────
  async function submitResponsavel(data: CadastroResponsavelInput) {
    setServerError('')
    setIsUploading(true)
    try {
      // 1. Upload das imagens
      const foto_resp_url = data.foto_url instanceof File
        ? await uploadImage(data.foto_url, 'responsavel')
        : (data.foto_url ?? null)

      const atleta_foto_url = atletaData.fotoUrl instanceof File
        ? await uploadImage(atletaData.fotoUrl, 'atleta')
        : (atletaData.fotoUrl ?? null)

      const atleta_fotos_adicionais = await uploadImages(
        atletaData.fotosAdicionais.filter((f: any) => f instanceof File || (typeof f === 'string' && f)),
        'atleta_galeria'
      )

      // 2. Criar conta
      const { error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            nome: data.nome,
            role: 'responsavel',
            telefone: data.telefone,
            foto_url: foto_resp_url,
          },
        },
      })
      if (signUpError) {
        setServerError(signUpError.message)
        toast.error(signUpError.message)
        return
      }

      // 3. Login automático para obter sessão
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })
      if (signInError) {
        // Conta criada mas login falhou — usuário pode fazer login manualmente
        setDone(true)
        return
      }

      // 4. Buscar o profile criado pelo trigger
      // Aguarda um momento para o trigger rodar
      await new Promise(r => setTimeout(r, 1200))

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', data.email)
        .single()

      if (!profile) {
        // Profile ainda não criado — continua mesmo assim
        setDone(true)
        return
      }

      // 5. Criar o atleta diretamente via Supabase client
      const { data: atletaCriado, error: atletaError } = await supabase
        .from('atletas')
        .insert({
          responsavel_id: profile.id,
          nome: atletaData.nomeAtleta,
          descricao: atletaData.descricao,
          data_nascimento: atletaData.dataNascimento,
          estado: atletaData.estado,
          cidade: atletaData.cidade,
          pe_dominante: atletaData.peDominante,
          escolinha_atual: atletaData.escolinhaAtual || null,
          posicao: atletaData.posicao,
          habilidade_tecnica: atletaData.habilidades[0],
          habilidade_velocidade: atletaData.habilidades[1],
          habilidade_visao: atletaData.habilidades[2],
          habilidade_fisico: atletaData.habilidades[3],
          habilidade_finalizacao: atletaData.habilidades[4],
          habilidade_passes: atletaData.habilidades[5],
          visivel: atletaData.visivel,
          exibir_cidade: atletaData.exibirCidade,
          aceitar_mensagens: atletaData.mensagens,
          foto_url: atleta_foto_url,
          fotos_adicionais: atleta_fotos_adicionais,
          status: 'pendente',
        })
        .select('id')
        .single()

      if (atletaError) {
        console.error('Erro ao criar atleta:', atletaError)
        // Conta foi criada, atleta pode ser adicionado depois
        toast.error('Conta criada! Mas houve um problema ao salvar o atleta. Acesse o dashboard para tentar novamente.')
        setDone(true)
        return
      }

      // 6. Inserir vídeos
      if (atletaData.videos.length > 0 && atletaCriado) {
        const videoInserts = atletaData.videos
          .filter(v => v.url)
          .map(v => ({ atleta_id: atletaCriado.id, titulo: v.titulo || 'Destaque', url: v.url }))
        if (videoInserts.length > 0) {
          await supabase.from('atleta_videos').insert(videoInserts)
        }
      }

      // 7. Inserir conquistas
      if (atletaData.conquistas.length > 0 && atletaCriado) {
        const conquistaInserts = atletaData.conquistas
          .filter(c => c.titulo)
          .map(c => ({
            atleta_id: atletaCriado.id,
            titulo: c.titulo,
            ano: parseInt(c.ano) || new Date().getFullYear(),
            descricao: c.descricao || null,
          }))
        if (conquistaInserts.length > 0) {
          await supabase.from('atleta_conquistas').insert(conquistaInserts)
        }
      }

      toast.success('Perfil de atleta publicado com sucesso!')
      setDone(true)

    } catch (e: any) {
      console.error(e)
      setServerError('Ocorreu um erro inesperado. Tente novamente.')
      toast.error('Ocorreu um erro inesperado. Tente novamente.')
    } finally {
      setIsUploading(false)
    }
  }

  // ── Submit escolinha ────────────────────────────────────────
  async function submitEscolinha(data: CadastroEscolinhaInput) {
    setServerError('')
    setIsUploading(true)
    try {
      const foto_url_final = data.foto_url instanceof File ? await uploadImage(data.foto_url, 'escolinha') : data.foto_url
      const fotos_adicionais_final = await uploadImages(escolinhaFotos, 'escolinha_galeria')

      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            nome: data.nome,
            role: 'escolinha',
            telefone: data.telefone,
            estado: data.estado,
            cidade: data.cidade,
            cnpj: data.cnpj ?? null,
            foto_url: foto_url_final,
            descricao: data.descricao,
            fotos_adicionais: fotos_adicionais_final,
            status: 'pendente',
          },
        },
      })
      if (error) { setServerError(error.message); toast.error(error.message); return }
      toast.success('Conta de escolinha criada com sucesso!')
      setDone(true)
    } catch {
      setServerError('Falha ao processar. Tente novamente.')
      toast.error('Falha ao processar. Tente novamente.')
    } finally {
      setIsUploading(false)
    }
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

        {/* Progress bar */}
        <div className="mb-5 sm:mb-6">
          <div className="relative h-1.5 bg-neutral-200 rounded-full mb-2.5 sm:mb-3 overflow-hidden">
            <div
              className="h-full bg-green-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${totalSteps}, 1fr)` }}>
            {labels.map((l, i) => (
              <span key={l} className={cn(
                'text-[8px] sm:text-[10px] font-bold uppercase tracking-tight text-center',
                i + 1 === step ? 'text-green-700' : i + 1 < step ? 'text-green-400' : 'text-neutral-300'
              )}>
                {l}
              </span>
            ))}
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-5 sm:p-8 shadow-sm">

          {/* STEP 1 — Tipo */}
          {step === 1 && (
            <div>
              <div className="font-display text-3xl sm:text-4xl text-neutral-400 mb-1.5 leading-none">01</div>
              <h2 className="text-lg sm:text-xl font-medium mb-1">Que tipo de conta?</h2>
              <p className="text-xs sm:text-sm text-neutral-500 mb-5 sm:mb-6">Escolha o perfil que se aplica.</p>
              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
                {([
                  { val: 'responsavel', icon: <Users size={22} />, title: 'Sou responsável', sub: 'Quero cadastrar meu filho(a) como atleta' },
                  { val: 'escolinha', icon: <Landmark size={22} />, title: 'Sou uma escolinha', sub: 'Quero buscar e recrutar jovens talentos' },
                ] as const).map(opt => (
                  <button key={opt.val} type="button" onClick={() => setTipo(opt.val)}
                    className={cn('p-4 sm:p-5 border-2 rounded-xl text-left transition-all',
                      tipo === opt.val ? 'border-green-400 bg-green-50' : 'border-neutral-200 hover:border-neutral-300'
                    )}>
                    <div className={cn('mb-2 sm:mb-3', tipo === opt.val ? 'text-green-600' : 'text-neutral-400')}>{opt.icon}</div>
                    <div className="text-xs sm:text-sm font-medium mb-0.5 sm:mb-1">{opt.title}</div>
                    <div className="text-[10px] sm:text-xs text-neutral-400 leading-snug">{opt.sub}</div>
                  </button>
                ))}
              </div>
              <div className="flex justify-end">
                <Button variant="dark" onClick={() => setStep(2)}>Continuar <ArrowRight size={14} /></Button>
              </div>
            </div>
          )}

          {/* ── RESPONSÁVEL ── */}

          {step === 2 && tipo === 'responsavel' && (
            <form onSubmit={formResp.handleSubmit(() => setStep(3))}>
              <div className="font-display text-3xl sm:text-4xl text-neutral-400 mb-1.5 leading-none">02</div>
              <h2 className="text-lg sm:text-xl font-medium mb-1">Seus dados de contato</h2>
              <p className="text-xs sm:text-sm text-neutral-500 mb-4 sm:mb-6">Nunca aparecem no perfil público do atleta.</p>
              <div className="flex flex-col gap-3 sm:gap-4">
                {/* Foto responsável */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="w-16 h-16 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center flex-shrink-0 overflow-hidden text-neutral-400">
                    {responsavelPreview
                      ? <img src={responsavelPreview} alt="Avatar" className="w-full h-full object-cover" />
                      : <ImageIcon size={20} />}
                  </div>
                  <FieldGroup className="flex-1">
                    <Label>Sua foto de perfil (Opcional)</Label>
                    <Input type="file" accept="image/*" className="pt-2"
                      error={formResp.formState.errors.foto_url?.message as string}
                      onChange={e => {
                        const file = e.target.files?.[0]
                        if (file) {
                          formResp.setValue('foto_url', file, { shouldValidate: true })
                          const reader = new FileReader()
                          reader.onload = ev => setResponsavelPreview(ev.target?.result as string)
                          reader.readAsDataURL(file)
                        } else {
                          formResp.setValue('foto_url', null)
                          setResponsavelPreview('')
                        }
                      }} />
                  </FieldGroup>
                </div>
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
                    <Input type="tel" placeholder="(51) 9 9999-9999"
                      error={formResp.formState.errors.telefone?.message}
                      {...formResp.register('telefone', { onChange: e => { e.target.value = formatPhone(e.target.value) } })} />
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
                <Button variant="outline" type="button" onClick={() => setStep(1)}><ArrowLeft size={14} /> Voltar</Button>
                <Button variant="dark" type="submit">Continuar <ArrowRight size={14} /></Button>
              </div>
            </form>
          )}

          {step >= 3 && step <= 8 && tipo === 'responsavel' && (
            <AtletaSteps
              step={step} setStep={setStep}
              data={atletaData} setData={setAtletaData}
              loading={isUploading || formResp.formState.isSubmitting}
              serverError={serverError}
              onSubmit={formResp.handleSubmit(submitResponsavel)}
              isUploading={isUploading}
            />
          )}

          {/* ── ESCOLINHA ── */}

          {step === 2 && tipo === 'escolinha' && (
            <form onSubmit={formEscolinha.handleSubmit(() => setStep(3))}>
              <div className="font-display text-3xl sm:text-4xl text-neutral-400 mb-1.5 leading-none">02</div>
              <h2 className="text-lg sm:text-xl font-medium mb-1">Dados da escolinha</h2>
              <p className="text-xs sm:text-sm text-neutral-500 mb-4 sm:mb-6">Informações da instituição.</p>
              <div className="flex flex-col gap-3 sm:gap-4">
                <FieldGroup>
                  <Label>Nome da escolinha</Label>
                  <Input placeholder="Ex: Escolinha Grêmio FBPA" error={formEscolinha.formState.errors.nome?.message} {...formEscolinha.register('nome')} />
                </FieldGroup>
                <FieldGroup>
                  <Label>CNPJ</Label>
                  <Input placeholder="00.000.000/0000-00" error={formEscolinha.formState.errors.cnpj?.message}
                    {...formEscolinha.register('cnpj', { onChange: e => { e.target.value = formatCNPJ(e.target.value) } })} />
                </FieldGroup>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <FieldGroup>
                    <Label>E-mail</Label>
                    <Input type="email" placeholder="contato@escolinha.com.br" error={formEscolinha.formState.errors.email?.message} {...formEscolinha.register('email')} />
                  </FieldGroup>
                  <FieldGroup>
                    <Label>Telefone</Label>
                    <Input type="tel" placeholder="(51) 3333-3333" error={formEscolinha.formState.errors.telefone?.message}
                      {...formEscolinha.register('telefone', { onChange: e => { e.target.value = formatPhone(e.target.value) } })} />
                  </FieldGroup>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <FieldGroup>
                    <Label>Estado</Label>
                    <Select options={ESTADOS} placeholder="Selecione" error={formEscolinha.formState.errors.estado?.message} 
                      {...formEscolinha.register('estado', { onChange: () => formEscolinha.setValue('cidade', '') })} />
                  </FieldGroup>
                  <FieldGroup>
                    <Label>Cidade</Label>
                    <CitySelect
                      estado={formEscolinha.watch('estado')}
                      value={formEscolinha.watch('cidade')}
                      onChange={e => formEscolinha.setValue('cidade', e.target.value, { shouldValidate: true })}
                      error={formEscolinha.formState.errors.cidade?.message}
                    />
                  </FieldGroup>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <FieldGroup>
                    <Label>Senha</Label>
                    <Input type="password" placeholder="Mín. 8 caracteres" error={formEscolinha.formState.errors.password?.message} {...formEscolinha.register('password')} />
                  </FieldGroup>
                  <FieldGroup>
                    <Label>Confirmar</Label>
                    <Input type="password" error={formEscolinha.formState.errors.confirmPassword?.message} {...formEscolinha.register('confirmPassword')} />
                  </FieldGroup>
                </div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" className="mt-0.5 accent-green-500" {...formEscolinha.register('aceito_termos')} />
                  <span className="text-xs text-neutral-500">Li e aceito os termos de uso e política de privacidade</span>
                </label>
                {formEscolinha.formState.errors.aceito_termos && (
                  <p className="text-xs text-red-500">{formEscolinha.formState.errors.aceito_termos.message}</p>
                )}
              </div>
              <div className="flex justify-between mt-5 sm:mt-6">
                <Button variant="outline" type="button" onClick={() => setStep(1)}><ArrowLeft size={14} /> Voltar</Button>
                <Button variant="dark" type="submit">Continuar <ArrowRight size={14} /></Button>
              </div>
            </form>
          )}

          {step === 3 && tipo === 'escolinha' && (
            <div className="flex flex-col gap-5">
              <div className="font-display text-3xl sm:text-4xl text-neutral-400 mb-1.5 leading-none">03</div>
              <h2 className="text-lg sm:text-xl font-medium mb-1">Sobre a Escolinha</h2>
              <p className="text-xs sm:text-sm text-neutral-500 mb-4 sm:mb-6">Crie um perfil atrativo para as famílias.</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-20 h-20 rounded-xl bg-neutral-100 border border-neutral-200 flex items-center justify-center flex-shrink-0 overflow-hidden text-neutral-400">
                  {escolinhaPreview ? <img src={escolinhaPreview} alt="Logo" className="w-full h-full object-cover" /> : <ImageIcon size={24} />}
                </div>
                <FieldGroup className="flex-1">
                  <Label>Logo / Emblema</Label>
                  <Input type="file" accept="image/*" className="pt-2" onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) {
                      formEscolinha.setValue('foto_url', file, { shouldValidate: true })
                      const reader = new FileReader()
                      reader.onload = ev => setEscolinhaPreview(ev.target?.result as string)
                      reader.readAsDataURL(file)
                    } else { formEscolinha.setValue('foto_url', null); setEscolinhaPreview('') }
                  }} />
                </FieldGroup>
              </div>
              <FieldGroup>
                <Label>Descrição</Label>
                <Textarea placeholder="Conte a história do clube, filosofia de jogo..." className="min-h-[100px]" {...formEscolinha.register('descricao')} />
              </FieldGroup>
              <div className="space-y-3">
                <Label>Fotos da Estrutura (Máx. 3)</Label>
                <Input type="file" accept="image/*" multiple className="pt-2" onChange={async e => {
                  if (e.target.files && e.target.files.length > 0) {
                    const selected = Array.from(e.target.files).slice(0, 3)
                    const withPreview = await Promise.all(selected.map(f => new Promise(resolve => {
                      const reader = new FileReader()
                      reader.onload = ev => resolve(Object.assign(f, { preview: ev.target?.result as string }))
                      reader.readAsDataURL(f)
                    })))
                    setEscolinhaFotos(withPreview as any[])
                  }
                }} />
                {escolinhaFotos.length > 0 && (
                  <div className="flex gap-3 mt-2 flex-wrap">
                    {escolinhaFotos.map((file: any, i: number) => (
                      <div key={i} className="relative group">
                        <img src={file.preview || file} className="w-20 h-20 rounded-xl object-cover border border-neutral-200" alt="Preview" />
                        <button type="button" onClick={() => setEscolinhaFotos(escolinhaFotos.filter((_, idx) => idx !== i))}
                          className="absolute top-1 right-1 bg-white/90 text-red-500 rounded-md p-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex justify-between mt-4">
                <Button variant="outline" type="button" onClick={() => setStep(2)}><ArrowLeft size={14} /> Voltar</Button>
                <Button variant="dark" type="button" onClick={() => setStep(4)}>Continuar <ArrowRight size={14} /></Button>
              </div>
            </div>
          )}

          {step === 4 && tipo === 'escolinha' && (
            <div>
              <div className="font-display text-3xl sm:text-4xl text-neutral-400 mb-1.5 leading-none">04</div>
              <h2 className="text-lg sm:text-xl font-medium mb-1">Tudo certo!</h2>
              <p className="text-xs sm:text-sm text-neutral-500 mb-4 sm:mb-6">Revise suas informações e finalize o cadastro.</p>
              <div className="border border-neutral-200 rounded-xl overflow-hidden mb-5 sm:mb-6">
                {[
                  { title: 'Acesso a todos os perfis', sub: 'Visualize perfis completos com stats e vídeos' },
                  { title: 'Filtros avançados', sub: 'Posição, idade, cidade, habilidades e mais' },
                  { title: 'Contato direto', sub: 'Envie mensagens para as famílias' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4 border-b border-neutral-100 last:border-none">
                    <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-green-100 text-green-700 flex items-center justify-center flex-shrink-0 font-display text-sm">{i + 1}</div>
                    <div>
                      <div className="text-xs sm:text-sm font-medium">{item.title}</div>
                      <div className="text-[10px] sm:text-xs text-neutral-400">{item.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
              {serverError && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-xs sm:text-sm rounded-lg px-3 sm:px-4 py-2.5 mb-4">{serverError}</div>
              )}
              <div className="flex justify-between">
                <Button variant="outline" type="button" onClick={() => setStep(3)}><ArrowLeft size={14} /> Voltar</Button>
                <Button variant="dark" loading={isUploading || formEscolinha.formState.isSubmitting} type="button"
                  onClick={formEscolinha.handleSubmit(submitEscolinha)}>
                  {isUploading ? 'Criando...' : 'Criar conta'} <ArrowRight size={14} />
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

// ──────────────────────────────────────────────────────────────
// AtletaSteps — steps 3-8 do fluxo de responsável
// ──────────────────────────────────────────────────────────────
function AtletaSteps({ step, setStep, data, setData, loading, serverError, onSubmit }: any) {
  const posicoes = [
    { value: 'GK', label: 'GK', sub: 'Goleiro' }, { value: 'LD', label: 'LD', sub: 'Lat. Dir.' },
    { value: 'LE', label: 'LE', sub: 'Lat. Esq.' }, { value: 'ZAG', label: 'ZAG', sub: 'Zagueiro' },
    { value: 'VOL', label: 'VOL', sub: 'Volante' }, { value: 'MEI', label: 'MEI', sub: 'Meia' },
    { value: 'EXT', label: 'EXT', sub: 'Extremo' }, { value: 'SA', label: 'SA', sub: '2° Ataq.' },
    { value: 'CA', label: 'CA', sub: 'C. Avante' },
  ]
  const habilidades = ['Técnica', 'Velocidade', 'Visão de jogo', 'Físico', 'Finalização', 'Passes']

  // Step 3 — Dados do atleta
  if (step === 3) return (
    <div className="flex flex-col gap-4">
      <div className="font-display text-3xl sm:text-4xl text-neutral-400 mb-1.5 leading-none">03</div>
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
        <FieldGroup>
          <Label>Posição Principal</Label>
          <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mt-1">
            {posicoes.map(p => (
              <button key={p.value} type="button" onClick={() => setData({ ...data, posicao: p.value })}
                className={cn('p-2 border rounded-lg text-center transition-all',
                  data.posicao === p.value ? 'border-green-400 bg-green-50 text-green-700' : 'border-neutral-200 hover:border-neutral-300')}>
                <div className="text-xs sm:text-sm font-medium">{p.label}</div>
                <div className="text-[9px] sm:text-[10px] text-neutral-400">{p.sub}</div>
              </button>
            ))}
          </div>
        </FieldGroup>
      </div>
      <div className="flex justify-between mt-5 sm:mt-6">
        <Button variant="outline" type="button" onClick={() => setStep(2)}><ArrowLeft size={14} /> Voltar</Button>
        <Button variant="dark" type="button"
          disabled={!data.nomeAtleta || !data.dataNascimento || !data.estado || !data.cidade || !data.descricao}
          onClick={() => setStep(4)}>
          Continuar <ArrowRight size={14} />
        </Button>
      </div>
    </div>
  )

  // Step 4 — Habilidades
  if (step === 4) return (
    <div>
      <div className="font-display text-3xl sm:text-4xl text-neutral-400 mb-1.5 leading-none">04</div>
      <h2 className="text-lg sm:text-xl font-medium mb-1">Habilidades</h2>
      <p className="text-xs sm:text-sm text-neutral-500 mb-4 sm:mb-6">Seja honesto. Escolinhas valorizam evolução.</p>
      <div className="flex flex-col gap-4 sm:gap-5">
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
      <div className="flex justify-between mt-5 sm:mt-6">
        <Button variant="outline" type="button" onClick={() => setStep(3)}><ArrowLeft size={14} /> Voltar</Button>
        <Button variant="dark" type="button" onClick={() => setStep(5)}>Continuar <ArrowRight size={14} /></Button>
      </div>
    </div>
  )

  // Step 5 — Mídia (com preview correto)
  if (step === 5) {
    const addVideo = () => setData({ ...data, videos: [...data.videos, { url: '', titulo: '' }] })
    const updateVideo = (i: number, field: string, val: string) => {
      const next = [...data.videos]; next[i] = { ...next[i], [field]: val }; setData({ ...data, videos: next })
    }
    const removeVideo = (i: number) => setData({ ...data, videos: data.videos.filter((_: any, idx: number) => idx !== i) })

    return (
      <div className="flex flex-col gap-6">
        <div>
          <div className="font-display text-3xl sm:text-4xl text-neutral-400 mb-1.5 leading-none">05</div>
          <h2 className="text-lg sm:text-xl font-medium mb-1">Fotos e vídeos</h2>
          <p className="text-xs sm:text-sm text-neutral-500 mb-4 sm:mb-6">Perfis com vídeos recebem até 8× mais interesse.</p>
        </div>

        {/* Foto de capa — preview imediato */}
        <FieldGroup>
          <Label className="flex items-center gap-2"><ImageIcon size={14} /> Foto de Capa / Perfil</Label>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-xl bg-neutral-100 border-2 border-dashed border-neutral-200 flex-shrink-0 overflow-hidden flex items-center justify-center text-neutral-400">
              {data.fotoPreview
                ? <img src={data.fotoPreview} alt="Capa" className="w-full h-full object-cover" />
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
                    // Gera preview local imediatamente
                    const reader = new FileReader()
                    reader.onload = ev => {
                      setData((prev: any) => ({
                        ...prev,
                        fotoUrl: file,
                        fotoPreview: ev.target?.result as string,
                      }))
                    }
                    reader.readAsDataURL(file)
                  } else {
                    setData((prev: any) => ({ ...prev, fotoUrl: null, fotoPreview: '' }))
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
              const selected = Array.from(e.target.files).slice(0, 3)
              const withPreview = await Promise.all(selected.map(f => new Promise(resolve => {
                const reader = new FileReader()
                reader.onload = ev => resolve(Object.assign(f, { preview: ev.target?.result as string }))
                reader.readAsDataURL(f)
              })))
              setData({ ...data, fotosAdicionais: withPreview as any[] })
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
          <Button variant="outline" type="button" onClick={() => setStep(4)}><ArrowLeft size={14} /> Voltar</Button>
          <Button variant="dark" type="button" onClick={() => setStep(6)}>Continuar <ArrowRight size={14} /></Button>
        </div>
      </div>
    )
  }

  // Step 6 — Conquistas
  if (step === 6) {
    const addConquista = () => setData({ ...data, conquistas: [...data.conquistas, { titulo: '', ano: '', descricao: '' }] })
    const updateConquista = (i: number, f: string, v: string) => {
      const next = [...data.conquistas]; next[i] = { ...next[i], [f]: v }; setData({ ...data, conquistas: next })
    }
    const removeConquista = (i: number) => setData({ ...data, conquistas: data.conquistas.filter((_: any, idx: number) => idx !== i) })

    return (
      <div className="flex flex-col gap-5">
        <div>
          <div className="font-display text-3xl sm:text-4xl text-neutral-400 mb-1.5 leading-none">06</div>
          <h2 className="text-lg sm:text-xl font-medium mb-1">Conquistas</h2>
          <p className="text-xs sm:text-sm text-neutral-500 mb-4 sm:mb-6">Torneios e prêmios que o atleta ganhou. (Opcional)</p>
        </div>
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
          <Button variant="outline" type="button" onClick={() => setStep(5)}><ArrowLeft size={14} /> Voltar</Button>
          <Button variant="dark" type="button" onClick={() => setStep(7)}>Continuar <ArrowRight size={14} /></Button>
        </div>
      </div>
    )
  }

  // Step 7 — Visualizar
  if (step === 7) return (
    <div className="flex flex-col gap-5 sm:gap-6">
      <div>
        <div className="font-display text-3xl sm:text-4xl text-neutral-400 mb-1.5 leading-none">07</div>
        <h2 className="text-lg sm:text-xl font-medium mb-1">Visualizar Perfil</h2>
        <p className="text-xs sm:text-sm text-neutral-500 mb-4 sm:mb-6">Veja como as escolinhas verão seu perfil.</p>
      </div>
      <AthleteProfilePreview data={data} onBack={() => setStep(6)} onNext={() => setStep(8)} />
    </div>
  )

  // Step 8 — Privacidade
  if (step === 8) {
    const toggle = (key: string) => setData({ ...data, [key]: !data[key] })
    const items = [
      { key: 'visivel', icon: <Eye size={14} />, title: 'Perfil visível para escolinhas', sub: 'Apenas escolinhas aprovadas podem ver' },
      { key: 'exibirCidade', icon: <MapPin size={14} />, title: 'Exibir cidade e estado', sub: 'Nunca endereço completo' },
      { key: 'mensagens', icon: <MessageCircle size={14} />, title: 'Receber mensagens', sub: 'Contato direto das escolinhas' },
    ]
    return (
      <div>
        <div className="font-display text-3xl sm:text-4xl text-neutral-400 mb-1.5 leading-none">08</div>
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
        {serverError && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs sm:text-sm rounded-lg px-3 sm:px-4 py-2.5 mb-4">{serverError}</div>
        )}
        <div className="flex justify-between">
          <Button variant="outline" type="button" onClick={() => setStep(7)}><ArrowLeft size={14} /> Voltar</Button>
          <Button variant="dark" loading={loading} onClick={onSubmit}>Publicar perfil <ArrowRight size={14} /></Button>
        </div>
      </div>
    )
  }

  return null
}

function SuccessScreen({ tipo }: { tipo: Tipo }) {
  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-neutral-200 rounded-2xl p-8 sm:p-10 text-center shadow-sm">
        <div className="text-amber-400 flex justify-center mb-4"><Clock size={48} /></div>
        <h2 className="font-display text-3xl sm:text-4xl text-neutral-800 mb-3 text-center uppercase">
          Cadastro Recebido!
        </h2>
        <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed mb-4 text-center">
          {tipo === 'responsavel'
            ? 'O perfil do atleta foi criado e agora passará por uma análise técnica de segurança.'
            : 'Os dados da sua escolinha foram enviados para nossa equipe de verificação.'}
        </p>
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-3.5 mb-6 text-left">
          <p className="text-[10px] sm:text-xs text-amber-700 leading-relaxed font-medium">
            💡 <strong>O que acontece agora?</strong><br />
            Nossa equipe revisará os dados em até 24h. Você receberá um e-mail assim que sua conta for aprovada e o acesso total for liberado.
          </p>
        </div>
        <div className="flex flex-col gap-2.5 sm:gap-3">
          <Link href="/"><Button variant="outline" className="w-full justify-center">Voltar ao início</Button></Link>
        </div>
      </div>
    </div>
  )
}
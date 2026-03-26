'use client'

import Link from 'next/link'
import React, { Suspense, useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  cadastroResponsavelSchema,
  cadastroResponsavelGoogleSchema,
  cadastroEscolinhaSchema,
  cadastroEscolinhaGoogleSchema,
  type CadastroResponsavelInput,
  type CadastroEscolinhaInput,
} from '@/lib/validations'
import { useSearchParams } from 'next/navigation'
import { createSupabaseBrowser } from '@/lib/supabase'
import { uploadImage, uploadImages } from '@/lib/storage'
import { Button } from '@/components/ui/Button'
import { Input, Select, Label, FieldGroup, Textarea } from '@/components/ui/Form'
import { ESTADOS } from '@/lib/utils'
import {
  Users, Landmark, ArrowLeft, ArrowRight, Eye, MapPin,
  MessageCircle, CircleCheckBig, Plus, Trash2, Trophy, Image as ImageIcon,
  Clock, Building2, Mail, Phone, FileText
} from 'lucide-react'
import { cn, formatPhone, formatCNPJ, translateAuthError } from '@/lib/utils'
import { toast } from 'sonner'
import { AthleteProfilePreview } from '@/components/atletas/AthleteProfilePreview'
import { CitySelect } from '@/components/ui/CitySelect'
import { TermsContent } from '@/components/legal/TermsContent'
import { PrivacyContent } from '@/components/legal/PrivacyContent'
import { X, Scale, Lock as LockIcon } from 'lucide-react'

type Tipo = 'responsavel' | 'escolinha'

const STEP_LABELS_RESP = ['Método', 'Tipo', 'Conta', 'Atleta', 'Habilidades', 'Mídia', 'Conquistas', 'Visualizar', 'Privacidade']
const STEP_LABELS_ESCOLINHA = ['Método', 'Tipo', 'Conta', 'Sobre', 'Finalizar']

export default function CadastroPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-100 flex items-center justify-center">Carregando...</div>}>
      <CadastroForm />
    </Suspense>
  )
}

function CadastroForm() {
  const searchParams = useSearchParams()
  const [tipo, setTipo] = useState<Tipo>('responsavel')
  const [step, setStep] = useState(0)
  const [done, setDone] = useState(false)
  const [serverError, setServerError] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [showLegal, setShowLegal] = useState<{ type: 'terms' | 'privacy', open: boolean }>({ type: 'terms', open: false })
  const [authMethod, setAuthMethod] = useState<'email' | 'google' | null>(null)
  const [googleUser, setGoogleUser] = useState<{ name: string; avatar_url: string; email: string } | null>(null)
  const supabase = createSupabaseBrowser()

  // Check if returning from Google OAuth
  useEffect(() => {
    const method = searchParams.get('method')
    if (method === 'google') {
      setAuthMethod('google')
      setStep(1) // Jump to role selection
      // Get user data from Supabase session
      supabase.auth.getUser().then((result: { data: { user: any } }) => {
        const user = result.data?.user
        if (user) {
          const meta = user.user_metadata
          setGoogleUser({
            name: meta?.full_name || meta?.name || '',
            avatar_url: meta?.avatar_url || meta?.picture || '',
            email: user.email || '',
          })
        }
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [atletaData, setAtletaData] = useState({
    nomeAtleta: '', descricao: '', dataNascimento: '',
    estado: '', cidade: '', posicao: 'MEI', peDominante: 'destro',
    altura_cm: '', peso_kg: '',
    escolinhaAtual: '',
    habilidades: [75, 68, 82, 60, 71, 79],
    // Fotos
    fotoPerfilUrl: null as File | string | null,
    fotoPerfilPreview: '',
    fotoCapaUrl: null as File | string | null,
    fotoCapaPreview: '',
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
  const progressPercent = (step / (totalSteps - 1)) * 100

  const isGoogle = authMethod === 'google'

  const formResp = useForm<CadastroResponsavelInput>({ 
    resolver: zodResolver(isGoogle ? cadastroResponsavelGoogleSchema : cadastroResponsavelSchema) as any,
    defaultValues: { nome: googleUser?.name || '', email: googleUser?.email || '', telefone: '', password: '', confirmPassword: '', aceito_termos: false }
  })
  const formEscolinha = useForm<CadastroEscolinhaInput>({ 
    resolver: zodResolver(isGoogle ? cadastroEscolinhaGoogleSchema : cadastroEscolinhaSchema) as any,
    defaultValues: { nome: '', cnpj: '', email: '', telefone: '', estado: '', cidade: '', password: '', confirmPassword: '', aceito_termos: false }
  })
  // Prefill form values when Google user data loads
  useEffect(() => {
    if (googleUser) {
      formResp.setValue('nome', googleUser.name)
      formResp.setValue('email', googleUser.email)
      formEscolinha.setValue('email', googleUser.email)
      if (googleUser.avatar_url) {
        formResp.setValue('foto_url', googleUser.avatar_url)
        setResponsavelPreview(googleUser.avatar_url)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [googleUser])

  // ── Submit responsável ──────────────────────────────────────
  async function submitResponsavel(data: CadastroResponsavelInput) {
    setServerError('')
    setIsUploading(true)
    try {
      // 1. Upload das imagens
      const foto_resp_url = data.foto_url instanceof File
        ? await uploadImage(data.foto_url, 'responsavel')
        : (data.foto_url ?? null)

      const atleta_foto_perfil = atletaData.fotoPerfilUrl instanceof File
        ? await uploadImage(atletaData.fotoPerfilUrl, 'atleta')
        : (atletaData.fotoPerfilUrl ?? null)

      const atleta_foto_capa = atletaData.fotoCapaUrl instanceof File
        ? await uploadImage(atletaData.fotoCapaUrl, 'atleta_capa')
        : (atletaData.fotoCapaUrl ?? null)

      const atleta_fotos_adicionais = await uploadImages(
        atletaData.fotosAdicionais.filter((f: any) => f instanceof File || (typeof f === 'string' && f)),
        'atleta_galeria'
      )

      // 2. Criar conta ou usar sessão Google existente
      let userId: string | undefined

      if (isGoogle) {
        // Google OAuth — user is already authenticated
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setServerError('Sessão Google expirada. Tente novamente.')
          toast.error('Sessão Google expirada. Tente novamente.')
          return
        }
        userId = user.id
        // Update user metadata with role
        await supabase.auth.updateUser({
          data: { nome: data.nome || user.user_metadata?.full_name, role: 'responsavel', telefone: data.telefone, foto_url: foto_resp_url }
        })
      } else {
        // Email signup
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
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
          setServerError(translateAuthError(signUpError.message))
          toast.error(translateAuthError(signUpError.message))
          return
        }
        userId = signUpData.user?.id

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
      }

      // 4. Buscar o profile criado pelo trigger
      // Aguarda um momento para o trigger rodar
      await new Promise(r => setTimeout(r, 1200))

      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', userId!)
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
          altura_cm: atletaData.altura_cm || null,
          peso_kg: atletaData.peso_kg || null,
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
          foto_url: atleta_foto_perfil,
          capa_url: atleta_foto_capa,
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

      // 1. Signup com metadata mínimo (evita cookie JWT gigante → erro 400)
      let userId: string | undefined

      if (isGoogle) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setServerError('Sessão Google expirada. Tente novamente.')
          toast.error('Sessão Google expirada. Tente novamente.')
          return
        }
        userId = user.id
        await supabase.auth.updateUser({
          data: { nome: data.nome, role: 'escolinha', telefone: data.telefone }
        })
      } else {
        const { data: signUpData, error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              nome: data.nome,
              role: 'escolinha',
              telefone: data.telefone,
            },
          },
        })
        if (error) { setServerError(translateAuthError(error.message)); toast.error(translateAuthError(error.message)); return }
        userId = signUpData.user?.id

        // 2. Login automático para obter sessão
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        })
        if (signInError) {
          toast.success('Conta criada! Faça login para continuar.')
          setDone(true)
          return
        }
      }

      // 3. Aguarda o trigger criar os registros base
      await new Promise(r => setTimeout(r, 1500))

      // 4. Atualiza a escolinha com os dados completos (descricao, fotos, etc.)
      if (userId) {
        await supabase
          .from('escolinhas')
          .update({
            estado: data.estado,
            cidade: data.cidade,
            cnpj: data.cnpj ?? null,
            foto_url: foto_url_final,
            logo_url: foto_url_final,
            descricao: data.descricao,
            fotos_adicionais: fotos_adicionais_final,
          })
          .eq('user_id', userId)

        // Atualiza foto no profile também
        if (foto_url_final) {
          await supabase
            .from('profiles')
            .update({ foto_url: foto_url_final })
            .eq('user_id', userId)
        }
      }

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
    <div className="min-h-screen bg-white flex overflow-hidden font-sans">
      
      {/* Left Side: Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0A1A14] relative items-center justify-center p-12 overflow-hidden sticky top-0 h-screen">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-green-500/10 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-amber-500/5 blur-[120px]"></div>
        
        <div className="relative z-10 max-w-lg">
          <Link href="/" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-20 group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Voltar para a home</span>
          </Link>

          <div className="font-display text-7xl text-white leading-none mb-8 uppercase">
            A JORNADA <br />
            <span className="text-green-400">COMEÇA</span> <br />
            AQUI.
          </div>

          <p className="text-neutral-400 text-lg leading-relaxed mb-12">
            {tipo === 'responsavel' 
              ? 'Dê o primeiro passo para o futuro do seu pequeno atleta. Cadastre-se e ganhe visibilidade nacional.' 
              : 'Encontre e monitore a evolução das maiores promessas da base em um só lugar.'}
          </p>

          <div className="grid grid-cols-1 gap-6">
            {[
              { icon: <CircleCheckBig className="text-green-400" />, title: 'Passo a Passo', desc: 'Preenchimento intuitivo e rápido.' },
              { icon: <Trophy className="text-amber-400" />, title: 'Visibilidade Real', desc: 'Seu perfil direto nas mãos de quem recruta.' },
            ].map((item, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="shrink-0 mt-1">{item.icon}</div>
                <div>
                  <div className="text-white font-bold text-sm mb-0.5">{item.title}</div>
                  <div className="text-neutral-500 text-xs leading-relaxed">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side: Form Wizard */}
      <div className="w-full lg:w-1/2 flex items-start justify-center p-6 sm:p-12 bg-neutral-50 lg:bg-white overflow-y-auto max-h-screen custom-scrollbar">
        <div className="w-full max-w-lg py-8 animate-fade-up">

          <div className="lg:hidden mb-12 text-center">
             <Link href="/" className="font-display text-3xl tracking-widest text-green-700">
              SCOUT<span className="text-amber-500">JR</span>
            </Link>
          </div>

          {/* Progress Header */}
          <div className="mb-10">
            <div className="flex items-end justify-between mb-4">
              <div>
                <span className="text-[10px] font-bold text-green-600 uppercase tracking-widest bg-green-50 px-2 py-1 rounded-md mb-2 inline-block">Etapa {step} de {totalSteps}</span>
                <h1 className="text-3xl font-bold text-neutral-900 leading-tight">Criação de Conta</h1>
              </div>
              <div className="text-right">
                <span className="text-2xl font-display text-neutral-300 tracking-tighter">{Math.round(progressPercent)}%</span>
              </div>
            </div>
            <div className="relative h-2 bg-neutral-100 rounded-full overflow-hidden border border-neutral-200/50">
              <div
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-600 to-green-400 rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(22,163,74,0.3)]"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="relative mt-4 -mx-4">
              <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-neutral-50 lg:from-white to-transparent z-10 pointer-events-none" />
              <div className="flex items-center gap-x-6 overflow-x-auto scrollbar-hide py-2 px-4 shadow-[inset_-20px_0_20px_-20px_rgba(0,0,0,0.05)]">
                {labels.map((l, i) => (
                  <div key={l} className={cn(
                    'text-[9px] font-bold uppercase tracking-widest flex items-center gap-2 shrink-0 transition-all duration-300',
                    i === step ? 'text-green-700 opacity-100 scale-110' : i < step ? 'text-green-600 opacity-80' : 'text-neutral-300 opacity-40'
                  )}>
                    <div className={cn(
                      "w-2.5 h-2.5 rounded-full flex items-center justify-center transition-all duration-500",
                      i <= step ? "bg-current shadow-[0_0_8px_rgba(34,197,94,0.3)]" : "bg-neutral-200"
                    )}>
                      {i < step && <CircleCheckBig size={8} className="text-white" />}
                    </div>
                    <span className="whitespace-nowrap">{l}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white lg:bg-transparent border border-neutral-200 lg:border-none rounded-2xl p-6 sm:p-0 shadow-sm lg:shadow-none">

          {/* STEP 0 — Método de autenticação */}
          {step === 0 && (
            <div>
              <div className="font-display text-3xl sm:text-4xl text-neutral-400 mb-1.5 leading-none">01</div>
              <h2 className="text-lg sm:text-xl font-medium mb-1">Como deseja criar sua conta?</h2>
              <p className="text-xs sm:text-sm text-neutral-500 mb-5 sm:mb-6">Escolha uma forma de se cadastrar.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
                <button type="button" onClick={async () => {
                  setAuthMethod('google')
                  await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                      redirectTo: `${window.location.origin}/api/auth/callback?next=${encodeURIComponent('/cadastro?method=google')}`
                    }
                  })
                }}
                  className="p-5 sm:p-6 border-2 rounded-xl text-left transition-all border-neutral-200 hover:border-green-400 hover:bg-green-50/50 group"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <svg height="1em" style={{flex:'none', lineHeight:1}} viewBox="0 0 24 24" width="1em" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6"><title>Google</title><path d="M23 12.245c0-.905-.075-1.565-.236-2.25h-10.54v4.083h6.186c-.124 1.014-.797 2.542-2.294 3.569l-.021.136 3.332 2.53.23.022C21.779 18.417 23 15.593 23 12.245z" fill="#4285F4"></path><path d="M12.225 23c3.03 0 5.574-.978 7.433-2.665l-3.542-2.688c-.948.648-2.22 1.1-3.891 1.1a6.745 6.745 0 01-6.386-4.572l-.132.011-3.465 2.628-.045.124C4.043 20.531 7.835 23 12.225 23z" fill="#34A853"></path><path d="M5.84 14.175A6.65 6.65 0 015.463 12c0-.758.138-1.491.361-2.175l-.006-.147-3.508-2.67-.115.054A10.831 10.831 0 001 12c0 1.772.436 3.447 1.197 4.938l3.642-2.763z" fill="#FBBC05"></path><path d="M12.225 5.253c2.108 0 3.529.892 4.34 1.638l3.167-3.031C17.787 2.088 15.255 1 12.225 1 7.834 1 4.043 3.469 2.197 7.062l3.63 2.763a6.77 6.77 0 016.398-4.572z" fill="#EB4335"></path></svg>
                    <span className="text-sm sm:text-base font-bold text-neutral-700">Criar com Google</span>
                  </div>
                  <div className="text-[10px] sm:text-xs text-neutral-400 leading-snug">Rápido e seguro. Use sua conta Google para se cadastrar com um clique.</div>
                </button>
                <button type="button" onClick={() => { setAuthMethod('email'); setStep(1) }}
                  className="p-5 sm:p-6 border-2 rounded-xl text-left transition-all border-neutral-200 hover:border-green-400 hover:bg-green-50/50 group"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <Mail size={24} className="text-green-600" />
                    <span className="text-sm sm:text-base font-bold text-neutral-700">Criar com E-mail</span>
                  </div>
                  <div className="text-[10px] sm:text-xs text-neutral-400 leading-snug">Crie uma conta com seu e-mail e senha. Controle total dos seus dados.</div>
                </button>
              </div>
            </div>
          )}

          {/* STEP 1 — Tipo de conta */}
          {step === 1 && (
            <div>
              <div className="font-display text-3xl sm:text-4xl text-neutral-400 mb-1.5 leading-none">02</div>
              <h2 className="text-lg sm:text-xl font-medium mb-1">Que tipo de conta?</h2>
              <p className="text-xs sm:text-sm text-neutral-500 mb-5 sm:mb-6">Escolha o perfil que se aplica.</p>
              {isGoogle && googleUser && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-4 animate-in fade-in duration-300">
                  {googleUser.avatar_url && <img src={googleUser.avatar_url} alt="" className="w-10 h-10 rounded-full border-2 border-green-300" />}
                  <div>
                    <div className="text-sm font-bold text-green-800">Logado como {googleUser.name || googleUser.email}</div>
                    <div className="text-[11px] text-green-600">Agora escolha o tipo da sua conta.</div>
                  </div>
                </div>
              )}
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
              <div className="flex justify-between">
                {!isGoogle && <Button variant="outline" type="button" onClick={() => setStep(0)}><ArrowLeft size={14} /> Voltar</Button>}
                <Button variant="dark" className="h-12 px-8 rounded-xl ml-auto" onClick={() => setStep(2)}>Continuar <ArrowRight size={14} className="ml-2" /></Button>
              </div>
            </div>
          )}

          {/* ── RESPONSÁVEL ── */}

          {step === 2 && tipo === 'responsavel' && (
            <form onSubmit={formResp.handleSubmit(() => setStep(3))}>
              <div className="font-display text-3xl sm:text-4xl text-neutral-400 mb-1.5 leading-none">03</div>
              <h2 className="text-lg sm:text-xl font-medium mb-1">Seus dados de contato</h2>
              <p className="text-xs sm:text-sm text-neutral-500 mb-4 sm:mb-6">Nunca aparecem no perfil público do atleta.</p>
              <div className="flex flex-col gap-3 sm:gap-4">
                {/* Foto responsável */}
                {isGoogle && googleUser?.avatar_url ? (
                  <div className="flex items-center gap-4 p-3 bg-green-50 border border-green-200 rounded-xl">
                    <img src={googleUser.avatar_url} alt="" className="w-14 h-14 rounded-full border-2 border-green-300" />
                    <div>
                      <div className="text-sm font-bold text-green-800">{googleUser.name}</div>
                      <div className="text-[11px] text-green-600">{googleUser.email}</div>
                    </div>
                  </div>
                ) : (
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
                )}
                {!isGoogle && (
                  <FieldGroup>
                    <Label>Nome completo</Label>
                    <Input placeholder="João da Silva" error={formResp.formState.errors.nome?.message} {...formResp.register('nome')} />
                  </FieldGroup>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {!isGoogle && (
                    <FieldGroup>
                      <Label>E-mail</Label>
                      <Input type="email" placeholder="joao@email.com" error={formResp.formState.errors.email?.message} {...formResp.register('email')} />
                    </FieldGroup>
                  )}
                  <FieldGroup>
                    <Label>Telefone / WhatsApp</Label>
                    <Input type="tel" placeholder="(51) 9 9999-9999"
                      error={formResp.formState.errors.telefone?.message}
                      {...formResp.register('telefone', { 
                        onChange: e => { 
                          const val = formatPhone(e.target.value);
                          e.target.value = val;
                          formResp.setValue('telefone', val);
                        } 
                      })} />
                  </FieldGroup>
                </div>
                {!isGoogle && (
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
                )}
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-xs text-amber-700 leading-relaxed">
                  Ao criar uma conta você confirma ser o responsável legal e concorda com os{' '}
                  <button type="button" onClick={() => setShowLegal({ type: 'terms', open: true })} className="underline font-bold hover:text-amber-800 transition-colors">Termos de Uso</button>.
                </div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" className="mt-0.5 accent-green-500" {...formResp.register('aceito_termos')} />
                  <span className="text-xs text-neutral-500">Li e aceito os <button type="button" onClick={() => setShowLegal({ type: 'terms', open: true })} className="underline">termos de uso</button> e <button type="button" onClick={() => setShowLegal({ type: 'privacy', open: true })} className="underline">política de privacidade</button></span>
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
              <div className="font-display text-3xl sm:text-4xl text-neutral-400 mb-1.5 leading-none">03</div>
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
                    <Input type="email" placeholder="contato@escolinha.com.br" 
                      readOnly={isGoogle}
                      className={isGoogle ? 'bg-neutral-50 cursor-not-allowed' : ''}
                      error={formEscolinha.formState.errors.email?.message} {...formEscolinha.register('email')} />
                  </FieldGroup>
                  <FieldGroup>
                    <Label>Telefone</Label>
                    <Input type="tel" placeholder="(51) 3333-3333" error={formEscolinha.formState.errors.telefone?.message}
                      {...formEscolinha.register('telefone', { 
                        onChange: e => { 
                          const val = formatPhone(e.target.value);
                          e.target.value = val;
                          formEscolinha.setValue('telefone', val);
                        } 
                      })} />
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
                      {...formEscolinha.register('cidade')}
                      value={formEscolinha.watch('cidade')}
                      onChange={e => formEscolinha.setValue('cidade', e.target.value, { shouldValidate: true })}
                      error={formEscolinha.formState.errors.cidade?.message}
                    />
                  </FieldGroup>
                </div>
                {!isGoogle && (
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
                )}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" className="mt-0.5 accent-green-500" {...formEscolinha.register('aceito_termos')} />
                  <span className="text-xs text-neutral-500">Li e aceito os <button type="button" onClick={() => setShowLegal({ type: 'terms', open: true })} className="underline">termos de uso</button> e <button type="button" onClick={() => setShowLegal({ type: 'privacy', open: true })} className="underline">política de privacidade</button></span>
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
              <div className="font-display text-3xl sm:text-4xl text-neutral-400 mb-1.5 leading-none">04</div>
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
                    const newFiles = Array.from(e.target.files)
                    const remainingSlots = 3 - escolinhaFotos.length
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
                    setEscolinhaFotos(prev => [...prev, ...withPreview] as any[])
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
              <div className="font-display text-3xl sm:text-4xl text-neutral-400 mb-1.5 leading-none">05</div>
              <h2 className="text-lg sm:text-xl font-medium mb-1">Tudo certo!</h2>
              <p className="text-xs sm:text-sm text-neutral-500 mb-4 sm:mb-6">Revise suas informações e finalize o cadastro.</p>
              <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-5 mb-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 rounded-xl bg-white border border-neutral-200 overflow-hidden flex-shrink-0">
                    {escolinhaPreview ? <img src={escolinhaPreview} alt="Logo" className="w-full h-full object-cover" /> : <Building2 className="w-full h-full p-4 text-neutral-300" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900 leading-tight">{formEscolinha.watch('nome') || 'Nome não informado'}</h3>
                    <p className="text-xs text-neutral-500 uppercase font-bold tracking-wider mt-1">{formEscolinha.watch('cnpj') || 'CNPJ não informado'}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-start gap-3">
                    <MapPin size={16} className="text-green-600 mt-0.5" />
                    <div>
                      <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Localização</div>
                      <div className="text-sm text-neutral-700">{formEscolinha.watch('cidade')}, {formEscolinha.watch('estado')}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail size={16} className="text-green-600 mt-0.5" />
                    <div>
                      <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">E-mail de contato</div>
                      <div className="text-sm text-neutral-700">{formEscolinha.watch('email')}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone size={16} className="text-green-600 mt-0.5" />
                    <div>
                      <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">WhatsApp / Telefone</div>
                      <div className="text-sm text-neutral-700">{formEscolinha.watch('telefone')}</div>
                    </div>
                  </div>
                  {formEscolinha.watch('descricao') && (
                    <div className="flex items-start gap-3">
                      <FileText size={16} className="text-green-600 mt-0.5" />
                      <div>
                        <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">Sobre</div>
                        <div className="text-sm text-neutral-700 line-clamp-2 leading-relaxed">{formEscolinha.watch('descricao')}</div>
                      </div>
                    </div>
                  )}
                </div>

                {escolinhaFotos.length > 0 && (
                  <div className="mt-6 pt-6 border-t border-neutral-200/50">
                    <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-3">Estrutura ({escolinhaFotos.length}/3)</div>
                    <div className="flex gap-2">
                       {escolinhaFotos.map((file, i) => (
                         <img key={i} src={file.preview} className="w-12 h-12 rounded-lg object-cover border border-neutral-200" alt="Estrutura" />
                       ))}
                    </div>
                  </div>
                )}
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

          <p className="text-center text-sm text-neutral-400 mt-12 mb-8">
            Já possui uma conta? {' '}
            <Link href="/login" className="text-green-600 hover:text-green-700 font-bold hover:underline underline-offset-4 decoration-2">
              Entrar agora
            </Link>
          </p>
        </div>
      </div>

      {/* Legal Modal Overlay */}
      {showLegal.open && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col relative animate-in slide-in-from-bottom-8 duration-500">
            {/* Modal Header */}
            <div className="p-6 sm:p-8 border-b border-neutral-100 flex items-center justify-between shrink-0 bg-white">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setShowLegal({ ...showLegal, open: false })}
                  className="w-10 h-10 rounded-full border border-neutral-200 flex items-center justify-center hover:bg-neutral-50 transition-colors"
                >
                  <ArrowLeft size={18} className="text-neutral-600" />
                </button>
                <div>
                  <div className="flex items-center gap-2 text-green-700 mb-0.5">
                    {showLegal.type === 'terms' ? <Scale size={18} /> : <LockIcon size={18} />}
                    <span className="text-[10px] font-bold uppercase tracking-widest leading-none">ScoutJR Jurídico</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 leading-tight">
                    {showLegal.type === 'terms' ? 'Termos de Uso' : 'Privacidade & LGPD'}
                  </h2>
                </div>
              </div>
              <button 
                onClick={() => setShowLegal({ ...showLegal, open: false })}
                className="text-neutral-400 hover:text-neutral-900 transition-colors hidden sm:block"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-12 custom-scrollbar bg-neutral-50/30">
              <div className="max-w-3xl mx-auto">
                <p className="text-sm text-neutral-400 mb-10 border-l-2 border-green-500 pl-4 py-1 italic bg-green-50/50 rounded-r-md">
                  {showLegal.type === 'terms' 
                    ? 'Revisado e em vigor a partir de Março de 2026. Documento em compliance com o Marco Civil da Internet.'
                    : 'A proteção dos dados das crianças, jovens e responsáveis é a raiz e fundação do ScoutJR.'}
                </p>
                {showLegal.type === 'terms' ? <TermsContent /> : <PrivacyContent />}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-neutral-100 flex justify-end shrink-0 bg-white gap-3">
               <Button variant="outline" onClick={() => setShowLegal({ ...showLegal, open: false })}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
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
    <div className="min-h-screen bg-white flex overflow-hidden font-sans">
      {/* Left Side: Success Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0A1A14] relative items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-green-500/10 blur-[120px]"></div>
        
        <div className="relative z-10 max-w-lg text-center">
          <div className="w-24 h-24 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-10 backdrop-blur-xl animate-pulse">
            <CircleCheckBig size={48} className="text-green-400" />
          </div>
          <div className="font-display text-6xl text-white leading-none mb-6 uppercase">
            ESTAMOS <br />
            <span className="text-green-400">JUNTOS.</span>
          </div>
          <p className="text-neutral-400 text-lg leading-relaxed">
            Seu cadastro é o primeiro passo para uma trajetória de sucesso no mundo do futebol.
          </p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-neutral-50 lg:bg-white">
        <div className="w-full max-w-md text-center animate-fade-up">
          <div className="lg:hidden text-green-500 flex justify-center mb-8 bg-green-50 w-20 h-20 rounded-full items-center mx-auto shadow-sm">
            <CircleCheckBig size={40} />
          </div>
          
          <h2 className="text-3xl font-bold text-neutral-900 mb-4 leading-tight">
            Cadastro Recebido!
          </h2>
          <p className="text-neutral-500 leading-relaxed mb-8">
            {tipo === 'responsavel'
              ? 'O perfil do atleta foi enviado e agora passará por uma análise técnica e de segurança de nossa equipe.'
              : 'Os dados da sua escolinha foram enviados e estão em fase de aprovação.'}
          </p>
          
          <div className="bg-amber-50 border border-amber-100/50 rounded-2xl p-6 mb-10 text-left shadow-sm">
            <div className="flex gap-3 items-start">
              <div className="bg-amber-100 p-2 rounded-lg shrink-0 mt-0.5">
                <Clock size={16} className="text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-bold text-amber-800 mb-1">O que acontece agora?</p>
                <p className="text-xs text-amber-700/80 leading-relaxed">
                  Nossa equipe revisará as informações em até <strong>24 horas úteis</strong>. 
                  Você receberá um e-mail de confirmação assim que o acesso total for liberado.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <Link href="/" className="w-full">
              <Button variant="dark" size="lg" className="w-full h-12 rounded-xl text-base font-bold shadow-lg shadow-green-900/10">
                Voltar ao Início
              </Button>
            </Link>
            <p className="text-neutral-400 text-xs text-center font-medium">Siga-nos nas redes sociais para atualizações.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
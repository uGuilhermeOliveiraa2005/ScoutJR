'use client'

import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginInput } from '@/lib/validations'
import { createSupabaseBrowser } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, Suspense } from 'react'
import { Mail, Lock, LogIn, ArrowLeft, ShieldCheck, Zap, Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input, Label, FieldGroup } from '@/components/ui/Form'
import { translateAuthError } from '@/lib/utils'
import { toast } from 'sonner'
import { TermsContent } from '@/components/legal/TermsContent'
import { PrivacyContent } from '@/components/legal/PrivacyContent'
import { X, Scale, Lock as LockIcon, Check as CheckLucide, Smartphone, ShieldCheck as ShieldIcon } from 'lucide-react'

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createSupabaseBrowser()
  const [serverError, setServerError] = useState('')
  const [rememberMe, setRememberMe] = useState(true)
  const [showLegal, setShowLegal] = useState<{ type: 'terms' | 'privacy', open: boolean }>({ type: 'terms', open: false })
  
  // MFA Login State
  const [step, setStep] = useState<'password' | 'mfa'>('password')
  const [mfaCode, setMfaCode] = useState('')
  const [pendingFactorId, setPendingFactorId] = useState<string | null>(null)
  const [mfaLoading, setMfaLoading] = useState(false)

  const isProfileError = searchParams.get('error') === 'profile_not_found'

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  async function onSubmit(data: LoginInput) {
    setServerError('')
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })
    
    if (error) {
      const msg = translateAuthError(error.message)
      setServerError(msg)
      toast.error(msg)
      return
    }

    // Check if MFA is required
    const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors()
    if (factorsError) {
      console.error('Error listing factors:', factorsError)
    }

    const verifiedFactor = factors?.all?.find((f: any) => f.status === 'verified')
    
    if (verifiedFactor) {
      // MFA sequence
      setPendingFactorId(verifiedFactor.id)
      setStep('mfa')
      return
    }

    toast.success('Login efetuado com sucesso!')
    router.push('/dashboard')
    router.refresh()
  }

  async function onVerifyMfa(e: React.FormEvent) {
    e.preventDefault()
    if (!pendingFactorId || mfaCode.length !== 6) return
    
    setMfaLoading(true)
    setServerError('')

    try {
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({
        factorId: pendingFactorId
      })
      if (challengeError) throw challengeError

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: pendingFactorId,
        challengeId: challenge.id,
        code: mfaCode
      })
      if (verifyError) throw verifyError

      toast.success('Autenticação confirmada!')
      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      console.error(err)
      const msg = translateAuthError(err.message || 'Erro na verificação do código.')
      setServerError(msg)
      toast.error(msg)
    } finally {
      setMfaLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex overflow-hidden font-sans">
      
      {/* Left Side: Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0A1A14] relative items-center justify-center p-12 overflow-hidden">
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
            O PRÓXIMO <br />
            <span className="text-green-400">CRAQUE</span> <br />
            ESTÁ AQUI.
          </div>

          <p className="text-neutral-400 text-lg leading-relaxed mb-12">
            Acesse sua conta para gerenciar perfis, descobrir novos talentos e acompanhar a evolução dos atletas da ScoutJR.
          </p>

          <div className="grid grid-cols-1 gap-6">
            {[
              { icon: <ShieldCheck className="text-green-400" />, title: 'Ambiente Seguro', desc: 'Seus dados e de sua família protegidos.' },
              { icon: <Zap className="text-amber-400" />, title: 'Acesso Instantâneo', desc: 'Dashboard completo e em tempo real.' },
              { icon: <Star className="text-green-400" />, title: 'Rede Exclusiva', desc: 'Conectando as melhores bases do Brasil.' }
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

      {/* Right Side: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-neutral-50 lg:bg-white relative">
        <div className="w-full max-w-md animate-fade-up">
          
          <div className="lg:hidden mb-12 text-center">
             <Link href="/" className="font-display text-3xl tracking-widest text-green-700">
              SCOUT<span className="text-amber-500">JR</span>
            </Link>
          </div>

          <div className="mb-10">
            <h1 className="text-3xl font-bold text-neutral-900 mb-2">{step === 'password' ? 'Login' : 'Segurança'}</h1>
            <p className="text-neutral-500">{step === 'password' ? 'Insira suas credenciais para entrar na plataforma.' : 'Proteção 2FA detectada.'}</p>
          </div>

          {step === 'password' ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            <FieldGroup>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                className="h-12 rounded-xl"
                leftIcon={<Mail size={18} className="text-neutral-400" />}
                error={errors.email?.message}
                {...register('email')}
              />
            </FieldGroup>

            <FieldGroup>
              <div className="flex justify-between items-center mb-1.5">
                <Label htmlFor="password" className="mb-0 text-xs text-neutral-500">Senha</Label>
                <Link href="/recuperar-senha" className="text-xs text-green-600 hover:text-green-700 font-medium">
                  Esqueceu a senha?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="h-12 rounded-xl"
                leftIcon={<Lock size={18} className="text-neutral-400" />}
                error={errors.password?.message}
                {...register('password')}
              />
            </FieldGroup>

            <div className="flex items-center justify-between py-1">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="peer appearance-none w-5 h-5 border-2 border-neutral-300 rounded-md checked:bg-green-500 checked:border-green-500 transition-all cursor-pointer" 
                  />
                  <CheckIcon className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                </div>
                <span className="text-sm text-neutral-600 font-medium group-hover:text-neutral-900 transition-colors">Manter conectado</span>
              </label>
            </div>

            {isProfileError && (
              <div className="bg-amber-50 border border-amber-200 text-amber-700 text-xs sm:text-sm rounded-xl px-4 py-4 flex flex-col gap-3 shadow-sm">
                <p className="font-medium leading-relaxed"><strong>Perfil não encontrado:</strong> Você está autenticado, mas não encontramos seus dados cadastrais.</p>
                <Button type="button" variant="outline" size="sm" onClick={handleLogout} className="w-full justify-center bg-white border-amber-200 hover:bg-amber-100 h-10">
                  Sair e tentar novamente
                </Button>
              </div>
            )}

            {serverError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 font-medium animate-in fade-in zoom-in-95 duration-200">
                {serverError}
              </div>
            )}

            <Button type="submit" variant="dark" size="lg" loading={isSubmitting} className="w-full h-12 rounded-xl text-base font-bold shadow-lg shadow-green-900/10 hover:shadow-green-900/20 active:scale-[0.98] transition-all">
              <LogIn size={18} className="mr-2" /> Acessar conta
            </Button>
          </form>
          ) : (
            /* MFA CHALLENGE UI */
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
               <div className="mb-8 p-4 bg-blue-50 border border-blue-100 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600 shrink-0">
                     <Smartphone size={24} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-blue-900 leading-tight">Autenticação de 2 Fatores</h3>
                    <p className="text-[11px] text-blue-700 mt-1">Sua conta exige uma camada extra de segurança.</p>
                  </div>
               </div>

               <p className="text-sm text-neutral-600 mb-6 font-medium">Digite o código de 6 dígitos gerado no seu aplicativo autenticador.</p>

               <form onSubmit={onVerifyMfa} className="space-y-6">
                  <div className="flex justify-center">
                    <input 
                      type="text" 
                      maxLength={6} 
                      autoFocus
                      value={mfaCode}
                      onChange={e => setMfaCode(e.target.value.replace(/\D/g, ''))}
                      className="w-full h-16 text-center text-4xl font-black tracking-[0.5em] sm:tracking-[1em] pl-4 border-2 border-neutral-200 rounded-2xl outline-none focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all bg-white shadow-inner"
                      placeholder="000000"
                    />
                  </div>

                  {serverError && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 font-medium animate-in shake">
                      {serverError}
                    </div>
                  )}

                  <div className="flex flex-col gap-3">
                    <Button type="submit" variant="dark" size="lg" loading={mfaLoading} disabled={mfaCode.length !== 6} className="w-full h-12 rounded-xl text-base font-bold shadow-green-900/10">
                      <ShieldIcon size={18} className="mr-2" /> Confirmar Código
                    </Button>
                    <button type="button" onClick={() => { setStep('password'); handleLogout() }} className="text-sm font-bold text-neutral-400 hover:text-neutral-600 py-2 transition-colors">
                      Voltar para login
                    </button>
                  </div>
               </form>
            </div>
          )}

          <div className="relative my-10">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-neutral-200"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-neutral-50 lg:bg-white px-4 text-neutral-400 font-medium tracking-widest">OU</span>
            </div>
          </div>

          <p className="text-center text-sm text-neutral-500">
            Ainda não faz parte da comunidade? <br className="sm:hidden" />
            <Link href="/cadastro" className="text-green-600 font-bold hover:text-green-700 hover:underline underline-offset-4 decoration-2 transition-all">
              Criar conta grátis
            </Link>
          </p>

          <div className="mt-12 pt-6 border-t border-neutral-100 flex flex-wrap justify-center gap-x-6 gap-y-2 text-[10px] sm:text-xs text-neutral-400 font-medium">
            <button type="button" onClick={() => setShowLegal({ type: 'terms', open: true })} className="hover:text-neutral-900 transition-colors">Termos de Uso</button>
            <button type="button" onClick={() => setShowLegal({ type: 'privacy', open: true })} className="hover:text-neutral-900 transition-colors">Privacidade</button>
            <span>© {new Date().getFullYear()} ScoutJR</span>
          </div>

        </div>
      </div>

      {/* Legal Modal Overlay */}
      {showLegal.open && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col relative animate-in slide-in-from-bottom-8 duration-500 font-sans text-left">
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
                  <div className="flex items-center gap-2 text-green-700 mb-0.5 text-left">
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


function CheckIcon(props: any) {
  return (
    <svg 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor" 
      strokeWidth={4} 
      {...props}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-100 flex items-center justify-center font-display text-xl tracking-widest text-green-700 animate-pulse">CARREGANDO...</div>}>
      <LoginContent />
    </Suspense>
  )
}
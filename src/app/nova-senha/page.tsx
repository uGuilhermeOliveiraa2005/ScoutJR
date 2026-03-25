'use client'

import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { novaSenhaSchema, type NovaSenhaInput } from '@/lib/validations'
import { createSupabaseBrowser } from '@/lib/supabase'
import { useState } from 'react'
import { Lock, ArrowLeft, ShieldCheck, Zap, Star, CheckCircle2, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input, Label, FieldGroup } from '@/components/ui/Form'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export default function NovaSenhaPage() {
  const router = useRouter()
  const supabase = createSupabaseBrowser()
  const [serverError, setServerError] = useState('')
  const [success, setSuccess] = useState(false)

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<NovaSenhaInput>({
    resolver: zodResolver(novaSenhaSchema),
  })

  async function onSubmit(data: NovaSenhaInput) {
    setServerError('')
    const { error } = await supabase.auth.updateUser({
      password: data.password,
    })
    
    if (error) {
      setServerError('Não foi possível alterar a senha. O link pode ter expirado.')
      toast.error('Erro ao redefinir senha.')
      return
    }

    setSuccess(true)
    toast.success('Senha alterada com sucesso!')
    setTimeout(() => {
      router.push('/login')
    }, 3000)
  }

  // Password requirements for UI guidance
  const pass = watch('password', '')
  const hasMin = pass.length >= 8
  const hasUpper = /[A-Z]/.test(pass)
  const hasLower = /[a-z]/.test(pass)
  const hasNum = /\d/.test(pass)
  const hasSpecial = /[@$!%*?&\W]/.test(pass)

  return (
    <div className="min-h-screen bg-white flex overflow-hidden font-sans">
      
      {/* Left Side: Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0A1A14] relative items-center justify-center p-12 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-green-500/10 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-amber-500/5 blur-[120px]"></div>
        
        <div className="relative z-10 max-w-lg">
          <div className="font-display text-7xl text-white leading-none mb-8 uppercase">
             Segurança em <br />
            <span className="text-green-400 font-bold italic tracking-tighter">Primeiro.</span>
          </div>

          <p className="text-neutral-400 text-lg leading-relaxed mb-12">
            Escolha uma senha forte e memorável. No ScoutJR, utilizamos criptografia de ponta para garantir que seus dados permaneçam inacessíveis a terceiros.
          </p>

          <div className="grid grid-cols-1 gap-6">
            {[
              { icon: <ShieldCheck className="text-green-400" />, title: 'Criptografia Militar', desc: 'Sua nova senha será protegida pelos padrões mais rigorosos.' },
              { icon: <Lock className="text-amber-400" />, title: 'Controle Total', desc: 'Você pode alterar sua senha a qualquer momento no perfil.' },
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

          {success ? (
            <div className="text-center">
              <div className="w-20 h-20 bg-green-50 text-green-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner shadow-green-100/50 scale-110 animate-fade-down">
                <CheckCircle2 size={32} />
              </div>
              <h2 className="text-3xl font-bold text-neutral-900 mb-4 tracking-tight">Senha Atualizada!</h2>
              <p className="text-neutral-500 leading-relaxed mb-10">
                Sua senha foi redefinida com sucesso. Você será redirecionado para a página de login em instantes.
              </p>
              
              <Link href="/login" className="block w-full">
                <Button variant="dark" size="lg" className="w-full h-12 rounded-xl text-base font-bold shadow-lg shadow-green-900/10 active:scale-[0.98] transition-all">
                  Ir para o Login Agora
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-10">
                <h1 className="text-3xl font-bold text-neutral-900 mb-2">Nova senha</h1>
                <p className="text-neutral-500">Crie uma senha forte para proteger seu acesso.</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
                <FieldGroup>
                  <Label htmlFor="password">Nova Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="h-12 rounded-xl"
                    leftIcon={<Lock size={18} className="text-neutral-400" />}
                    error={errors.password?.message}
                    {...register('password')}
                  />
                  
                  {/* Password Requirements Guidance */}
                  <div className="grid grid-cols-2 gap-y-2 gap-x-4 pt-2">
                    {[
                      { met: hasMin, label: '8+ caracteres' },
                      { met: hasUpper, label: 'Letra Maiúscula' },
                      { met: hasLower, label: 'Letra Minúscula' },
                      { met: hasNum, label: 'Número' },
                      { met: hasSpecial, label: 'Símbolo (@$!%...)' }
                    ].map((req, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className={cn(
                          "w-4 h-4 rounded-full flex items-center justify-center transition-colors",
                          req.met ? "bg-green-100 text-green-600" : "bg-neutral-100 text-neutral-300"
                        )}>
                          <Check size={10} strokeWidth={4} />
                        </div>
                        <span className={cn(
                          "text-[10px] font-medium transition-colors",
                          req.met ? "text-green-700" : "text-neutral-400"
                        )}>{req.label}</span>
                      </div>
                    ))}
                  </div>
                </FieldGroup>

                <FieldGroup>
                  <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    className="h-12 rounded-xl"
                    leftIcon={<Lock size={18} className="text-neutral-400" />}
                    error={errors.confirmPassword?.message}
                    {...register('confirmPassword')}
                  />
                </FieldGroup>

                {serverError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 font-medium animate-in fade-in zoom-in-95 duration-200">
                    {serverError}
                  </div>
                )}

                <Button 
                  type="submit" 
                  variant="dark" 
                  size="lg" 
                  loading={isSubmitting} 
                  className="w-full h-12 rounded-xl text-base font-bold shadow-lg shadow-green-900/10 hover:shadow-green-900/20 active:scale-[0.98] transition-all"
                >
                  Confirmar nova senha
                </Button>
              </form>
            </>
          )}

          <div className="mt-12 pt-6 border-t border-neutral-100 flex justify-center gap-x-6 text-[10px] sm:text-xs text-neutral-400 font-medium">
            <span>© {new Date().getFullYear()} ScoutJR</span>
          </div>

        </div>
      </div>
    </div>
  )
}

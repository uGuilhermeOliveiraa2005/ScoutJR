'use client'

import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { recuperarSenhaSchema, type RecuperarSenhaInput } from '@/lib/validations'
import { createSupabaseBrowser } from '@/lib/supabase'
import { useState } from 'react'
import { Mail, ArrowLeft, ShieldCheck, Zap, Star, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input, Label, FieldGroup } from '@/components/ui/Form'
import { toast } from 'sonner'

export default function RecuperarSenhaPage() {
  const supabase = createSupabaseBrowser()
  const [sent, setSent] = useState(false)
  const [serverError, setServerError] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RecuperarSenhaInput>({
    resolver: zodResolver(recuperarSenhaSchema),
  })

  async function onSubmit(data: RecuperarSenhaInput) {
    setServerError('')
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/api/auth/callback?next=/nova-senha`,
    })
    
    if (error) {
      setServerError('Não foi possível enviar o e-mail. Verifique o endereço e tente novamente.')
      toast.error('Erro ao enviar link de recuperação.')
      return
    }

    setSent(true)
    toast.success('Link de recuperação enviado!')
  }

  return (
    <div className="min-h-screen bg-white flex overflow-hidden font-sans">
      
      {/* Left Side: Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0A1A14] relative items-center justify-center p-12 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-green-500/10 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-amber-500/5 blur-[120px]"></div>
        
        <div className="relative z-10 max-w-lg">
          <Link href="/login" className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors mb-20 group">
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-sm font-medium">Voltar para o login</span>
          </Link>

          <div className="font-display text-7xl text-white leading-none mb-8 uppercase">
            Sua conta <br />
            <span className="text-amber-500 font-bold italic tracking-tighter">Segura.</span>
          </div>

          <p className="text-neutral-400 text-lg leading-relaxed mb-12">
            Não se preocupe! Acontece com os melhores. Informe seu e-mail e enviaremos um link seguro para você redefinir sua senha em instantes.
          </p>

          <div className="grid grid-cols-1 gap-6">
            {[
              { icon: <ShieldCheck className="text-green-400" />, title: 'Redefinição Segura', desc: 'Processo criptografado via e-mail pessoal.' },
              { icon: <Zap className="text-amber-400" />, title: 'Rápido e Prático', desc: 'Link de acesso imediato enviado agora.' },
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

          {sent ? (
            <div className="text-center">
              <div className="w-20 h-20 bg-green-50 text-green-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner shadow-green-100/50 scale-110 animate-fade-down">
                <Mail size={32} />
              </div>
              <h2 className="text-3xl font-bold text-neutral-900 mb-4 tracking-tight">E-mail Enviado!</h2>
              <p className="text-neutral-500 leading-relaxed mb-10">
                Verifique sua caixa de entrada e siga as instruções para redefinir sua senha. Caso não encontre, verifique a pasta de spam.
              </p>
              
              <div className="space-y-4">
                <Link href="/login" className="block w-full">
                  <Button variant="dark" size="lg" className="w-full h-12 rounded-xl text-base font-bold shadow-lg shadow-green-900/10 active:scale-[0.98] transition-all">
                    Voltar ao Login
                  </Button>
                </Link>
                <button 
                  onClick={() => setSent(false)} 
                  className="text-sm text-neutral-400 hover:text-green-600 font-medium transition-colors"
                >
                  Tentar com outro e-mail
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-10">
                <h1 className="text-3xl font-bold text-neutral-900 mb-2">Recuperar acesso</h1>
                <p className="text-neutral-500">Esqueceu sua senha? Não se preocupe, vamos te ajudar.</p>
              </div>

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
                  Enviar link de recuperação
                </Button>
              </form>

              <p className="text-center text-sm text-neutral-500 mt-10">
                Lembrou a senha? {' '}
                <Link href="/login" className="text-green-600 font-bold hover:text-green-700 hover:underline underline-offset-4 decoration-2 transition-all">
                  Voltar ao login
                </Link>
              </p>
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

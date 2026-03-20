'use client'

import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginInput } from '@/lib/validations'
import { createSupabaseBrowser } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, Suspense } from 'react'
import { Mail, Lock, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input, Label, FieldGroup } from '@/components/ui/Form'

// 1. Movemos a lógica principal para este componente interno
function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createSupabaseBrowser()
  const [serverError, setServerError] = useState('')

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
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })
    if (error) {
      setServerError('E-mail ou senha incorretos.')
      return
    }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center px-4 py-10 sm:py-12">
      <div className="w-full max-w-md">

        <div className="text-center mb-6 sm:mb-8">
          <Link href="/" className="font-display text-2xl sm:text-3xl tracking-widest text-green-700 inline-block mb-1 sm:mb-2">
            SCOUT<span className="text-amber-500">JR</span>
          </Link>
          <p className="text-xs sm:text-sm text-neutral-500">Bem-vindo de volta</p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 sm:gap-5" noValidate>

            <FieldGroup>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                leftIcon={<Mail size={14} />}
                error={errors.email?.message}
                {...register('email')}
              />
            </FieldGroup>

            <FieldGroup>
              <div className="flex justify-between items-center mb-1.5">
                <Label htmlFor="password" className="mb-0">Senha</Label>
                <Link href="/recuperar-senha" className="text-[10px] sm:text-xs text-green-600 hover:text-green-700">
                  Esqueci minha senha
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                leftIcon={<Lock size={14} />}
                error={errors.password?.message}
                {...register('password')}
              />
            </FieldGroup>

            {isProfileError && (
              <div className="bg-amber-50 border border-amber-200 text-amber-700 text-xs sm:text-sm rounded-lg px-3 sm:px-4 py-3 flex flex-col gap-2.5 sm:gap-3">
                <p><strong>Perfil não encontrado:</strong> Você está autenticado, mas não encontramos seus dados.</p>
                <Button type="button" variant="outline" size="sm" onClick={handleLogout} className="w-full justify-center">
                  Sair e tentar novamente
                </Button>
              </div>
            )}

            {serverError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-xs sm:text-sm rounded-lg px-3 sm:px-4 py-2.5 sm:py-3">
                {serverError}
              </div>
            )}

            <Button type="submit" variant="dark" size="lg" loading={isSubmitting} className="w-full mt-1 justify-center">
              <LogIn size={15} /> Entrar
            </Button>
          </form>

          <div className="flex items-center gap-3 my-5 sm:my-6">
            <div className="flex-1 h-px bg-neutral-100" />
            <span className="text-[10px] sm:text-xs text-neutral-400">ou</span>
            <div className="flex-1 h-px bg-neutral-100" />
          </div>

          <p className="text-center text-xs sm:text-sm text-neutral-500">
            Não tem conta?{' '}
            <Link href="/cadastro" className="text-green-600 font-medium hover:text-green-700">
              Criar gratuitamente
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

// 2. Exportamos a página com o Suspense englobando o componente
export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-100 flex items-center justify-center">Carregando...</div>}>
      <LoginContent />
    </Suspense>
  )
}
'use client'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, type LoginInput } from '@/lib/validations'
import { createSupabaseBrowser } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { Mail, Lock, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input, Label, FieldGroup } from '@/components/ui/Form'

export default function LoginPage() {
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
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <Link href="/" className="font-display text-3xl tracking-widest text-green-700 inline-block mb-2">
            SCOUT<span className="text-amber-500">JR</span>
          </Link>
          <p className="text-sm text-neutral-500">Bem-vindo de volta</p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-8 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>

            <FieldGroup>
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                leftIcon={<Mail size={15} />}
                error={errors.email?.message}
                {...register('email')}
              />
            </FieldGroup>

            <FieldGroup>
              <div className="flex justify-between items-center mb-1.5">
                <Label htmlFor="password" className="mb-0">Senha</Label>
                <Link href="/recuperar-senha" className="text-xs text-green-600 hover:text-green-700">Esqueci minha senha</Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                leftIcon={<Lock size={15} />}
                error={errors.password?.message}
                {...register('password')}
              />
            </FieldGroup>

            {isProfileError && (
              <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-lg px-4 py-3 flex flex-col gap-3">
                <p>
                  <strong>Perfil não encontrado:</strong> Você está autenticado, mas não conseguimos encontrar seus dados de perfil.
                </p>
                <Button type="button" variant="outline" size="sm" onClick={handleLogout} className="w-full">
                  Sair da conta e tentar novamente
                </Button>
              </div>
            )}

            {serverError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
                {serverError}
              </div>
            )}

            <Button type="submit" variant="dark" size="lg" loading={isSubmitting} className="w-full mt-1">
              <LogIn size={16} /> Entrar
            </Button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-neutral-100" />
            <span className="text-xs text-neutral-400">ou</span>
            <div className="flex-1 h-px bg-neutral-100" />
          </div>

          <p className="text-center text-sm text-neutral-500">
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

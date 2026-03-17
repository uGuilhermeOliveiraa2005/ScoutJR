'use client'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { recuperarSenhaSchema, type RecuperarSenhaInput } from '@/lib/validations'
import { createSupabaseBrowser } from '@/lib/supabase'
import { useState } from 'react'
import { Mail, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input, Label, FieldGroup } from '@/components/ui/Form'

export default function RecuperarSenhaPage() {
  const supabase = createSupabaseBrowser()
  const [sent, setSent] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RecuperarSenhaInput>({
    resolver: zodResolver(recuperarSenhaSchema),
  })

  async function onSubmit(data: RecuperarSenhaInput) {
    await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/api/auth/callback?next=/nova-senha`,
    })
    setSent(true)
  }

  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="font-display text-3xl tracking-widest text-green-700 inline-block mb-2">
            SCOUT<span className="text-amber-500">JR</span>
          </Link>
        </div>
        <div className="bg-white border border-neutral-200 rounded-2xl p-8 shadow-sm">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail size={24} />
              </div>
              <h2 className="font-display text-2xl text-green-700 mb-2">E-MAIL ENVIADO</h2>
              <p className="text-sm text-neutral-500 leading-relaxed mb-6">Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.</p>
              <Link href="/login"><Button variant="outline" className="w-full"><ArrowLeft size={14} /> Voltar ao login</Button></Link>
            </div>
          ) : (
            <>
              <h2 className="font-display text-2xl text-neutral-900 mb-1">Recuperar senha</h2>
              <p className="text-sm text-neutral-500 mb-6">Informe seu e-mail e enviaremos um link para redefinir.</p>
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
                <FieldGroup>
                  <Label>E-mail</Label>
                  <Input type="email" placeholder="seu@email.com" leftIcon={<Mail size={15} />} error={errors.email?.message} {...register('email')} />
                </FieldGroup>
                <Button type="submit" variant="dark" loading={isSubmitting} className="w-full">Enviar link de recuperação</Button>
              </form>
              <p className="text-center text-sm text-neutral-400 mt-6">
                <Link href="/login" className="text-green-600 hover:text-green-700 flex items-center justify-center gap-1">
                  <ArrowLeft size={13} /> Voltar ao login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

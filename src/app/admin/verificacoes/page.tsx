'use server'

import { createSupabaseServer } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { getPendentes, aprovarPerfil, rejeitarPerfil } from './actions'
import { VerificationClient } from './VerificationClient'
import { NavbarDashboard } from '@/components/layout/Navbar'

export default async function AdminVerificacoesPage() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!profile || !profile.is_admin) {
    redirect('/dashboard')
  }

  const data = await getPendentes()

  if ('error' in data) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <p className="text-red-500 font-medium">{data.error}</p>
      </div>
    )
  }

  return (
    <>
      <NavbarDashboard
        userName={profile.nome}
        userRole="admin"
        userId={user.id}
        userFotoUrl={profile.foto_url}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl text-neutral-900 tracking-tight">
            VERIFICAÇÕES PENDENTES
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            Analise cuidadosamente cada solicitação antes de aprovar.
          </p>
        </div>

        <VerificationClient initialData={data} />
      </main>
    </>
  )
}

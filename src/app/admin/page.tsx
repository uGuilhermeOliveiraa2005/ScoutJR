'use server'

import { createSupabaseServer } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { getAdminDashboardData, getAdminPendentes } from './actions'
import { AdminClient } from './AdminClient'
import { NavbarDashboard } from '@/components/layout/Navbar'

export default async function AdminPage() {
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

  // Busca dados iniciais para o Dashboard e Verificações
  const [dashboard, pendentes] = await Promise.all([
    getAdminDashboardData(),
    getAdminPendentes()
  ])

  if ('error' in dashboard || 'error' in pendentes) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm text-center">
           <p className="text-red-500 font-medium">Erro ao carregar dados administrativos.</p>
           <button onClick={() => window.location.reload()} className="mt-4 text-sm text-neutral-400 underline">Tentar novamente</button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-50/50">
      <NavbarDashboard
        userName={profile.nome}
        userRole="admin"
        userId={user.id}
        userFotoUrl={profile.foto_url}
        isAdmin={true}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8 animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-3 mb-2">
            <span className="w-8 h-8 rounded-lg bg-green-700 flex items-center justify-center text-white shadow-lg">
              <ShieldCheck size={20} />
            </span>
            <h1 className="font-display text-3xl text-neutral-900 tracking-tight">
              CENTRO DE COMANDO
            </h1>
          </div>
          <p className="text-sm text-neutral-500">
            Gerencie usuários, aprove perfis e acompanhe o crescimento da ScoutJR em tempo real.
          </p>
        </div>

        <AdminClient initialData={{ dashboard, pendentes }} />
      </main>
    </div>
  )
}

function ShieldCheck({ size }: { size: number }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

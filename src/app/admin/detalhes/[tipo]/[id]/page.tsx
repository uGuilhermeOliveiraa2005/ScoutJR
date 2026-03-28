'use server'

import { createSupabaseServer } from '@/lib/supabase-server'
import { redirect, notFound } from 'next/navigation'
import { getAdminDetail } from '../../../actions'
import { DetailViewClient } from '../../DetailViewClient'
import { NavbarDashboard } from '@/components/layout/Navbar'
import { ShieldCheck } from 'lucide-react'

export default async function AdminDetailPage({ 
  params 
}: { 
  params: Promise<{ tipo: string; id: string }> 
}) {
  const { tipo, id } = await params
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

  // Busca os dados detalhados da entidade
  const detail = await getAdminDetail(tipo, id)

  if ('error' in detail || !detail.data) {
    notFound()
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
        <DetailViewClient data={detail.data} tipo={detail.tipo} />
      </main>
    </div>
  )
}

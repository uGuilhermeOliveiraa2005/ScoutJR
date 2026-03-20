import { createSupabaseServer } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { NavbarDashboard } from '@/components/layout/Navbar'
import { RecentActivity } from '@/components/notifications/RecentActivity'
import { Bell, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default async function NotificacoesPage() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (!profile) redirect('/login')

  let clube = null
  if (profile.role === 'clube') {
    const { data } = await supabase
      .from('clubes')
      .select('*')
      .eq('user_id', user.id)
      .single()
    clube = data
  }

  return (
    <>
      <NavbarDashboard
        userName={profile.nome}
        userRole={profile.role}
        verificado={clube?.verificado ?? false}
        userId={user.id}
      />
      
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-5 sm:py-8 pb-24 md:pb-8">
        <div className="mb-6 sm:mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <button className="p-2 rounded-lg hover:bg-neutral-100 transition-colors text-neutral-500">
                <ArrowLeft size={20} />
              </button>
            </Link>
            <h1 className="font-display text-2xl sm:text-3xl text-neutral-900 tracking-tight">NOTIFICAÇÕES</h1>
          </div>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6 text-neutral-400">
            <Bell size={18} />
            <span className="text-sm font-medium">Histórico de interações</span>
          </div>
          
          <RecentActivity userId={user.id} limit={20} />
          
          <div className="mt-8 pt-6 border-t border-neutral-100 text-center">
             <p className="text-xs text-neutral-400 italic">
               As notificações são atualizadas em tempo real.
             </p>
          </div>
        </div>
      </main>
    </>
  )
}

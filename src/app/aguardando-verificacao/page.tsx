import { createSupabaseServer } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { signOutAction } from './actions'
import { Clock, ShieldCheck, Mail, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function WaitingVerificationPage() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('status, nome, is_admin')
    .eq('user_id', user.id)
    .single()

  console.log('DEBUG WAITING PAGE:', { 
    userId: user.id, 
    email: user.email,
    profileStatus: profile?.status, 
    profileIsAdmin: profile?.is_admin 
  })

  if (profile?.status === 'ativo' || profile?.is_admin) {
    console.log('REDIRECTING TO DASHBOARD...')
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center px-4 text-center">
      <div className="max-w-md w-full bg-white border border-neutral-200 rounded-3xl p-8 sm:p-10 shadow-xl animate-in fade-in zoom-in duration-500">
        
        <div className="w-20 h-20 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
          <Clock size={40} className="animate-pulse" />
        </div>

        <h1 className="font-display text-2xl sm:text-3xl text-neutral-900 mb-3 tracking-tight">
          CONTA EM ANÁLISE
        </h1>
        
        <p className="text-neutral-500 text-sm sm:text-base leading-relaxed mb-8">
          Olá, <span className="font-bold text-neutral-800">{profile?.nome}</span>! 
          Recebemos sua solicitação de cadastro. Para garantir a segurança de todos os atletas e clubes, 
          realizamos uma revisão manual de cada perfil.
        </p>

        <div className="space-y-4 mb-8">
          <FeatureItem icon={<ShieldCheck size={18} className="text-green-600" />} text="Segurança garantida para menores" />
          <FeatureItem icon={<Mail size={18} className="text-blue-600" />} text="Notificação por e-mail após aprovação" />
        </div>

        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 mb-8 text-left">
          <p className="text-xs text-amber-700 leading-relaxed font-medium">
            💡 Isso geralmente leva menos de 24 horas úteis. 
            Fique atento ao seu e-mail e ao painel quando for aprovado!
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <Link href="/">
            <Button variant="dark" className="w-full justify-center py-6 text-base">
              Página inicial
            </Button>
          </Link>
          
          <form action={signOutAction}>
            <Button type="submit" variant="outline" className="w-full justify-center text-neutral-500 hover:text-red-500 hover:bg-neutral-50">
               <LogOut size={16} /> Sair da conta
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

function FeatureItem({ icon, text }: { icon: React.ReactNode, text: string }) {
  return (
    <div className="flex items-center gap-3 text-left bg-neutral-50 p-3 rounded-xl border border-neutral-100">
      <span className="flex-shrink-0">{icon}</span>
      <span className="text-xs sm:text-sm text-neutral-600 font-medium">{text}</span>
    </div>
  )
}

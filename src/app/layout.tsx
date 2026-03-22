import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import { NotificationToastProvider } from '@/components/notifications/NotificationToastProvider'
import { RealtimeInit } from '@/components/notifications/RealtimeInit'
import { createSupabaseServer } from '@/lib/supabase-server'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ScoutJR',
  description: 'Plataforma de talentos do futebol infantil',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // userId server-side — passado para o client RealtimeInit
  let userId: string | null = null
  try {
    const supabase = await createSupabaseServer()
    const { data: { user } } = await supabase.auth.getUser()
    userId = user?.id ?? null
  } catch {
    // Não logado ou erro de sessão — ok, realtime fica desativado
  }

  return (
    <html lang="pt-BR">
      <body className={inter.className}>

        {/*
          NotificationToastProvider DEVE envolver tudo para que
          useNotificationToast() funcione em qualquer componente filho.
        */}
        <NotificationToastProvider>

          {/* Abre o canal Supabase Realtime assim que a página monta */}
          <RealtimeInit userId={userId} />

          {children}

          {/*
            Toaster do Sonner para toasts de ações (form submit, erros, etc.)
            Fica separado do sistema de notificações acima.
          */}
          <Toaster
            position="bottom-right"
            richColors
            closeButton
            toastOptions={{ style: { borderRadius: '12px' } }}
          />

        </NotificationToastProvider>
      </body>
    </html>
  )
}
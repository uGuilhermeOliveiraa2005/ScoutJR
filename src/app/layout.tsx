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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Pega userId server-side para passar ao RealtimeInit
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <NotificationToastProvider>
          {/* Ativa realtime + toasts para o usuário logado */}
          <RealtimeInit userId={user?.id ?? null} />

          {children}

          {/* Toasts genéricos do Sonner (form actions, erros, etc.) */}
          <Toaster
            position="bottom-right"
            richColors
            closeButton
            toastOptions={{
              style: { borderRadius: '12px' },
            }}
          />
        </NotificationToastProvider>
      </body>
    </html>
  )
}
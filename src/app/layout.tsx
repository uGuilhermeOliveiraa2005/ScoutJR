import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import { NotificationToastProvider } from '@/components/notifications/NotificationToastProvider'
import { RealtimeInit } from '@/components/notifications/RealtimeInit'
import { createSupabaseServer } from '@/lib/supabase-server'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ScoutJR | A maior vitrine digital para talentos do futebol de base',
  description: 'Conectamos jovens atletas a olheiros e escolinhas de futebol em todo o Brasil. Crie seu currículo digital, compartilhe lances e inicie sua carreira profissional hoje.',
  keywords: ['futebol infantil', 'categorias de base', 'olheiro de futebol', 'peneiras de futebol', 'scoutjr', 'talento do futebol'],
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
    <html lang="pt-BR" data-scroll-behavior="smooth">
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
            closeButton
            toastOptions={{
              className: "font-display border-0 shadow-2xl rounded-2xl p-4 flex gap-3 items-start",
              classNames: {
                toast: "bg-white data-[type=success]:bg-green-50 data-[type=error]:bg-red-50 data-[type=info]:bg-blue-50 data-[type=warning]:bg-amber-50 backdrop-blur-3xl data-[type=success]:border-green-200 data-[type=error]:border-red-200 border",
                title: "text-base font-black text-neutral-900 tracking-tight",
                description: "text-xs text-neutral-500 font-medium leading-relaxed mt-1",
                actionButton: "bg-green-600 text-white rounded-xl px-4 py-2 text-xs font-bold shadow-sm hover:bg-green-700 transition-colors uppercase tracking-widest",
                cancelButton: "bg-neutral-100 text-neutral-600 rounded-xl px-4 py-2 text-xs font-bold hover:bg-neutral-200 transition-colors uppercase tracking-widest",
                icon: "mt-0.5",
                closeButton: "bg-white border text-sm border-neutral-200 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50 rounded-full transition-all shadow-sm flex items-center justify-center p-1"
              }
            }}
          />

        </NotificationToastProvider>
      </body>
    </html>
  )
}
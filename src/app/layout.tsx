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
            Toaster Premium: Modais animados dinâmicos que sumirão em 4s
          */}
          <Toaster
            position="top-center"
            duration={4000}
            expand={false}
            toastOptions={{
              className: "font-display border-0 p-1.5 flex gap-3 items-center rounded-full animate-slide-up shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)] w-auto max-w-[90vw] lg:max-w-md backdrop-blur-2xl transition-all",
              classNames: {
                toast: "bg-white/95 ring-1 ring-neutral-200 data-[type=success]:bg-green-50/95 data-[type=error]:bg-red-50/95 data-[type=success]:ring-green-400/40 data-[type=error]:ring-red-400/40",
                content: "flex-1 flex flex-col py-2 pr-5 pl-1",
                title: "text-[15px] sm:text-base font-black text-neutral-900 tracking-tight leading-tight",
                description: "text-xs text-neutral-500 font-medium leading-relaxed mt-0.5",
                actionButton: "bg-neutral-900 text-white rounded-xl px-4 py-2 text-[10px] sm:text-xs font-bold shadow-sm hover:bg-black transition-colors uppercase tracking-widest",
                cancelButton: "bg-neutral-100 text-neutral-600 rounded-xl px-4 py-2 text-[10px] sm:text-xs font-bold hover:bg-neutral-200 transition-colors uppercase tracking-widest",
                icon: "mt-0.5 w-10 h-10 rounded-full flex items-center justify-center shrink-0 ml-1 shadow-inner bg-white bg-opacity-50",
                closeButton: "bg-white border text-sm border-neutral-200 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50 rounded-full transition-all shadow-sm flex items-center justify-center p-1"
              }
            }}
          />

        </NotificationToastProvider>
      </body>
    </html>
  )
}
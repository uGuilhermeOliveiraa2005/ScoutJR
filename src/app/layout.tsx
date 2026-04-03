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
            Toaster Premium Elite
          */}
          <Toaster
            position="top-center"
            duration={4000}
            expand={false}
            toastOptions={{
              className: "font-display border-0 p-2 flex gap-4 items-center rounded-[2rem] animate-slide-up shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] w-auto min-w-[320px] max-w-[90vw] lg:max-w-md backdrop-blur-3xl transition-all relative overflow-hidden group",
              classNames: {
                toast: "bg-neutral-900/95 ring-1 ring-white/15 data-[type=success]:bg-gradient-to-r data-[type=success]:from-green-950/90 data-[type=success]:to-neutral-900/95 data-[type=error]:bg-gradient-to-r data-[type=error]:from-red-950/90 data-[type=error]:to-neutral-900/95 data-[type=success]:ring-green-500/40 data-[type=error]:ring-red-500/40 text-white",
                content: "flex-1 flex flex-col py-2 pr-6 pl-1 z-10",
                title: "text-[15px] sm:text-[17px] font-black text-white tracking-tight leading-tight",
                description: "text-xs text-neutral-300 font-medium leading-relaxed mt-0.5",
                actionButton: "bg-white text-neutral-900 rounded-xl px-4 py-2 text-[10px] sm:text-xs font-black shadow-sm hover:bg-neutral-200 transition-colors uppercase tracking-widest z-10",
                cancelButton: "bg-neutral-800 text-neutral-300 rounded-xl px-4 py-2 text-[10px] sm:text-xs font-bold hover:bg-neutral-700 transition-colors uppercase tracking-widest z-10",
                icon: "mt-0.5 w-12 h-12 rounded-full flex items-center justify-center shrink-0 ml-1 bg-gradient-to-br from-white/10 to-transparent border border-white/5 z-10 shadow-[0_0_20px_rgba(255,255,255,0.1)] text-white data-[type=success]:text-green-400 data-[type=success]:shadow-[0_0_30px_rgba(34,197,94,0.3)] data-[type=error]:text-red-400 data-[type=error]:shadow-[0_0_30px_rgba(239,68,68,0.3)]",
                closeButton: "bg-neutral-800/50 border text-sm border-neutral-700 text-neutral-400 hover:text-white hover:bg-neutral-700 rounded-full transition-all shadow-sm flex items-center justify-center p-1 z-20 absolute top-3 right-3"
              }
            }}
          />

        </NotificationToastProvider>
      </body>
    </html>
  )
}
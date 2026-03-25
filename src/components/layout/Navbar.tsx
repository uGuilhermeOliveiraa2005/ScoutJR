'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, LogOut, Settings, LayoutDashboard, ShieldCheck, Trophy, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { createSupabaseBrowser } from '@/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'
import { NotificationsBell } from '@/components/notifications/NotificationsBell'
import { Avatar } from '@/components/ui/Avatar'

// -----------------------------------------------
// Public Navbar
// -----------------------------------------------
export function NavbarPublic() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        <Link href="/" className="font-display text-xl sm:text-2xl tracking-widest text-green-700">
          SCOUT<span className="text-amber-500">JR</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 lg:gap-8">
          <Link href="/#como-funciona" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">Como funciona</Link>
          <Link href="/#para-quem" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">Para quem</Link>
          <Link href="/ranking" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors font-medium">Ranking</Link>
          <Link href="/#escolinhas" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">Para escolinhas</Link>
        </nav>

        <div className="hidden md:flex items-center gap-2 lg:gap-3">
          <Link href="/login">
            <Button variant="outline" size="sm">Entrar</Button>
          </Link>
          <Link href="/cadastro">
            <Button size="sm">Criar conta</Button>
          </Link>
        </div>

        <button
          className="md:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-neutral-100 bg-white shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="px-4 py-3 flex flex-col gap-0.5">
            {[
              { href: '/#como-funciona', label: 'Como funciona' },
              { href: '/#para-quem', label: 'Para quem' },
              { href: '/ranking', label: '🏆 Ranking' },
              { href: '/#escolinhas', label: 'Para escolinhas' },
            ].map(item => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium py-3 px-3 rounded-lg text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition-colors"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="px-4 pb-5 pt-2 flex flex-col gap-2.5 border-t border-neutral-100">
            <Link href="/login" onClick={() => setOpen(false)}>
              <Button variant="outline" className="w-full h-11 justify-center">Entrar</Button>
            </Link>
            <Link href="/cadastro" onClick={() => setOpen(false)}>
              <Button variant="dark" className="w-full h-11 justify-center">Criar conta grátis</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

// -----------------------------------------------
// Dashboard Navbar
// -----------------------------------------------
export function NavbarDashboard({
  userName,
  userRole,
  verificado,
  userId,
  userFotoUrl,
  isAdmin,
}: {
  userName: string
  userRole: string
  verificado?: boolean
  userId?: string
  userFotoUrl?: string | null
  isAdmin?: boolean
}) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createSupabaseBrowser()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={14} /> },
    { href: '/busca', label: 'Explorar', icon: <Search size={14} /> },
    { href: '/ranking', label: 'Ranking', icon: <Trophy size={14} /> },
    ...(isAdmin ? [{ href: '/admin/verificacoes', label: 'Admin', icon: <ShieldCheck size={14} /> }] : []),
    { href: '/configuracoes', label: 'Config.', icon: <Settings size={14} /> },
  ]

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
        
        {/* Desktop Logo */}
        <Link href="/dashboard" className="hidden md:flex font-display text-2xl tracking-widest text-green-700 flex-shrink-0">
          SCOUT<span className="text-amber-500">JR</span>
        </Link>

        {/* Mobile Logo */}
        <Link href="/dashboard" className="md:hidden font-display text-2xl tracking-widest text-green-700 flex-shrink-0">
          SCOUT<span className="text-amber-500">JR</span>
        </Link>

        {/* Desktop Nav Items (Center) */}
        <nav className="hidden md:flex items-center gap-4 lg:gap-6 flex-1 justify-center">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'text-sm flex items-center gap-1.5 transition-colors',
                pathname === item.href
                  ? 'text-green-700 font-medium'
                  : 'text-neutral-500 hover:text-neutral-900'
              )}
            >
              {item.icon}
              {item.label === 'Config.' ? 'Configurações' : item.label}
            </Link>
          ))}
        </nav>

        {/* User Area (Mobile & Desktop) */}
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          {/* Notifications */}
          {userId && <NotificationsBell userId={userId} />}
          
          {/* Vertical Separator */}
          <div className="h-6 w-px bg-neutral-200 mx-1 sm:mx-2" />

          {/* Profile & Logout Group */}
          <div className="flex items-center gap-2 sm:gap-5">
            <Link href="/configuracoes" className="flex items-center gap-2">
               <Avatar
                 src={userFotoUrl}
                 nome={userName}
                 size="sm"
                 colorClass="bg-green-100 text-green-700"
                 className="border-2 border-white shadow-sm"
               />
               <span className="text-sm font-bold text-neutral-900 truncate max-w-[70px] sm:max-w-none">
                 {userName?.split(' ')[0]}
               </span>
            </Link>
            
            {/* Logout Button (Icon link on mobile, Icon+Text on desktop) */}
            <button 
               onClick={handleLogout} 
               className="flex items-center gap-1.5 text-neutral-400 hover:text-red-500 transition-colors py-1"
               aria-label="Sair"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline text-xs font-medium">Sair</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile bottom nav (fixed) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-neutral-200 safe-area-bottom">
        <div className="flex items-center justify-around px-2 py-1">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-colors min-w-[56px]',
                pathname === item.href
                  ? 'text-green-700'
                  : 'text-neutral-400 hover:text-neutral-600'
              )}
            >
              <span className="text-[20px]">
                {item.href === '/dashboard' && <LayoutDashboard size={20} />}
                {item.href === '/busca' && <Search size={20} />}
                {item.href === '/ranking' && <Trophy size={20} />}
                {item.href === '/admin/verificacoes' && <ShieldCheck size={20} />}
                {item.href === '/configuracoes' && <Settings size={20} />}
              </span>
              <span className="text-[9px] font-medium leading-none">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </header>
  )
}

// -----------------------------------------------
// Footer
// -----------------------------------------------
export function Footer() {
  return (
    <footer className="bg-green-700 text-white/70 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-8 pb-8 border-b border-white/10">
          <div className="col-span-2 sm:col-span-2 md:col-span-1">
            <div className="font-display text-2xl tracking-widest text-white mb-2 sm:mb-3">
              SCOUT<span className="text-amber-400">JR</span>
            </div>
            <p className="text-xs sm:text-sm leading-relaxed">
              Conectando jovens talentos do futebol a escolinhas de todo o Brasil.
            </p>
          </div>
          <div>
            <h4 className="text-[10px] sm:text-xs uppercase tracking-widest text-white/40 mb-3 font-medium">Plataforma</h4>
            <div className="flex flex-col gap-2">
              <Link href="/cadastro" className="text-xs sm:text-sm hover:text-white transition-colors">Criar perfil</Link>
              <Link href="/busca" className="text-xs sm:text-sm hover:text-white transition-colors">Explorar talentos</Link>
              <Link href="/login" className="text-xs sm:text-sm hover:text-white transition-colors">Entrar</Link>
            </div>
          </div>
          <div>
            <h4 className="text-[10px] sm:text-xs uppercase tracking-widest text-white/40 mb-3 font-medium">Para escolinhas</h4>
            <div className="flex flex-col gap-2">
              <Link href="/#escolinhas" className="text-xs sm:text-sm hover:text-white transition-colors">Planos</Link>
              <Link href="/#como-funciona" className="text-xs sm:text-sm hover:text-white transition-colors">Como funciona</Link>
            </div>
          </div>
          <div>
            <h4 className="text-[10px] sm:text-xs uppercase tracking-widest text-white/40 mb-3 font-medium">Legal</h4>
            <div className="flex flex-col gap-2">
              <Link href="/privacidade" className="text-xs sm:text-sm hover:text-white transition-colors">Privacidade & LGPD</Link>
              <Link href="/termos" className="text-xs sm:text-sm hover:text-white transition-colors">Termos de uso</Link>
            </div>
          </div>
        </div>
        <div className="pt-5 sm:pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-[10px] sm:text-xs text-white/40">
          <span>© 2025 ScoutJR. Todos os direitos reservados.</span>
          <span>Feito com dedicação no Brasil 🇧🇷</span>
        </div>
      </div>
    </footer>
  )
}
'use client'
// ============================================
// CAMINHO: src/components/layout/Navbar.tsx
// ============================================

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, LogOut, Settings, LayoutDashboard, ShieldCheck, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { createSupabaseBrowser } from '@/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'
import { NotificationsBell } from '@/components/notifications/NotificationsBell'

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

      {/* Mobile menu */}
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
}: {
  userName: string
  userRole: string
  verificado?: boolean
  userId?: string
}) {
  const [menuOpen, setMenuOpen] = useState(false)
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
    { href: '/busca', label: 'Explorar', icon: null },
    { href: '/ranking', label: 'Ranking', icon: <Trophy size={14} /> },
    { href: '/configuracoes', label: 'Config.', icon: <Settings size={14} /> },
  ]

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-3">
        <Link href="/dashboard" className="font-display text-xl sm:text-2xl tracking-widest text-green-700 flex-shrink-0">
          SCOUT<span className="text-amber-500">JR</span>
        </Link>

        {/* Desktop nav */}
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

        {/* Desktop user area */}
        <div className="hidden md:flex items-center gap-2 lg:gap-4 flex-shrink-0">
          {userId && <NotificationsBell userId={userId} />}

          <div className="flex items-center gap-2 border-l border-neutral-100 pl-2 lg:pl-4">
            <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-display text-xs flex-shrink-0">
              {userName?.slice(0, 2).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-neutral-700 hidden lg:block">
              {userName?.split(' ')[0]}
            </span>
            {verificado && (
              <div className="hidden lg:flex items-center gap-1 bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full">
                <ShieldCheck size={11} />
                Verificado
              </div>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-neutral-500">
            <LogOut size={14} />
            <span className="hidden lg:inline">Sair</span>
          </Button>
        </div>

        {/* Mobile: avatar + bell + hamburger */}
        <div className="md:hidden flex items-center gap-1.5 sm:gap-2">
          {userId && <NotificationsBell userId={userId} />}
          <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-display text-xs ml-1">
            {userName?.slice(0, 2).toUpperCase()}
          </div>
          <button
            className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
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
              onClick={() => setMenuOpen(false)}
            >
              <span className="text-[20px]">
                {item.href === '/dashboard' && <LayoutDashboard size={20} />}
                {item.href === '/busca' && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                )}
                {item.href === '/ranking' && <Trophy size={20} />}
                {item.href === '/configuracoes' && <Settings size={20} />}
              </span>
              <span className="text-[9px] font-medium leading-none">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile drawer menu */}
      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-40 top-14" onClick={() => setMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <div
            className="absolute right-0 top-0 w-72 h-full bg-white shadow-2xl animate-in slide-in-from-right duration-200"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-5 border-b border-neutral-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-display text-lg">
                  {userName?.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-semibold text-neutral-900">{userName}</div>
                  <div className="text-[10px] text-neutral-400 uppercase tracking-widest font-medium mt-0.5">
                    {userRole === 'escolinha' ? 'Escolinha' : 'Responsável'}
                  </div>
                  {verificado && (
                    <div className="flex items-center gap-1 text-[10px] text-green-700 font-medium mt-1">
                      <ShieldCheck size={10} /> Verificado
                    </div>
                  )}
                </div>
              </div>
            </div>
            <nav className="p-3 flex flex-col gap-1">
              {[
                { href: '/dashboard', icon: <LayoutDashboard size={16} />, label: 'Dashboard' },
                { href: '/busca', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>, label: 'Explorar talentos' },
                { href: '/ranking', icon: <Trophy size={16} />, label: 'Ranking' },
                { href: '/configuracoes', icon: <Settings size={16} />, label: 'Configurações' },
              ].map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors',
                    pathname === item.href
                      ? 'bg-green-50 text-green-700'
                      : 'text-neutral-600 hover:bg-neutral-50'
                  )}
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="text-neutral-400">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="absolute bottom-8 left-0 right-0 px-5">
              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full h-11 text-red-500 border-red-100 hover:bg-red-50 justify-center"
              >
                <LogOut size={15} /> Sair da conta
              </Button>
            </div>
          </div>
        </div>
      )}
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
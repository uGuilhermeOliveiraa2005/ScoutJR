'use client'
// ============================================
// CAMINHO: src/components/layout/Navbar.tsx
// ============================================

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, LogOut, Settings, LayoutDashboard, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { createSupabaseBrowser } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

// -----------------------------------------------
// Public Navbar
// -----------------------------------------------
export function NavbarPublic() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-neutral-200">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-display text-2xl tracking-widest text-green-700">
          SCOUT<span className="text-amber-500">JR</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/#como-funciona" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">Como funciona</Link>
          <Link href="/#para-quem" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">Para quem</Link>
          <Link href="/busca" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">Explorar talentos</Link>
          <Link href="/ranking" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors font-medium">Ranking</Link>
          <Link href="/#clubes" className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors">Para clubes</Link>
        </nav>
        <div className="hidden md:flex items-center gap-3">
          <Link href="/login"><Button variant="outline" size="sm">Entrar</Button></Link>
          <Link href="/cadastro"><Button size="sm">Criar conta</Button></Link>
        </div>
        <button className="md:hidden p-2 rounded-lg hover:bg-neutral-100" onClick={() => setOpen(!open)}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-neutral-100 bg-white px-6 py-8 flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-300 shadow-xl">
          <Link href="/#como-funciona" className="text-sm font-medium py-2 text-neutral-600 active:text-green-600" onClick={() => setOpen(false)}>Como funciona</Link>
          <Link href="/#para-quem" className="text-sm font-medium py-2 text-neutral-600" onClick={() => setOpen(false)}>Para quem</Link>
          <Link href="/busca" className="text-sm font-medium py-2 text-neutral-600" onClick={() => setOpen(false)}>Explorar talentos</Link>
          <Link href="/ranking" className="text-sm font-medium py-2 text-green-600" onClick={() => setOpen(false)}>Ranking</Link>
          <Link href="/#clubes" className="text-sm font-medium py-2 text-neutral-600" onClick={() => setOpen(false)}>Para clubes</Link>
          <hr className="border-neutral-100" />
          <div className="flex flex-col gap-3 pt-2">
            <Link href="/login" onClick={() => setOpen(false)}><Button variant="outline" className="w-full h-12">Entrar</Button></Link>
            <Link href="/cadastro" onClick={() => setOpen(false)}><Button className="w-full h-12 bg-green-600">Criar conta</Button></Link>
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
}: {
  userName: string
  userRole: string
  verificado?: boolean
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()
  const supabase = createSupabaseBrowser()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/dashboard" className="font-display text-xl tracking-widest text-green-700">
          SCOUT<span className="text-amber-500">JR</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/dashboard" className="text-sm text-neutral-500 hover:text-neutral-900 flex items-center gap-1.5 transition-colors">
            <LayoutDashboard size={15} /> Dashboard
          </Link>
          <Link href="/busca" className="text-sm text-neutral-500 hover:text-neutral-900 flex items-center gap-1.5 transition-colors">
            Explorar
          </Link>
          <Link href="/ranking" className="text-sm text-neutral-500 hover:text-neutral-900 flex items-center gap-1.5 transition-colors">
            Ranking
          </Link>
          <Link href="/configuracoes" className="text-sm text-neutral-500 hover:text-neutral-900 flex items-center gap-1.5 transition-colors">
            <Settings size={15} /> Configurações
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 text-sm text-neutral-600">
            <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-display text-xs">
              {userName?.slice(0, 2).toUpperCase()}
            </div>
            <span className="font-medium">{userName?.split(' ')[0]}</span>
            {/* Selo de verificado na navbar */}
            {verificado && (
              <div className="flex items-center gap-1 bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full">
                <ShieldCheck size={11} />
                Verificado
              </div>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="hidden md:flex">
            <LogOut size={14} /> Sair
          </Button>
          <button className="md:hidden p-2 rounded-lg hover:bg-neutral-100" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-neutral-100 bg-white px-6 py-8 flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-300 shadow-xl">
          <div className="flex items-center gap-3 mb-2 pb-4 border-b border-neutral-50">
            <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-display">
              {userName?.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="text-sm font-bold text-neutral-900 leading-none mb-1">{userName}</div>
              <div className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold">{userRole}</div>
            </div>
          </div>
          <Link href="/dashboard" className="text-sm font-medium py-2 flex items-center gap-2" onClick={() => setMenuOpen(false)}><LayoutDashboard size={16} /> Dashboard</Link>
          <Link href="/busca" className="text-sm font-medium py-2 flex items-center gap-2" onClick={() => setMenuOpen(false)}>Explorar</Link>
          <Link href="/ranking" className="text-sm font-bold py-2 flex items-center gap-2 text-green-600" onClick={() => setMenuOpen(false)}>🏆 Ranking</Link>
          <Link href="/configuracoes" className="text-sm font-medium py-2 flex items-center gap-2" onClick={() => setMenuOpen(false)}><Settings size={16} /> Configurações</Link>
          <hr className="border-neutral-100" />
          <Button variant="outline" onClick={handleLogout} className="w-full h-12 text-red-500 border-red-100 hover:bg-red-50">Sair da conta</Button>
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
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-8 border-b border-white/10">
          <div className="col-span-2 md:col-span-1">
            <div className="font-display text-2xl tracking-widest text-white mb-2">
              SCOUT<span className="text-amber-400">JR</span>
            </div>
            <p className="text-sm leading-relaxed">Conectando jovens talentos do futebol a clubes de todo o Brasil.</p>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-widest text-white/40 mb-3">Plataforma</h4>
            <div className="flex flex-col gap-2">
              <Link href="/cadastro" className="text-sm hover:text-white transition-colors">Criar perfil</Link>
              <Link href="/busca" className="text-sm hover:text-white transition-colors">Explorar talentos</Link>
              <Link href="/login" className="text-sm hover:text-white transition-colors">Entrar</Link>
            </div>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-widest text-white/40 mb-3">Para clubes</h4>
            <div className="flex flex-col gap-2">
              <Link href="/#clubes" className="text-sm hover:text-white transition-colors">Planos</Link>
              <Link href="/#como-funciona" className="text-sm hover:text-white transition-colors">Como funciona</Link>
            </div>
          </div>
          <div>
            <h4 className="text-xs uppercase tracking-widest text-white/40 mb-3">Legal</h4>
            <div className="flex flex-col gap-2">
              <Link href="/privacidade" className="text-sm hover:text-white transition-colors">Privacidade</Link>
              <Link href="/termos" className="text-sm hover:text-white transition-colors">Termos de uso</Link>
              <Link href="/lgpd" className="text-sm hover:text-white transition-colors">LGPD</Link>
            </div>
          </div>
        </div>
        <div className="pt-6 flex flex-col md:flex-row justify-between items-center gap-2 text-xs text-white/40">
          <span>© 2025 ScoutJR. Todos os direitos reservados.</span>
          <span>Feito com dedicação no Brasil</span>
        </div>
      </div>
    </footer>
  )
}
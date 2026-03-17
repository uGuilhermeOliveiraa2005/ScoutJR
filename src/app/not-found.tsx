import Link from 'next/link'
import { NavbarPublic } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'

export default function NotFound() {
  return (
    <>
      <NavbarPublic />
      <main className="min-h-[70vh] flex items-center justify-center px-6">
        <div className="text-center">
          <div className="font-display text-[120px] leading-none text-neutral-200 mb-4">404</div>
          <h1 className="font-display text-3xl text-neutral-700 mb-2">PÁGINA NÃO ENCONTRADA</h1>
          <p className="text-neutral-400 text-sm mb-8">A página que você procura não existe ou foi removida.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/"><Button variant="dark">Voltar ao início</Button></Link>
            <Link href="/busca"><Button variant="outline">Explorar talentos</Button></Link>
          </div>
        </div>
      </main>
    </>
  )
}

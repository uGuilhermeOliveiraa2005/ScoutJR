import Link from 'next/link'
import { ArrowLeft, ShieldCheck, Scale, FileText, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { TermsContent } from '@/components/legal/TermsContent'

export const metadata = {
  title: 'Termos de Uso | ScoutJR',
  description: 'Política legal e termos de uso e funcionamento da plataforma ScoutJR.',
}

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center">
      <div className="w-full max-w-4xl px-4 py-8 sm:py-16">
        
        {/* Header */}
        <div className="mb-10 sm:mb-16">
          <Link href="/">
            <Button variant="outline" className="mb-8">
              <ArrowLeft size={16} className="mr-2" /> Voltar ao início
            </Button>
          </Link>
          <div className="flex items-center gap-3 text-green-700 mb-4">
            <Scale size={32} />
          </div>
          <h1 className="font-display text-4xl sm:text-5xl text-neutral-900 tracking-tight leading-tight mb-4">
            Termos de Uso <br className="hidden sm:block" /> e Condições Legais
          </h1>
          <p className="text-lg text-neutral-500 max-w-2xl">
            Revisado e em vigor a partir de Março de 2026. Documento em compliance com o Marco Civil da Internet.
          </p>
        </div>

        {/* Content */}
        <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-12 shadow-sm">
          <TermsContent />
        </div>
        
        {/* Footer info */}
        <div className="mt-12 text-center text-sm text-neutral-400">
          <p>Para dúvidas legais, entre em contato via <a href="mailto:contato@scoutjr.com" className="hover:text-green-600 underline">contato@scoutjr.com</a>.</p>
          <p className="mt-2">© {new Date().getFullYear()} ScoutJR. Todos os direitos reservados.</p>
        </div>

      </div>
    </div>
  )
}

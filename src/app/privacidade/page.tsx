import Link from 'next/link'
import { ArrowLeft, Lock, FileSearch, Fingerprint, Database, Eraser } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { PrivacyContent } from '@/components/legal/PrivacyContent'

export const metadata = {
  title: 'Política de Privacidade & LGPD | ScoutJR',
  description: 'Política de privacidade, LGPD, exclusão e uso de dados.',
}

export default function PrivacidadePage() {
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
            <Lock size={32} />
          </div>
          <h1 className="font-display text-4xl sm:text-5xl text-neutral-900 tracking-tight leading-tight mb-4">
            Política de Privacidade <br className="hidden sm:block" /> e Conformidade LGPD
          </h1>
          <p className="text-lg text-neutral-500 max-w-2xl">
            A proteção dos dados das crianças, jovens e responsáveis é a raiz e fundação do ScoutJR.
          </p>
        </div>

        {/* Content */}
        <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-12 shadow-sm">
          <PrivacyContent />
        </div>
        
        {/* Footer info */}
        <div className="mt-12 text-center text-sm text-neutral-400">
          <p>Dúvidas em torno da retenção de dados ou do DPO? <a href="mailto:privacidade@scoutjr.com" className="hover:text-green-600 underline">privacidade@scoutjr.com</a>.</p>
          <p className="mt-2">© {new Date().getFullYear()} ScoutJR.</p>
        </div>

      </div>
    </div>
  )
}

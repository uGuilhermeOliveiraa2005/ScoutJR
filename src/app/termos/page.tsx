import Link from 'next/link'
import { ArrowLeft, ShieldCheck, Scale, FileText, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'

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
        <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-12 shadow-sm space-y-10 sm:space-y-16">
          
          <section>
            <h2 className="text-2xl font-bold text-neutral-800 mb-4 flex items-center gap-2">
              <FileText className="text-green-600" size={24} /> 1. Aceitação
            </h2>
            <div className="space-y-4 text-neutral-600 leading-relaxed text-sm sm:text-base">
              <p>
                Ao acessar e criar uma conta na plataforma <strong>ScoutJR</strong> ("Nós", "Sistema" ou "Plataforma"), 
                você ("Usuário", "Responsável" ou "Escolinha") declara que leu, compreendeu e concorda expressa 
                e integralmente com todos os Termos de Uso aqui dispostos e com nossa 
                <Link href="/privacidade" className="text-green-600 hover:underline mx-1">Política de Privacidade</Link>.
              </p>
              <p>
                Se você não concorda com qualquer disposição, solicitamos que interrompa imediatamente 
                o uso e a navegação no sistema.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-neutral-800 mb-4 flex items-center gap-2">
              <ShieldCheck className="text-green-600" size={24} /> 2. Responsabilidade do Uso
            </h2>
            <div className="space-y-4 text-neutral-600 leading-relaxed text-sm sm:text-base">
              <p>
                O ScoutJR atua estritamente como um <strong>catálogo e ponte de software</strong> entre
                Atletas/Responsáveis e Escolinhas de Futebol. Não possuímos autoria, gerência,
                agenciamento ou participação sobre nenhum negócio, contrato ou seletiva que venha
                a ocorrer em virtude de "Match" ou da troca de informações na plataforma.
              </p>
              <ul className="list-disc pl-5 mt-4 space-y-2">
                <li>O usuário (Pai/Mãe/Tutor legal) responde juridicamente pela exatidão dos dados inseridos no perfil do atleta menor de idade.</li>
                <li>As Escolinhas assumem toda a responsabilidade cível e criminal sobre o uso das ferramentas de busca e contato com os menores através dos responsáveis diretos.</li>
                <li>É proibida qualquer conduta difamatória, publicação de fotos ofensivas, ou uso comercial não autorizado (spam) pela plataforma.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-neutral-800 mb-4 flex items-center gap-2">
              <CheckCircle2 className="text-green-600" size={24} /> 3. Assinaturas e Pagamentos
            </h2>
            <div className="space-y-4 text-neutral-600 leading-relaxed text-sm sm:text-base">
              <p>
                As assinaturas (mensalidades) e selos de verificação são vinculados à empresa transacionadora
                <strong> Mercado Pago</strong>. Ao realizar assinaturas, o Responsável ou Escolinha autoriza
                cobranças recorrentes no cartão de crédito/débito registrado.
              </p>
              <p>
                O cancelamento da assinatura pode ser feito a qualquer momento diretamente pelo painel de 
                <strong> Configurações &gt; Zona de Assinaturas</strong>. Não operamos com estorno ou reembolso pro rata
                de períodos cujo serviço já tenha sido disponibilizado ou ativado sistemicamente.
              </p>
              <p>
                Em caso de remoção integral da conta (Zona de Perigo), nossa inteligência artificial do backend 
                aplicará o cancelamento sumário na Gateway do MP, interrompendo as faturas futuras de forma irrevogável.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-neutral-800 mb-4">4. Propriedade Intelectual</h2>
            <div className="space-y-4 text-neutral-600 leading-relaxed text-sm sm:text-base">
              <p>
                Todas as logomarcas, software, interfaces, banco de dados e algoritmos pertencem
                à ScoutJR. O usuário cede, no entanto, para uso restrito na plataforma, o direito 
                de exibição das imagens (fotos e dados esportivos) lá indexados, sem que isso confira 
                violação de propriedade da imagem.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-neutral-800 mb-4">5. Modificações dos Termos</h2>
            <div className="space-y-4 text-neutral-600 leading-relaxed text-sm sm:text-base">
              <p>
                Reservamo-nos o direito de alterar as presentes regras a qualquer momento para 
                cumprir obrigações regulatórias. Notificaremos os usuários da plataforma 
                através da área logada, sendo a continuidade do uso sinônimo de aquiescência aos 
                novos termos publicados.
              </p>
            </div>
          </section>

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

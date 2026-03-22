import Link from 'next/link'
import { ArrowLeft, Lock, FileSearch, Fingerprint, Database, Eraser } from 'lucide-react'
import { Button } from '@/components/ui/Button'

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
        <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-12 shadow-sm space-y-10 sm:space-y-16">
          
          <section>
            <h2 className="text-2xl font-bold text-neutral-800 mb-4 flex items-center gap-2">
              <Database className="text-green-600" size={24} /> 1. Coleta de Dados Pessoais
            </h2>
            <div className="space-y-4 text-neutral-600 leading-relaxed text-sm sm:text-base">
              <p>
                Em conformidade direta com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD), 
                coletamos exclusivamente os dados necessários para o funcionamento e pareamento (recrutamento) no aplicativo.
              </p>
              <ul className="list-disc pl-5 mt-4 space-y-2">
                <li><strong>Responsáveis Legais:</strong> Nome, E-mail, Telefone/WhatsApp (DDD rígido), CPF/CNPJ.</li>
                <li><strong>Atletas (Menores):</strong> Idade, Estado, Cidade, posições, habilidades, galeria de mídia atrelada à evolução esportiva.</li>
                <li><strong>Escolinhas:</strong> Nome, CNPJ (validado no módulo 11 da Receita Federal), localização, contato de e-mail e bio.</li>
              </ul>
              <p>
                <strong>Importante:</strong> Dado o cadastro tratar em grande maioria de Menores de Idade (5 a 17 anos),
                os perfis são cadastrados rigorosamente mediante manifestação via "Consentimento Responsável" onde
                o adulto tutor provê representação total legal aceitando no ato de criação.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-neutral-800 mb-4 flex items-center gap-2">
              <Fingerprint className="text-green-600" size={24} /> 2. Utilização e Ocultação
            </h2>
            <div className="space-y-4 text-neutral-600 leading-relaxed text-sm sm:text-base">
              <p>
                O ScoutJR desenhou as arquiteturas RLS da plataforma de forma que a integridade biométrica 
                institucional (contato dos pais) seja ocultada de curiosos e aberta <strong>estritamente</strong> 
                sistemicamente se um consentimento mútuo acontecer (Match com a Escolinha ou Configurações do usuário).
              </p>
              <p>
                Você, na condição de usuário (Responsável), no passo final do cadastro ou pelas Configurações, pode aplicar:
                <br /> - Tornar o perfil de acesso invisível.
                <br /> - Bloquear a visualização da Cidade e Estado natal do atleta.
                <br /> - Restringir envios de Mensagens diretas por Chat pelas empresas.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-neutral-800 mb-4 flex items-center gap-2">
              <FileSearch className="text-green-600" size={24} /> 3. Compartilhamento
            </h2>
            <div className="space-y-4 text-neutral-600 leading-relaxed text-sm sm:text-base">
              <p>
                Sob nenhuma hipótese a plataforma realiza venda, locação ou trade-marketing do banco de dados 
                infantil e familiar para empresas patrocinadoras ou parceiros logísticos sem consentimento ostensivo.
              </p>
              <p>
                Os únicos sub-operadores logísticos para quem trafégamos infraestruturas tokenizadas são gateways seguras:
                <br /> - O **Mercado Pago**, que retém as tokenizações puras para as assinaturas automatizadas.
                <br /> - A nuvem em data-centers encriptados 256-bit providenciados pelo Supabase.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-neutral-800 mb-4 flex items-center gap-2">
              <Eraser className="text-green-600" size={24} /> 4. Direito de Aniquilação (LGPD Permanente)
            </h2>
            <div className="space-y-4 text-neutral-600 leading-relaxed text-sm sm:text-base">
              <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-red-900">
                O usuário possui autonomia para exercer o seu direito de <strong>"Esquecimento Digital"</strong>
                e extinção a qualquer momento que desejar, sem fricção, dentro do painel de <code>Configurações</code>.
              </div>
              <p>
                Ao engatilhar o botão de <strong>"Deletar Minha Conta"</strong>, o ScoutJR não irá esconder 
                a conta — o sistema fará um <code>DELETE CASCADE</code> profundo no PostgreSQL apagando todas as rows de
                Atletas, Pais e Notificações, bem como invocará o SDK da Gateway impedindo cobranças futuras. 
                Os dados serão limpos irrevogavelmente.
              </p>
            </div>
          </section>

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

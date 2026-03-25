import React from 'react'
import { Database, Fingerprint, FileSearch, Eraser } from 'lucide-react'

export function PrivacyContent() {
  return (
    <div className="space-y-10 sm:space-y-16">
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
            O ScoutJR foi desenvolvido com rigorosas camadas de segurança que garantem que dados sensíveis 
            (como o contato direto dos responsáveis) fiquem protegidos e ocultos para o público geral. 
          </p>
          <p>
            Essas informações só são compartilhadas se houver um interesse mútuo confirmado (através de um 
            "Match" com uma Escolinha) ou se você ajustar as permissões de visibilidade em suas Configurações.
          </p>
          <p>
            Você, na condição de usuário (Responsável), no passo final do cadastro ou pelas Configurações, pode aplicar:
            <br /> • Tornar o perfil de acesso invisível.
            <br /> • Bloquear a visualização da cidade e estado natal do atleta.
            <br /> • Restringir envios de mensagens diretas por chat pelas empresas.
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
            Os únicos parceiros tecnológicos para quem trafegamos informações (de forma criptografada) são:
            <br /> • O <strong>Mercado Pago</strong>, que processa as cobranças das assinaturas.
            <br /> • O <strong>Supabase</strong>, que provê a infraestrutura de servidores seguros onde o banco de dados é armazenado.
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
            Ao solicitar a exclusão da sua conta através do botão <strong>"Deletar Minha Conta"</strong>, 
            o ScoutJR não apenas desativa o seu acesso — nós removemos permanentemente todas as suas 
            informações de nossa base de dados, incluindo perfis de atletas, históricos e notificações. 
          </p>
          <p>
            Além disso, qualquer assinatura ativa é cancelada automaticamente junto ao processador de pagamentos 
            para garantir que não ocorram novas cobranças. Esse processo é definitivo e garante que seus dados 
            sejam totalmente apagados, em conformidade com o seu direito ao esquecimento.
          </p>
        </div>
      </section>
    </div>
  )
}

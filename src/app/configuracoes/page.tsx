// ============================================
// CAMINHO: src/app/configuracoes/page.tsx
// ============================================

import { createSupabaseServer } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { NavbarDashboard } from '@/components/layout/Navbar'
import { PaymentButton } from '@/components/shared/PaymentButton'
import { updateProfile } from './actions'
import { Shield, CreditCard, Bell, User, ShieldCheck } from 'lucide-react'

export default async function ConfiguracoesPage() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', user.id).single()
  if (!profile) redirect('/login')

  let clube = null
  if (profile.role === 'clube') {
    const { data } = await supabase.from('clubes').select('*').eq('user_id', user.id).single()
    clube = data
  }

  const isClube = profile.role === 'clube'

  return (
    <>
      <NavbarDashboard
        userName={profile.nome}
        userRole={profile.role}
        verificado={clube?.verificado ?? false}
        userId={user.id}
      />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-5 sm:py-8 pb-24 md:pb-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-5 sm:mb-6">
          <h1 className="font-display text-3xl sm:text-4xl text-neutral-900">CONFIGURAÇÕES</h1>
          {isClube && clube?.verificado && (
            <div className="flex items-center gap-1.5 bg-green-100 text-green-700 text-[10px] sm:text-sm font-medium px-2 sm:px-3 py-1 sm:py-1.5 rounded-full">
              <ShieldCheck size={12} />
              Verificado
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:gap-4">

          {/* Dados da conta */}
          <Section icon={<User size={16} />} title="Dados da conta">
            <form action={updateProfile}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-[10px] sm:text-xs font-medium text-neutral-400 uppercase tracking-wide mb-1 sm:mb-1.5">Nome</label>
                  <input
                    name="nome"
                    defaultValue={profile.nome}
                    className="w-full px-3 py-2 sm:py-2.5 text-sm border border-neutral-200 rounded-lg bg-white outline-none focus:border-green-400"
                  />
                </div>
                <div>
                  <label className="block text-[10px] sm:text-xs font-medium text-neutral-400 uppercase tracking-wide mb-1 sm:mb-1.5">E-mail</label>
                  <input
                    defaultValue={profile.email}
                    disabled
                    className="w-full px-3 py-2 sm:py-2.5 text-sm border border-neutral-200 rounded-lg bg-neutral-50 text-neutral-400 cursor-not-allowed"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] sm:text-xs font-medium text-neutral-400 uppercase tracking-wide mb-1 sm:mb-1.5">Telefone</label>
                  <input
                    name="telefone"
                    defaultValue={profile.telefone || ''}
                    className="w-full px-3 py-2 sm:py-2.5 text-sm border border-neutral-200 rounded-lg bg-white outline-none focus:border-green-400"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="mt-4 w-full sm:w-auto px-5 py-2.5 text-sm bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors font-medium"
              >
                Salvar alterações
              </button>
            </form>
          </Section>

          {/* Plano e pagamento */}
          <Section icon={<CreditCard size={16} />} title="Plano e pagamento">
            <div className="flex items-center justify-between p-3 sm:p-4 bg-neutral-50 rounded-lg mb-3 sm:mb-4">
              <div>
                <div className="text-xs sm:text-sm font-medium text-neutral-900">
                  {isClube
                    ? (clube?.plano ? `Plano ${clube.plano.charAt(0).toUpperCase() + clube.plano.slice(1)}` : 'Plano Gratuito')
                    : 'Conta Família'}
                </div>
                <div className="text-[10px] sm:text-xs text-neutral-400 mt-0.5">
                  {isClube && clube?.status_assinatura === 'active' ? 'Assinatura ativa' : 'Sem assinatura ativa'}
                </div>
              </div>
              {isClube && clube?.status_assinatura === 'active'
                ? <span className="bg-green-100 text-green-700 text-[10px] sm:text-xs font-medium px-2 sm:px-2.5 py-1 rounded-full">Ativo</span>
                : <span className="bg-neutral-200 text-neutral-600 text-[10px] sm:text-xs font-medium px-2 sm:px-2.5 py-1 rounded-full">Gratuito</span>
              }
            </div>

            {isClube && (
              <>
                {clube?.status_assinatura === 'active' ? (
                  <div className="bg-green-50 border border-green-100 rounded-xl p-3 sm:p-4 text-center">
                    <p className="text-xs sm:text-sm text-green-700 font-medium mb-1">Assinatura ativa ✓</p>
                    <p className="text-[10px] sm:text-xs text-green-600">
                      Plano {clube.plano} ativo.
                      {clube.assinatura_expira_em && (
                        <> Renova em {new Date(clube.assinatura_expira_em).toLocaleDateString('pt-BR')}.</>
                      )}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {([
                      { plano: 'starter', preco: 'R$ 297', desc: 'Até 500 atletas' },
                      { plano: 'pro', preco: 'R$ 797', desc: 'Ilimitado' },
                      { plano: 'enterprise', preco: 'R$ 1.497', desc: 'Tudo ilimitado' },
                    ] as const).map(({ plano, preco, desc }) => (
                      <div key={plano} className="border border-neutral-200 rounded-xl p-3 sm:p-4 flex sm:flex-col items-center sm:items-start gap-3 sm:gap-2">
                        <div className="flex-1 sm:w-full">
                          <div className="font-display text-base sm:text-lg text-neutral-900">{plano.toUpperCase()}</div>
                          <div className="font-display text-xl sm:text-2xl text-green-700">
                            {preco}
                            <span className="text-[10px] sm:text-xs text-neutral-400 font-sans font-normal">/mês</span>
                          </div>
                          <p className="text-[10px] sm:text-xs text-neutral-400 mt-0.5">{desc}</p>
                        </div>
                        <PaymentButton
                          tipo="assinatura"
                          plano={plano}
                          label="Assinar"
                          variant="dark"
                          className="w-full sm:w-full justify-center text-xs"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {!isClube && (
              <PaymentButton
                tipo="destaque"
                label="Ativar destaque por R$ 49/mês"
                variant="amber"
                className="w-full justify-center"
              />
            )}
          </Section>

          {/* Verificação de clube */}
          {isClube && !clube?.verificado && (
            <Section icon={<Shield size={16} />} title="Verificação de clube">
              <div className="flex items-start sm:items-center gap-3 sm:gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                  <Shield size={18} />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-neutral-900">Clube não verificado</p>
                  <p className="text-[10px] sm:text-xs text-neutral-400 mt-0.5">
                    Obtenha o selo verificado e aumente a confiança das famílias.
                  </p>
                </div>
              </div>
              <PaymentButton
                tipo="verificacao"
                label="Verificar meu clube — R$ 997"
                variant="dark"
                className="w-full justify-center"
              />
            </Section>
          )}

          {isClube && clube?.verificado && (
            <Section icon={<ShieldCheck size={16} />} title="Verificação de clube">
              <div className="flex items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-green-50 border border-green-100 rounded-xl">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-medium text-green-800 flex items-center gap-2 flex-wrap">
                    Clube verificado
                    <span className="bg-green-600 text-white text-[9px] sm:text-xs px-2 py-0.5 rounded-full">✓ Oficial</span>
                  </p>
                  <p className="text-[10px] sm:text-xs text-green-600 mt-0.5">
                    {clube.verificado_em && (
                      <>Verificado em {new Date(clube.verificado_em).toLocaleDateString('pt-BR')}.</>
                    )}
                  </p>
                </div>
              </div>
            </Section>
          )}

          {/* Segurança */}
          <Section icon={<Shield size={16} />} title="Segurança">
            <div className="flex flex-col gap-3 sm:gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs sm:text-sm font-medium">Alterar senha</div>
                  <div className="text-[10px] sm:text-xs text-neutral-400">Recomendamos trocar periodicamente</div>
                </div>
                <button className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors flex-shrink-0">
                  Alterar
                </button>
              </div>
              <hr className="border-neutral-100" />
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs sm:text-sm font-medium">Autenticação em dois fatores</div>
                  <div className="text-[10px] sm:text-xs text-neutral-400">Aumenta a segurança da conta</div>
                </div>
                <button className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors flex-shrink-0">
                  Ativar
                </button>
              </div>
            </div>
          </Section>

          {/* Notificações */}
          <Section icon={<Bell size={16} />} title="Notificações">
            {[
              { label: 'Clube visualizou o perfil', desc: 'E-mail quando um clube ver o atleta' },
              { label: 'Novo interesse de clube', desc: 'Alerta de interesse' },
              { label: 'Mensagem recebida', desc: 'Alertas de novas mensagens' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between py-2.5 sm:py-3 border-b border-neutral-100 last:border-none">
                <div>
                  <div className="text-xs sm:text-sm font-medium">{item.label}</div>
                  <div className="text-[10px] sm:text-xs text-neutral-400">{item.desc}</div>
                </div>
                <button className="relative w-9 sm:w-10 h-5 sm:h-6 rounded-full bg-green-400 transition-colors flex-shrink-0 ml-3">
                  <span className="absolute top-0.5 sm:top-1 left-4 sm:left-5 w-3.5 sm:w-4 h-3.5 sm:h-4 bg-white rounded-full shadow" />
                </button>
              </div>
            ))}
          </Section>

        </div>
      </main>
    </>
  )
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2.5 sm:gap-3 px-4 sm:px-5 py-3 sm:py-4 border-b border-neutral-100">
        <div className="text-neutral-400">{icon}</div>
        <h2 className="text-xs sm:text-sm font-medium text-neutral-900">{title}</h2>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  )
}
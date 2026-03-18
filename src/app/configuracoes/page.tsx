import { createSupabaseServer } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { NavbarDashboard } from '@/components/layout/Navbar'
import { PaymentButton } from '@/components/shared/PaymentButton'
import { Shield, CreditCard, Bell, User } from 'lucide-react'

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
      <NavbarDashboard userName={profile.nome} userRole={profile.role} />
      <main className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="font-display text-4xl text-neutral-900 mb-6">CONFIGURAÇÕES</h1>

        <div className="flex flex-col gap-4">

          {/* Dados da conta */}
          <Section icon={<User size={18} />} title="Dados da conta">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wide mb-1.5">Nome</label>
                <input
                  defaultValue={profile.nome}
                  className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-lg bg-white outline-none focus:border-green-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wide mb-1.5">E-mail</label>
                <input
                  defaultValue={profile.email}
                  disabled
                  className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-lg bg-neutral-50 text-neutral-400 cursor-not-allowed"
                />
              </div>
              {profile.telefone && (
                <div>
                  <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wide mb-1.5">Telefone</label>
                  <input
                    defaultValue={profile.telefone}
                    className="w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-lg bg-white outline-none focus:border-green-400"
                  />
                </div>
              )}
            </div>
            <button className="mt-4 px-5 py-2.5 text-sm bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors font-medium">
              Salvar alterações
            </button>
          </Section>

          {/* Plano e pagamento */}
          <Section icon={<CreditCard size={18} />} title="Plano e pagamento">
            <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg mb-4">
              <div>
                <div className="text-sm font-medium text-neutral-900">
                  {isClube
                    ? (clube?.plano
                      ? `Plano ${clube.plano.charAt(0).toUpperCase() + clube.plano.slice(1)}`
                      : 'Plano Gratuito')
                    : 'Conta Família'}
                </div>
                <div className="text-xs text-neutral-400 mt-0.5">
                  {isClube && clube?.status_assinatura === 'active'
                    ? 'Assinatura ativa'
                    : 'Sem assinatura ativa'}
                </div>
              </div>
              {isClube && clube?.status_assinatura === 'active'
                ? <span className="bg-green-100 text-green-700 text-xs font-medium px-2.5 py-1 rounded-full">Ativo</span>
                : <span className="bg-neutral-200 text-neutral-600 text-xs font-medium px-2.5 py-1 rounded-full">Gratuito</span>
              }
            </div>

            {isClube && (
              <>
                {clube?.status_assinatura === 'active' ? (
                  <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
                    <p className="text-sm text-green-700 font-medium mb-1">Assinatura ativa ✓</p>
                    <p className="text-xs text-green-600">
                      Seu plano {clube.plano} está ativo.{' '}
                      {clube.assinatura_expira_em && (
                        <>Renova em {new Date(clube.assinatura_expira_em).toLocaleDateString('pt-BR')}.</>
                      )}
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {([
                      { plano: 'starter', preco: 'R$ 297', desc: 'Até 500 atletas, 10 contatos/mês' },
                      { plano: 'pro', preco: 'R$ 797', desc: 'Ilimitado, 50 contatos/mês' },
                      { plano: 'enterprise', preco: 'R$ 1.497', desc: 'Tudo ilimitado' },
                    ] as const).map(({ plano, preco, desc }) => (
                      <div key={plano} className="border border-neutral-200 rounded-xl p-4 text-center flex flex-col gap-2">
                        <div className="font-display text-lg text-neutral-900">{plano.toUpperCase()}</div>
                        <div className="font-display text-2xl text-green-700">
                          {preco}
                          <span className="text-xs text-neutral-400 font-sans font-normal">/mês</span>
                        </div>
                        <p className="text-xs text-neutral-400 leading-snug">{desc}</p>
                        <PaymentButton
                          tipo="assinatura"
                          plano={plano}
                          label="Assinar"
                          variant="dark"
                          className="w-full justify-center"
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
            <Section icon={<Shield size={18} />} title="Verificação de clube">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                  <Shield size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-900">Clube não verificado</p>
                  <p className="text-xs text-neutral-400">
                    Obtenha o selo verificado e aumente a confiança das famílias na plataforma.
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
            <Section icon={<Shield size={18} />} title="Verificação de clube">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                  <Shield size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-700">Clube verificado ✓</p>
                  <p className="text-xs text-neutral-400">
                    Seu clube possui o selo de verificação oficial.
                    {clube.verificado_em && (
                      <> Verificado em {new Date(clube.verificado_em).toLocaleDateString('pt-BR')}.</>
                    )}
                  </p>
                </div>
              </div>
            </Section>
          )}

          {/* Segurança */}
          <Section icon={<Shield size={18} />} title="Segurança">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Alterar senha</div>
                  <div className="text-xs text-neutral-400">Recomendamos trocar periodicamente</div>
                </div>
                <button className="px-4 py-2 text-sm border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
                  Alterar
                </button>
              </div>
              <hr className="border-neutral-100" />
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">Autenticação em dois fatores</div>
                  <div className="text-xs text-neutral-400">Aumenta a segurança da sua conta</div>
                </div>
                <button className="px-4 py-2 text-sm bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors">
                  Ativar
                </button>
              </div>
            </div>
          </Section>

          {/* Notificações */}
          <Section icon={<Bell size={18} />} title="Notificações">
            {[
              { label: 'Clube visualizou o perfil', desc: 'Receba um e-mail quando um clube ver o atleta' },
              { label: 'Novo interesse de clube', desc: 'Seja notificado quando um clube marcar interesse' },
              { label: 'Mensagem recebida', desc: 'Alertas de novas mensagens de clubes' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between py-3 border-b border-neutral-100 last:border-none">
                <div>
                  <div className="text-sm font-medium">{item.label}</div>
                  <div className="text-xs text-neutral-400">{item.desc}</div>
                </div>
                <button className="relative w-10 h-6 rounded-full bg-green-400 transition-colors">
                  <span className="absolute top-1 left-5 w-4 h-4 bg-white rounded-full shadow" />
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
      <div className="flex items-center gap-3 px-5 py-4 border-b border-neutral-100">
        <div className="text-neutral-400">{icon}</div>
        <h2 className="text-sm font-medium text-neutral-900">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}
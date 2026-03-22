import { createSupabaseServer } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { NavbarDashboard } from '@/components/layout/Navbar'
import { PaymentButton } from '@/components/shared/PaymentButton'
import { cancelSubscription } from './actions'
import { Shield, CreditCard, Bell, User, ShieldCheck, AlertTriangle } from 'lucide-react'
import { DeleteAccountModal } from './DeleteAccountModal'
import { ProfileForm } from './ProfileForm'
import { PasswordChangeForm } from './PasswordChangeForm'

export default async function ConfiguracoesPage() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('user_id', user.id).single()
  if (!profile) redirect('/login')

  let escolinha = null
  if (profile.role === 'escolinha') {
    const { data } = await supabase.from('escolinhas').select('*').eq('user_id', user.id).single()
    escolinha = data
  }

  const isEscolinha = profile.role === 'escolinha'

  const userFotoUrl = isEscolinha
    ? (escolinha?.foto_url ?? profile?.foto_url ?? null)
    : (profile?.foto_url ?? null)

  return (
    <>
      <NavbarDashboard
        userName={profile.nome}
        userRole={profile.role}
        verificado={escolinha?.verificado ?? false}
        userId={user.id}
        userFotoUrl={userFotoUrl}
      />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-5 sm:py-8 pb-24 md:pb-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-5 sm:mb-6">
          <h1 className="font-display text-3xl sm:text-4xl text-neutral-900">CONFIGURAÇÕES</h1>
          {isEscolinha && escolinha?.verificado && (
            <div className="flex items-center gap-1.5 bg-green-100 text-green-700 text-[10px] sm:text-sm font-medium px-2 sm:px-3 py-1 sm:py-1.5 rounded-full">
              <ShieldCheck size={12} />
              Verificado
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:gap-4">

          {/* Dados da conta */}
          <Section icon={<User size={16} />} title="Dados da conta">
            <ProfileForm profile={profile} escolinha={escolinha} isEscolinha={isEscolinha} />
          </Section>

          {/* Plano e pagamento */}
          <Section icon={<CreditCard size={16} />} title="Plano e pagamento">
            <div className="flex items-center justify-between p-3 sm:p-4 bg-neutral-50 rounded-lg mb-3 sm:mb-4">
              <div>
                <div className="text-xs sm:text-sm font-medium text-neutral-900">
                  {isEscolinha
                    ? (escolinha?.plano ? `Plano ${escolinha.plano.charAt(0).toUpperCase() + escolinha.plano.slice(1)}` : 'Plano Gratuito')
                    : 'Conta Família'}
                </div>
                <div className="text-[10px] sm:text-xs text-neutral-400 mt-0.5">
                  {isEscolinha && escolinha?.status_assinatura === 'active' ? 'Assinatura ativa' : 'Sem assinatura ativa'}
                </div>
              </div>
              {isEscolinha && escolinha?.status_assinatura === 'active'
                ? <span className="bg-green-100 text-green-700 text-[10px] sm:text-xs font-medium px-2 sm:px-2.5 py-1 rounded-full">Ativo</span>
                : <span className="bg-neutral-200 text-neutral-600 text-[10px] sm:text-xs font-medium px-2 sm:px-2.5 py-1 rounded-full">Gratuito</span>
              }
            </div>

            {isEscolinha && (
              <>
                {escolinha?.status_assinatura === 'active' ? (
                  <div className="bg-green-50 border border-green-100 rounded-xl p-3 sm:p-4 text-center">
                    <p className="text-xs sm:text-sm text-green-700 font-medium mb-1">Assinatura ativa ✓</p>
                    <p className="text-[10px] sm:text-xs text-green-600">
                      Plano {escolinha.plano} ativo.
                      {escolinha.assinatura_expira_em && (
                        <> Renova em {new Date(escolinha.assinatura_expira_em).toLocaleDateString('pt-BR')}.</>
                      )}
                    </p>
                    <form action={cancelSubscription}>
                      <button
                        type="submit"
                        className="mt-4 px-5 py-2 sm:py-2.5 text-[10px] sm:text-xs font-medium text-red-600 border border-red-200 bg-white rounded-lg hover:bg-red-50 transition-colors w-full sm:w-auto"
                      >
                        Cancelar assinatura mensal
                      </button>
                    </form>
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

            {!isEscolinha && (
              <PaymentButton
                tipo="destaque"
                label="Ativar destaque por R$ 49/mês"
                variant="amber"
                className="w-full justify-center"
              />
            )}
          </Section>

          {/* Verificação de escolinha */}
          {isEscolinha && !escolinha?.verificado && (
            <Section icon={<Shield size={16} />} title="Verificação de escolinha">
              <div className="flex items-start sm:items-center gap-3 sm:gap-4 mb-4">
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                  <Shield size={18} />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-neutral-900">Escolinha não verificada</p>
                  <p className="text-[10px] sm:text-xs text-neutral-400 mt-0.5">
                    Obtenha o selo verificado e aumente a confiança das famílias.
                  </p>
                </div>
              </div>
              <PaymentButton
                tipo="verificacao"
                label="Verificar minha escolinha — R$ 997"
                variant="dark"
                className="w-full justify-center"
              />
            </Section>
          )}

          {isEscolinha && escolinha?.verificado && (
            <Section icon={<ShieldCheck size={16} />} title="Verificação de escolinha">
              <div className="flex items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-green-50 border border-green-100 rounded-xl">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-xs sm:text-sm font-medium text-green-800 flex items-center gap-2 flex-wrap">
                    Escolinha verificada
                    <span className="bg-green-600 text-white text-[9px] sm:text-xs px-2 py-0.5 rounded-full">✓ Oficial</span>
                  </p>
                  <p className="text-[10px] sm:text-xs text-green-600 mt-0.5">
                    {escolinha.verificado_em && (
                      <>Verificado em {new Date(escolinha.verificado_em).toLocaleDateString('pt-BR')}.</>
                    )}
                  </p>
                </div>
              </div>
            </Section>
          )}

          {/* Segurança */}
          <Section icon={<Shield size={16} />} title="Segurança">
            <div className="flex flex-col gap-3 sm:gap-3">
              <PasswordChangeForm />
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
              { label: 'Escolinha visualizou o perfil', desc: 'E-mail quando uma escolinha ver o atleta' },
              { label: 'Novo interesse de escolinha', desc: 'Alerta de interesse' },
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

          {/* Zona de Perigo */}
          <Section icon={<AlertTriangle size={16} className="text-red-500" />} title="Zona de Perigo">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-neutral-900">Excluir conta definitivamente</p>
                <p className="text-[10px] sm:text-xs text-neutral-500 mt-1 max-w-sm">
                  Exclui permanentemente sua conta, configurações, assinaturas e todos os dados associados. Essa ação não pode ser desfeita.
                </p>
              </div>
              <DeleteAccountModal
                hasAssinatura={escolinha?.status_assinatura === 'active'}
                isVerificado={escolinha?.verificado === true}
              />
            </div>
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
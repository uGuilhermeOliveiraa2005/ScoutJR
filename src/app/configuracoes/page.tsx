import { createSupabaseServer } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { NavbarDashboard } from '@/components/layout/Navbar'
import { Shield, Bell, User, AlertTriangle, UserCircle, Building2 } from 'lucide-react'
import { DeleteAccountModal } from './DeleteAccountModal'
import { ProfileForm } from './ProfileForm'
import { AtletaConfigForm } from './AtletaConfigForm'
import { PasswordChangeForm } from './PasswordChangeForm'

export const dynamic = 'force-dynamic'

export default async function ConfiguracoesPage() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles').select('*').eq('user_id', user.id).single()
  if (!profile) redirect('/login')

  console.log('DEBUG CONFIG:', {
    userId: user.id,
    email: user.email,
    profileExists: !!profile,
    profileStatus: profile?.status,
    profileIsAdmin: profile?.is_admin
  })

  // Strict Lockout for unverified users
  if (profile.status !== 'ativo' && !profile.is_admin) {
    console.log('CONFIG REDIRECTING TO WAITING PAGE...')
    redirect('/aguardando-verificacao')
  }

  let escolinha = null
  let atleta = null

  if (profile.role === 'escolinha') {
    const { data } = await supabase
      .from('escolinhas').select('*').eq('user_id', user.id).single()
    escolinha = data
  }

  if (profile.role === 'responsavel') {
    const { data } = await supabase
      .from('atletas')
      .select('*, atleta_videos(*), atleta_conquistas(*)')
      .eq('responsavel_id', profile.id)
      .order('created_at', { ascending: true })
      .limit(1)
      .single()
    atleta = data
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
        userId={user.id}
        userFotoUrl={userFotoUrl}
      />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-5 sm:py-8 pb-24 md:pb-8">

        <div className="mb-5 sm:mb-8">
          <h1 className="font-display text-3xl sm:text-4xl text-neutral-900 tracking-tight">CONFIGURAÇÕES</h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Gerencie sua conta e {isEscolinha ? 'os dados da escolinha' : 'o perfil do atleta'}.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:gap-4">

          {/* ── Dados da conta (responsável ou escolinha) ── */}
          <Section
            icon={isEscolinha ? <Building2 size={16} /> : <User size={16} />}
            title={isEscolinha ? 'Dados da Escolinha' : 'Dados da Conta'}
          >
            <ProfileForm
              profile={profile}
              escolinha={escolinha}
              isEscolinha={isEscolinha}
            />
          </Section>

          {/* ── Perfil do atleta (só para responsável) ── */}
          {!isEscolinha && atleta && (
            <Section icon={<UserCircle size={16} />} title="Perfil do Atleta">
              <AtletaConfigForm atleta={atleta} />
            </Section>
          )}

          {/* Sem atleta cadastrado */}
          {!isEscolinha && !atleta && (
            <Section icon={<UserCircle size={16} />} title="Perfil do Atleta">
              <div className="py-6 text-center">
                <p className="text-sm text-neutral-500 mb-4">
                  Você ainda não cadastrou nenhum atleta.
                </p>
                <a
                  href="/perfil/novo"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-700 text-white text-sm rounded-lg hover:bg-green-800 transition-colors font-medium"
                >
                  Cadastrar atleta agora
                </a>
              </div>
            </Section>
          )}

          {/* ── Segurança ── */}
          <Section icon={<Shield size={16} />} title="Segurança">
            <div className="flex flex-col gap-3">
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

          {/* ── Notificações ── */}
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

          {/* ── Zona de perigo ── */}
          <Section icon={<AlertTriangle size={16} className="text-red-500" />} title="Zona de Perigo">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-neutral-900">Excluir conta definitivamente</p>
                <p className="text-[10px] sm:text-xs text-neutral-500 mt-1 max-w-sm">
                  Exclui permanentemente sua conta e todos os dados associados. Irreversível.
                </p>
              </div>
              <DeleteAccountModal hasAssinatura={false} isVerificado={false} />
            </div>
          </Section>

        </div>
      </main>
    </>
  )
}

function Section({ icon, title, children }: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2.5 sm:gap-3 px-4 sm:px-5 py-3 sm:py-4 border-b border-neutral-100 bg-neutral-50/50">
        <div className="text-neutral-400">{icon}</div>
        <h2 className="text-xs sm:text-sm font-semibold text-neutral-700 uppercase tracking-wide">{title}</h2>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </div>
  )
}
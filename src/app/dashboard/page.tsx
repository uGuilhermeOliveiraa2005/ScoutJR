import { createSupabaseServer, createSupabaseAdmin } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { NavbarDashboard } from '@/components/layout/Navbar'
import { Users, Star, MessageCircle, TrendingUp, ArrowRight, Eye } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default async function DashboardPage() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: initialProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  let profile = initialProfile

  if (!profile) {
    // Tenta "auto-reparar" o perfil via Admin Client (bypass RLS)
    const adminSupabase = createSupabaseAdmin()
    const { data: newProfile, error: insertError } = await adminSupabase
      .from('profiles')
      .upsert(
        {
          user_id: user.id,
          nome: user.user_metadata?.nome || 'Usuário',
          email: user.email!,
          role: user.user_metadata?.role || 'responsavel'
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single()

    if (insertError) {
      console.error('Erro detalhado ao auto-criar perfil:', {
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint
      })
      redirect('/login?error=profile_not_found')
    }
    profile = newProfile
  }

  const isClube = profile.role === 'clube'

  return (
    <>
      <NavbarDashboard userName={profile.nome} userRole={profile.role} />
      <main className="max-w-7xl mx-auto px-6 py-8">

        {/* Welcome */}
        <div className="mb-8">
          <h1 className="font-display text-4xl text-neutral-900 mb-1">
            OLÁ, {profile.nome.split(' ')[0].toUpperCase()}
          </h1>
          <p className="text-sm text-neutral-500">
            {isClube ? 'Gerencie suas buscas e interesses.' : 'Acompanhe o perfil do seu atleta.'}
          </p>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {isClube ? (
            <>
              <StatCard icon={<Eye size={18} />} label="Perfis visualizados" value="—" color="green" />
              <StatCard icon={<Star size={18} />} label="Favoritos" value="—" color="amber" />
              <StatCard icon={<MessageCircle size={18} />} label="Interesses enviados" value="—" color="blue" />
              <StatCard icon={<TrendingUp size={18} />} label="Novos atletas" value="—" color="green" />
            </>
          ) : (
            <>
              <StatCard icon={<Eye size={18} />} label="Visualizações" value="—" color="green" />
              <StatCard icon={<Star size={18} />} label="Clubes interessados" value="—" color="amber" />
              <StatCard icon={<MessageCircle size={18} />} label="Mensagens" value="—" color="blue" />
              <StatCard icon={<TrendingUp size={18} />} label="Posição no ranking" value="—" color="green" />
            </>
          )}
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-6">

            {isClube ? (
              <div className="bg-white border border-neutral-200 rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-medium text-neutral-900">Buscar talentos</h2>
                  <Link href="/busca"><Button size="sm" variant="outline">Ver todos <ArrowRight size={13} /></Button></Link>
                </div>
                <p className="text-sm text-neutral-500 mb-4">Encontre o próximo craque usando nossos filtros avançados.</p>
                <Link href="/busca"><Button variant="dark">Explorar atletas</Button></Link>
              </div>
            ) : (
              <div className="bg-white border border-neutral-200 rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="font-medium text-neutral-900">Meu atleta</h2>
                  <Link href="/perfil"><Button size="sm" variant="outline">Ver perfil <ArrowRight size={13} /></Button></Link>
                </div>
                <p className="text-sm text-neutral-500 mb-4">Nenhum atleta cadastrado ainda. Crie o perfil do seu filho para aparecer para os clubes.</p>
                <Link href="/perfil/novo"><Button variant="dark">Cadastrar atleta</Button></Link>
              </div>
            )}

            <div className="bg-white border border-neutral-200 rounded-xl p-6">
              <h2 className="font-medium text-neutral-900 mb-4">Atividade recente</h2>
              <div className="flex flex-col items-center justify-center py-8 text-neutral-300">
                <TrendingUp size={32} />
                <p className="text-sm mt-2">Nenhuma atividade ainda</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-4">
            <div className="bg-white border border-neutral-200 rounded-xl p-5">
              <h3 className="text-sm font-medium text-neutral-900 mb-3">Minha conta</h3>
              <div className="flex flex-col gap-2 text-sm text-neutral-500">
                <div className="flex justify-between">
                  <span>Plano</span>
                  <span className="font-medium text-neutral-700">{isClube ? 'Gratuito' : 'Família'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status</span>
                  <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">Ativo</span>
                </div>
              </div>
              {isClube && (
                <Link href="/configuracoes" className="mt-4 block">
                  <Button variant="amber" size="sm" className="w-full">Fazer upgrade</Button>
                </Link>
              )}
            </div>

            {!isClube && (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-5">
                <h3 className="text-sm font-medium text-amber-800 mb-2">Destaque seu atleta</h3>
                <p className="text-xs text-amber-600 leading-relaxed mb-3">Apareça no topo das buscas e receba mais atenção dos clubes por apenas R$ 49/mês.</p>
                <Link href="/configuracoes"><Button variant="amber" size="sm" className="w-full">Ativar destaque</Button></Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  const colors: Record<string, string> = {
    green: 'bg-green-100 text-green-700',
    amber: 'bg-amber-100 text-amber-700',
    blue: 'bg-blue-100 text-blue-700',
  }
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-4">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${colors[color]}`}>{icon}</div>
      <div className="font-display text-2xl text-neutral-900 leading-none mb-1">{value}</div>
      <div className="text-xs text-neutral-400">{label}</div>
    </div>
  )
}

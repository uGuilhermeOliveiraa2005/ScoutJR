import { createSupabaseServer } from '@/lib/supabase-server'
import { RankingClient } from './RankingClient'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function RankingPage() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  let escolinha = null

  if (user) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()
    profile = profileData

    console.log('DEBUG RANKING:', {
      userId: user.id,
      email: user.email,
      profileExists: !!profile,
      profileStatus: profile?.status,
      profileIsAdmin: profile?.is_admin
    })

    // Strict Lockout for unverified users
    if (profile && profile.status !== 'ativo' && !profile.is_admin) {
      console.log('RANKING REDIRECTING TO WAITING PAGE...')
      redirect('/aguardando-verificacao')
    }

    if (profile?.role === 'escolinha') {
      const { data: escolinhaData } = await supabase
        .from('escolinhas')
        .select('verificado, foto_url')
        .eq('user_id', user.id)
        .single()
      escolinha = escolinhaData
    }
  }

  const { data: atletas } = await supabase
    .from('atletas')
    .select('id, nome, posicao, estado, cidade, ranking_score, favoritos_count, interesses_count, destaque_ativo, foto_url')
    .eq('status', 'ativo')
    .gt('ranking_score', 0)
    .order('ranking_score', { ascending: false })
    .order('favoritos_count', { ascending: false })
    .limit(100)

  return (
    <RankingClient 
      initialAtletas={atletas || []} 
      user={user} 
      profile={profile} 
      escolinha={escolinha} 
      />
    )
}
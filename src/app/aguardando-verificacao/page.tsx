import { checkUserVerification } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { WaitingClient } from './WaitingClient'

export const dynamic = 'force-dynamic'

export default async function WaitingVerificationPage() {
  const { user, profile, isVerified } = await checkUserVerification()
  
  if (!user) redirect('/login')
  if (isVerified) redirect('/dashboard')

  return (
    <WaitingClient
      profileId={profile?.id || ''}
      nome={profile?.nome || ''}
      status={profile?.status || 'pendente'}
    />
  )
}

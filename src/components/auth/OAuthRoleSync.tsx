'use client'

import { useEffect } from 'react'
import { createSupabaseBrowser } from '@/lib/supabase'

export function OAuthRoleSync({ currentRole, userId }: { currentRole: string, userId: string }) {
  useEffect(() => {
    const intendedRole = localStorage.getItem('scoutjr_oauth_tipo')
    if (intendedRole && intendedRole !== currentRole) {
      const syncRole = async () => {
        const supabase = createSupabaseBrowser()
        await supabase.from('profiles').update({ role: intendedRole }).eq('id', userId)
        localStorage.removeItem('scoutjr_oauth_tipo')
        window.location.reload()
      }
      syncRole()
    } else if (intendedRole === currentRole) {
      localStorage.removeItem('scoutjr_oauth_tipo')
    }
  }, [currentRole, userId])

  return null
}

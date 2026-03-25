'use client'

import { LogOut, Loader2 } from 'lucide-react'
import { createSupabaseBrowser } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function LogoutButton() {
  const router = useRouter()
  const supabase = createSupabaseBrowser()
  const [loading, setLoading] = useState(false)

  async function handleLogout() {
    setLoading(true)
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-red-50 text-red-600 border border-red-100 rounded-2xl text-sm font-bold shadow-sm active:scale-[0.98] transition-all disabled:opacity-50"
    >
      {loading ? (
        <Loader2 size={18} className="animate-spin" />
      ) : (
        <LogOut size={18} />
      )}
      {loading ? 'Saindo...' : 'Encerrar Sessão'}
    </button>
  )
}

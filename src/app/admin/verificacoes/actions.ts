'use server'

import { createSupabaseServer, createSupabaseAdmin } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function getPendentes() {
  const supabase = await createSupabaseServer()
  
  // Perfil do admin
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('user_id', user.id)
    .single()

  if (!profile?.is_admin) return { error: 'Não autorizado' }

  // Busca profiles pendentes com dados de atletas/escolinhas
  const { data: pendentes, error } = await supabase
    .from('profiles')
    .select(`
      *,
      atletas(*),
      escolinhas(*)
    `)
    .eq('status', 'pendente')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erro ao buscar pendentes:', error)
    return { error: 'Falha ao buscar solicitações' }
  }

  return pendentes
}

export async function aprovarPerfil(profileId: string) {
  const supabase = await createSupabaseAdmin()
  
  const { error } = await supabase
    .from('profiles')
    .update({ status: 'ativo' })
    .eq('id', profileId)

  if (error) {
    console.error('Erro ao aprovar:', error)
    return { error: 'Falha ao aprovar perfil' }
  }

  revalidatePath('/admin/verificacoes')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function rejeitarPerfil(profileId: string) {
  const supabase = await createSupabaseAdmin()
  
  const { error } = await supabase
    .from('profiles')
    .update({ status: 'rejeitado' })
    .eq('id', profileId)

  if (error) {
    console.error('Erro ao rejeitar:', error)
    return { error: 'Falha ao rejeitar perfil' }
  }

  revalidatePath('/admin/verificacoes')
  return { success: true }
}

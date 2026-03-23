'use server'

import { createSupabaseServer, createSupabaseAdmin } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

async function checkIsAdmin() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('user_id', user.id)
    .single()

  return !!profile?.is_admin
}

export async function aprovarPerfil(id: string, tipo: 'profile' | 'atleta') {
  if (!(await checkIsAdmin())) return { error: 'Não autorizado' }

  const admin = createSupabaseAdmin()
  const table = tipo === 'profile' ? 'profiles' : 'atletas'

  const { error } = await admin
    .from(table)
    .update({ status: 'ativo' })
    .eq('id', id)

  if (error) return { error: 'Erro ao aprovar: ' + error.message }

  revalidatePath('/admin/verificacoes')
  revalidatePath('/dashboard')
  revalidatePath('/ranking')
  revalidatePath('/busca')
  
  return { success: true }
}

export async function rejeitarPerfil(id: string, tipo: 'profile' | 'atleta') {
  if (!(await checkIsAdmin())) return { error: 'Não autorizado' }

  const admin = createSupabaseAdmin()
  const table = tipo === 'profile' ? 'profiles' : 'atletas'

  const { error } = await admin
    .from(table)
    .update({ status: 'rejeitado' })
    .eq('id', id)

  if (error) return { error: 'Erro ao rejeitar: ' + error.message }

  revalidatePath('/admin/verificacoes')
  return { success: true }
}

export async function getPendentes() {
  if (!(await checkIsAdmin())) return { error: 'Não autorizado' }

  const admin = createSupabaseAdmin()

  const [
    { data: profiles },
    { data: atletas }
  ] = await Promise.all([
    admin.from('profiles').select('*').eq('status', 'pendente').order('created_at', { ascending: false }),
    admin.from('atletas').select('*, responsavel:profiles(*)').eq('status', 'pendente').order('created_at', { ascending: false })
  ])

  // Busca escolinhas relacionadas aos profiles do tipo escolinha
  const escolinhaIds = profiles?.filter(p => p.role === 'escolinha').map(p => p.user_id) || []
  const { data: escolinhas } = await admin
    .from('escolinhas')
    .select('*')
    .in('user_id', escolinhaIds)

  return {
    profiles: profiles?.map(p => ({
      ...p,
      escolinha: escolinhas?.find(e => e.user_id === p.user_id)
    })) || [],
    atletas: atletas || []
  }
}

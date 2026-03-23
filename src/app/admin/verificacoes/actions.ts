'use server'

import { createSupabaseServer, createSupabaseAdmin } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

// Helper para validar Admin Server-Side
async function checkIsAdmin() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  // Validate using the exact schema table and Service Role bypass
  const adminClient = createSupabaseAdmin()
  const { data: profile } = await adminClient
    .from('profiles')
    .select('is_admin')
    .eq('user_id', user.id)
    .single()

  return !!profile?.is_admin
}

export async function getPendentes() {
  if (!(await checkIsAdmin())) return { error: 'Não autorizado' }
  const admin = createSupabaseAdmin()

  // Busca profiles pendentes com dados de atletas/escolinhas bypassando RLS (Service_Role)
  const [
    { data: profiles, error: pError },
    { data: atletas, error: aError }
  ] = await Promise.all([
    admin.from('profiles').select('*').eq('status', 'pendente').order('created_at', { ascending: false }),
    admin.from('atletas').select('*, responsavel:profiles(id, nome, telefone, email)').eq('status', 'pendente').order('created_at', { ascending: false })
  ])

  if (pError || aError) {
    console.error('Erro ao buscar pendentes:', pError || aError)
    return { error: 'Falha ao buscar solicitações' }
  }

  // Busca escolinhas vinculadas aos profiles listados
  const escolinhaIds = profiles?.filter(p => p.role === 'escolinha').map(p => p.user_id) || []
  let escolinhas: any[] = []
  
  if (escolinhaIds.length > 0) {
    const { data } = await admin
      .from('escolinhas')
      .select('*')
      .in('user_id', escolinhaIds)
    if (data) escolinhas = data
  }

  return {
    profiles: profiles?.filter(p => p.role === 'escolinha').map(p => ({
      ...p,
      escolinha: escolinhas.find(e => e.user_id === p.user_id) || null
    })) || [],
    atletas: atletas || []
  }
}

export async function aprovarPerfil(id: string, tipo: 'profile' | 'atleta') {
  if (!(await checkIsAdmin())) return { error: 'Não autorizado' }

  const admin = createSupabaseAdmin()
  const table = tipo === 'profile' ? 'profiles' : 'atletas'

  const { error } = await admin
    .from(table)
    .update({ status: 'ativo' })
    .eq('id', id)

  if (error) {
    console.error(`Erro ao aprovar ${tipo}:`, error)
    return { error: 'Falha ao aprovar perfil' }
  }

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

  if (error) {
    console.error(`Erro ao rejeitar ${tipo}:`, error)
    return { error: 'Falha ao rejeitar perfil' }
  }

  revalidatePath('/admin/verificacoes')
  return { success: true }
}

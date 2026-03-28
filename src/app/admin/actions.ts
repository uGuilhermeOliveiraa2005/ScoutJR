'use server'

import { createSupabaseServer, createSupabaseAdmin } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

// Helper para validar Admin Server-Side
async function checkIsAdmin() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const adminClient = createSupabaseAdmin()
  const { data: profile } = await adminClient
    .from('profiles')
    .select('is_admin')
    .eq('user_id', user.id)
    .single()

  return !!profile?.is_admin
}

// ═══════════════════════════════════════════════════════════════
// DASHBOARD & STATS
// ═══════════════════════════════════════════════════════════════

export async function getAdminDashboardData() {
  if (!(await checkIsAdmin())) return { error: 'Não autorizado' }
  const admin = createSupabaseAdmin()

  const [
    { count: totalUsers },
    { count: totalAtletas },
    { count: totalEscolinhas },
    { count: totalPendentes },
    { data: recentUsers }
  ] = await Promise.all([
    admin.from('profiles').select('*', { count: 'exact', head: true }),
    admin.from('atletas').select('*', { count: 'exact', head: true }),
    admin.from('escolinhas').select('*', { count: 'exact', head: true }),
    admin.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'pendente'),
    admin.from('profiles').select('*').order('created_at', { ascending: false }).limit(5)
  ])

  return {
    stats: {
      totalUsers: totalUsers || 0,
      totalAtletas: totalAtletas || 0,
      totalEscolinhas: totalEscolinhas || 0,
      totalPendentes: totalPendentes || 0,
    },
    recentUsers: recentUsers || []
  }
}

// ═══════════════════════════════════════════════════════════════
// VERIFICAÇÕES (Refatorado para ser mais performático)
// ═══════════════════════════════════════════════════════════════

export async function getAdminPendentes() {
  if (!(await checkIsAdmin())) return { error: 'Não autorizado' }
  const admin = createSupabaseAdmin()

  // 1. Busca todos os profiles pendentes
  const { data: pendingProfiles } = await admin
    .from('profiles')
    .select('*')
    .eq('status', 'pendente')

  // 2. Busca todos os atletas pendentes
  const { data: pendingAtletas } = await admin
    .from('atletas')
    .select('*')
    .eq('status', 'pendente')

  // 3. Pega os IDs de todos os responsáveis de atletas pendentes
  const parentIdsFromAtletas = pendingAtletas?.map(a => a.responsavel_id) || []
  
  // 4. Busca os profiles desses responsáveis que ainda não estão no pendingProfiles
  const existingProfileIds = pendingProfiles?.map(p => p.id) || []
  const orphanProfileIds = [...new Set(parentIdsFromAtletas.filter(id => !existingProfileIds.includes(id)))]
  
  let orphanProfiles: any[] = []
  if (orphanProfileIds.length > 0) {
    const { data } = await admin
      .from('profiles')
      .select('*')
      .in('id', orphanProfileIds)
    orphanProfiles = data || []
  }

  const allRelevantProfiles = [...(pendingProfiles || []), ...orphanProfiles]
  const responsavelProfiles = allRelevantProfiles.filter(p => p.role === 'responsavel')
  const allRespIds = responsavelProfiles.map(p => p.id)

  let allAtletas: any[] = []
  if (allRespIds.length > 0) {
    const { data } = await admin.from('atletas').select('*').in('responsavel_id', allRespIds)
    allAtletas = data || []
  }

  const responsaveis = responsavelProfiles.map(p => ({
    ...p,
    atletas: allAtletas.filter(a => a.responsavel_id === p.id)
  })).filter(p => p.status === 'pendente' || p.atletas.some((a: any) => a.status === 'pendente'))

  const escolinhaProfiles = allRelevantProfiles.filter(p => p.role === 'escolinha')
  const escolinhas = escolinhaProfiles.length > 0 
    ? (await admin.from('escolinhas').select('*').in('user_id', escolinhaProfiles.map(p => p.user_id))).data 
    : []

  return {
    responsaveis: responsaveis.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    escolinhas: escolinhaProfiles.map(p => ({
      ...p,
      escolinha: escolinhas?.find(e => e.user_id === p.user_id) || null
    })).sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }
}

// ═══════════════════════════════════════════════════════════════
// GESTÃO DE USUÁRIOS & ATLETAS
// ═══════════════════════════════════════════════════════════════

export async function getAdminUsersList(search?: string) {
  if (!(await checkIsAdmin())) return { error: 'Não autorizado' }
  const admin = createSupabaseAdmin()

  let query = admin.from('profiles').select('*').order('created_at', { ascending: false }).limit(100)
  if (search) {
    query = query.or(`nome.ilike.%${search}%,email.ilike.%${search}%`)
  }

  const { data, error } = await query
  return { users: data || [], error }
}

export async function getAdminAtletasList(search?: string) {
  if (!(await checkIsAdmin())) return { error: 'Não autorizado' }
  const admin = createSupabaseAdmin()

  let query = admin.from('atletas').select('*').order('created_at', { ascending: false }).limit(100)
  if (search) {
    query = query.ilike('nome', `%${search}%`)
  }

  const { data, error } = await query
  return { atletas: data || [], error }
}

// ═══════════════════════════════════════════════════════════════
// AÇÕES DE APROVAÇÃO/REJEIÇÃO
// ═══════════════════════════════════════════════════════════════

export async function aprovarPerfil(profileId: string) {
  if (!(await checkIsAdmin())) return { error: 'Não autorizado' }
  const admin = createSupabaseAdmin()

  const { data: profile } = await admin.from('profiles').select('*').eq('id', profileId).single()
  if (!profile) return { error: 'Perfil não encontrado.' }

  await admin.from('profiles').update({ status: 'ativo' }).eq('id', profileId)

  if (profile.role === 'responsavel') {
    await admin.from('atletas').update({ status: 'ativo' }).eq('responsavel_id', profileId).eq('status', 'pendente')
  }

  revalidatePath('/admin')
  return { success: true }
}

export async function rejeitarPerfil(profileId: string) {
  if (!(await checkIsAdmin())) return { error: 'Não autorizado' }
  const admin = createSupabaseAdmin()

  const { data: profile } = await admin.from('profiles').select('*').eq('id', profileId).single()
  if (!profile) return { error: 'Perfil não encontrado.' }

  if (profile.role === 'responsavel') {
    await admin.from('atletas').delete().eq('responsavel_id', profileId)
  } else if (profile.role === 'escolinha') {
    await admin.from('escolinhas').delete().eq('user_id', profile.user_id)
  }

  await admin.from('profiles').delete().eq('id', profileId)
  await admin.auth.admin.deleteUser(profile.user_id)

  revalidatePath('/admin')
  return { success: true }
}

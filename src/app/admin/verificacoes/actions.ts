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

export async function getPendentes() {
  if (!(await checkIsAdmin())) return { error: 'Não autorizado' }
  const admin = createSupabaseAdmin()

  // 1. Busca todos os profiles marcados como pendentes
  const { data: pendingProfiles, error: pError } = await admin
    .from('profiles')
    .select('*')
    .eq('status', 'pendente')

  if (pError) {
    console.error('Erro ao buscar profiles pendentes:', pError)
    return { error: 'Falha ao buscar solicitações' }
  }

  // 2. Busca todos os atletas marcados como pendentes (pode haver novos atletas em perfis antigos)
  const { data: pendingAtletas } = await admin
    .from('atletas')
    .select('*')
    .eq('status', 'pendente')

  // 3. Pega os IDs de todos os responsáveis de atletas pendentes
  const parentIdsFromAtletas = pendingAtletas?.map(a => a.responsavel_id) || []
  
  // 4. Busca os profiles desses responsáveis que ainda não estão na lista de pendentes
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

  // 5. Unifica os perfis relevantes (Pai pendente OU Atleta pendente)
  const allRelevantProfiles = [...(pendingProfiles || []), ...orphanProfiles]

  // 6. Para cada perfil de responsável, buscamos os atletas para montar o card
  const responsavelProfiles = allRelevantProfiles.filter(p => p.role === 'responsavel')
  const allRespIds = responsavelProfiles.map(p => p.id)

  let allAtletas: any[] = []
  if (allRespIds.length > 0) {
    const { data } = await admin
      .from('atletas')
      .select('*')
      .in('responsavel_id', allRespIds)
    allAtletas = data || []
  }

  // 7. Organiza Responsáveis + Atletas
  const responsaveis = responsavelProfiles.map(p => ({
    ...p,
    atletas: allAtletas.filter(a => a.responsavel_id === p.id)
  }))
  // Filtro extra de segurança: garantir que o card realmente tenha algo pendente
  .filter(p => p.status === 'pendente' || p.atletas.some((a: any) => a.status === 'pendente'))

  // 8. Organiza Escolinhas
  const escolinhaProfiles = allRelevantProfiles.filter(p => p.role === 'escolinha')
  const escolinhaUserIds = escolinhaProfiles.map(p => p.user_id)
  
  let escolinhas: any[] = []
  if (escolinhaUserIds.length > 0) {
    const { data } = await admin
      .from('escolinhas')
      .select('*')
      .in('user_id', escolinhaUserIds)
    escolinhas = data || []
  }

  const escolinhasCompletas = escolinhaProfiles.map(p => ({
    ...p,
    escolinha: escolinhas.find(e => e.user_id === p.user_id) || null
  }))

  return {
    responsaveis: responsaveis.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    escolinhas: escolinhasCompletas.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }
}

export async function aprovarPerfil(profileId: string) {
  if (!(await checkIsAdmin())) return { error: 'Não autorizado' }

  const admin = createSupabaseAdmin()

  // Buscar profile para saber o tipo
  const { data: profile } = await admin.from('profiles').select('*').eq('id', profileId).single()
  if (!profile) return { error: 'Perfil não encontrado.' }

  // 1. Aprovar o profile
  const { error: profileError } = await admin
    .from('profiles')
    .update({ status: 'ativo' })
    .eq('id', profileId)

  if (profileError) {
    console.error('Erro ao aprovar profile:', profileError)
    return { error: 'Falha ao aprovar perfil' }
  }

  // 2. Se for responsável, também aprovar todos os atletas pendentes vinculados
  if (profile.role === 'responsavel') {
    const { error: atletaError } = await admin
      .from('atletas')
      .update({ status: 'ativo' })
      .eq('responsavel_id', profileId)
      .eq('status', 'pendente')

    if (atletaError) {
      console.error('Erro ao aprovar atletas do responsável:', atletaError)
    }

    // Notificação de aprovação para responsável
    try {
      await admin.from('notificacoes').insert({
        user_id: profile.user_id,
        titulo: '✅ Conta aprovada — Bem-vindo ao ScoutJR!',
        mensagem: 'Ótima notícia! Sua conta e o perfil do(s) atleta(s) foram verificados e aprovados pela nossa equipe. O perfil já está visível para as escolinhas na plataforma.',
        tipo: 'sistema',
        metadata: { type: 'profile_approved' }
      })
    } catch {}

  } else if (profile.role === 'escolinha') {
    // Notificação de aprovação para escolinha
    try {
      await admin.from('notificacoes').insert({
        user_id: profile.user_id,
        titulo: '✅ Escolinha verificada — Acesso liberado!',
        mensagem: 'Sua escolinha foi verificada e aprovada pela nossa equipe! Agora você pode buscar atletas, salvar favoritos e demonstrar interesse nos perfis. Boas descobertas!',
        tipo: 'sistema',
        metadata: { type: 'profile_approved' }
      })
    } catch {}
  }

  revalidatePath('/admin/verificacoes')
  revalidatePath('/dashboard')
  revalidatePath('/ranking')
  revalidatePath('/busca')
  
  return { success: true }
}

export async function rejeitarPerfil(profileId: string) {
  if (!(await checkIsAdmin())) return { error: 'Não autorizado' }

  const admin = createSupabaseAdmin()

  const { data: profile } = await admin.from('profiles').select('*').eq('id', profileId).single()
  if (!profile) return { error: 'Perfil não encontrado.' }

// 1. Se for responsável, remover atletas vinculados
  if (profile.role === 'responsavel') {
    await admin.from('atletas').delete().eq('responsavel_id', profileId)
  }

  // 2. Se for escolinha, remover dados da escolinha
  if (profile.role === 'escolinha') {
    await admin.from('escolinhas').delete().eq('user_id', profile.user_id)
  }

  // 3. Remover profile (isso também dispara o trigger do realtime avisando o client do DELETE)
  const { error: profileError } = await admin.from('profiles').delete().eq('id', profileId)
  
  if (profileError) {
    console.error('Erro ao apagar profile:', profileError)
    return { error: 'Falha ao apagar perfil do banco de dados' }
  }

  // 4. Apagar da tabela auth.users do Supabase
  const { error: authError } = await admin.auth.admin.deleteUser(profile.user_id)
  if (authError) {
    console.error('Erro ao excluir usuário no auth:', authError)
  }

  revalidatePath('/admin/verificacoes')
  return { success: true }
}

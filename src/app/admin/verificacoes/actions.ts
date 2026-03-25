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

  // 1. Busca todos os profiles pendentes (tanto responsáveis quanto escolinhas)
  const { data: profiles, error: pError } = await admin
    .from('profiles')
    .select('*')
    .eq('status', 'pendente')
    .order('created_at', { ascending: false })

  if (pError) {
    console.error('Erro ao buscar profiles pendentes:', pError)
    return { error: 'Falha ao buscar solicitações' }
  }

  // 2. Para responsáveis: buscar atletas vinculados
  const responsavelProfiles = profiles?.filter(p => p.role === 'responsavel') || []
  const responsavelIds = responsavelProfiles.map(p => p.id)

  let atletasByResponsavel: any[] = []
  if (responsavelIds.length > 0) {
    const { data: atletas } = await admin
      .from('atletas')
      .select('*')
      .in('responsavel_id', responsavelIds)

    atletasByResponsavel = atletas || []
  }

  // 3. Para escolinhas: buscar dados da escolinha
  const escolinhaProfiles = profiles?.filter(p => p.role === 'escolinha') || []
  const escolinhaUserIds = escolinhaProfiles.map(p => p.user_id)

  let escolinhas: any[] = []
  if (escolinhaUserIds.length > 0) {
    const { data } = await admin
      .from('escolinhas')
      .select('*')
      .in('user_id', escolinhaUserIds)
    if (data) escolinhas = data
  }

  // 4. Montar os dados organizados
  const responsaveis = responsavelProfiles.map(p => ({
    ...p,
    atletas: atletasByResponsavel.filter(a => a.responsavel_id === p.id)
  }))

  const escolinhasCompletas = escolinhaProfiles.map(p => ({
    ...p,
    escolinha: escolinhas.find(e => e.user_id === p.user_id) || null
  }))

  return {
    responsaveis,
    escolinhas: escolinhasCompletas
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

    // Notificação
    try {
      await admin.from('notificacoes').insert({
        user_id: profile.user_id,
        titulo: 'Conta Aprovada! 🎉',
        mensagem: 'Sua conta e o perfil do(s) atleta(s) foram aprovados. Bem-vindo ao ScoutJR!',
        tipo: 'sistema',
        metadata: { type: 'profile_approved' }
      })
    } catch {}

  } else if (profile.role === 'escolinha') {
    // Notificação para escolinha
    try {
      await admin.from('notificacoes').insert({
        user_id: profile.user_id,
        titulo: 'Escolinha Aprovada! 🏟️',
        mensagem: 'Sua escolinha foi aprovada! Comece agora a buscar talentos no ScoutJR.',
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

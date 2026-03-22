'use server'

import { createSupabaseServer, createSupabaseAdmin } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

// Dispara notificações para escolinhas que têm alerta para a posição do atleta
async function notificarEscolinhasPorPosicao(
  atletaId: string,
  atletaNome: string,
  posicao: string,
  admin: ReturnType<typeof createSupabaseAdmin>
) {
  try {
    // Busca escolinhas com alerta ativo para essa posição
    const { data: alertas } = await admin
      .from('escolinha_interesses_posicoes')
      .select('escolinha_id, escolinhas(user_id)')
      .eq('posicao', posicao)

    if (!alertas || alertas.length === 0) return

    // Cria uma notificação para cada escolinha
    const notificacoes = alertas
      .map((alerta: any) => {
        const userId = alerta.escolinhas?.user_id
        if (!userId) return null
        return {
          user_id: userId,
          tipo: 'sistema',
          titulo: `Novo ${posicao} disponível!`,
          mensagem: `${atletaNome} acabou de criar um perfil. Clique para ver.`,
          lida: false,
          metadata: {
            atleta_id: atletaId,
            posicao,
          },
        }
      })
      .filter(Boolean)

    if (notificacoes.length > 0) {
      await admin.from('notificacoes').insert(notificacoes)
    }
  } catch (err) {
    // Não bloqueia o fluxo se a notificação falhar
    console.error('[notificarEscolinas] Erro:', err)
  }
}

export async function createAthlete(data: any) {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Não autorizado' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('user_id', user.id)
    .single()

  if (!profile || profile.role !== 'responsavel') {
    return { error: 'Apenas responsáveis podem cadastrar atletas' }
  }

  const admin = createSupabaseAdmin()

  const { data: athlete, error } = await admin
    .from('atletas')
    .insert({
      responsavel_id: profile.id,
      nome: data.nomeAtleta,
      descricao: data.descricao || '',
      data_nascimento: data.dataNascimento,
      estado: data.estado,
      cidade: data.cidade,
      pe_dominante: data.peDominante,
      escolinha_atual: data.escolinhaAtual || null,
      posicao: data.posicao,
      habilidade_tecnica: data.habilidades[0],
      habilidade_velocidade: data.habilidades[1],
      habilidade_visao: data.habilidades[2],
      habilidade_fisico: data.habilidades[3],
      habilidade_finalizacao: data.habilidades[4],
      habilidade_passes: data.habilidades[5],
      visivel: data.visivel,
      exibir_cidade: data.exibirCidade,
      aceitar_mensagens: data.mensagens,
      foto_url: data.fotoUrl || null,
      fotos_adicionais: data.fotosAdicionais || [],
    })
    .select()
    .single()

  if (error) {
    console.error('Erro ao criar atleta:', error)
    return { error: 'Erro ao salvar os dados do atleta: ' + error.message }
  }

  // Vídeos
  if (data.videos && data.videos.length > 0) {
    const videoInserts = data.videos
      .filter((v: any) => v.url)
      .map((v: any) => ({ atleta_id: athlete.id, titulo: v.titulo || 'Destaque', url: v.url }))
    if (videoInserts.length > 0) {
      await admin.from('atleta_videos').insert(videoInserts)
    }
  }

  // Conquistas
  if (data.conquistas && data.conquistas.length > 0) {
    const conquistaInserts = data.conquistas
      .filter((c: any) => c.titulo)
      .map((c: any) => ({
        atleta_id: athlete.id,
        titulo: c.titulo,
        ano: parseInt(c.ano) || new Date().getFullYear(),
        descricao: c.descricao || null,
      }))
    if (conquistaInserts.length > 0) {
      await admin.from('atleta_conquistas').insert(conquistaInserts)
    }
  }

  // Notifica escolinhas com alerta para a posição
  await notificarEscolinhasPorPosicao(athlete.id, athlete.nome, athlete.posicao, admin)

  revalidatePath('/dashboard')
  revalidatePath('/busca')

  return { success: true, id: athlete.id }
}

export async function updateAthlete(id: string, data: any) {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Não autorizado' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('user_id', user.id)
    .single()

  if (!profile || profile.role !== 'responsavel') {
    return { error: 'Apenas responsáveis podem editar atletas' }
  }

  const { data: existing } = await supabase
    .from('atletas')
    .select('responsavel_id')
    .eq('id', id)
    .single()

  if (!existing || existing.responsavel_id !== profile.id) {
    return { error: 'Você não tem permissão para editar este atleta' }
  }

  const admin = createSupabaseAdmin()

  const { data: updatedAtleta, error } = await admin
    .from('atletas')
    .update({
      nome: data.nomeAtleta,
      descricao: data.descricao || '',
      data_nascimento: data.dataNascimento,
      estado: data.estado,
      cidade: data.cidade,
      pe_dominante: data.peDominante,
      escolinha_atual: data.escolinhaAtual || null,
      posicao: data.posicao,
      habilidade_tecnica: data.habilidades[0],
      habilidade_velocidade: data.habilidades[1],
      habilidade_visao: data.habilidades[2],
      habilidade_fisico: data.habilidades[3],
      habilidade_finalizacao: data.habilidades[4],
      habilidade_passes: data.habilidades[5],
      visivel: data.visivel,
      exibir_cidade: data.exibirCidade,
      aceitar_mensagens: data.mensagens,
      foto_url: data.fotoUrl || null,
      fotos_adicionais: data.fotosAdicionais || [],
    })
    .eq('id', id)
    .select('id')
    .maybeSingle()

  if (error || !updatedAtleta) {
    console.error('Erro ao atualizar atleta:', error?.message)
    return { error: 'Atleta não encontrado ou permissão negada.' }
  }

  // Vídeos: deleta e recria
  await admin.from('atleta_videos').delete().eq('atleta_id', id)
  if (data.videos && data.videos.length > 0) {
    const videoInserts = data.videos
      .filter((v: any) => v.url)
      .map((v: any) => ({ atleta_id: id, titulo: v.titulo || 'Destaque', url: v.url }))
    if (videoInserts.length > 0) {
      await admin.from('atleta_videos').insert(videoInserts)
    }
  }

  // Conquistas: deleta e recria
  await admin.from('atleta_conquistas').delete().eq('atleta_id', id)
  if (data.conquistas && data.conquistas.length > 0) {
    const conquistaInserts = data.conquistas
      .filter((c: any) => c.titulo)
      .map((c: any) => ({
        atleta_id: id,
        titulo: c.titulo,
        ano: parseInt(c.ano) || new Date().getFullYear(),
        descricao: c.descricao || null,
      }))
    if (conquistaInserts.length > 0) {
      await admin.from('atleta_conquistas').insert(conquistaInserts)
    }
  }

  revalidatePath('/dashboard')
  revalidatePath(`/perfil/${id}`)
  revalidatePath('/busca')

  return { success: true }
}
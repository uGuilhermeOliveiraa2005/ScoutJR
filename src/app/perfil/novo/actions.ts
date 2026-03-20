'use server'

import { createSupabaseServer } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createAthlete(data: any) {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Não autorizado' }
  }

  // Busca o profile do responsável
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('user_id', user.id)
    .single()

  if (!profile || profile.role !== 'responsavel') {
    return { error: 'Apenas responsáveis podem cadastrar atletas' }
  }

  const { data: athlete, error } = await supabase
    .from('atletas')
    .insert({
      responsavel_id: profile.id,
      nome: data.nomeAtleta,
      descricao: data.descricao || '',
      data_nascimento: data.dataNascimento,
      estado: data.estado,
      cidade: data.cidade,
      pe_dominante: data.peDominante,
      clube_atual: data.clubeAtual,
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
      foto_url: data.fotoUrl,
      fotos_adicionais: data.fotosAdicionais || [],
    })
    .select()
    .single()

  if (error) {
    console.error('Erro ao criar atleta:', error)
    return { error: 'Erro ao salvar os dados do atleta: ' + error.message }
  }

  // Insert Videos
  if (data.videos && data.videos.length > 0) {
    const videoInserts = data.videos.map((v: any) => ({
      atleta_id: athlete.id,
      titulo: v.titulo || 'Destaque',
      url: v.url
    }))
    await supabase.from('atleta_videos').insert(videoInserts)
  }

  // Insert Conquests
  if (data.conquistas && data.conquistas.length > 0) {
    const conquestInserts = data.conquistas.map((c: any) => ({
      atleta_id: athlete.id,
      titulo: c.titulo,
      ano: parseInt(c.ano),
      descricao: c.descricao
    }))
    await supabase.from('atleta_conquistas').insert(conquestInserts)
  }

  revalidatePath('/dashboard')
  revalidatePath('/perfil')
  revalidatePath('/ranking')
  revalidatePath('/busca')
  
  return { success: true, id: athlete.id }
}

export async function updateAthlete(id: string, data: any) {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Não autorizado' }
  }

  // Busca o profile do responsável
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('user_id', user.id)
    .single()

  if (!profile || profile.role !== 'responsavel') {
    return { error: 'Apenas responsáveis podem editar atletas' }
  }

  // Verifica se o atleta pertence a este responsável
  const { data: existing } = await supabase
    .from('atletas')
    .select('responsavel_id')
    .eq('id', id)
    .single()

  if (!existing || existing.responsavel_id !== profile.id) {
    return { error: 'Você não tem permissão para editar este atleta' }
  }

  const { error } = await supabase
    .from('atletas')
    .update({
      nome: data.nomeAtleta,
      descricao: data.descricao || '',
      data_nascimento: data.dataNascimento,
      estado: data.estado,
      cidade: data.cidade,
      pe_dominante: data.peDominante,
      clube_atual: data.clubeAtual,
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
      foto_url: data.fotoUrl,
      fotos_adicionais: data.fotosAdicionais || [],
    })
    .eq('id', id)

  if (error) {
    console.error('Erro ao atualizar atleta:', error)
    return { error: 'Erro ao salvar os dados do atleta: ' + error.message }
  }

  // Update Videos: Delete and recreate
  await supabase.from('atleta_videos').delete().eq('atleta_id', id)
  if (data.videos && data.videos.length > 0) {
    const videoInserts = data.videos.map((v: any) => ({
      atleta_id: id,
      titulo: v.titulo || 'Destaque',
      url: v.url
    }))
    await supabase.from('atleta_videos').insert(videoInserts)
  }

  // Update Conquests: Delete and recreate
  await supabase.from('atleta_conquistas').delete().eq('atleta_id', id)
  if (data.conquistas && data.conquistas.length > 0) {
    const conquestInserts = data.conquistas.map((c: any) => ({
      atleta_id: id,
      titulo: c.titulo,
      ano: parseInt(c.ano),
      descricao: c.descricao
    }))
    await supabase.from('atleta_conquistas').insert(conquestInserts)
  }

  revalidatePath('/dashboard')
  revalidatePath(`/perfil/${id}`)
  revalidatePath('/ranking')
  revalidatePath('/busca')
  
  return { success: true }
}

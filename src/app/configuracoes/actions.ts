'use server'

import { createSupabaseServer, createSupabaseAdmin } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

// ── Perfil básico (responsável ou escolinha) ─────────────────
export async function updateProfile(formData: FormData) {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Usuário não autenticado.' }

  const nome = formData.get('nome') as string
  const telefone = formData.get('telefone') as string
  const descricao = formData.get('descricao') as string
  const current_foto_url = formData.get('current_foto_url') as string
  const foto_file = formData.get('foto_url') as File | null

  let final_foto_url = current_foto_url

  if (foto_file && foto_file.size > 0) {
    const admin = createSupabaseAdmin()
    const fileExt = foto_file.name.split('.').pop()
    const fileName = `configuracoes/${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
    const { error: uploadError } = await admin.storage.from('media').upload(fileName, foto_file)
    if (!uploadError) {
      const { data: { publicUrl } } = admin.storage.from('media').getPublicUrl(fileName)
      final_foto_url = publicUrl
    } else {
      return { error: 'Erro ao enviar a imagem. Tente novamente.' }
    }
  }

  const { error } = await createSupabaseAdmin()
    .from('profiles')
    .update({ nome, telefone, foto_url: final_foto_url, avatar_url: final_foto_url })
    .eq('user_id', user.id)

  if (error) return { error: 'Erro ao atualizar perfil: ' + error.message }

  // Atualiza escolinha se for do tipo escolinha
  const { data: profileCheck } = await (await createSupabaseServer())
    .from('profiles').select('role').eq('user_id', user.id).single()

  if (profileCheck?.role === 'escolinha') {
    const admin = createSupabaseAdmin()
    const { data: existing } = await admin
      .from('escolinhas').select('estado, cidade, cnpj').eq('user_id', user.id).maybeSingle()

    await admin.from('escolinhas').upsert({
      user_id: user.id,
      nome,
      foto_url: final_foto_url,
      logo_url: final_foto_url,
      descricao,
      estado: existing?.estado ?? '',
      cidade: existing?.cidade ?? '',
      cnpj: existing?.cnpj ?? null,
    }, { onConflict: 'user_id' })
  }

  revalidatePath('/configuracoes')
  revalidatePath('/dashboard')
  revalidatePath('/ranking')
  revalidatePath('/busca')
  return { success: true }
}

// ── Localização da escolinha ─────────────────────────────────
export async function updateEscolinhaLocalizacao(formData: FormData) {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const estado = formData.get('estado') as string
  const cidade = formData.get('cidade') as string
  const cnpj = formData.get('cnpj') as string

  const admin = createSupabaseAdmin()
  const { error } = await admin
    .from('escolinhas')
    .update({ estado, cidade, cnpj: cnpj || null })
    .eq('user_id', user.id)

  if (error) return { error: 'Erro ao atualizar localização: ' + error.message }

  revalidatePath('/configuracoes')
  revalidatePath('/dashboard')
  revalidatePath('/ranking')
  revalidatePath('/busca')
  return { success: true }
}

// ── Fotos adicionais da escolinha ────────────────────────────
export async function updateEscolinhaFotos(formData: FormData) {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const fotosJson = formData.get('fotos_adicionais') as string
  let fotos: string[] = []
  try { fotos = JSON.parse(fotosJson) } catch { fotos = [] }

  // Upload de novos arquivos
  const admin = createSupabaseAdmin()
  const uploadedUrls: string[] = []

  for (let i = 0; i < 3; i++) {
    const file = formData.get(`foto_nova_${i}`) as File | null
    if (file && file.size > 0) {
      const ext = file.name.split('.').pop()
      const fileName = `escolinha_galeria/${Math.random().toString(36).substring(2)}_${Date.now()}.${ext}`
      const { error: upErr } = await admin.storage.from('media').upload(fileName, file)
      if (!upErr) {
        const { data: { publicUrl } } = admin.storage.from('media').getPublicUrl(fileName)
        uploadedUrls.push(publicUrl)
      }
    }
  }

  const allFotos = [...fotos.filter(Boolean), ...uploadedUrls].slice(0, 3)

  const { error } = await admin
    .from('escolinhas')
    .update({ fotos_adicionais: allFotos })
    .eq('user_id', user.id)

  if (error) return { error: 'Erro ao atualizar fotos: ' + error.message }

  revalidatePath('/configuracoes')
  revalidatePath('/dashboard')
  revalidatePath('/ranking')
  revalidatePath('/busca')
  return { success: true }
}

// ── Dados do atleta ──────────────────────────────────────────
export async function updateAtleta(formData: FormData) {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autenticado.' }

  const { data: profile } = await supabase
    .from('profiles').select('id').eq('user_id', user.id).single()
  if (!profile) return { error: 'Perfil não encontrado.' }

  const atletaId = formData.get('atleta_id') as string
  if (!atletaId) return { error: 'Atleta não encontrado.' }

  const admin = createSupabaseAdmin()

  // Upload foto se houver
  const foto_file = formData.get('foto_url') as File | null
  const current_foto_url = formData.get('current_foto_url') as string
  let final_foto_url = current_foto_url

  if (foto_file && foto_file.size > 0) {
    const ext = foto_file.name.split('.').pop()
    const fileName = `atleta/${Math.random().toString(36).substring(2)}_${Date.now()}.${ext}`
    const { error: upErr } = await admin.storage.from('media').upload(fileName, foto_file)
    if (!upErr) {
      const { data: { publicUrl } } = admin.storage.from('media').getPublicUrl(fileName)
      final_foto_url = publicUrl
    }
  }

  const habilidades = [
    parseInt(formData.get('hab_tecnica') as string) || 50,
    parseInt(formData.get('hab_velocidade') as string) || 50,
    parseInt(formData.get('hab_visao') as string) || 50,
    parseInt(formData.get('hab_fisico') as string) || 50,
    parseInt(formData.get('hab_finalizacao') as string) || 50,
    parseInt(formData.get('hab_passes') as string) || 50,
  ]

  const { error } = await admin
    .from('atletas')
    .update({
      nome: formData.get('nome') as string,
      descricao: formData.get('descricao') as string,
      data_nascimento: formData.get('data_nascimento') as string,
      estado: formData.get('estado') as string,
      cidade: formData.get('cidade') as string,
      posicao: formData.get('posicao') as string,
      pe_dominante: formData.get('pe_dominante') as string,
      escolinha_atual: (formData.get('escolinha_atual') as string) || null,
      habilidade_tecnica: habilidades[0],
      habilidade_velocidade: habilidades[1],
      habilidade_visao: habilidades[2],
      habilidade_fisico: habilidades[3],
      habilidade_finalizacao: habilidades[4],
      habilidade_passes: habilidades[5],
      foto_url: final_foto_url || null,
      visivel: formData.get('visivel') === 'true',
      exibir_cidade: formData.get('exibir_cidade') === 'true',
      aceitar_mensagens: formData.get('aceitar_mensagens') === 'true',
    })
    .eq('id', atletaId)
    .eq('responsavel_id', profile.id)

  if (error) return { error: 'Erro ao atualizar atleta: ' + error.message }

  revalidatePath('/configuracoes')
  revalidatePath(`/perfil/${atletaId}`)
  revalidatePath('/dashboard')
  revalidatePath('/ranking')
  revalidatePath('/busca')
  return { success: true }
}

// ── Senha ────────────────────────────────────────────────────
export async function updatePassword(formData: FormData) {
  const supabase = await createSupabaseServer()
  const password = formData.get('password') as string
  const confirm = formData.get('confirm') as string
  if (!password || password.length < 8) return { error: 'A senha deve ter pelo menos 8 caracteres.' }
  if (password !== confirm) return { error: 'As senhas não coincidem.' }
  const { error } = await supabase.auth.updateUser({ password })
  if (error) return { error: error.message }
  return { success: true }
}

// ── Excluir conta ────────────────────────────────────────────
export async function deleteAccount() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado' }
  const admin = createSupabaseAdmin()
  const { error } = await admin.auth.admin.deleteUser(user.id)
  if (error) return { error: 'Falha ao excluir conta.' }
  return { success: true }
}
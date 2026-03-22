'use server'

import { createSupabaseServer, createSupabaseAdmin } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'
import { mpPreApproval } from '@/lib/mercadopago'

export async function updateProfile(formData: FormData) {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Usuário não autenticado.' }
  }

  const nome = formData.get('nome') as string
  const telefone = formData.get('telefone') as string
  const descricao = formData.get('descricao') as string
  const current_foto_url = formData.get('current_foto_url') as string
  const foto_file = formData.get('foto_url') as File | null

  let final_foto_url = current_foto_url

  if (foto_file && foto_file.size && foto_file.size > 0) {
    const admin = createSupabaseAdmin()
    const fileExt = foto_file.name.split('.').pop()
    const fileName = `configuracoes/${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`

    const { data: uploadData, error: uploadError } = await admin.storage.from('media').upload(fileName, foto_file)
    if (!uploadError) {
      const { data: { publicUrl } } = admin.storage.from('media').getPublicUrl(fileName)
      final_foto_url = publicUrl
    } else {
      console.error('Erro no upload:', uploadError)
      return { error: 'Ocorreu um erro ao enviar a imagem para o servidor.' }
    }
  }

  // Atualiza profiles
  const { data: updatedProfile, error } = await supabase
    .from('profiles')
    .update({
      nome,
      telefone,
      foto_url: final_foto_url,
      avatar_url: final_foto_url
    })
    .eq('user_id', user.id)
    .select('id')
    .maybeSingle()

  if (error || !updatedProfile) {
    console.error('Erro ao atualizar perfil:', error?.message || 'Nenhuma linha afetada')
    return { error: 'Perfil não encontrado ou erro de permissão. Tente novamente.' }
  }

  // Verifica se é escolinha
  const { data: profileCheck } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (profileCheck?.role === 'escolinha') {
    // Busca dados existentes da escolinha para preservar campos obrigatórios
    const { data: escolinhaExistente } = await supabase
      .from('escolinhas')
      .select('estado, cidade, cnpj')
      .eq('user_id', user.id)
      .maybeSingle()

    // Garante que estado e cidade nunca sejam nulos no upsert
    const estado = escolinhaExistente?.estado ?? ''
    const cidade = escolinhaExistente?.cidade ?? ''
    const cnpj = escolinhaExistente?.cnpj ?? null

    const { data: updatedEsc, error: escError } = await supabase
      .from('escolinhas')
      .upsert({
        user_id: user.id,
        nome,
        foto_url: final_foto_url,
        logo_url: final_foto_url,
        descricao,
        estado,
        cidade,
        cnpj,
      }, { onConflict: 'user_id' })
      .select('id')
      .maybeSingle()

    if (escError || !updatedEsc) {
      console.error('Erro ao atualizar/criar escolinha:', escError?.message || 'Nenhuma linha afetada')
      return { error: 'Não foi possível salvar os dados da escolinha. Verifique suas permissões.' }
    }
  }

  revalidatePath('/configuracoes')
  revalidatePath('/dashboard')

  return { success: true }
}

export async function cancelSubscription(formData?: FormData): Promise<void> {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autorizado')

  const { data: escolinha } = await supabase
    .from('escolinhas')
    .select('mp_payment_id')
    .eq('user_id', user.id)
    .single()

  if (escolinha?.mp_payment_id) {
    try {
      await (mpPreApproval as any).update({
        id: escolinha.mp_payment_id,
        body: { status: 'cancelled' }
      })
    } catch (err) {
      console.error('Erro ao cancelar no MP:', err)
    }
  }

  await supabase.from('escolinhas').update({ status_assinatura: 'canceled' }).eq('user_id', user.id)
  revalidatePath('/configuracoes')
}

export async function deleteAccount() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Não autorizado' }

  const { data: escolinha } = await supabase
    .from('escolinhas')
    .select('mp_payment_id, status_assinatura')
    .eq('user_id', user.id)
    .single()

  if (escolinha?.status_assinatura === 'active' && escolinha.mp_payment_id) {
    try {
      await (mpPreApproval as any).update({
        id: escolinha.mp_payment_id,
        body: { status: 'cancelled' }
      })
    } catch (err) {
      console.error('Erro ao cancelar assinatura antes da exclusão', err)
    }
  }

  const admin = createSupabaseAdmin()
  const { error } = await admin.auth.admin.deleteUser(user.id)

  if (error) {
    console.error('Erro ao deletar usuário:', error)
    return { error: 'Falha ao excluir conta no Supabase.' }
  }

  return { success: true }
}

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
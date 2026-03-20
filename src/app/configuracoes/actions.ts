'use server'

import { createSupabaseServer } from '@/lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function updateProfile(formData: FormData) {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    console.error('Não autorizado')
    return
  }

  const nome = formData.get('nome') as string
  const telefone = formData.get('telefone') as string

  const { error } = await supabase
    .from('profiles')
    .update({ nome, telefone })
    .eq('user_id', user.id)

  if (error) {
    console.error('Erro ao atualizar perfil:', error.message)
    return
  }

  revalidatePath('/configuracoes')
  revalidatePath('/dashboard')
}

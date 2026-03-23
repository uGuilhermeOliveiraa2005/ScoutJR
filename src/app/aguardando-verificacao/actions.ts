'use server'

import { createSupabaseServer } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function signOutAction() {
  const supabase = await createSupabaseServer()
  await supabase.auth.signOut()
  
  // Limpa o cache para garantir que o próximo login venha fresco
  revalidatePath('/')
  revalidatePath('/dashboard')
  revalidatePath('/aguardando-verificacao')
  
  redirect('/login')
}

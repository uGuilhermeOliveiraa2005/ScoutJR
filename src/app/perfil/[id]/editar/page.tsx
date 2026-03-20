import { createSupabaseServer } from '@/lib/supabase-server'
import { notFound, redirect } from 'next/navigation'
import { AthleteForm } from '@/components/atletas/AthleteForm'
import { updateAthlete } from '@/app/perfil/novo/actions'

export default async function EditarAtletaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Busca o atleta com relações
  const { data: athlete } = await supabase
    .from('atletas')
    .select('*, atleta_videos(*), atleta_conquistas(*)')
    .eq('id', id)
    .single()

  if (!athlete) notFound()

  // Verifica se o usuário é o dono (responsável)
  // Nota: o responsavel_id na tabela atletas aponta para profiles.id
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!profile || athlete.responsavel_id !== profile.id) {
    redirect(`/perfil/${id}`)
  }

  // Wrapper para a action de update para incluir o ID
  async function handleUpdate(data: any) {
    'use server'
    return updateAthlete(id, data)
  }

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col items-center justify-start px-4 py-8 sm:py-12">
      <AthleteForm 
        mode="edit" 
        initialData={athlete}
        athleteId={id}
        onSubmit={handleUpdate} 
      />
    </div>
  )
}

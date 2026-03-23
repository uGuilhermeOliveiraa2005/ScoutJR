import { createSupabaseServer } from '@/lib/supabase-server'
import { notFound, redirect } from 'next/navigation'
import { NavbarPublic } from '@/components/layout/Navbar'
import { NavbarDashboard } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Navbar'
import { Badge, SkillBar } from '@/components/ui/index'
import { Avatar } from '@/components/ui/Avatar'
import { POSICAO_LABEL, ESTADO_LABEL, calcularIdade } from '@/lib/utils'
import { headers } from 'next/headers'
import { MapPin, Landmark, Star, Send, Trophy, Target, Award, Play, BarChart2, ArrowLeft, Edit2, Eye } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { AthleteActions } from '@/components/atletas/AthleteActions'
import { MediaGallery } from '@/components/atletas/MediaGallery'

export const dynamic = 'force-dynamic'

export default async function PerfilAtletaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  let profile = null
  let isEscolinha = false
  let escolinhaId = null
  let escolinha_data: any = null
  let initialIsFavorite = false
  let initialHasInterest = false

  if (user) {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()
    profile = profileData

    console.log('DEBUG PERFIL ATLETA:', {
      userId: user.id,
      email: user.email,
      profileExists: !!profile,
      profileStatus: profile?.status,
      profileIsAdmin: profile?.is_admin
    })

    // Strict Lockout for unverified users
    if (profile && profile.status !== 'ativo' && !profile.is_admin) {
      console.log('PERFIL ATLETA REDIRECTING TO WAITING PAGE...')
      redirect('/aguardando-verificacao')
    }

    isEscolinha = profile?.role === 'escolinha'

    if (isEscolinha) {
      const { data: c } = await supabase.from('escolinhas').select('id, foto_url, verificado').eq('user_id', user.id).single()
      if (c) {
        escolinhaId = c.id
        escolinha_data = c
        const { data: fav } = await supabase.from('favoritos').select('id').eq('atleta_id', id).eq('escolinha_id', c.id).single()
        initialIsFavorite = !!fav
        const { data: int } = await supabase.from('interesses').select('id').eq('atleta_id', id).eq('escolinha_id', c.id).single()
        initialHasInterest = !!int
      }
    }
  }

  const { data: atleta } = await supabase
    .from('atletas')
    .select(`*, atleta_stats(*), atleta_videos(*), atleta_conquistas(*)`)
    .eq('id', id)
    .eq('visivel', true)
    .single()

  if (!atleta) notFound()

  // REGISTRAR VISITA (Robusta) — sem bloquear o render principal
  try {
    const heads = await headers()
    const ip = heads.get('x-forwarded-for')?.split(',')[0] || heads.get('x-real-ip') || '127.0.0.1'

    // Chama a RPC de forma assíncrona (não await para não atrasar o LCP)
    supabase.rpc('fn_registrar_visita', {
      p_page_path: `/perfil/${id}`,
      p_ip_address: ip,
      p_user_id: user?.id || null
    }).then(() => { })
  } catch (err) {
    console.error('Erro ao registrar visita:', err)
  }

  const userFotoUrl = isEscolinha
    ? (escolinha_data?.foto_url ?? profile?.foto_url ?? null)
    : (profile?.foto_url ?? null)

  const isOwner = user && profile?.id === atleta.responsavel_id

  return (
    <>
      {user && profile ? (
        <NavbarDashboard
          userName={profile.nome}
          userRole={profile.role}
          verificado={escolinha_data?.verificado ?? false}
          userId={user.id}
          userFotoUrl={userFotoUrl}
        />
      ) : (
        <NavbarPublic />
      )}

      <main className="min-h-screen bg-white">
        {/* Header/Cover Section */}
        <div className="relative bg-neutral-900 overflow-hidden pt-16 sm:pt-20">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 relative pb-10 sm:pb-16 flex flex-col md:flex-row gap-6 sm:gap-10 items-center md:items-end">
            {/* Foto de Perfil */}
            <div className="relative group flex-shrink-0 animate-in fade-in zoom-in duration-500">
               <Avatar 
                src={atleta.foto_url} 
                nome={atleta.nome} 
                size="xl" 
                className="border-4 border-white shadow-2xl"
              />
              {atleta.destaque_ativo && (
                <div className="absolute -top-3 -right-3 bg-amber-400 text-amber-950 p-2.5 rounded-full shadow-lg border-2 border-white animate-bounce">
                  <Star size={18} fill="currentColor" />
                </div>
              )}
            </div>

            {/* Nome e Info Básica */}
            <div className="text-center md:text-left flex-1 animate-in fade-in slide-in-from-left duration-500 delay-150">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-white/80 text-[10px] sm:text-xs font-semibold tracking-wider mb-3">
                <Landmark size={12} className="text-green-400" />
                {atleta.posicao?.toUpperCase() || 'POSIÇÃO'} • {atleta.clube_atual?.toUpperCase() || 'SEM CLUBE'}
              </div>
              
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl text-white tracking-tight leading-none mb-3">
                {atleta.nome.toUpperCase()}
              </h1>

              <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 sm:gap-6 text-white/60 text-xs sm:text-sm">
                <div className="flex items-center gap-2">
                  <MapPin size={14} className="text-green-500" />
                  {atleta.cidade}, {atleta.estado}
                </div>
                <div className="flex items-center gap-2">
                  <Trophy size={14} className="text-amber-500" />
                  {calcularIdade(atleta.data_nascimento)} ANOS
                </div>
                <div className="flex items-center gap-2">
                  <Star size={14} className="text-blue-500" />
                  {atleta.pe_dominante === 'canhoto' ? 'CANHOTO' : atleta.pe_dominante === 'destro' ? 'DESTRO' : 'AMBIDESTRO'}
                </div>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto animate-in fade-in slide-in-from-right duration-500 delay-300">
              {isOwner ? (
                <Link href="/configuracoes">
                  <Button variant="outline" className="w-full sm:w-auto bg-white/5 border-white/20 text-white hover:bg-white/10 py-6 px-8 rounded-2xl flex items-center justify-center gap-2">
                    <Edit2 size={16} /> Editar Perfil
                  </Button>
                </Link>
              ) : (
                <AthleteActions 
                  atletaId={id}
                  escolinhaId={escolinhaId}
                  initialIsFavorite={initialIsFavorite}
                  initialHasInterest={initialHasInterest}
                  aceitarMensagens={atleta.aceitar_mensagens}
                />
              )}
            </div>
          </div>
        </div>

        {/* Informações detalhadas */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 sm:gap-16">
            
            {/* Coluna Esquerda: Skills e Atributos */}
            <div className="lg:col-span-2 space-y-12">
              
              {/* Descrição */}
              {atleta.descricao && (
                <section className="animate-in fade-in duration-700">
                  <h2 className="font-display text-2xl text-neutral-900 mb-6 flex items-center gap-3">
                    <span className="w-2 h-8 bg-green-500 rounded-full" />
                    SOBRE O ATLETA
                  </h2>
                  <p className="text-neutral-600 leading-relaxed text-base sm:text-lg">
                    {atleta.descricao}
                  </p>
                </section>
              )}

              {/* Habilidades Técnicas */}
              <section className="animate-in fade-in duration-700 delay-200">
                <h2 className="font-display text-2xl text-neutral-900 mb-8 flex items-center gap-3">
                  <span className="w-2 h-8 bg-blue-500 rounded-full" />
                  ATRIBUTOS TÉCNICOS
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
                  <SkillBar label="Técnica" value={atleta.habilidade_tecnica} />
                  <SkillBar label="Velocidade" value={atleta.habilidade_velocidade} />
                  <SkillBar label="Visão de Jogo" value={atleta.habilidade_visao} />
                  <SkillBar label="Físico" value={atleta.habilidade_fisico} />
                  <SkillBar label="Finalização" value={atleta.habilidade_finalizacao} />
                  <SkillBar label="Passes" value={atleta.habilidade_passes} />
                </div>
              </section>

              {/* Galeria de Mídia */}
              <section className="animate-in fade-in duration-700 delay-400">
                <h2 className="font-display text-2xl text-neutral-900 mb-8 flex items-center gap-3">
                  <span className="w-2 h-8 bg-amber-500 rounded-full" />
                  MÍDIA E DESTAQUES
                </h2>
                <MediaGallery 
                  photos={atleta.fotos_adicionais || []} 
                  videos={atleta.atleta_videos || []} 
                />
              </section>
            </div>

            {/* Coluna Direita: Conquistas e Sidebar */}
            <div className="space-y-12">
              
              {/* Conquistas (Trophies) */}
              <section className="animate-in fade-in slide-in-from-right duration-700 delay-300">
                <h2 className="font-display text-xl text-neutral-900 mb-6 flex items-center gap-3">
                  <Trophy size={20} className="text-amber-500" />
                  CONQUISTAS
                </h2>
                <div className="space-y-4">
                  {atleta.atleta_conquistas && atleta.atleta_conquistas.length > 0 ? (
                    atleta.atleta_conquistas.map((conquista: any) => (
                      <div key={conquista.id} className="bg-neutral-50 border border-neutral-100 p-5 rounded-2xl group hover:bg-neutral-100 transition-colors">
                        <div className="text-xs font-bold text-amber-600 mb-1">{conquista.ano}</div>
                        <div className="font-semibold text-neutral-900 mb-1 group-hover:text-amber-700 transition-colors">{conquista.titulo}</div>
                        {conquista.descricao && (
                          <div className="text-xs text-neutral-500 leading-relaxed font-medium">{conquista.descricao}</div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="py-10 text-center bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
                      <Trophy size={24} className="text-neutral-300 mx-auto mb-2" />
                      <p className="text-xs text-neutral-400 font-medium">Nenhuma conquista registrada.</p>
                    </div>
                  )}
                </div>
              </section>

              {/* Sidebar Info Card */}
              <div className="bg-green-700 rounded-3xl p-8 text-white shadow-xl animate-in fade-in duration-700 delay-500">
                <h3 className="font-display text-xl mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
                  RESUMO DO ATLETA
                </h3>
                <div className="space-y-6">
                  <SidebarItem label="Altura" value={atleta.atleta_stats?.[0]?.altura ? `${atleta.atleta_stats[0].altura} cm` : '—'} />
                  <SidebarItem label="Peso" value={atleta.atleta_stats?.[0]?.peso ? `${atleta.atleta_stats[0].peso} kg` : '—'} />
                  <SidebarItem label="Clube Atual" value={atleta.clube_atual || 'Sem clube'} />
                  <SidebarItem label="Pé Dominante" value={atleta.pe_dominante === 'canhoto' ? 'Canhoto' : atleta.pe_dominante === 'destro' ? 'Destro' : 'Ambidestro'} />
                  <SidebarItem label="Visibilidade" value={atleta.visivel ? 'Perfil Público' : 'Privado'} />
                </div>
                
                {!isOwner && (
                  <Button className="w-full mt-10 py-7 bg-white text-green-700 hover:bg-green-50 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg">
                    <Send size={18} /> ENVIAR MENSAGEM
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

function SidebarItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-white/50 text-[10px] uppercase font-bold tracking-widest mb-1">{label}</div>
      <div className="text-base font-semibold">{value}</div>
    </div>
  )
}
import { createSupabaseServer } from '@/lib/supabase-server'
import { notFound, redirect } from 'next/navigation'
import { NavbarPublic } from '@/components/layout/Navbar'
import { NavbarDashboard } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Navbar'
import { Badge, SkillBar } from '@/components/ui/index'
import { POSICAO_LABEL, ESTADO_LABEL, calcularIdade } from '@/lib/utils'
import { MapPin, Landmark, Star, Send, Trophy, Target, Award, Play, BarChart2, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default async function PerfilAtletaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  // Busca atleta com dados relacionados
  const { data: atleta } = await supabase
    .from('atletas')
    .select(`
      *,
      atleta_stats(*),
      atleta_videos(*),
      atleta_conquistas(*)
    `)
    .eq('id', id)
    .eq('visivel', true)
    .single()

  if (!atleta) notFound()

  let profile = null
  let isClube = false
  if (user) {
    const { data } = await supabase.from('profiles').select('*').eq('user_id', user.id).single()
    profile = data
    isClube = profile?.role === 'clube'
  }

  const idade = calcularIdade(atleta.data_nascimento)
  const statsAtual = atleta.atleta_stats?.sort((a: any, b: any) => b.temporada - a.temporada)[0]

  const habilidades = [
    { label: 'Técnica', value: atleta.habilidade_tecnica, color: 'green' as const },
    { label: 'Velocidade', value: atleta.habilidade_velocidade, color: 'amber' as const },
    { label: 'Visão de jogo', value: atleta.habilidade_visao, color: 'green' as const },
    { label: 'Físico', value: atleta.habilidade_fisico, color: 'amber' as const },
    { label: 'Finalização', value: atleta.habilidade_finalizacao, color: 'green' as const },
    { label: 'Passes', value: atleta.habilidade_passes, color: 'green' as const },
  ]

  const Navbar = user && profile
    ? <NavbarDashboard userName={profile.nome} userRole={profile.role} />
    : <NavbarPublic />

  return (
    <>
      {Navbar}
      <main className="max-w-6xl mx-auto px-6 py-8">

        {/* Back */}
        <Link href="/busca" className="inline-flex items-center gap-1.5 text-sm text-neutral-400 hover:text-neutral-700 mb-6 transition-colors">
          <ArrowLeft size={14} /> Voltar para busca
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Sidebar */}
          <aside className="lg:col-span-1 flex flex-col gap-4">

            {/* Profile card */}
            <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
              <div className="bg-green-100 px-5 pt-6 pb-3 flex items-end gap-3 relative min-h-[100px]">
                <div className="w-16 h-16 rounded-full bg-green-400 text-white flex items-center justify-center font-display text-2xl flex-shrink-0">
                  {atleta.nome.split(' ').map((p: string) => p[0]).slice(0,2).join('').toUpperCase()}
                </div>
                <div className="font-display text-8xl text-green-400/20 absolute right-4 bottom-0 leading-none">
                  {atleta.posicao}
                </div>
              </div>
              <div className="p-5">
                <h1 className="font-display text-2xl text-neutral-900 leading-tight mb-0.5">{atleta.nome}</h1>
                <p className="text-sm text-neutral-500 mb-3">{POSICAO_LABEL[atleta.posicao]}</p>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="outline">{idade} anos</Badge>
                  {atleta.exibir_cidade && (
                    <Badge variant="outline">{atleta.cidade}, {atleta.estado}</Badge>
                  )}
                  <Badge variant="outline">{atleta.pe_dominante === 'destro' ? 'Destro' : atleta.pe_dominante === 'canhoto' ? 'Canhoto' : 'Ambidestro'}</Badge>
                </div>
                {atleta.clube_atual && (
                  <div className="flex items-center gap-1.5 text-sm text-neutral-500 mb-3">
                    <Landmark size={13} className="text-neutral-400" />
                    {atleta.clube_atual}
                  </div>
                )}
                {atleta.destaque_ativo && (
                  <Badge variant="amber" className="mb-4">Em destaque</Badge>
                )}

                {/* Actions */}
                {isClube ? (
                  <div className="flex flex-col gap-2 mt-4">
                    {atleta.aceitar_mensagens ? (
                      <Button variant="dark" className="w-full justify-center">
                        <Send size={14} /> Contatar responsável
                      </Button>
                    ) : (
                      <Button variant="outline" className="w-full justify-center">
                        <Star size={14} /> Marcar interesse
                      </Button>
                    )}
                    <Button variant="outline" className="w-full justify-center">
                      <Star size={14} /> Salvar nos favoritos
                    </Button>
                  </div>
                ) : !user ? (
                  <Link href="/login" className="block mt-4">
                    <Button variant="dark" className="w-full justify-center">Entrar para contatar</Button>
                  </Link>
                ) : null}
              </div>
            </div>

            {/* Stats season */}
            {statsAtual && (
              <div className="bg-white border border-neutral-200 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart2 size={15} className="text-neutral-400" />
                  <span className="text-sm font-medium">Temporada {statsAtual.temporada}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ['Jogos', statsAtual.jogos],
                    ['Gols', statsAtual.gols],
                    ['Assists', statsAtual.assistencias],
                    ['Nota média', statsAtual.nota_media],
                  ].map(([label, value]) => (
                    <div key={label as string} className="bg-neutral-50 rounded-lg p-3 text-center">
                      <div className="font-display text-2xl text-green-700 leading-none">{value as number}</div>
                      <div className="text-xs text-neutral-400 mt-1">{label as string}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </aside>

          {/* Main content */}
          <main className="lg:col-span-2 flex flex-col gap-5">

            {/* Sobre */}
            {atleta.descricao && (
              <Section title="Sobre o atleta">
                <p className="text-sm text-neutral-600 leading-relaxed">{atleta.descricao}</p>
              </Section>
            )}

            {/* Dados físicos */}
            {(atleta.altura_cm || atleta.peso_kg) && (
              <Section title="Dados físicos">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {atleta.altura_cm && <DataItem label="Altura" value={`${atleta.altura_cm}cm`} />}
                  {atleta.peso_kg && <DataItem label="Peso" value={`${atleta.peso_kg}kg`} />}
                  <DataItem label="Pé dominante" value={atleta.pe_dominante === 'destro' ? 'Destro' : atleta.pe_dominante === 'canhoto' ? 'Canhoto' : 'Ambidestro'} />
                  {atleta.posicao_secundaria && <DataItem label="Posição sec." value={POSICAO_LABEL[atleta.posicao_secundaria]} />}
                </div>
              </Section>
            )}

            {/* Habilidades */}
            <Section title="Habilidades">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                {habilidades.map(h => (
                  <SkillBar key={h.label} label={h.label} value={h.value} color={h.color} />
                ))}
              </div>
            </Section>

            {/* Conquistas */}
            {atleta.atleta_conquistas && atleta.atleta_conquistas.length > 0 && (
              <Section title="Conquistas">
                <div className="flex flex-col gap-3">
                  {atleta.atleta_conquistas.map((c: any, i: number) => {
                    const icons = [<Trophy size={16} />, <Target size={16} />, <Award size={16} />]
                    const colors = ['bg-amber-100 text-amber-700', 'bg-green-100 text-green-700', 'bg-blue-100 text-blue-700']
                    return (
                      <div key={c.id} className="flex items-start gap-3 bg-neutral-50 rounded-lg p-3">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${colors[i % 3]}`}>
                          {icons[i % 3]}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-neutral-900">{c.titulo}</div>
                          {c.descricao && <div className="text-xs text-neutral-400 mt-0.5">{c.descricao}</div>}
                          <div className="text-xs text-neutral-400 mt-0.5">{c.ano}</div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </Section>
            )}

            {/* Vídeos */}
            {atleta.atleta_videos && atleta.atleta_videos.length > 0 && (
              <Section title="Vídeos de jogos">
                <div className="flex flex-col gap-3">
                  {atleta.atleta_videos.map((v: any) => (
                    <a key={v.id} href={v.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-4 border border-neutral-200 rounded-lg p-3 hover:bg-neutral-50 transition-colors">
                      <div className="w-16 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-700 flex-shrink-0">
                        <Play size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-neutral-900 truncate">{v.titulo}</div>
                        {v.duracao_segundos && (
                          <div className="text-xs text-neutral-400 mt-0.5">
                            {Math.floor(v.duracao_segundos / 60)}:{String(v.duracao_segundos % 60).padStart(2, '0')}
                          </div>
                        )}
                      </div>
                    </a>
                  ))}
                </div>
              </Section>
            )}

            {/* Gate para não logados */}
            {!user && (
              <div className="bg-green-700 rounded-xl p-6 text-center text-white">
                <h3 className="font-display text-2xl mb-2">QUER CONTATAR ESTE ATLETA?</h3>
                <p className="text-sm text-white/70 mb-4">Crie uma conta de clube para enviar interesse e entrar em contato com a família.</p>
                <div className="flex gap-3 justify-center">
                  <Link href="/cadastro?tipo=clube"><Button variant="amber">Criar conta de clube</Button></Link>
                  <Link href="/login"><Button variant="outline" className="text-white border-white/30 hover:bg-white/10">Já tenho conta</Button></Link>
                </div>
              </div>
            )}

          </main>
        </div>
      </main>
      <Footer />
    </>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-neutral-100">
        <h2 className="text-sm font-medium text-neutral-700">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function DataItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-neutral-50 rounded-lg p-3">
      <div className="text-xs text-neutral-400 uppercase tracking-wide mb-1">{label}</div>
      <div className="text-sm font-medium text-neutral-900">{value}</div>
    </div>
  )
}

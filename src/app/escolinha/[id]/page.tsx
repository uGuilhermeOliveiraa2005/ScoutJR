import { createSupabaseServer } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import { NavbarPublic, NavbarDashboard, Footer } from '@/components/layout/Navbar'
import { Avatar } from '@/components/ui/Avatar'
import {
  MapPin, ShieldCheck, ArrowLeft, Image as ImageIcon,
  Users, Star, MessageCircle, Trophy, Phone, Mail,
  Calendar, CheckCircle, Globe
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export default async function PerfilEscolinhaPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: escolinha } = await supabase
    .from('escolinhas')
    .select('*')
    .eq('id', id)
    .single()

  if (!escolinha) notFound()

  // Busca atletas que têm essa escolinha como atual
  const { data: atletasRelacionados } = await supabase
    .from('atletas')
    .select('id, nome, posicao, foto_url, habilidade_tecnica, habilidade_visao, habilidade_passes')
    .eq('escolinha_atual', escolinha.nome)
    .eq('visivel', true)
    .limit(6)

  // Conta interesses e favoritos da escolinha
  const { count: totalInteresses } = await supabase
    .from('interesses')
    .select('*', { count: 'exact', head: true })
    .eq('escolinha_id', id)

  const { count: totalFavoritos } = await supabase
    .from('favoritos')
    .select('*', { count: 'exact', head: true })
    .eq('escolinha_id', id)

  let profile = null
  if (user) {
    const { data: p } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()
    profile = p
  }

  const userFotoUrl = profile?.foto_url ?? null
  const fotosList = Array.isArray(escolinha.fotos_adicionais)
    ? escolinha.fotos_adicionais.filter(Boolean)
    : []

  const Navbar = user && profile
    ? <NavbarDashboard
      userName={profile.nome}
      userRole={profile.role}
      userId={user.id}
      userFotoUrl={userFotoUrl}
    />
    : <NavbarPublic />

  // Ano de fundação simulado a partir do created_at
  const anoFundacao = escolinha.created_at
    ? new Date(escolinha.created_at).getFullYear()
    : null

  return (
    <>
      {Navbar}
      <main className="pb-24 md:pb-0">

        {/* ── Hero Banner ── */}
        <div className="relative bg-gradient-to-br from-green-800 via-green-700 to-green-900 overflow-hidden">
          {/* Padrão de fundo decorativo */}
          <div className="absolute inset-0 opacity-10 pointer-events-none select-none">
            <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full bg-white/20" />
            <div className="absolute -bottom-10 -left-10 w-64 h-64 rounded-full bg-white/10" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/10" />
          </div>

          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-16 sm:pb-20">
            {/* Voltar */}
            <Link
              href="/busca"
              className="inline-flex items-center gap-1.5 text-white/60 hover:text-white text-xs sm:text-sm mb-6 sm:mb-8 transition-colors"
            >
              <ArrowLeft size={14} /> Voltar para busca
            </Link>

            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 sm:gap-6">
              {/* Logo */}
              <div className="flex-shrink-0">
                <Avatar
                  src={escolinha.foto_url ?? escolinha.logo_url}
                  nome={escolinha.nome}
                  size="2xl"
                  colorClass="bg-white text-green-700"
                  className="border-4 border-white/30 shadow-2xl ring-4 ring-white/10"
                />
              </div>

              {/* Info principal */}
              <div className="flex-1 text-center sm:text-left">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                  {escolinha.verificado && (
                    <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm text-white text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full border border-white/20 uppercase tracking-widest">
                      <ShieldCheck size={11} /> Verificado
                    </span>
                  )}
                  {anoFundacao && (
                    <span className="inline-flex items-center gap-1.5 bg-white/10 text-white/70 text-[10px] sm:text-xs px-2.5 py-1 rounded-full border border-white/10">
                      <Calendar size={10} /> Desde {anoFundacao}
                    </span>
                  )}
                </div>

                <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-white leading-tight tracking-tight mb-2">
                  {escolinha.nome.toUpperCase()}
                </h1>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4 text-white/70">
                  <span className="flex items-center gap-1.5 text-xs sm:text-sm">
                    <MapPin size={14} className="text-white/50" />
                    {escolinha.cidade}, {escolinha.estado}
                  </span>
                  {escolinha.cnpj && (
                    <span className="flex items-center gap-1.5 text-xs sm:text-sm">
                      <Globe size={14} className="text-white/50" />
                      CNPJ: {escolinha.cnpj}
                    </span>
                  )}
                </div>
              </div>

              {/* Stats rápidos — desktop */}
              <div className="hidden sm:flex flex-col gap-2 flex-shrink-0">
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-center min-w-[100px]">
                  <div className="font-display text-3xl text-white leading-none">{totalInteresses ?? 0}</div>
                  <div className="text-[10px] text-white/60 uppercase tracking-widest mt-1">Interesses</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 text-center">
                  <div className="font-display text-3xl text-white leading-none">{totalFavoritos ?? 0}</div>
                  <div className="text-[10px] text-white/60 uppercase tracking-widest mt-1">Favoritos</div>
                </div>
              </div>
            </div>
          </div>

          {/* Curva de corte */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
              <path d="M0 40H1440V0C1440 0 1080 40 720 40C360 40 0 0 0 0V40Z" fill="#f7f6f2" />
            </svg>
          </div>
        </div>

        {/* ── Conteúdo ── */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

          {/* Stats mobile */}
          <div className="sm:hidden grid grid-cols-2 gap-3 mb-6">
            {[
              { label: 'Interesses', value: totalInteresses ?? 0, icon: <Star size={16} /> },
              { label: 'Favoritos', value: totalFavoritos ?? 0, icon: <MessageCircle size={16} /> },
            ].map(s => (
              <div key={s.label} className="bg-white border border-neutral-200 rounded-xl p-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-green-100 text-green-700 flex items-center justify-center flex-shrink-0">
                  {s.icon}
                </div>
                <div>
                  <div className="font-display text-2xl text-neutral-900 leading-none">{s.value}</div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">

            {/* ── Coluna principal ── */}
            <div className="lg:col-span-2 flex flex-col gap-5 sm:gap-6">

              {/* Sobre */}
              {escolinha.descricao ? (
                <Section title="Sobre a Escolinha">
                  <p className="text-sm text-neutral-600 leading-relaxed text-justify whitespace-pre-wrap">
                    {escolinha.descricao}
                  </p>
                </Section>
              ) : (
                <Section title="Sobre a Escolinha">
                  <div className="py-6 text-center">
                    <p className="text-sm text-neutral-400 italic">Esta escolinha ainda não adicionou uma descrição.</p>
                  </div>
                </Section>
              )}

              {/* Galeria de fotos */}
              {fotosList.length > 0 && (
                <Section title="Estrutura & Instalações">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {fotosList.map((fotoUrl: string, index: number) => (
                      <a
                        key={index}
                        href={fotoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block aspect-[4/3] rounded-xl overflow-hidden bg-neutral-100 border border-neutral-200 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group"
                      >
                        <img
                          src={fotoUrl}
                          alt={`Instalação ${index + 1}`}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </a>
                    ))}
                  </div>
                </Section>
              )}

              {/* Atletas vinculados */}
              {atletasRelacionados && atletasRelacionados.length > 0 && (
                <Section title={`Atletas da ${escolinha.nome}`}>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {atletasRelacionados.map((atleta: any) => {
                      const nota = Math.round(
                        (atleta.habilidade_tecnica + atleta.habilidade_visao + atleta.habilidade_passes) / 3
                      )
                      return (
                        <Link
                          key={atleta.id}
                          href={user ? `/perfil/${atleta.id}` : '/login'}
                          className="bg-neutral-50 border border-neutral-200 rounded-xl p-3 hover:border-green-300 hover:bg-green-50/30 transition-all group"
                        >
                          <div className="flex items-center gap-2.5 mb-2">
                            <Avatar
                              src={atleta.foto_url}
                              nome={atleta.nome}
                              size="sm"
                              colorClass="bg-green-400 text-white"
                            />
                            <div className="min-w-0">
                              <div className="text-xs font-semibold text-neutral-900 truncate group-hover:text-green-700 transition-colors">
                                {atleta.nome.split(' ')[0]}
                              </div>
                              <div className="text-[10px] text-neutral-400">{atleta.posicao}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="flex-1 h-1 bg-neutral-200 rounded-full overflow-hidden">
                              <div className="h-full bg-green-400 rounded-full" style={{ width: `${nota}%` }} />
                            </div>
                            <span className="text-[10px] font-medium text-neutral-500">{nota}</span>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                  <div className="mt-4 text-center">
                    <Link href={`/busca`}>
                      <Button variant="outline" size="sm" className="text-xs">
                        Ver todos os atletas
                      </Button>
                    </Link>
                  </div>
                </Section>
              )}

              {/* Sem fotos placeholder */}
              {fotosList.length === 0 && (!atletasRelacionados || atletasRelacionados.length === 0) && (
                <Section title="Estrutura & Instalações">
                  <div className="py-10 text-center">
                    <ImageIcon size={36} className="mx-auto text-neutral-200 mb-3" />
                    <p className="text-sm text-neutral-400">Nenhuma foto da estrutura adicionada ainda.</p>
                  </div>
                </Section>
              )}
            </div>

            {/* ── Sidebar ── */}
            <div className="flex flex-col gap-4 sm:gap-5">

              {/* Card de info */}
              <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-neutral-100 bg-neutral-50">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500">
                    Informações
                  </h3>
                </div>
                <div className="p-5 flex flex-col gap-4">
                  <InfoRow
                    icon={<MapPin size={15} className="text-green-600" />}
                    label="Localização"
                    value={`${escolinha.cidade}, ${escolinha.estado}`}
                  />
                  {escolinha.cnpj && (
                    <InfoRow
                      icon={<Globe size={15} className="text-green-600" />}
                      label="CNPJ"
                      value={escolinha.cnpj}
                    />
                  )}
                  {anoFundacao && (
                    <InfoRow
                      icon={<Calendar size={15} className="text-green-600" />}
                      label="Na plataforma desde"
                      value={String(anoFundacao)}
                    />
                  )}
                  {escolinha.verificado && (
                    <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-100 rounded-xl">
                      <ShieldCheck size={18} className="text-green-600 flex-shrink-0" />
                      <div>
                        <div className="text-xs font-bold text-green-800">Escolinha Verificada</div>
                        <div className="text-[10px] text-green-600 mt-0.5">
                          Identidade confirmada pela ScoutJR
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Diferenciais */}
              <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-neutral-100 bg-neutral-50">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-500">
                    Por que escolher
                  </h3>
                </div>
                <div className="p-5 flex flex-col gap-3">
                  {[
                    'Perfil verificado na plataforma',
                    'Busca ativa por novos talentos',
                    'Contato direto com responsáveis',
                    'Comprometida com o desenvolvimento',
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-neutral-600 leading-relaxed">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* CTA para responsáveis */}
              {!user && (
                <div className="bg-green-700 rounded-2xl p-5 text-white text-center">
                  <Trophy size={28} className="mx-auto mb-3 text-amber-400" />
                  <h3 className="font-display text-xl mb-1">Seu filho pode estar aqui</h3>
                  <p className="text-xs text-white/70 leading-relaxed mb-4">
                    Crie o perfil gratuitamente e deixe que esta escolinha o descubra.
                  </p>
                  <Link href="/cadastro">
                    <Button variant="amber" className="w-full justify-center text-sm">
                      Criar perfil grátis
                    </Button>
                  </Link>
                </div>
              )}

              {user && profile?.role === 'responsavel' && (
                <div className="bg-green-50 border border-green-100 rounded-2xl p-5 text-center">
                  <h3 className="text-sm font-medium text-green-800 mb-1.5">
                    Interessado nesta escolinha?
                  </h3>
                  <p className="text-xs text-green-600 leading-relaxed mb-4">
                    Explore os atletas da plataforma e aguarde o contato desta escolinha.
                  </p>
                  <Link href="/busca">
                    <Button variant="dark" size="sm" className="w-full justify-center text-xs">
                      Ver atletas em destaque
                    </Button>
                  </Link>
                </div>
              )}

              {/* Outras escolinhas */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 sm:p-5">
                <p className="text-[10px] text-neutral-400 uppercase tracking-widest font-bold mb-3">
                  Explore mais escolinhas
                </p>
                <Link href="/busca">
                  <Button variant="outline" size="sm" className="w-full justify-center text-xs">
                    Ver todas as escolinhas
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

// ── Componentes auxiliares ──────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="px-5 py-4 border-b border-neutral-100 bg-neutral-50">
        <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-500">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function InfoRow({
  icon, label, value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-7 h-7 rounded-lg bg-green-50 flex items-center justify-center flex-shrink-0 mt-0.5">
        {icon}
      </div>
      <div>
        <div className="text-[10px] text-neutral-400 uppercase tracking-wide font-medium">{label}</div>
        <div className="text-sm text-neutral-800 font-medium mt-0.5">{value}</div>
      </div>
    </div>
  )
}
import Link from 'next/link'
import { NavbarPublic, Footer } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import {
  Zap, Shield, BadgeCheck, Check, UserPlus, Search,
  Handshake, ArrowRight, TrendingUp, Users, SlidersHorizontal,
  Star, MessageCircle, BarChart2, CheckCircle,
} from 'lucide-react'

import { headers } from 'next/headers'
import { createSupabaseServer } from '@/lib/supabase-server'

export default async function HomePage() {
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  // REGISTRAR VISITA Home
  try {
    const heads = await headers()
    const ip = heads.get('x-forwarded-for')?.split(',')[0] || heads.get('x-real-ip') || '127.0.0.1'
    
    supabase.rpc('fn_registrar_visita', {
      p_page_path: '/',
      p_ip_address: ip,
      p_user_id: user?.id || null
    }).then(() => {})
  } catch (err) {
    console.error('Erro ao registrar visita home:', err)
  }

  return (
    <>
      <NavbarPublic />
      <main>
        <HeroSection />
        <StatsBar />
        <HowItWorksSection />
        <ForWhoSection />
        <CtaSection />
      </main>
      <Footer />
    </>
  )
}

// -----------------------------------------------
// Hero
// -----------------------------------------------
function HeroSection() {
  return (
    <section className="relative bg-white overflow-hidden pt-12 sm:pt-16 lg:pt-20 pb-0">
      {/* Decorative blobs */}
      <div className="absolute right-[-60px] top-[-80px] w-[260px] h-[260px] sm:w-[400px] sm:h-[400px] lg:w-[480px] lg:h-[480px] rounded-full bg-green-50 opacity-70 pointer-events-none" />
      <div className="absolute right-[60px] sm:right-[140px] top-[40px] w-[100px] h-[100px] sm:w-[150px] sm:h-[150px] lg:w-[180px] lg:h-[180px] rounded-full bg-amber-50 opacity-80 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center pb-16 sm:pb-20 lg:pb-16 lg:min-h-[560px]">

          {/* Left — copy */}
          <div className="animate-fade-up pt-2 lg:pt-0">
            <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 text-[10px] sm:text-xs font-medium px-3 py-1.5 rounded-full mb-5 sm:mb-6 uppercase tracking-wide">
              <Zap size={11} />
              Plataforma de talentos do futebol infantil
            </div>

            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl leading-none tracking-wide mb-4 sm:mb-5">
              O <span className="text-green-400">FUTURO</span> DO<br />
              FUTEBOL COMEÇA<br />
              AQUI.
            </h1>

            <p className="text-neutral-500 text-base sm:text-lg leading-relaxed mb-7 sm:mb-8 max-w-md">
              A vitrine digital para jovens atletas. Pais criam o perfil, escolinhas e olheiros descobrem o próximo craque.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-8 sm:mb-10">
              <Link href="/cadastro" className="w-full sm:w-auto">
                <Button variant="dark" size="lg" className="w-full sm:w-auto justify-center">
                  Criar perfil — é grátis
                </Button>
              </Link>
              <Link href="/busca" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-base font-medium rounded-lg border-2 border-neutral-300 bg-white text-neutral-800 hover:border-neutral-400 hover:bg-neutral-50 transition-all duration-150">
                  Explorar atletas <ArrowRight size={15} />
                </button>
              </Link>
            </div>

            <div className="flex flex-wrap gap-4 sm:gap-6">
              {[
                { icon: <Check size={13} />, label: '100% gratuito' },
                { icon: <Shield size={13} />, label: 'Dados protegidos' },
                { icon: <BadgeCheck size={13} />, label: 'Fácil de usar' },
              ].map(item => (
                <span key={item.label} className="flex items-center gap-1.5 text-xs text-neutral-400">
                  {item.icon} {item.label}
                </span>
              ))}
            </div>
          </div>

          {/* Right — hero card */}
          <div className="relative flex justify-center lg:justify-end py-6 lg:py-10">
            <div className="w-full max-w-[300px] sm:max-w-[320px]">
              <HeroPlayerCard />
            </div>
            <FloatBadge
              className="hidden sm:flex absolute bottom-4 -left-4 lg:-left-10 animate-float"
              title="Novo interesse!"
              sub="Grêmio FBPA visualizou o perfil"
            />
            <FloatBadge
              className="hidden sm:flex absolute top-4 -left-2 lg:-left-6 animate-float-delay"
              title="180 escolinhas ativas"
              sub="buscando talentos agora"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function HeroPlayerCard() {
  return (
    <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-lg">
      <div className="bg-green-100 px-4 pt-4 pb-3 flex items-end gap-3 relative">
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-green-400 flex items-center justify-center font-display text-lg sm:text-xl text-white flex-shrink-0">
          GS
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-display text-lg sm:text-xl text-green-700 truncate">Gabriel Silva</div>
          <div className="text-[10px] sm:text-xs font-medium text-green-600">Meia-atacante · 13 anos</div>
        </div>
        <div className="font-display text-5xl sm:text-7xl text-green-400/20 absolute right-3 bottom-0 leading-none select-none">10</div>
      </div>
      <div className="p-3 sm:p-4">
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mb-3 sm:mb-4">
          {[['23', 'Gols'], ['31', 'Assists'], ['47', 'Jogos'], ['9.1', 'Nota']].map(([v, l]) => (
            <div key={l} className="bg-neutral-50 rounded-lg p-1.5 sm:p-2 text-center">
              <div className="font-display text-lg sm:text-xl text-green-700 leading-none">{v}</div>
              <div className="text-[8px] sm:text-[9px] text-neutral-400 mt-0.5">{l}</div>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-1.5 sm:gap-2">
          {[['Técnica', 88, 'green'], ['Visão', 91, 'green'], ['Velocidade', 75, 'amber']].map(([label, val, color]) => (
            <div key={label as string} className="flex items-center gap-2">
              <span className="text-[10px] sm:text-xs text-neutral-400 w-16 sm:w-20 flex-shrink-0">{label as string}</span>
              <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${color === 'green' ? 'bg-green-400' : 'bg-amber-500'}`} style={{ width: `${val}%` }} />
              </div>
              <span className="text-[10px] sm:text-xs font-medium text-neutral-600">{val as number}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="px-3 sm:px-4 py-2.5 sm:py-3 border-t border-neutral-100 flex justify-between items-center gap-2">
        <span className="bg-green-100 text-green-700 text-[9px] sm:text-xs font-medium px-2 py-0.5 rounded-full truncate">
          3 escolinhas interessadas
        </span>
        <Button size="sm" className="flex-shrink-0 text-xs">Ver perfil</Button>
      </div>
    </div>
  )
}

function FloatBadge({ title, sub, className }: { title: string; sub: string; className?: string }) {
  return (
    <div className={`flex items-center gap-2 sm:gap-3 bg-white border border-neutral-200 rounded-xl px-2.5 sm:px-3 py-2 sm:py-2.5 shadow-md max-w-[160px] sm:max-w-[200px] ${className}`}>
      <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-green-100 text-green-700 flex items-center justify-center flex-shrink-0">
        <TrendingUp size={14} />
      </div>
      <div>
        <div className="text-[10px] sm:text-xs font-medium text-neutral-900">{title}</div>
        <div className="text-[9px] sm:text-xs text-neutral-400 leading-tight">{sub}</div>
      </div>
    </div>
  )
}

// -----------------------------------------------
// Stats bar
// -----------------------------------------------
async function StatsBar() {
  const supabase = await createSupabaseServer()
  
  // Busca estatísticas reais
  const [
    { count: totalAtletas },
    { count: totalEscolinhas },
    { count: totalVisitas }
  ] = await Promise.all([
    supabase.from('atletas').select('*', { count: 'exact', head: true }),
    supabase.from('escolinhas').select('*', { count: 'exact', head: true }),
    supabase.from('visitas').select('*', { count: 'exact', head: true })
  ])

  const stats = [
    { num: `${(totalAtletas || 0).toLocaleString()}`, label: 'Atletas cadastrados' },
    { num: `${(totalEscolinhas || 0).toLocaleString()}`, label: 'Escolinhas parceiras' },
    { num: `${((totalVisitas || 0) + 1240).toLocaleString()}`, label: 'Visitas totais' }, // Base de 1240 + reais
    { num: '12', label: 'Estados cobertos' },
  ]

  return (
    <div className="bg-green-700 py-5 sm:py-6">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-0 divide-y-2 sm:divide-y-0 sm:divide-x divide-white/20">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center px-4 sm:px-8 py-4 sm:py-2">
              <div className="font-display text-2xl sm:text-3xl text-white leading-none">{stat.num}</div>
              <div className="text-[10px] sm:text-xs text-white/50 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// -----------------------------------------------
// How it works
// -----------------------------------------------
function HowItWorksSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-neutral-100" id="como-funciona">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="mb-10 sm:mb-14">
          <p className="text-[10px] sm:text-xs uppercase tracking-widest text-neutral-400 mb-2">Como funciona</p>
          <h2 className="font-display text-4xl sm:text-5xl text-neutral-900">
            DO PERFIL À <span className="text-green-400">ESCOLINHA</span><br className="hidden sm:block" />
            {' '}EM TRÊS PASSOS
          </h2>
        </div>

        {/* Mobile: cards verticais */}
        <div className="flex flex-col gap-4 sm:hidden">
          {[
            { num: '01', icon: <UserPlus size={20} />, title: 'Pais criam o perfil', desc: 'Responsáveis cadastram o atleta com posição, habilidades, fotos e vídeos. Rápido e seguro.' },
            { num: '02', icon: <Search size={20} />, title: 'Escolinhas buscam talentos', desc: 'Filtros por posição, idade, cidade e habilidades. Olheiros encontram exatamente quem procuram.' },
            { num: '03', icon: <Handshake size={20} />, title: 'Conexão direta e segura', desc: 'A escolinha contata os responsáveis. Nenhum dado da criança exposto. Família decide se aceita.' },
          ].map((step, i) => (
            <div key={step.num} className="bg-white border border-neutral-200 rounded-xl p-5 flex gap-4">
              <div className="flex-shrink-0">
                <div className="font-display text-3xl text-green-400/30 leading-none mb-2">{step.num}</div>
                <div className="w-10 h-10 rounded-xl bg-green-100 text-green-700 flex items-center justify-center">
                  {step.icon}
                </div>
              </div>
              <div className="pt-1">
                <h3 className="text-sm font-semibold mb-1.5 text-neutral-900">{step.title}</h3>
                <p className="text-xs text-neutral-500 leading-relaxed">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop: grid com setas */}
        <div className="hidden sm:grid grid-cols-3 gap-0 relative">
          {[
            { num: '01', icon: <UserPlus size={24} />, title: 'Pais criam o perfil', desc: 'Responsáveis cadastram o atleta com posição, habilidades, fotos e vídeos. Rápido e seguro.' },
            { num: '02', icon: <Search size={24} />, title: 'Escolinhas buscam talentos', desc: 'Filtros por posição, idade, cidade e habilidades. Olheiros encontram exatamente quem procuram.' },
            { num: '03', icon: <Handshake size={24} />, title: 'Conexão direta e segura', desc: 'A escolinha contata os responsáveis. Nenhum dado da criança exposto. Família decide se aceita.' },
          ].map((step, i) => (
            <div key={step.num} className="relative">
              <div className="p-8 lg:p-10">
                <div className="font-display text-5xl text-green-400/30 mb-4">{step.num}</div>
                <div className="w-14 h-14 rounded-xl bg-green-100 text-green-700 flex items-center justify-center mb-5">{step.icon}</div>
                <h3 className="text-lg font-semibold mb-2.5 text-neutral-900">{step.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{step.desc}</p>
              </div>
              {i < 2 && (
                <div className="hidden sm:flex items-center justify-center text-neutral-300 absolute" style={{ left: `${(i + 1) * 33.33}%`, top: '38%', transform: 'translateX(-50%)' }}>
                  <ArrowRight size={20} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// -----------------------------------------------
// For who
// -----------------------------------------------
function ForWhoSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white" id="para-quem">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-14">
          <p className="text-[10px] sm:text-xs uppercase tracking-widest text-neutral-400 mb-2">Para quem é</p>
          <h2 className="font-display text-4xl sm:text-5xl">
            UMA PLATAFORMA,{' '}
            <span className="text-green-400">DOIS MUNDOS</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {/* Famílias */}
          <div className="bg-green-50 border border-green-100 rounded-2xl p-6 sm:p-8">
            <p className="text-[10px] sm:text-xs uppercase tracking-widest text-green-600 font-semibold mb-3">Para famílias</p>
            <h3 className="font-display text-2xl sm:text-3xl text-neutral-900 mb-3">Seu filho merece ser visto</h3>
            <p className="text-sm text-neutral-500 leading-relaxed mb-6">
              Crie um perfil completo, adicione vídeos de jogos e acompanhe o interesse de escolinhas com total segurança.
            </p>
            <ul className="flex flex-col gap-3 mb-7">
              {[
                'Perfil gratuito para sempre',
                'Controle total de privacidade',
                'Notificações de interesse',
                'Fotos e vídeos em destaque',
              ].map(item => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-neutral-600">
                  <CheckCircle size={15} className="text-green-400 flex-shrink-0" /> {item}
                </li>
              ))}
            </ul>
            <Link href="/cadastro">
              <Button variant="dark" className="w-full sm:w-auto justify-center">Criar perfil grátis</Button>
            </Link>
          </div>

          {/* Escolinhas */}
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 sm:p-8">
            <p className="text-[10px] sm:text-xs uppercase tracking-widest text-amber-600 font-semibold mb-3">Para escolinhas</p>
            <h3 className="font-display text-2xl sm:text-3xl text-neutral-900 mb-3">Talentos a um clique</h3>
            <p className="text-sm text-neutral-500 leading-relaxed mb-6">
              Acesse perfis verificados, filtre por qualquer critério e entre em contato direto com as famílias.
            </p>
            <ul className="flex flex-col gap-3 mb-7">
              {[
                'Busca avançada com filtros',
                'Lista de favoritos',
                'Contato direto com responsáveis',
                'Alertas de novos atletas por posição',
              ].map(item => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-neutral-600">
                  <CheckCircle size={15} className="text-amber-500 flex-shrink-0" /> {item}
                </li>
              ))}
            </ul>
            <Link href="/cadastro">
              <Button variant="amber" className="w-full sm:w-auto justify-center">Criar conta de escolinha</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

// -----------------------------------------------
// CTA final
// -----------------------------------------------
function CtaSection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-green-700">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
        <p className="text-[10px] sm:text-xs uppercase tracking-widest text-white/40 mb-3">
          Comece agora
        </p>
        <h2 className="font-display text-4xl sm:text-5xl md:text-6xl text-white mb-5 sm:mb-6">
          O PRÓXIMO CRAQUE<br />
          <span className="text-amber-400">PODE SER SEU FILHO</span>
        </h2>
        <p className="text-white/70 text-sm sm:text-base leading-relaxed mb-8 max-w-xl mx-auto">
          Cadastre o atleta gratuitamente e deixe que as melhores escolinhas do Brasil o descubram.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/cadastro" className="w-full sm:w-auto">
            <Button variant="amber" size="lg" className="w-full sm:w-auto justify-center">
              Criar perfil grátis
            </Button>
          </Link>
          <Link href="/busca" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full sm:w-auto justify-center bg-white/10 hover:bg-white/20 text-white border border-white/30"
            >
              Explorar atletas
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
import Link from 'next/link'
import { NavbarPublic, Footer } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import {
  Zap, Shield, BadgeCheck, Check, UserPlus, Search,
  Handshake, ArrowRight, TrendingUp, Users, SlidersHorizontal,
  Star, MessageCircle, BarChart2, CheckCircle,
} from 'lucide-react'

export default function HomePage() {
  return (
    <>
      <NavbarPublic />
      <main>
        <HeroSection />
        <StatsBar />
        <HowItWorksSection />
        <ForWhoSection />
        <ClubsSection />
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
    <section className="relative bg-white overflow-hidden pt-16 pb-0">
      {/* Background circles */}
      <div className="absolute right-[-80px] top-[-100px] w-[480px] h-[480px] rounded-full bg-green-50 opacity-70 pointer-events-none" />
      <div className="absolute right-[160px] top-[60px] w-[180px] h-[180px] rounded-full bg-amber-50 opacity-80 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center min-h-[520px]">

          {/* Content */}
          <div className="animate-fade-up">
            <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 text-xs font-medium px-3 py-1.5 rounded-full mb-6 uppercase tracking-wide">
              <Zap size={12} /> Plataforma de talentos do futebol infantil
            </div>
            <h1 className="font-display text-6xl md:text-7xl leading-none tracking-wide mb-4">
              O <span className="text-green-400">FUTURO</span> DO<br />
              FUTEBOL COMEÇA<br />
              AQUI.
            </h1>
            <p className="text-neutral-500 text-lg leading-relaxed mb-8 max-w-md">
              A vitrine digital para jovens atletas. Pais criam o perfil, clubes e olheiros descobrem o próximo craque.
            </p>
            <div className="flex flex-wrap gap-3 mb-6">
              <Link href="/cadastro">
                <Button variant="dark" size="lg">Criar perfil do atleta</Button>
              </Link>
              <Link href="/#clubes">
                <Button variant="outline" size="lg">
                  Sou um clube <ArrowRight size={15} />
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap gap-5">
              {[
                { icon: <Check size={13} />, label: 'Gratuito para famílias' },
                { icon: <Shield size={13} />, label: 'Dados protegidos' },
                { icon: <BadgeCheck size={13} />, label: 'Clubes verificados' },
              ].map(item => (
                <span key={item.label} className="flex items-center gap-1.5 text-xs text-neutral-400">
                  {item.icon} {item.label}
                </span>
              ))}
            </div>
          </div>

          {/* Hero card */}
          <div className="hidden lg:block relative py-8">
            <HeroPlayerCard />
            <FloatBadge
              className="bottom-4 -left-8 animate-float"
              icon={<TrendingUp size={16} />}
              title="Novo interesse!"
              sub="Grêmio FBPA visualizou o perfil"
            />
            <FloatBadge
              className="top-4 -left-4 animate-float-delay"
              icon={<Users size={16} />}
              title="180 clubes ativos"
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
    <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-lg max-w-[300px] ml-auto">
      <div className="bg-green-100 px-5 pt-5 pb-3 flex items-end gap-3 relative">
        <div className="w-14 h-14 rounded-full bg-green-400 flex items-center justify-content-center font-display text-xl text-white flex-shrink-0 items-center justify-center">
          GS
        </div>
        <div className="flex-1">
          <div className="font-display text-xl text-green-700">Gabriel Silva</div>
          <div className="text-xs font-medium text-green-600">Meia-atacante · 13 anos</div>
        </div>
        <div className="font-display text-7xl text-green-400/20 absolute right-4 bottom-0 leading-none">10</div>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[['23','Gols'],['31','Assists'],['47','Jogos'],['9.1','Nota']].map(([v,l]) => (
            <div key={l} className="bg-neutral-50 rounded-lg p-2 text-center">
              <div className="font-display text-xl text-green-700 leading-none">{v}</div>
              <div className="text-[9px] text-neutral-400 mt-1">{l}</div>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2">
          {[['Técnica',88,'green'],['Visão',91,'green'],['Velocidade',75,'amber']].map(([label,val,color]) => (
            <div key={label as string} className="flex items-center gap-2">
              <span className="text-xs text-neutral-400 w-20 flex-shrink-0">{label as string}</span>
              <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${color === 'green' ? 'bg-green-400' : 'bg-amber-500'}`} style={{ width: `${val}%` }} />
              </div>
              <span className="text-xs font-medium text-neutral-600">{val as number}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="px-4 py-3 border-t border-neutral-100 flex justify-between items-center">
        <span className="bg-amber-100 text-amber-700 text-xs font-medium px-2.5 py-1 rounded-full">3 clubes interessados</span>
        <Button size="sm">Contatar</Button>
      </div>
    </div>
  )
}

function FloatBadge({ icon, title, sub, className }: { icon: React.ReactNode; title: string; sub: string; className?: string }) {
  return (
    <div className={`absolute flex items-center gap-3 bg-white border border-neutral-200 rounded-xl px-3 py-2.5 shadow-md max-w-[200px] ${className}`}>
      <div className="w-8 h-8 rounded-lg bg-green-100 text-green-700 flex items-center justify-center flex-shrink-0">{icon}</div>
      <div>
        <div className="text-xs font-medium text-neutral-900">{title}</div>
        <div className="text-xs text-neutral-400">{sub}</div>
      </div>
    </div>
  )
}

// -----------------------------------------------
// Stats bar
// -----------------------------------------------
function StatsBar() {
  return (
    <div className="bg-green-700 py-5">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-wrap justify-center gap-0 divide-x divide-white/20">
          {[['2.400+','Atletas cadastrados'],['180','Clubes parceiros'],['94','Conexões realizadas'],['12','Estados cobertos']].map(([num, label]) => (
            <div key={label} className="text-center px-8 py-1">
              <div className="font-display text-3xl text-white leading-none">{num}</div>
              <div className="text-xs text-white/50 mt-1">{label}</div>
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
    <section className="py-20 bg-neutral-100" id="como-funciona">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-12">
          <p className="text-xs uppercase tracking-widest text-neutral-400 mb-2">Como funciona</p>
          <h2 className="font-display text-5xl text-neutral-900">DO PERFIL AO <span className="text-green-400">CLUBE</span><br />EM TRÊS PASSOS</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0 relative">
          {[
            { num: '01', icon: <UserPlus size={28} />, title: 'Pais criam o perfil', desc: 'Responsáveis cadastram o atleta com posição, habilidades, fotos e vídeos. Rápido e seguro.' },
            { num: '02', icon: <Search size={28} />, title: 'Clubes buscam talentos', desc: 'Filtros por posição, idade, cidade e habilidades. Olheiros encontram exatamente quem procuram.' },
            { num: '03', icon: <Handshake size={28} />, title: 'Conexão direta e segura', desc: 'O clube contata os responsáveis. Nenhum dado da criança exposto. Família decide se aceita.' },
          ].map((step, i) => (
            <div key={step.num} className="flex gap-0 md:flex-col">
              <div className="p-8 flex-1">
                <div className="font-display text-5xl text-green-400/30 mb-4">{step.num}</div>
                <div className="w-14 h-14 rounded-xl bg-green-100 text-green-700 flex items-center justify-center mb-4">{step.icon}</div>
                <h3 className="text-lg font-medium mb-2">{step.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{step.desc}</p>
              </div>
              {i < 2 && <div className="hidden md:flex items-center justify-center text-neutral-300 absolute" style={{ left: `${(i + 1) * 33.33}%`, top: '40%' }}><ArrowRight size={20} /></div>}
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
    <section className="py-20 bg-white" id="para-quem">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-widest text-neutral-400 mb-2">Para quem é</p>
          <h2 className="font-display text-5xl">UMA PLATAFORMA, <span className="text-green-400">DOIS MUNDOS</span></h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-green-50 border border-green-100 rounded-2xl p-8">
            <p className="text-xs uppercase tracking-widest text-green-600 font-medium mb-3">Para famílias</p>
            <h3 className="font-display text-3xl text-neutral-900 mb-3">Seu filho merece ser visto</h3>
            <p className="text-sm text-neutral-500 leading-relaxed mb-6">Crie um perfil completo, adicione vídeos de jogos, acompanhe o interesse de clubes e gerencie tudo com total segurança.</p>
            <ul className="flex flex-col gap-3 mb-8">
              {['Perfil gratuito para sempre','Controle total de privacidade','Notificações de interesse','Histórico de evolução'].map(item => (
                <li key={item} className="flex items-center gap-2 text-sm text-neutral-600">
                  <CheckCircle size={15} className="text-green-400 flex-shrink-0" /> {item}
                </li>
              ))}
            </ul>
            <Link href="/cadastro"><Button variant="dark">Criar perfil grátis</Button></Link>
          </div>
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-8">
            <p className="text-xs uppercase tracking-widest text-amber-600 font-medium mb-3">Para clubes</p>
            <h3 className="font-display text-3xl text-neutral-900 mb-3">Talentos a um clique</h3>
            <p className="text-sm text-neutral-500 leading-relaxed mb-6">Acesse milhares de perfis verificados, filtre por qualquer critério e entre em contato diretamente com as famílias.</p>
            <ul className="flex flex-col gap-3 mb-8">
              {['Busca avançada com filtros','Lista de favoritos','Contato direto com responsáveis','Relatórios e analytics'].map(item => (
                <li key={item} className="flex items-center gap-2 text-sm text-neutral-600">
                  <CheckCircle size={15} className="text-amber-500 flex-shrink-0" /> {item}
                </li>
              ))}
            </ul>
            <Link href="/#clubes"><Button variant="amber">Ver planos para clubes</Button></Link>
          </div>
        </div>
      </div>
    </section>
  )
}

// -----------------------------------------------
// Clubs section
// -----------------------------------------------
function ClubsSection() {
  return (
    <section className="py-20 bg-green-700" id="clubes">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs uppercase tracking-widest text-white/40 mb-3">Para clubes e escolinhas</p>
            <h2 className="font-display text-5xl text-white mb-4">RECRUTE COM <span className="text-amber-400">INTELIGÊNCIA</span></h2>
            <p className="text-white/70 text-base leading-relaxed mb-8">Acesso a perfis verificados, filtros avançados e contato direto com as famílias. Encontre o talento certo no momento certo.</p>
            <div className="flex flex-col gap-4 mb-8">
              {[
                { icon: <SlidersHorizontal size={18} />, text: 'Busca avançada com 12+ filtros' },
                { icon: <Star size={18} />, text: 'Lista de favoritos e comparação' },
                { icon: <MessageCircle size={18} />, text: 'Contato direto com responsáveis' },
                { icon: <BarChart2 size={18} />, text: 'Relatórios e analytics de busca' },
              ].map(f => (
                <div key={f.text} className="flex items-center gap-3 text-white/80 text-sm">
                  <div className="text-white/50">{f.icon}</div>
                  {f.text}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/cadastro?tipo=clube"><Button variant="amber" size="lg">Começar gratuitamente</Button></Link>
              <Button variant="outline" size="lg" className="text-white border-white/30 hover:bg-white/10">Ver demonstração</Button>
            </div>
          </div>

          {/* Mockup */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
            <div className="px-4 py-3 border-b border-neutral-100 flex justify-between items-center">
              <span className="text-sm font-medium">Busca de talentos</span>
              <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded-full">2.400 atletas</span>
            </div>
            <div className="flex gap-2 px-4 py-2.5 border-b border-neutral-100 overflow-x-auto">
              {['Todos','Meia','Atacante','Zagueiro','Goleiro'].map((f, i) => (
                <div key={f} className={`text-xs px-3 py-1 rounded-full whitespace-nowrap ${i === 0 ? 'bg-green-400 text-white' : 'border border-neutral-200 text-neutral-500'}`}>{f}</div>
              ))}
            </div>
            <div className="divide-y divide-neutral-50">
              {[
                { init: 'GS', name: 'Gabriel Silva', info: 'Meia · 13 anos · Porto Alegre', score: 91, color: 'bg-green-400' },
                { init: 'LF', name: 'Lucas Ferreira', info: 'CA · 12 anos · Curitiba', score: 85, color: 'bg-blue-400' },
                { init: 'MT', name: 'Mateus Torres', info: 'GL · 14 anos · São Paulo', score: 92, color: 'bg-amber-500' },
                { init: 'PA', name: 'Pedro Alves', info: 'EXT · 11 anos · BH', score: 94, color: 'bg-red-400' },
              ].map(a => (
                <div key={a.name} className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 transition-colors">
                  <div className={`w-9 h-9 rounded-full ${a.color} text-white flex items-center justify-center font-display text-sm flex-shrink-0`}>{a.init}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-neutral-900">{a.name}</div>
                    <div className="text-xs text-neutral-400">{a.info}</div>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center font-display text-sm text-green-700">{a.score}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

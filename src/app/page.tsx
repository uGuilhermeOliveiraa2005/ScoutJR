import Link from 'next/link'
import { NavbarPublic, Footer } from '@/components/layout/Navbar'
import { Button } from '@/components/ui/Button'
import {
  Zap, Shield, BadgeCheck, Check, UserPlus, Search,
  Handshake, ArrowRight, TrendingUp, Users, SlidersHorizontal,
  Star, MessageCircle, BarChart2, CheckCircle, Activity,
  Target, Award, Play
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
    <div className="min-h-screen bg-neutral-50 font-sans selection:bg-green-400 selection:text-white">
      <NavbarPublic />
      <main className="overflow-hidden">
        <HeroSection />
        <StatsSection />
        <HowItWorksBento />
        <ForWhoSplitSection />
        <UltraCtaSection />
      </main>
      <Footer />
    </div>
  )
}

// -----------------------------------------------
// Premium Hero Section (Dark/Glass Theme)
// -----------------------------------------------
function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden bg-[#0A1A14]">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20 mix-blend-overlay"></div>
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[70%] rounded-[100%] bg-green-500/20 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[80%] rounded-[100%] bg-amber-500/10 blur-[150px] pointer-events-none"></div>
      
      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 pt-20 pb-24 lg:pt-32 lg:pb-36">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Text Content */}
          <div className="lg:col-span-7 animate-fade-up text-center lg:text-left flex flex-col items-center lg:items-start">
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 backdrop-blur-md text-amber-400 text-[10px] sm:text-xs font-semibold px-3 sm:px-4 py-1.5 sm:py-2 rounded-full mb-6 sm:mb-8 uppercase tracking-widest shadow-2xl">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              A maior vitrine digital do país
            </div>

            <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-[7rem] leading-[0.85] tracking-tight text-white mb-6 uppercase break-words hyphens-auto mt-2">
              O FUTURO DO <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300 filter drop-shadow-[0_0_20px_rgba(74,222,128,0.3)]">
                FUTEBOL DE BASE
              </span> <br />
              COMEÇA AQUI.
            </h1>

            <p className="text-neutral-300 text-lg sm:text-xl leading-relaxed mb-10 max-w-xl font-light">
              A vitrine profissional que o talento do seu filho merece. No ScoutJR, conectamos jovens promessas a olheiros e escolinhas de todo o Brasil através de um currículo digital completo e seguro.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Link href="/cadastro" className="w-full sm:w-auto group">
                <button className="w-full sm:w-auto relative inline-flex items-center justify-center gap-3 px-8 py-4 text-base font-bold text-[#0A1A14] bg-green-400 rounded-xl overflow-hidden transition-all hover:scale-105 hover:bg-green-300 hover:shadow-[0_0_40px_rgba(74,222,128,0.4)]">
                  <span className="relative z-10">Criar perfil grátis</span>
                  <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                </button>
              </Link>
              <Link href="/busca" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 text-base font-medium rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm text-white hover:bg-white/10 transition-all duration-200">
                  <Search size={18} className="text-neutral-400" /> Explorar atletas
                </button>
              </Link>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center lg:justify-start gap-2 text-sm text-neutral-400">
              Já tem uma conta? <Link href="/login" className="text-green-400 font-medium hover:text-green-300 transition-colors">Entrar no painel</Link>
            </div>

            <div className="flex flex-wrap justify-center lg:justify-start gap-6 sm:gap-8 mt-10">
              {[
                { icon: <Check size={16} className="text-green-400" />, label: '100% Gratuito' },
                { icon: <Shield size={16} className="text-green-400" />, label: 'Privacidade Total' },
                { icon: <Activity size={16} className="text-green-400" />, label: 'Conexão Direta' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2 text-sm text-neutral-300 font-medium">
                  <div className="p-1 rounded-full bg-green-400/10">
                    {item.icon}
                  </div>
                  {item.label}
                </div>
              ))}
            </div>
          </div>

          {/* Premium Glassmorphism Player Card */}
          <div className="lg:col-span-5 relative mt-10 lg:mt-0 flex justify-center lg:justify-end perspective-1000 pointer-events-none">
            <div className="relative w-full max-w-[340px] transform-gpu lg:rotate-[-2deg] z-20">
              <HeroPremiumCard />
            </div>
            
            {/* Floating Elements */}
            <div className="hidden sm:flex absolute -left-12 bottom-12 animate-float z-30">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-2xl flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white">
                  <Star size={18} fill="currentColor" />
                </div>
                <div>
                  <div className="text-white text-sm font-bold">Grêmio FBPA</div>
                  <div className="text-amber-300 text-xs font-medium">Visualizou o perfil</div>
                </div>
              </div>
            </div>

            <div className="hidden sm:flex absolute -right-8 top-12 animate-float-delay z-30">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-3 rounded-2xl shadow-2xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                  <TrendingUp size={14} />
                </div>
                <div>
                  <div className="text-white text-xs font-bold whitespace-nowrap">Nota: 9.1</div>
                  <div className="text-neutral-300 text-[10px]">Técnica em campo</div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Fade into bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-neutral-50 to-transparent pointer-events-none z-10"></div>
    </section>
  )
}

function HeroPremiumCard() {
  return (
    <div className="bg-white/5 backdrop-blur-2xl border border-white/20 rounded-3xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col relative before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/10 before:to-transparent before:opacity-50">
      
      {/* Header */}
      <div className="p-6 pb-4 border-b border-white/10 relative z-10 flex gap-4 items-center overflow-hidden">
        <div className="absolute -right-4 -top-4 text-[10rem] font-display text-white/5 leading-none select-none">10</div>
        
        <div className="relative">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-green-500 to-emerald-300 p-[2px]">
            <div className="w-full h-full rounded-full bg-[#0A1A14] flex items-center justify-center font-display text-2xl text-white">
              GS
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-amber-400 rounded-full border-2 border-[#0A1A14] flex items-center justify-center text-[#0A1A14]">
            <BadgeCheck size={12} fill="currentColor" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0 z-10">
          <h3 className="font-display text-2xl text-white truncate drop-shadow-md">Gabriel Silva</h3>
          <p className="text-sm font-medium text-green-300">Meia-atacante</p>
          <p className="text-xs text-neutral-400 mt-0.5">13 anos • São Paulo, SP</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="p-6 relative z-10">
        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { v: '23', l: 'Gols' },
            { v: '31', l: 'Assists' },
            { v: '47', l: 'Jogos' },
            { v: '9.1', l: 'Nota' }
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center justify-center bg-white/5 rounded-2xl py-3 border border-white/5 hover:bg-white/10 transition-colors">
              <span className="font-display text-2xl text-white leading-none mb-1">{stat.v}</span>
              <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">{stat.l}</span>
            </div>
          ))}
        </div>

        {/* Skills Bars */}
        <div className="flex flex-col gap-3">
          {[
            { label: 'Técnica', val: 88, color: 'from-green-400 to-emerald-300' },
            { label: 'Visão de jogo', val: 91, color: 'from-green-400 to-emerald-300' },
            { label: 'Velocidade', val: 75, color: 'from-amber-400 to-amber-500' }
          ].map((skill, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-neutral-300 font-medium">{skill.label}</span>
                <span className="text-white font-bold">{skill.val}</span>
              </div>
              <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full bg-gradient-to-r ${skill.color} relative`}
                  style={{ width: `${skill.val}%` }}
                >
                  <div className="absolute inset-0 bg-white/20 w-full animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Footer */}
      <div className="p-4 bg-white/5 border-t border-white/10 relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-2">
            <div className="w-6 h-6 rounded-full bg-amber-500 border-2 border-[#0A1A14] flex items-center justify-center"><Star size={10} className="text-[#0A1A14]" /></div>
            <div className="w-6 h-6 rounded-full bg-neutral-200 border-2 border-[#0A1A14]"></div>
            <div className="w-6 h-6 rounded-full bg-neutral-300 border-2 border-[#0A1A14]"></div>
          </div>
          <span className="text-[10px] font-medium text-neutral-300">+3 interessados</span>
        </div>
        <button className="bg-white text-[#0A1A14] text-xs font-bold px-4 py-2 rounded-lg transition-colors cursor-default">
          Ver perfil completo
        </button>
      </div>
    </div>
  )
}

// -----------------------------------------------
// Premium Stats Grid
// -----------------------------------------------
async function StatsSection() {
  const supabase = await createSupabaseServer()
  
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
    { 
      num: `${(totalAtletas || 0).toLocaleString()}`, 
      label: 'Atletas Cadastrados',
      icon: <Users size={24} className="text-green-500" />,
      href: '/busca?tab=atletas'
    },
    { 
      num: `${(totalEscolinhas || 0).toLocaleString()}`, 
      label: 'Escolinhas Parceiras',
      icon: <Target size={24} className="text-amber-500" />,
      href: '/busca?tab=escolinhas'
    },
    { 
      num: `${((totalVisitas || 0) + 1240).toLocaleString()}`, 
      label: 'Visitas na Plataforma',
      icon: <Activity size={24} className="text-green-500" />
    },
    { 
      num: '+12', 
      label: 'Estados Cobertos',
      icon: <Award size={24} className="text-amber-500" />
    },
  ]

  return (
    <div className="bg-neutral-50 pt-10 pb-16 sm:py-24 relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((stat, i) => {
            const content = (
              <>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-neutral-50 mb-3 sm:mb-4 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  {stat.icon}
                </div>
                <div className="font-display text-3xl sm:text-4xl lg:text-5xl text-neutral-900 mb-1 sm:mb-2">{stat.num}</div>
                <div className="text-[10px] sm:text-xs md:text-sm font-medium text-neutral-500 uppercase tracking-widest leading-tight">{stat.label}</div>
              </>
            )
            const className = "bg-white rounded-[2rem] sm:rounded-3xl p-5 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-neutral-100 flex flex-col items-center justify-center text-center group hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300"
            return stat.href ? (
              <Link key={i} href={stat.href} className={className}>
                {content}
              </Link>
            ) : (
              <div key={i} className={className}>
                {content}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// -----------------------------------------------
// Bento Grid - How it works
// -----------------------------------------------
function HowItWorksBento() {
  return (
    <section className="py-20 sm:py-32 bg-white" id="como-funciona">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 text-xs font-bold px-4 py-2 rounded-full mb-6 uppercase tracking-widest border border-green-100">
            Simples e Direto
          </div>
          <h2 className="font-display text-5xl sm:text-6xl text-neutral-900 leading-none uppercase">
            3 passos para iniciar sua <br/> <span className="text-green-500">carreira no futebol</span>
          </h2>
          <p className="mt-6 text-lg text-neutral-500">
            Nossa plataforma descomplica a jornada. O atleta foca em jogar bem, nós focamos em mostrar seu talento para as pessoas certas.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(300px,_auto)]">
          
          {/* Card 1 */}
          <div className="bg-neutral-50 rounded-3xl p-8 border border-neutral-100 relative overflow-hidden group hover:border-green-200 transition-colors">
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-400/5 rounded-full blur-[80px] group-hover:bg-green-400/10 transition-colors"></div>
            <div className="font-display text-6xl sm:text-8xl text-neutral-200 leading-none absolute -top-2 sm:-top-4 -left-2 sm:-left-4 select-none opacity-50 group-hover:text-green-100 transition-colors">01</div>
            
            <div className="relative z-10 h-full flex flex-col pt-12">
              <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-neutral-100 flex items-center justify-center text-neutral-700 mb-6 group-hover:text-green-600 transition-colors">
                <UserPlus size={28} />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-3">Crie seu Perfil de Atleta</h3>
              <p className="text-neutral-500 leading-relaxed text-sm sm:text-base">
                Os pais ou responsáveis cadastram o atleta. Adicione posição, pé dominante, altura, fotos e os melhores lances em vídeo. É fácil e totalmente gratuito.
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-neutral-50 rounded-3xl p-8 border border-neutral-100 relative overflow-hidden group hover:border-amber-200 transition-colors md:col-span-2 md:row-span-1">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/5 rounded-full blur-[80px] group-hover:bg-amber-400/10 transition-colors"></div>
            <div className="font-display text-6xl sm:text-8xl text-neutral-200 leading-none absolute -top-2 sm:-top-4 -left-2 sm:-left-4 select-none opacity-50 group-hover:text-amber-100 transition-colors">02</div>
            
            <div className="relative z-10 h-full flex flex-col md:flex-row gap-8 items-start pt-12">
              <div className="flex-1">
                <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-neutral-100 flex items-center justify-center text-neutral-700 mb-6 group-hover:text-amber-500 transition-colors">
                  <Search size={28} />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-3">Seja Visto por Olheiros</h3>
                <p className="text-neutral-500 leading-relaxed text-sm sm:text-base">
                  Olheiros e treinadores usam nossa busca avançada. Eles filtram por idade, posição e região para encontrar exatamente a peça que falta nos seus elencos.
                </p>
              </div>
              <div className="hidden md:flex flex-1 items-center justify-center p-6 bg-white rounded-2xl border border-neutral-100 shadow-inner w-full">
                {/* Mockup visual de busca */}
                <div className="w-full flex gap-2">
                  <div className="flex-1 bg-neutral-50 h-10 rounded-lg flex items-center px-4">
                    <Search size={14} className="text-neutral-400 mr-2" />
                    <div className="h-2 w-20 bg-neutral-200 rounded-full"></div>
                  </div>
                  <div className="w-24 bg-green-500 h-10 rounded-lg flex items-center justify-center">
                    <SlidersHorizontal size={14} className="text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-neutral-50 rounded-3xl p-8 border border-neutral-100 relative overflow-hidden group hover:border-blue-200 transition-colors md:col-span-3">
             <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-neutral-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
             <div className="font-display text-6xl sm:text-8xl text-neutral-200 leading-none absolute -top-2 sm:-top-4 -left-2 sm:-left-4 select-none opacity-50 group-hover:text-neutral-300 transition-colors">03</div>
             
             <div className="relative z-10 h-full flex flex-col md:flex-row gap-8 items-center pt-8 md:pt-0">
               <div className="w-16 h-16 shrink-0 rounded-2xl bg-white shadow-sm border border-neutral-100 flex items-center justify-center text-neutral-700 mb-2 md:mb-0 group-hover:text-neutral-900 transition-colors">
                 <Handshake size={32} />
               </div>
               <div className="flex-1 text-center md:text-left">
                 <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-2">Conquiste sua Oportunidade</h3>
                 <p className="text-neutral-500 leading-relaxed text-sm sm:text-base max-w-3xl">
                   Quando a escolinha gosta do perfil, ela envia uma mensagem. Vocês trocam contatos com total segurança e o sonho começa a virar realidade fora das telas. A decisão final é sempre da família.
                 </p>
               </div>
               <div className="shrink-0 mt-6 md:mt-0 w-full md:w-auto flex justify-center">
                  <Button variant="dark" size="lg" className="w-full sm:w-auto rounded-xl px-8 focus:ring-2 ring-neutral-900 ring-offset-2">
                    Cadastrar agora
                  </Button>
               </div>
             </div>
          </div>

        </div>
      </div>
    </section>
  )
}

// -----------------------------------------------
// Split Screen - For Who
// -----------------------------------------------
function ForWhoSplitSection() {
  return (
    <section className="py-24 sm:py-32 bg-neutral-900 text-white relative overflow-hidden" id="para-quem">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        <div className="text-center mb-16 sm:mb-24">
          <h2 className="font-display text-5xl sm:text-6xl text-white uppercase">
            A ponte entre o <span className="text-green-400">talento e a oportunidade</span>
          </h2>
          <p className="mt-4 text-neutral-400 text-lg">Criamos a ponte perfeita entre a promessa e a oportunidade.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          
          {/* Famílias */}
          <div className="group rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-b from-neutral-800 to-neutral-900 p-6 sm:p-12 border border-neutral-700 hover:border-green-500/50 transition-colors relative overflow-hidden">
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-neutral-800 text-white text-xs font-bold px-4 py-2 rounded-full mb-8 border border-neutral-700">
                <Users size={14} className="text-green-400" /> PARA ATLETAS E PAIS
              </div>
              <h3 className="font-display text-3xl sm:text-4xl lg:text-5xl mb-3 sm:mb-4 leading-tight">Mostre seu talento<br className="hidden sm:block"/> para o Brasil</h3>
              <p className="text-neutral-400 leading-relaxed mb-10 text-lg">
                Seu filho joga muito, mas precisa ser visto. Concentre os melhores momentos em um único link profissional e seja descoberto pelas grandes equipes de base.
              </p>
              
              <ul className="space-y-4 mb-12">
                {[
                  'Portfólio 100% digital e moderno.',
                  'Estatísticas e vídeos em um só lugar.',
                  'Controle sua privacidade.',
                  'Receba alertas quando olheiros visualizarem.'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4 text-neutral-300">
                    <div className="mt-1 bg-green-500/20 p-1 rounded-md text-green-400"><Check size={14} strokeWidth={3} /></div>
                    <span className="font-medium text-base">{item}</span>
                  </li>
                ))}
              </ul>
              
              <Link href="/cadastro">
                <button className="w-full sm:w-auto px-8 py-4 bg-green-500 hover:bg-green-400 text-[#0A1A14] font-bold rounded-xl transition-colors">
                  Criar perfil do atleta
                </button>
              </Link>
            </div>
          </div>

          {/* Escolinhas */}
          <div className="group rounded-[2rem] sm:rounded-[2.5rem] bg-gradient-to-b from-neutral-800 to-neutral-900 p-6 sm:p-12 border border-neutral-700 hover:border-amber-500/50 transition-colors relative overflow-hidden" id="escolinhas">
            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-neutral-800 text-white text-xs font-bold px-4 py-2 rounded-full mb-8 border border-neutral-700">
                <Target size={14} className="text-amber-400" /> PARA ESCOLINHAS E CLUBES
              </div>
              <h3 className="font-display text-3xl sm:text-4xl lg:text-5xl mb-3 sm:mb-4 leading-tight">Monte o time<br className="hidden sm:block"/> dos sonhos</h3>
              <p className="text-neutral-400 leading-relaxed mb-10 text-lg">
                Esqueça peneiras desorganizadas e vídeos soltos no WhatsApp. Busque, avalie e recrute os melhores talentos infantis usando nossa inteligência de dados.
              </p>
              
              <ul className="space-y-4 mb-12">
                {[
                  'Filtros precisos (posição, idade, região).',
                  'Acesso a dados e vídeos centralizados.',
                  'Salve perfis em listas de observação.',
                  'Contato direto com os responsáveis legais.'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-4 text-neutral-300">
                    <div className="mt-1 bg-amber-500/20 p-1 rounded-md text-amber-400"><Check size={14} strokeWidth={3} /></div>
                    <span className="font-medium text-base">{item}</span>
                  </li>
                ))}
              </ul>
              
              <Link href="/cadastro">
                <button className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-neutral-200 text-neutral-900 font-bold rounded-xl transition-colors">
                  Cadastrar minha instituição
                </button>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

// -----------------------------------------------
// Massive Typography CTA
// -----------------------------------------------
function UltraCtaSection() {
  return (
    <section className="relative bg-green-500 overflow-hidden py-32 sm:py-40 flex items-center justify-center">
      {/* Abstract large typography background */}
      <h2 className="absolute text-[8rem] sm:text-[20rem] lg:text-[30rem] font-display text-green-600/30 whitespace-nowrap select-none pointer-events-none leading-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-bold tracking-tighter">
        VAMOS
      </h2>
      
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center">
        <h2 className="font-display text-5xl sm:text-6xl lg:text-[7rem] text-[#0A1A14] leading-[0.9] mb-6 sm:mb-8 uppercase px-2 break-words">
          Seu lugar não é <br className="hidden sm:block" />
          no banco de reservas.
        </h2>
        
        <p className="text-green-950 font-medium text-lg sm:text-xl max-w-2xl mb-12 mx-auto">
          Junte-se a milhares de garotos e dezenas de escolinhas na revolução digital do futebol de base brasileiro. O registro leva apenas 2 minutos e é gratuito.
        </p>

        <Link href="/cadastro">
          <button className="group relative inline-flex items-center justify-center gap-4 px-10 py-5 text-xl font-bold text-white bg-[#0A1A14] rounded-2xl overflow-hidden transition-all hover:scale-105 shadow-[0_20px_40px_rgba(10,26,20,0.4)]">
            <span className="relative z-10 font-display text-3xl tracking-widest leading-none pt-1">COMEÇAR AGORA</span>
            <div className="absolute inset-0 bg-neutral-800 scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300 ease-out"></div>
            <ArrowRight size={24} className="relative z-10 group-hover:translate-x-2 transition-transform" />
          </button>
        </Link>
      </div>
    </section>
  )
}
import { createSupabaseServer } from '@/lib/supabase-server'
import { notFound } from 'next/navigation'
import { NavbarPublic, NavbarDashboard, Footer } from '@/components/layout/Navbar'
import { MapPin, ShieldCheck, ArrowLeft, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'

export default async function PerfilEscolinhaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: escolinha } = await supabase
    .from('escolinhas')
    .select('*')
    .eq('id', id)
    .single()

  if (!escolinha) notFound()

  let profile = null

  if (user) {
    const { data: p } = await supabase.from('profiles').select('*').eq('user_id', user.id).single()
    profile = p
  }

  const Navbar = user && profile
    ? <NavbarDashboard userName={profile.nome} userRole={profile.role} userId={user.id} />
    : <NavbarPublic />

  const fotosList = Array.isArray(escolinha.fotos_adicionais) ? escolinha.fotos_adicionais : []

  return (
    <>
      {Navbar}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-5 sm:py-8 pb-24 md:pb-8">
        {/* Back */}
        <Link href="/busca" className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-neutral-400 hover:text-neutral-700 mb-4 sm:mb-6 transition-colors font-medium">
          <ArrowLeft size={14} /> Voltar para a busca
        </Link>

        <div className="bg-white border border-neutral-200 rounded-3xl overflow-hidden shadow-sm mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-gradient-to-r from-green-700 to-green-900 px-5 pt-12 pb-5 flex flex-col sm:flex-row items-center sm:items-end gap-5 relative min-h-[180px]">
             
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-white text-green-700 flex items-center justify-center font-display text-4xl flex-shrink-0 z-10 border-4 border-white shadow-xl overflow-hidden relative sm:translate-y-6">
              {escolinha.foto_url 
                ? <img src={escolinha.foto_url} alt={escolinha.nome} className="w-full h-full object-cover" />
                : escolinha.nome.split(' ').map((p: string) => p[0]).slice(0, 2).join('').toUpperCase()
              }
            </div>

            <div className="flex-1 z-10 text-center sm:text-left mt-3 sm:mt-0 sm:pl-3 pb-1">
              <h1 className="font-display text-3xl sm:text-4xl text-white leading-tight mb-2 tracking-tight">{escolinha.nome}</h1>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-1 text-green-50">
                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium tracking-wide">
                  <MapPin size={16} /> {escolinha.cidade}, {escolinha.estado}
                </div>
                {escolinha.verificado && (
                  <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs backdrop-blur-sm border border-white/20 shadow-sm">
                    <ShieldCheck size={14} className="text-white" /> <span className="text-white font-bold tracking-widest uppercase">Verificado</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="p-6 sm:p-8 sm:pt-12">
            {escolinha.descricao && (
              <div className="mb-10">
                <h2 className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-3 ml-1">Sobre a Escolinha</h2>
                <div className="bg-neutral-50/50 rounded-2xl p-5 border border-neutral-100">
                  <p className="text-sm text-neutral-700 leading-relaxed text-justify whitespace-pre-wrap">{escolinha.descricao}</p>
                </div>
              </div>
            )}

            {fotosList.length > 0 && (
              <div>
                <h2 className="text-xs font-black uppercase tracking-widest text-neutral-400 mb-4 ml-1 flex items-center gap-2">
                  <ImageIcon size={14} /> Estrutura & Treinos
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
                  {fotosList.map((fotoUrl: string, index: number) => (
                    fotoUrl ? (
                      <a key={index} href={fotoUrl} target="_blank" rel="noopener noreferrer" className="block w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 bg-neutral-100 border border-neutral-200">
                        <img src={fotoUrl} alt={`Foto ${index + 1}`} className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"/>
                      </a>
                    ) : null
                  ))}
                </div>
              </div>
            )}
            
            {!escolinha.descricao && fotosList.length === 0 && (
              <div className="text-center py-12 bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
                <ImageIcon size={32} className="mx-auto text-neutral-300 mb-3" />
                <p className="text-neutral-500 font-medium text-sm">Este perfil ainda não adicionou uma descrição ou fotos da estrutura.</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

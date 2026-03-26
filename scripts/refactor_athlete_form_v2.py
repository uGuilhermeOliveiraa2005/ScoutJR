import re

with open('src/app/cadastro/page.tsx', 'r', encoding='utf-8') as f:
    cadastro = f.read()

# Extract AtletaSteps body
match = re.search(r'function AtletaSteps\(\{.*?\).*?\{([\s\S]*)\n\}\n*$', cadastro)
atleta_steps_body = match.group(1)

# Modify the AtletaSteps body so that "if (step === X) return ( <div...> )" becomes "{step === X && ( <div...> )}"
def convert_step(match):
    # match.group(0) is the entire if (step === X) { ... return ( ... ) }
    # Let's just manually replace each step block.
    pass

# A simpler approach: Let's extract each step's JSX individually.
steps_jsx = {}
for i in range(3, 9):
    # Regex to find "if (step === i) { ... return ( ... ) }" or "if (step === i) return ( ... )"
    r = re.compile(rf'if \(step === {i}\)(.*?return \([\s\S]*?\n  \))', re.MULTILINE | re.DOTALL)
    m = r.search(atleta_steps_body)
    if not m:
        r = re.compile(rf'if \(step === {i}\) \{{\s*const.*?return \([\s\S]*?\n    \)\n  \}}', re.MULTILINE | re.DOTALL)
        m = r.search(atleta_steps_body)
    
    if m:
        # Keep it as components: function Step1({data, setData, ...}) { ... }
        steps_jsx[i-2] = m.group(0)

new_components = ""
for step_num, step_code in steps_jsx.items():
    step_code = step_code.replace(f'step === {step_num+2}', 'true') # remove the if
    step_code = re.sub(r'setStep\((\d+)\)', lambda m: f"setStep({int(m.group(1)) - 2})", step_code)
    
    # fix onSubmit vs formResp.handleSubmit
    step_code = step_code.replace('onClick={formResp.handleSubmit(submitResponsavel)}', 'onClick={handleSubmit}')
    step_code = step_code.replace('loading={isUploading || formResp.formState.isSubmitting}', 'loading={loading}')
    
    new_components += f"\nfunction Step{step_num}({{ data, setData, setStep, handleSubmit, loading, serverError }}: any) {{\n"
    # drop the if (true) wrapper
    if step_code.startswith("if (true) {"):
        new_components += step_code.replace("if (true) {", "", 1)[:-1] # remove last }
    elif step_code.startswith("if (true) return"):
        new_components += step_code.replace("if (true) return", "return", 1)
    else:
        new_components += step_code
        
    new_components += "\n}\n"


new_form = """'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input, Select, Label, FieldGroup, Textarea } from '@/components/ui/Form'
import { ESTADOS } from '@/lib/utils'
import {
  ArrowLeft, ArrowRight, Eye, MapPin,
  MessageCircle, CircleCheckBig,
  Users, Trash2, Trophy, Image as ImageIcon
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AthleteProfilePreview } from '@/components/atletas/AthleteProfilePreview'
import { CitySelect } from '@/components/ui/CitySelect'

const STEP_LABELS = ['Dados', 'Habilidades', 'Mídia', 'Conquistas', 'Visualizar', 'Privacidade']

interface AthleteFormProps {
  initialData?: any
  athleteId?: string
  mode: 'create' | 'edit'
  onSubmit: (data: any) => Promise<{ success?: boolean; error?: string; id?: string }>
}

export function AthleteForm({ initialData, athleteId, mode, onSubmit }: AthleteFormProps) {
  const [step, setStep] = useState(1)
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(false)
  const [serverError, setServerError] = useState('')

  const [data, setData] = useState({
    nomeAtleta: initialData?.nome || '',
    descricao: initialData?.descricao || '',
    dataNascimento: initialData?.data_nascimento || '',
    estado: initialData?.estado || '',
    cidade: initialData?.cidade || '',
    posicao: initialData?.posicao || 'MEI',
    peDominante: initialData?.pe_dominante || 'destro',
    altura_cm: initialData?.altura_cm || '',
    peso_kg: initialData?.peso_kg || '',
    escolinhaAtual: initialData?.escolinha_atual || '',
    habilidades: [
      initialData?.habilidade_tecnica ?? 75,
      initialData?.habilidade_velocidade ?? 68,
      initialData?.habilidade_visao ?? 82,
      initialData?.habilidade_fisico ?? 60,
      initialData?.habilidade_finalizacao ?? 71,
      initialData?.habilidade_passes ?? 79,
    ],
    fotoPerfilUrl: initialData?.foto_url || null,
    fotoPerfilPreview: initialData?.foto_url || '',
    fotoCapaUrl: initialData?.capa_url || null,
    fotoCapaPreview: initialData?.capa_url || '',
    fotosAdicionais: initialData?.fotos_adicionais || [],
    videos: initialData?.atleta_videos?.map((v: any) => ({ url: v.url, titulo: v.titulo })) || [],
    conquistas: initialData?.atleta_conquistas?.map((c: any) => ({
      titulo: c.titulo,
      ano: c.ano.toString(),
      descricao: c.descricao,
    })) || [],
    visivel: initialData?.visivel ?? true,
    exibirCidade: initialData?.exibir_cidade ?? true,
    mensagens: initialData?.aceitar_mensagens ?? false,
  })

  async function handleSubmit() {
    setLoading(true)
    setServerError('')
    const res = await onSubmit(data)
    setLoading(false)
    if (res.error) {
      setServerError(res.error)
    } else {
      setDone(true)
    }
  }

  if (done) return <SuccessScreen mode={mode} athleteId={athleteId || ''} />

  const progressPercent = ((step - 1) / (STEP_LABELS.length - 1)) * 100

  return (
    <div className="w-full max-w-lg">
      <div className="text-center mb-6 sm:mb-8">
        <Link href="/dashboard" className="font-display text-3xl tracking-widest text-green-700 inline-block mb-2">
          SCOUT<span className="text-amber-500">JR</span>
        </Link>
        <h1 className="text-neutral-500 text-sm font-medium uppercase tracking-widest">
          {mode === 'create' ? 'Novo Atleta' : 'Editar Atleta'}
        </h1>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="relative h-1.5 bg-neutral-200 rounded-full mb-3 overflow-hidden">
          <div
            className="h-full bg-green-400 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className={`grid grid-cols-${STEP_LABELS.length}`} style={{ gridTemplateColumns: `repeat(${STEP_LABELS.length}, 1fr)` }}>
          {STEP_LABELS.map((l, i) => (
            <span
              key={l}
              className={cn(
                'text-[9px] sm:text-[10px] font-bold uppercase tracking-tighter text-center',
                i + 1 === step ? 'text-green-700' : i + 1 < step ? 'text-green-400' : 'text-neutral-300'
              )}
            >
              {l}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        {step === 1 && <Step1 data={data} setData={setData} setStep={setStep} />}
        {step === 2 && <Step2 data={data} setData={setData} setStep={setStep} />}
        {step === 3 && <Step3 data={data} setData={setData} setStep={setStep} />}
        {step === 4 && <Step4 data={data} setData={setData} setStep={setStep} />}
        {step === 5 && (
          <div className="flex flex-col gap-5 sm:gap-6">
            <div>
              <div className="font-display text-3xl sm:text-4xl text-neutral-400 mb-1.5 leading-none">05</div>
              <h2 className="text-lg sm:text-xl font-medium mb-1">Visualizar Perfil</h2>
              <p className="text-xs sm:text-sm text-neutral-500 mb-4 sm:mb-6">Veja como as escolinhas verão seu perfil.</p>
            </div>
            <AthleteProfilePreview data={data} onBack={() => setStep(4)} onNext={() => setStep(6)} />
          </div>
        )}
        {step === 6 && <Step6 data={data} setData={setData} setStep={setStep} handleSubmit={handleSubmit} loading={loading} serverError={serverError} />}
      </div>

      <div className="mt-8 text-center pb-8 border-t border-neutral-200/50 pt-8">
        <Link
          href={mode === 'create' ? '/dashboard' : `/perfil/${athleteId}`}
          className="text-sm font-bold text-neutral-400 hover:text-neutral-600 transition-colors uppercase tracking-widest"
        >
          Cancelar e Voltar
        </Link>
      </div>
    </div>
  )
}

function SuccessScreen({ mode, athleteId }: { mode: 'create' | 'edit'; athleteId?: string }) {
  return (
    <div className="w-full max-w-md text-center py-12 animate-in fade-in zoom-in-95 duration-500 bg-white border border-neutral-200 rounded-3xl p-8 shadow-sm">
      <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <CircleCheckBig size={40} />
      </div>
      <h2 className="font-display text-3xl text-neutral-900 mb-2">
        {mode === 'create' ? 'Atleta Cadastrado!' : 'Perfil Atualizado!'}
      </h2>
      <p className="text-neutral-500 mb-8">
        {mode === 'create'
          ? 'O perfil do atleta já está ativo e visível para escolinhas na plataforma.'
          : 'As informações foram atualizadas e salvas com sucesso.'}
      </p>
      <Link href={mode === 'create' ? '/dashboard' : `/perfil/${athleteId}`}>
        <Button variant="dark" className="w-full h-12 text-base font-bold shadow-lg justify-center uppercase tracking-widest">
          DASHBOARD INICIAL
        </Button>
      </Link>
    </div>
  )
}
""" + new_components

with open('src/components/atletas/AthleteForm.tsx', 'w', encoding='utf-8') as f:
    f.write(new_form)

print("AthleteForm rewritten successfully (v2).")

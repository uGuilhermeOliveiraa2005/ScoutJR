import re

with open('src/app/cadastro/page.tsx', 'r', encoding='utf-8') as f:
    cadastro = f.read()

# Extract AtletaSteps body
match = re.search(r'function AtletaSteps\(\{.*?\).*?\{([\s\S]*)\n\}\n*$', cadastro)
if not match:
    print('AtletaSteps not found')
    exit(1)

atleta_steps_body = match.group(1)

# Fix step numbers (decrease by 2)
def decrease_step(m):
    return f"step === {int(m.group(1)) - 2}"
atleta_steps_body = re.sub(r'step === (\d+)', decrease_step, atleta_steps_body)
atleta_steps_body = re.sub(r'setStep\((\d+)\)', lambda m: f"setStep({int(m.group(1)) - 2})", atleta_steps_body)
atleta_steps_body = re.sub(r'step >= (\d+) && step <= (\d+)', lambda m: f"step >= {int(m.group(1)) - 2} && step <= {int(m.group(2)) - 2}", atleta_steps_body)

# In AthleteForm.tsx, the submit handler returns an object {error?: string}.
# The old AtletaSteps expects `onSubmit` to be a directly callable function without return handling (since it was handled outside),
# or rather it expected `onSubmit` to execute the submission.
# In AthleteForm, we have `handleSubmit()` that sets loading and calls `onSubmit(data)`.
atleta_steps_body = atleta_steps_body.replace('onClick={onSubmit}', 'onClick={handleSubmit}')

# Fix the JSX wrapper. We need to replace the old step rendering in AthleteForm.tsx
with open('src/components/atletas/AthleteForm.tsx', 'r', encoding='utf-8') as f:
    old_form = f.read()

# Extract headers and states from AthleteForm
header_match = re.search(r'(.*?  if \(done\) return <SuccessScreen .*?\n)', old_form, re.DOTALL)
if not header_match:
    print('AthleteForm header not found')
    exit(1)

header = header_match.group(1)

new_form = header + """
  // Barra de progresso: alinha o marcador com o centro do label ativo
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
        {/* Barra */}
        <div className="relative h-1.5 bg-neutral-200 rounded-full mb-3 overflow-hidden">
          <div
            className="h-full bg-green-400 rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        {/* Labels alinhados em grid para corresponder à barra */}
        <div className={`grid grid-cols-${STEP_LABELS.length}`} style={{ gridTemplateColumns: `repeat(${STEP_LABELS.length}, 1fr)` }}>
          {STEP_LABELS.map((l, i) => (
            <span
              key={l}
              className={cn(
                'text-[9px] sm:text-[10px] font-bold uppercase tracking-tighter text-center',
                i + 1 === step
                  ? 'text-green-700'
                  : i + 1 < step
                    ? 'text-green-400'
                    : 'text-neutral-300'
              )}
            >
              {l}
            </span>
          ))}
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-sm">
"""

# Append the extracted steps
new_form += atleta_steps_body

new_form += """
      </div>

      {serverError && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-600 text-xs sm:text-sm rounded-lg px-4 py-3 text-center">
          {serverError}
        </div>
      )}

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
    <div className="w-full max-w-md text-center py-12 animate-in fade-in zoom-in-95 duration-500">
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
        <Button variant="dark" className="w-full h-12 text-base font-bold shadow-lg justify-center">
          Ver perfil
        </Button>
      </Link>
    </div>
  )
}
"""

with open('src/components/atletas/AthleteForm.tsx', 'w', encoding='utf-8') as f:
    f.write(new_form)

print("AthleteForm rewritten successfully.")

'use client'

import { useState } from 'react'
import { ShieldCheck, ShieldAlert, Smartphone, CheckCircle2, Copy } from 'lucide-react'
import { createSupabaseBrowser } from '@/lib/supabase'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export function TwoFactorAuthForm({ enrolled, factorId }: { enrolled: boolean; factorId?: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Enrollment State
  const [qrCodeSvg, setQrCodeSvg] = useState<string | null>(null)
  const [secretText, setSecretText] = useState<string | null>(null)
  const [newFactorId, setNewFactorId] = useState<string | null>(null)
  const [verifyCode, setVerifyCode] = useState('')
  
  const supabase = createSupabaseBrowser()
  const router = useRouter()

  const handleStartEnroll = async () => {
    setLoading(true)
    try {
      // CLEANUP: Remover qualquer fator não verificado anterior para evitar o erro de código inválido
      const { data: factors } = await supabase.auth.mfa.listFactors()
      const unverifiedFactors = factors?.all?.filter((f: any) => f.status === 'unverified') || []
      
      for (const f of unverifiedFactors) {
        await supabase.auth.mfa.unenroll({ factorId: f.id })
      }

      const { data, error } = await supabase.auth.mfa.enroll({
        factorType: 'totp',
        issuer: 'ScoutJR',
        friendlyName: 'ScoutJR'
      })
    
      if (error) {
        toast.error('Erro ao iniciar 2FA: ' + error.message)
        return
      }

      if (data?.totp) {
        setQrCodeSvg(data.totp.qr_code)
        setSecretText(data.totp.secret)
        setNewFactorId(data.id)
        setIsOpen(true)
      }
    } catch (err) {
      console.error('MFA Enrollment Error:', err)
      toast.error('Ocorreu um erro ao preparar o 2FA.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyEnroll = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFactorId || verifyCode.length !== 6) {
       toast.error('Código inválido.')
       return
    }
    setLoading(true)
    
    try {
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: newFactorId })
      if (challengeError) {
        toast.error('Erro ao verificar: ' + challengeError.message)
        return
      }

      const { error: verifyError } = await supabase.auth.mfa.verify({
        factorId: newFactorId,
        challengeId: challenge.id,
        code: verifyCode
      })

      if (verifyError) {
        toast.error('Código incorreto. Tente novamente.')
        return
      }

      toast.success('Autenticação de 2 Fatores ATIVADA com sucesso!')
      setIsOpen(false)
      setQrCodeSvg(null)
      setVerifyCode('')
      router.refresh()
    } catch (err) {
      console.error('MFA Verification Error:', err)
      toast.error('Erro ao validar o código.')
    } finally {
      setLoading(false)
    }
  }

  const handleUnenroll = async () => {
    if (!factorId) return
    const confirm = window.confirm('Tem certeza que deseja desativar a proteção de Dois Fatores (2FA)?')
    if (!confirm) return

    setLoading(true)
    try {
      const { error } = await supabase.auth.mfa.unenroll({ factorId })
      if (error) {
        toast.error('Erro ao desativar: ' + error.message)
      } else {
        toast.success('Proteção 2FA DESATIVADA.')
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCancelEnroll = () => {
    if (newFactorId) {
      supabase.auth.mfa.unenroll({ factorId: newFactorId }).then(() => {})
    }
    setIsOpen(false)
    setQrCodeSvg(null)
    setSecretText(null)
    setVerifyCode('')
  }

  if (enrolled) {
    return (
      <div className="flex items-center justify-between bg-green-50/50 p-4 rounded-xl border border-green-200">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-green-100 text-green-700 rounded-lg shrink-0 mt-0.5"><ShieldCheck size={20} /></div>
          <div>
            <div className="text-sm font-bold text-green-900 flex items-center gap-1.5">
              Proteção 2FA Ativada <CheckCircle2 size={14} className="text-green-600" />
            </div>
            <div className="text-[11px] sm:text-xs text-green-700 mt-0.5 leading-relaxed pr-4">Sua conta está super protegida. O login exige um código do App Autenticador.</div>
          </div>
        </div>
        <button 
           disabled={loading}
           onClick={handleUnenroll} 
           className="px-3 py-1.5 text-xs font-bold bg-white text-red-600 hover:text-red-700 border border-red-200 rounded-lg hover:bg-red-50 transition-colors flex-shrink-0 shadow-sm leading-none"
        >
          {loading ? '...' : 'DESATIVAR'}
        </button>
      </div>
    )
  }

  if (!isOpen) {
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-neutral-100 text-neutral-500 rounded-lg shrink-0 mt-0.5"><ShieldAlert size={20} /></div>
          <div>
            <div className="text-xs sm:text-sm font-bold text-neutral-900">Autenticação em Dois Fatores (2FA)</div>
            <div className="text-[10px] sm:text-xs text-neutral-500 font-medium">Recomendamos ativar para aumentar a segurança.</div>
          </div>
        </div>
        <button 
          disabled={loading} 
          onClick={handleStartEnroll} 
          className="px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white border border-transparent bg-neutral-900 rounded-lg hover:bg-black transition-colors flex-shrink-0 shadow-sm"
        >
          {loading ? 'Aguarde...' : 'Ativar 2FA'}
        </button>
      </div>
    )
  }

  return (
    <div className="border border-neutral-200 rounded-xl p-5 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2 text-sm font-bold text-neutral-900"><Smartphone size={18} className="text-blue-500" /> Configurar Autenticador</div>
        <button onClick={handleCancelEnroll} className="text-xs font-bold text-neutral-400 hover:text-neutral-700 uppercase tracking-widest">Cancelar</button>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6 items-start">
        <div className="w-full md:w-auto flex flex-col items-center">
          {qrCodeSvg ? (
             <img 
               src={qrCodeSvg} 
               alt="QR Code" 
               className="w-48 h-48 p-2 bg-white rounded-xl border border-neutral-200 shadow-sm" 
             />
          ) : (
             <div className="w-48 h-48 bg-neutral-100 animate-pulse rounded-xl" />
          )}
        </div>
        
        <div className="flex-1 space-y-4">
           <div>
             <div className="flex items-center gap-2 text-xs font-bold text-neutral-800 mb-1">
                <span className="w-5 h-5 rounded-full bg-neutral-900 text-white flex items-center justify-center text-[10px]">1</span>
                Escaneie o QR Code
             </div>
             <p className="text-[11px] text-neutral-500 pl-7">Abra seu aplicativo autenticador e escaneie a imagem ao lado.</p>
           </div>
           
           <div>
             <div className="flex items-center gap-2 text-xs font-bold text-neutral-800 mb-1">
                <span className="w-5 h-5 rounded-full bg-neutral-900 text-white flex items-center justify-center text-[10px]">2</span>
                Digite o Código
             </div>
             <p className="text-[11px] text-neutral-500 pl-7 mb-2">Após adicionar, digite os 6 números gerados no aplicativo para confirmar o pareamento.</p>
             <div className="pl-7">
               <form onSubmit={handleVerifyEnroll} className="flex gap-2">
                 <input 
                   type="text" 
                   maxLength={6} 
                   value={verifyCode}
                   onChange={e => setVerifyCode(e.target.value.replace(/\D/g, ''))}
                   placeholder="000000" 
                   required 
                   className="w-28 px-3 py-2 text-center text-lg font-black tracking-widest border border-neutral-200 rounded-lg outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500" 
                 />
                 <button 
                   disabled={loading || verifyCode.length !== 6} 
                   type="submit" 
                   className="px-4 py-2 bg-green-600 text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 shadow-sm"
                 >
                   {loading ? '...' : 'Verificar'}
                 </button>
               </form>
             </div>
           </div>
           
           {secretText && (
              <div className="pl-7 pt-2 border-t border-neutral-100 mt-4">
                 <p className="text-[10px] sm:text-xs text-neutral-400 font-medium mb-1">Não consegue escanear? Use o código secreto:</p>
                 <div className="flex items-center gap-2">
                    <code className="text-xs bg-neutral-100 text-neutral-700 font-bold px-2 py-1 rounded select-all break-all">{secretText}</code>
                    <button type="button" onClick={() => { navigator.clipboard.writeText(secretText); toast.info('Código copiado!') }} className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-md transition-colors">
                       <Copy size={14} />
                    </button>
                 </div>
              </div>
           )}
        </div>
      </div>
    </div>
  )
}

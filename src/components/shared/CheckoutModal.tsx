'use client'
// ============================================
// CAMINHO: src/components/shared/CheckoutModal.tsx
// ============================================

import { useState, useEffect } from 'react'
import { initMercadoPago, CardPayment } from '@mercadopago/sdk-react'
import { X, Loader2, Copy, CheckCircle, AlertCircle, CreditCard, ShieldCheck, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface CheckoutModalProps {
    isOpen: boolean
    onClose: () => void
    tipo: 'assinatura' | 'destaque' | 'verificacao'
    plano?: 'starter' | 'pro' | 'enterprise'
    titulo: string
    valor: number
    descricao: string
}

type PaymentMethod = 'card' | 'pix'
type Step = 'method' | 'form' | 'processing' | 'pix_waiting' | 'success' | 'error'

interface PixData {
    qr_code: string
    qr_code_base64: string
    ticket_url: string
    payment_id: number
}

function PixIcon({ size = 24, className }: { size?: number; className?: string }) {
    return (
        <svg width={size} height={size} viewBox="0 0 512 512" fill="currentColor" className={className} xmlns="http://www.w3.org/2000/svg" aria-label="PIX">
            <g fillRule="evenodd">
                <path d="M112.57 391.19c20.056 0 38.928-7.808 53.12-22l76.693-76.692c5.385-5.404 14.765-5.384 20.15 0l76.989 76.989c14.191 14.172 33.045 21.98 53.12 21.98h15.098l-97.138 97.139c-30.326 30.344-79.505 30.344-109.85 0l-97.415-97.416h9.232zm280.068-271.294c-20.056 0-38.929 7.809-53.12 22l-76.97 76.99c-5.551 5.53-14.6 5.568-20.15-.02l-76.711-76.693c-14.192-14.191-33.046-21.999-53.12-21.999h-9.234l97.416-97.416c30.344-30.344 79.523-30.344 109.867 0l97.138 97.138h-15.116z" />
                <path d="M22.758 200.753l58.024-58.024h31.787c13.84 0 27.384 5.605 37.172 15.394l76.694 76.693c7.178 7.179 16.596 10.768 26.033 10.768 9.417 0 18.854-3.59 26.014-10.75l76.989-76.99c9.787-9.787 23.331-15.393 37.171-15.393h37.654l58.3 58.302c30.343 30.344 30.343 79.523 0 109.867l-58.3 58.303H392.64c-13.84 0-27.384-5.605-37.171-15.394l-76.97-76.99c-13.914-13.894-38.172-13.894-52.066.02l-76.694 76.674c-9.788 9.788-23.332 15.413-37.172 15.413H80.782L22.758 310.62c-30.344-30.345-30.344-79.524 0-109.868" />
            </g>
        </svg>
    )
}

const PROCESSING_MESSAGES = ['Processando pagamento...', 'Verificando dados...', 'Comunicando com o banco...', 'Quase lá...']

export function CheckoutModal({ isOpen, onClose, tipo, plano, titulo, valor, descricao }: CheckoutModalProps) {
    const [step, setStep] = useState<Step>('method')
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card')
    const [pixData, setPixData] = useState<PixData | null>(null)
    const [errorMsg, setErrorMsg] = useState('')
    const [loading, setLoading] = useState(false)
    const [copied, setCopied] = useState(false)
    const [mpReady, setMpReady] = useState(false)
    const [processingMsg, setProcessingMsg] = useState(PROCESSING_MESSAGES[0])

    useEffect(() => {
        if (isOpen && !mpReady) {
            initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY!, { locale: 'pt-BR' })
            setMpReady(true)
        }
    }, [isOpen, mpReady])

    useEffect(() => {
        if (!isOpen) {
            setStep('method'); setPixData(null); setErrorMsg('')
            setLoading(false); setCopied(false); setPaymentMethod('card')
        }
    }, [isOpen])

    useEffect(() => {
        if (step !== 'processing') return
        let i = 0
        const interval = setInterval(() => {
            i = (i + 1) % PROCESSING_MESSAGES.length
            setProcessingMsg(PROCESSING_MESSAGES[i])
        }, 1500)
        return () => clearInterval(interval)
    }, [step])

    useEffect(() => {
        if (step !== 'pix_waiting' || !pixData) return
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/mp/payment/status?id=${pixData.payment_id}`)
                const data = await res.json()
                if (data.status === 'approved') { setStep('success'); clearInterval(interval) }
            } catch { }
        }, 3000)
        return () => clearInterval(interval)
    }, [step, pixData])

    async function handleCardPayment(formData: any) {
        setStep('processing')
        try {
            const res = await fetch('/api/mp/payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tipo, plano,
                    payment_type: formData.payment_method_id?.startsWith('deb') ? 'debit_card' : 'credit_card',
                    token: formData.token, payment_method_id: formData.payment_method_id,
                    installments: formData.installments, issuer_id: formData.issuer_id,
                    payer: formData.payer,
                }),
            })
            const data = await res.json()
            if (!res.ok || data.status === 'rejected') {
                setErrorMsg(data.error ?? 'Pagamento recusado.')
                setStep('error')
                return
            }
            setStep('success')
        } catch {
            setErrorMsg('Erro ao processar. Tente novamente.')
            setStep('error')
        }
    }

    async function handlePixPayment(email: string, nome: string, cpf: string) {
        setLoading(true)
        const parts = nome.trim().split(' ')
        try {
            const res = await fetch('/api/mp/payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tipo, plano, payment_type: 'pix',
                    payer: {
                        email, first_name: parts[0],
                        last_name: parts.length > 1 ? parts.slice(1).join(' ') : parts[0],
                        identification: { type: cpf.replace(/\D/g, '').length <= 11 ? 'CPF' : 'CNPJ', number: cpf.replace(/\D/g, '') },
                        phone: { area_code: '11', number: '999999999' },
                        address: { zip_code: '01310100', street_name: 'PIX', street_number: '1', neighborhood: 'Centro', city: 'São Paulo', federal_unit: 'SP' },
                    },
                }),
            })
            const data = await res.json()
            if (!res.ok) { setErrorMsg(data.error ?? 'Erro ao gerar PIX'); setStep('error'); return }
            setPixData({ qr_code: data.pix.qr_code, qr_code_base64: data.pix.qr_code_base64, ticket_url: data.pix.ticket_url, payment_id: data.id })
            setStep('pix_waiting')
        } catch { setErrorMsg('Erro ao gerar PIX.'); setStep('error') } finally { setLoading(false) }
    }

    function copyPix() {
        if (!pixData?.qr_code) return
        navigator.clipboard.writeText(pixData.qr_code)
        setCopied(true)
        setTimeout(() => setCopied(false), 3000)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={step === 'processing' ? undefined : onClose} />

            {/* Sheet em mobile, modal em desktop */}
            <div className="relative bg-white w-full sm:max-w-lg sm:mx-4 sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[92vh] overflow-y-auto">

                {/* Handle bar mobile */}
                <div className="sm:hidden flex justify-center pt-3 pb-1">
                    <div className="w-10 h-1 bg-neutral-200 rounded-full" />
                </div>

                {step !== 'processing' && (
                    <div className="flex items-center justify-between px-5 py-3.5 sm:py-4 border-b border-neutral-100">
                        <div>
                            <h2 className="font-display text-lg sm:text-xl text-neutral-900">{titulo}</h2>
                            <p className="text-[10px] sm:text-xs text-neutral-400 mt-0.5">{descricao}</p>
                        </div>
                        <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-400 transition-colors ml-2 flex-shrink-0">
                            <X size={15} />
                        </button>
                    </div>
                )}

                {step !== 'processing' && step !== 'success' && step !== 'error' && (
                    <div className="px-5 py-2.5 bg-green-50 border-b border-green-100">
                        <div className="flex items-center justify-between">
                            <span className="text-xs sm:text-sm text-green-700">Total a pagar</span>
                            <span className="font-display text-xl sm:text-2xl text-green-700">
                                R$ {valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </span>
                        </div>
                    </div>
                )}

                <div className="p-5">

                    {step === 'method' && (
                        <div>
                            <p className="text-xs sm:text-sm font-medium text-neutral-700 mb-3 sm:mb-4">Escolha a forma de pagamento:</p>
                            <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mb-4 sm:mb-5">
                                <button onClick={() => setPaymentMethod('card')}
                                    className={cn('flex flex-col items-center gap-2 p-4 sm:p-5 border-2 rounded-xl transition-all',
                                        paymentMethod === 'card' ? 'border-green-400 bg-green-50' : 'border-neutral-200'
                                    )}>
                                    <CreditCard size={22} className={paymentMethod === 'card' ? 'text-green-600' : 'text-neutral-400'} />
                                    <div className="text-center">
                                        <div className="text-xs sm:text-sm font-medium">Cartão</div>
                                        <div className="text-[10px] sm:text-xs text-neutral-400 mt-0.5">Crédito ou Débito</div>
                                    </div>
                                </button>
                                <button onClick={() => setPaymentMethod('pix')}
                                    className={cn('flex flex-col items-center gap-2 p-4 sm:p-5 border-2 rounded-xl transition-all',
                                        paymentMethod === 'pix' ? 'border-[#32BCAD] bg-[#f0fdfb]' : 'border-neutral-200'
                                    )}>
                                    <PixIcon size={22} className={paymentMethod === 'pix' ? 'text-[#32BCAD]' : 'text-neutral-400'} />
                                    <div className="text-center">
                                        <div className="text-xs sm:text-sm font-medium">PIX</div>
                                        <div className="text-[10px] sm:text-xs text-neutral-400 mt-0.5">Aprovação imediata</div>
                                    </div>
                                </button>
                            </div>
                            <Button variant="dark" className="w-full justify-center" onClick={() => setStep('form')}>
                                Continuar com {paymentMethod === 'pix' ? 'PIX' : 'Cartão'}
                            </Button>
                        </div>
                    )}

                    {step === 'form' && (
                        <>
                            {paymentMethod === 'pix' ? (
                                <PixSimpleForm onSubmit={handlePixPayment} onBack={() => setStep('method')} loading={loading} />
                            ) : (
                                <div>
                                    <button onClick={() => setStep('method')} className="text-xs text-neutral-400 hover:text-neutral-600 mb-4 flex items-center gap-1">← Voltar</button>
                                    {mpReady && (
                                        <CardPayment
                                            initialization={{ amount: valor, payer: { email: '' } }}
                                            customization={{ visual: { style: { theme: 'default' } }, paymentMethods: { minInstallments: 1, maxInstallments: 12 } }}
                                            onSubmit={async (formData) => { await handleCardPayment(formData) }}
                                            onError={() => { setErrorMsg('Erro no formulário.'); setStep('error') }}
                                        />
                                    )}
                                </div>
                            )}
                        </>
                    )}

                    {step === 'processing' && (
                        <div className="flex flex-col items-center justify-center py-10 sm:py-12 text-center">
                            <div className="relative w-16 h-16 sm:w-20 sm:h-20 mb-5 sm:mb-6">
                                <div className="absolute inset-0 rounded-full border-4 border-neutral-100" />
                                <div className="absolute inset-0 rounded-full border-4 border-green-400 border-t-transparent animate-spin" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <ShieldCheck size={24} className="text-green-600" />
                                </div>
                            </div>
                            <h3 className="font-display text-xl sm:text-2xl text-neutral-900 mb-2">Processando</h3>
                            <p className="text-xs sm:text-sm text-neutral-400 mb-5 sm:mb-6">{processingMsg}</p>
                            <div className="w-full max-w-xs h-1 bg-neutral-100 rounded-full overflow-hidden">
                                <div className="h-full bg-green-400 rounded-full animate-pulse" style={{ width: '60%' }} />
                            </div>
                            <p className="text-[10px] sm:text-xs text-neutral-300 mt-3">Não feche esta janela</p>
                        </div>
                    )}

                    {step === 'pix_waiting' && pixData && (
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-4 text-[#32BCAD]">
                                <Loader2 size={15} className="animate-spin" />
                                <span className="text-xs sm:text-sm font-medium">Aguardando pagamento PIX...</span>
                            </div>
                            {pixData.qr_code_base64 && (
                                <div className="flex justify-center mb-4">
                                    <div className="p-2.5 sm:p-3 border-2 border-[#32BCAD]/30 rounded-2xl bg-white inline-block">
                                        <img src={`data:image/png;base64,${pixData.qr_code_base64}`} alt="QR Code PIX" className="w-36 h-36 sm:w-44 sm:h-44 rounded-lg" />
                                    </div>
                                </div>
                            )}
                            <p className="text-[10px] sm:text-xs text-neutral-500 mb-3">Ou copie o código PIX:</p>
                            <div className="flex items-center gap-2 mb-3 sm:mb-4">
                                <p className="text-[10px] sm:text-xs text-neutral-600 flex-1 truncate font-mono bg-neutral-50 border border-neutral-200 rounded-lg px-2.5 sm:px-3 py-2">
                                    {pixData.qr_code}
                                </p>
                                <button onClick={copyPix}
                                    className={cn('flex-shrink-0 flex items-center gap-1 text-[10px] sm:text-xs font-medium px-2.5 sm:px-3 py-2 rounded-lg transition-all',
                                        copied ? 'bg-green-100 text-green-700' : 'bg-[#32BCAD]/10 text-[#32BCAD]'
                                    )}>
                                    {copied ? <><CheckCircle size={12} /> Copiado!</> : <><Copy size={12} /> Copiar</>}
                                </button>
                            </div>
                            <p className="text-[10px] sm:text-xs text-neutral-400">Válido por 30 minutos</p>
                        </div>
                    )}

                    {step === 'success' && (
                        <div className="text-center py-4 sm:py-6">
                            <div className="relative w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-5">
                                <div className="w-full h-full bg-green-100 rounded-full flex items-center justify-center">
                                    <CheckCircle size={32} className="text-green-600" />
                                </div>
                                <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-amber-400 rounded-full flex items-center justify-center">
                                    <Sparkles size={10} className="text-white" />
                                </div>
                            </div>
                            <h3 className="font-display text-2xl sm:text-3xl text-green-700 mb-2">APROVADO!</h3>
                            <p className="text-xs sm:text-sm text-neutral-500 mb-4 sm:mb-6">Pagamento processado com sucesso.</p>
                            <Button variant="dark" size="lg" className="w-full justify-center" onClick={() => { onClose(); window.location.reload() }}>
                                Continuar
                            </Button>
                        </div>
                    )}

                    {step === 'error' && (
                        <div className="text-center py-3 sm:py-4">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                                <AlertCircle size={28} className="text-red-500" />
                            </div>
                            <h3 className="font-display text-xl sm:text-2xl text-red-600 mb-2">RECUSADO</h3>
                            <p className="text-xs sm:text-sm text-neutral-500 mb-5 sm:mb-6">{errorMsg}</p>
                            <div className="flex gap-2.5 sm:gap-3">
                                <Button variant="outline" className="flex-1 justify-center" onClick={() => setStep('method')}>Tentar novamente</Button>
                                <Button variant="dark" className="flex-1 justify-center" onClick={onClose}>Fechar</Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

function PixSimpleForm({ onSubmit, onBack, loading }: { onSubmit: (email: string, nome: string, cpf: string) => void; onBack: () => void; loading: boolean }) {
    const [nome, setNome] = useState('')
    const [email, setEmail] = useState('')
    const [cpf, setCpf] = useState('')
    const [errors, setErrors] = useState<Record<string, string>>({})

    function formatCpfCnpj(value: string) {
        const digits = value.replace(/\D/g, '')
        if (digits.length <= 11) return digits.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2')
        return digits.replace(/(\d{2})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1/$2').replace(/(\d{4})(\d{1,2})$/, '$1-$2')
    }

    function validate() {
        const e: Record<string, string> = {}
        if (!nome.trim() || nome.trim().split(' ').length < 2) e.nome = 'Informe nome e sobrenome'
        if (!email.includes('@')) e.email = 'E-mail inválido'
        const digits = cpf.replace(/\D/g, '')
        if (digits.length !== 11 && digits.length !== 14) e.cpf = 'CPF ou CNPJ inválido'
        setErrors(e)
        return Object.keys(e).length === 0
    }

    const inputClass = "w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-lg outline-none focus:border-[#32BCAD] focus:ring-2 focus:ring-[#32BCAD]/10 bg-white transition-colors"
    const labelClass = "block text-[10px] sm:text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1.5"

    return (
        <form onSubmit={e => { e.preventDefault(); if (validate()) onSubmit(email, nome, cpf) }} className="flex flex-col gap-4">
            <button type="button" onClick={onBack} className="text-xs text-neutral-400 hover:text-neutral-600 flex items-center gap-1 self-start">← Voltar</button>
            <div>
                <label className={labelClass}>Nome completo</label>
                <input className={inputClass} placeholder="João da Silva" value={nome} onChange={e => setNome(e.target.value)} />
                {errors.nome && <p className="text-[10px] sm:text-xs text-red-500 mt-1">{errors.nome}</p>}
            </div>
            <div>
                <label className={labelClass}>E-mail</label>
                <input type="email" className={inputClass} placeholder="joao@email.com" value={email} onChange={e => setEmail(e.target.value)} />
                {errors.email && <p className="text-[10px] sm:text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>
            <div>
                <label className={labelClass}>CPF ou CNPJ</label>
                <input className={inputClass} placeholder="000.000.000-00" value={cpf} maxLength={18} onChange={e => setCpf(formatCpfCnpj(e.target.value))} />
                {errors.cpf && <p className="text-[10px] sm:text-xs text-red-500 mt-1">{errors.cpf}</p>}
            </div>
            <Button type="submit" variant="dark" className="w-full justify-center mt-1" loading={loading}>
                <PixIcon size={14} className="text-white" /> Gerar QR Code PIX
            </Button>
        </form>
    )
}
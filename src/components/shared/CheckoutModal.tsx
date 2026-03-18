'use client'
import { useState, useEffect } from 'react'
import { initMercadoPago, CardPayment } from '@mercadopago/sdk-react'
import { X, Loader2, Copy, CheckCircle, AlertCircle, CreditCard, Smartphone } from 'lucide-react'
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
type Step = 'method' | 'form' | 'pix_waiting' | 'success' | 'error'

interface PixData {
    qr_code: string
    qr_code_base64: string
    ticket_url: string
    payment_id: number
}

interface PixPayerData {
    email: string
    first_name: string
    last_name: string
    identification: { type: 'CPF' | 'CNPJ'; number: string }
    phone: { area_code: string; number: string }
    address: {
        zip_code: string
        street_name: string
        street_number: string
        neighborhood: string
        city: string
        federal_unit: string
    }
}

export function CheckoutModal({
    isOpen,
    onClose,
    tipo,
    plano,
    titulo,
    valor,
    descricao,
}: CheckoutModalProps) {
    const [step, setStep] = useState<Step>('method')
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('card')
    const [pixData, setPixData] = useState<PixData | null>(null)
    const [errorMsg, setErrorMsg] = useState('')
    const [loading, setLoading] = useState(false)
    const [copied, setCopied] = useState(false)
    const [mpReady, setMpReady] = useState(false)

    useEffect(() => {
        if (isOpen && !mpReady) {
            initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY!, {
                locale: 'pt-BR',
            })
            setMpReady(true)
        }
    }, [isOpen, mpReady])

    useEffect(() => {
        if (!isOpen) {
            setStep('method')
            setPixData(null)
            setErrorMsg('')
            setLoading(false)
            setCopied(false)
            setPaymentMethod('card')
        }
    }, [isOpen])

    // Polling status PIX
    useEffect(() => {
        if (step !== 'pix_waiting' || !pixData) return
        const interval = setInterval(async () => {
            try {
                const res = await fetch(`/api/mp/payment/status?id=${pixData.payment_id}`)
                const data = await res.json()
                if (data.status === 'approved') {
                    setStep('success')
                    clearInterval(interval)
                }
            } catch {
                // Continua tentando
            }
        }, 3000)
        return () => clearInterval(interval)
    }, [step, pixData])

    async function handlePixPayment(payerData: PixPayerData) {
        setLoading(true)
        try {
            const res = await fetch('/api/mp/payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tipo,
                    plano,
                    payment_type: 'pix',
                    payer: payerData,
                }),
            })
            const data = await res.json()
            if (!res.ok) {
                setErrorMsg(data.error ?? 'Erro ao gerar PIX')
                setStep('error')
                return
            }
            setPixData({
                qr_code: data.pix.qr_code,
                qr_code_base64: data.pix.qr_code_base64,
                ticket_url: data.pix.ticket_url,
                payment_id: data.id,
            })
            setStep('pix_waiting')
        } catch {
            setErrorMsg('Erro ao gerar PIX. Tente novamente.')
            setStep('error')
        } finally {
            setLoading(false)
        }
    }

    async function handleCardPayment(formData: any) {
        setLoading(true)
        try {
            const res = await fetch('/api/mp/payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tipo,
                    plano,
                    payment_type: formData.payment_method_id?.startsWith('deb') ? 'debit_card' : 'credit_card',
                    token: formData.token,
                    payment_method_id: formData.payment_method_id,
                    installments: formData.installments,
                    issuer_id: formData.issuer_id,
                    payer: formData.payer,
                }),
            })
            const data = await res.json()
            if (!res.ok || data.status === 'rejected') {
                setErrorMsg(data.error ?? 'Pagamento recusado. Verifique os dados do cartão.')
                setStep('error')
                return
            }
            setStep('success')
        } catch {
            setErrorMsg('Erro ao processar pagamento. Tente novamente.')
            setStep('error')
        } finally {
            setLoading(false)
        }
    }

    function copyPix() {
        if (!pixData?.qr_code) return
        navigator.clipboard.writeText(pixData.qr_code)
        setCopied(true)
        setTimeout(() => setCopied(false), 3000)
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
                    <div>
                        <h2 className="font-display text-xl text-neutral-900">{titulo}</h2>
                        <p className="text-xs text-neutral-400 mt-0.5">{descricao}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center text-neutral-400 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Valor */}
                <div className="px-6 py-3 bg-green-50 border-b border-green-100">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-green-700">Total a pagar</span>
                        <span className="font-display text-2xl text-green-700">
                            R$ {valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                </div>

                <div className="p-6">

                    {/* STEP: Método */}
                    {step === 'method' && (
                        <div>
                            <p className="text-sm font-medium text-neutral-700 mb-4">Escolha a forma de pagamento:</p>
                            <div className="grid grid-cols-2 gap-3 mb-6">
                                <button
                                    onClick={() => setPaymentMethod('card')}
                                    className={cn(
                                        'flex flex-col items-center gap-2 p-4 border-2 rounded-xl transition-all',
                                        paymentMethod === 'card' ? 'border-green-400 bg-green-50' : 'border-neutral-200 hover:border-neutral-300'
                                    )}
                                >
                                    <CreditCard size={24} className={paymentMethod === 'card' ? 'text-green-600' : 'text-neutral-400'} />
                                    <span className="text-sm font-medium">Cartão</span>
                                    <span className="text-xs text-neutral-400">Crédito ou Débito</span>
                                </button>
                                <button
                                    onClick={() => setPaymentMethod('pix')}
                                    className={cn(
                                        'flex flex-col items-center gap-2 p-4 border-2 rounded-xl transition-all',
                                        paymentMethod === 'pix' ? 'border-green-400 bg-green-50' : 'border-neutral-200 hover:border-neutral-300'
                                    )}
                                >
                                    <Smartphone size={24} className={paymentMethod === 'pix' ? 'text-green-600' : 'text-neutral-400'} />
                                    <span className="text-sm font-medium">PIX</span>
                                    <span className="text-xs text-neutral-400">Aprovação imediata</span>
                                </button>
                            </div>
                            <Button variant="dark" className="w-full" onClick={() => setStep('form')}>
                                Continuar
                            </Button>
                        </div>
                    )}

                    {/* STEP: Formulário */}
                    {step === 'form' && (
                        <div>
                            {paymentMethod === 'pix' ? (
                                <PixForm
                                    onSubmit={handlePixPayment}
                                    onBack={() => setStep('method')}
                                    loading={loading}
                                />
                            ) : (
                                <div>
                                    <button
                                        onClick={() => setStep('method')}
                                        className="text-xs text-neutral-400 hover:text-neutral-600 mb-4 flex items-center gap-1"
                                    >
                                        ← Voltar
                                    </button>
                                    {mpReady && (
                                        <CardPayment
                                            initialization={{ amount: valor, payer: { email: '' } }}
                                            customization={{
                                                visual: { style: { theme: 'default' } },
                                                paymentMethods: { minInstallments: 1, maxInstallments: 12 },
                                            }}
                                            onSubmit={async (formData) => { await handleCardPayment(formData) }}
                                            onError={() => {
                                                setErrorMsg('Erro no formulário do cartão.')
                                                setStep('error')
                                            }}
                                        />
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP: PIX aguardando */}
                    {step === 'pix_waiting' && pixData && (
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-2 mb-4 text-amber-600">
                                <Loader2 size={16} className="animate-spin" />
                                <span className="text-sm font-medium">Aguardando pagamento PIX...</span>
                            </div>
                            {pixData.qr_code_base64 && (
                                <div className="flex justify-center mb-4">
                                    <img
                                        src={`data:image/png;base64,${pixData.qr_code_base64}`}
                                        alt="QR Code PIX"
                                        className="w-48 h-48 rounded-xl border border-neutral-200"
                                    />
                                </div>
                            )}
                            <p className="text-xs text-neutral-500 mb-3">Ou copie o código PIX abaixo:</p>
                            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 mb-4 flex items-center gap-2">
                                <p className="text-xs text-neutral-600 flex-1 truncate font-mono">{pixData.qr_code}</p>
                                <button onClick={copyPix} className="flex-shrink-0 text-green-600 hover:text-green-700">
                                    {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                                </button>
                            </div>
                            <p className="text-xs text-neutral-400">
                                O QR Code expira em 30 minutos. Após o pagamento, a confirmação é automática.
                            </p>
                        </div>
                    )}

                    {/* STEP: Sucesso */}
                    {step === 'success' && (
                        <div className="text-center py-4">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle size={32} className="text-green-600" />
                            </div>
                            <h3 className="font-display text-2xl text-green-700 mb-2">PAGAMENTO APROVADO!</h3>
                            <p className="text-sm text-neutral-500 mb-6">
                                Seu pagamento foi processado com sucesso. As funcionalidades já estão ativas.
                            </p>
                            <Button variant="dark" className="w-full" onClick={() => { onClose(); window.location.reload() }}>
                                Continuar
                            </Button>
                        </div>
                    )}

                    {/* STEP: Erro */}
                    {step === 'error' && (
                        <div className="text-center py-4">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <AlertCircle size={32} className="text-red-500" />
                            </div>
                            <h3 className="font-display text-2xl text-red-600 mb-2">PAGAMENTO RECUSADO</h3>
                            <p className="text-sm text-neutral-500 mb-6">{errorMsg}</p>
                            <div className="flex gap-3">
                                <Button variant="outline" className="flex-1" onClick={() => setStep('method')}>
                                    Tentar novamente
                                </Button>
                                <Button variant="dark" className="flex-1" onClick={onClose}>
                                    Fechar
                                </Button>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    )
}

// -----------------------------------------------
// Formulário PIX
// -----------------------------------------------
function PixForm({
    onSubmit,
    onBack,
    loading,
}: {
    onSubmit: (data: PixPayerData) => void
    onBack: () => void
    loading: boolean
}) {
    const [form, setForm] = useState<PixPayerData>({
        email: '',
        first_name: '',
        last_name: '',
        identification: { type: 'CPF', number: '' },
        phone: { area_code: '', number: '' },
        address: {
            zip_code: '',
            street_name: '',
            street_number: '',
            neighborhood: '',
            city: '',
            federal_unit: '',
        },
    })
    const [errors, setErrors] = useState<Record<string, string>>({})

    function validate(): boolean {
        const e: Record<string, string> = {}
        if (!form.first_name.trim()) e.first_name = 'Obrigatório'
        if (!form.last_name.trim()) e.last_name = 'Obrigatório'
        if (!form.email.includes('@')) e.email = 'E-mail inválido'
        if (form.identification.number.replace(/\D/g, '').length < 11) e.cpf = 'CPF/CNPJ inválido'
        if (form.phone.area_code.length !== 2) e.phone = 'DDD inválido'
        if (form.phone.number.length < 8) e.phone_number = 'Telefone inválido'
        if (form.address.zip_code.replace(/\D/g, '').length !== 8) e.zip_code = 'CEP inválido'
        if (!form.address.street_name.trim()) e.street_name = 'Obrigatório'
        if (!form.address.street_number.trim()) e.street_number = 'Obrigatório'
        if (!form.address.neighborhood.trim()) e.neighborhood = 'Obrigatório'
        if (!form.address.city.trim()) e.city = 'Obrigatório'
        if (form.address.federal_unit.length !== 2) e.federal_unit = 'UF inválida'
        setErrors(e)
        return Object.keys(e).length === 0
    }

    async function fetchCEP(cep: string) {
        const digits = cep.replace(/\D/g, '')
        if (digits.length !== 8) return
        try {
            const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
            const data = await res.json()
            if (!data.erro) {
                setForm(f => ({
                    ...f,
                    address: {
                        ...f.address,
                        street_name: data.logradouro,
                        neighborhood: data.bairro,
                        city: data.localidade,
                        federal_unit: data.uf,
                        zip_code: digits,
                    },
                }))
            }
        } catch { }
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (validate()) onSubmit(form)
    }

    const inputClass = "w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-lg outline-none focus:border-green-400 bg-white"
    const labelClass = "block text-xs font-medium text-neutral-500 uppercase tracking-wide mb-1"
    const errorClass = "text-xs text-red-500 mt-1"

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <button
                type="button"
                onClick={onBack}
                className="text-xs text-neutral-400 hover:text-neutral-600 flex items-center gap-1 self-start"
            >
                ← Voltar
            </button>

            <p className="text-sm font-medium text-neutral-700">Dados do pagador</p>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className={labelClass}>Nome</label>
                    <input
                        className={inputClass}
                        placeholder="João"
                        value={form.first_name}
                        onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))}
                    />
                    {errors.first_name && <p className={errorClass}>{errors.first_name}</p>}
                </div>
                <div>
                    <label className={labelClass}>Sobrenome</label>
                    <input
                        className={inputClass}
                        placeholder="Silva"
                        value={form.last_name}
                        onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))}
                    />
                    {errors.last_name && <p className={errorClass}>{errors.last_name}</p>}
                </div>
            </div>

            <div>
                <label className={labelClass}>E-mail</label>
                <input
                    type="email"
                    className={inputClass}
                    placeholder="joao@email.com"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                />
                {errors.email && <p className={errorClass}>{errors.email}</p>}
            </div>

            <div className="grid grid-cols-3 gap-3">
                <div>
                    <label className={labelClass}>Tipo doc.</label>
                    <select
                        className={inputClass}
                        value={form.identification.type}
                        onChange={e => setForm(f => ({
                            ...f,
                            identification: { ...f.identification, type: e.target.value as 'CPF' | 'CNPJ' },
                        }))}
                    >
                        <option value="CPF">CPF</option>
                        <option value="CNPJ">CNPJ</option>
                    </select>
                </div>
                <div className="col-span-2">
                    <label className={labelClass}>Número</label>
                    <input
                        className={inputClass}
                        placeholder="000.000.000-00"
                        value={form.identification.number}
                        onChange={e => setForm(f => ({
                            ...f,
                            identification: { ...f.identification, number: e.target.value.replace(/\D/g, '') },
                        }))}
                    />
                    {errors.cpf && <p className={errorClass}>{errors.cpf}</p>}
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
                <div>
                    <label className={labelClass}>DDD</label>
                    <input
                        className={inputClass}
                        placeholder="51"
                        maxLength={2}
                        value={form.phone.area_code}
                        onChange={e => setForm(f => ({
                            ...f,
                            phone: { ...f.phone, area_code: e.target.value.replace(/\D/g, '') },
                        }))}
                    />
                    {errors.phone && <p className={errorClass}>{errors.phone}</p>}
                </div>
                <div className="col-span-2">
                    <label className={labelClass}>Telefone</label>
                    <input
                        className={inputClass}
                        placeholder="999999999"
                        value={form.phone.number}
                        onChange={e => setForm(f => ({
                            ...f,
                            phone: { ...f.phone, number: e.target.value.replace(/\D/g, '') },
                        }))}
                    />
                    {errors.phone_number && <p className={errorClass}>{errors.phone_number}</p>}
                </div>
            </div>

            <p className="text-sm font-medium text-neutral-700 mt-1">Endereço</p>

            <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                    <label className={labelClass}>CEP</label>
                    <input
                        className={inputClass}
                        placeholder="00000-000"
                        maxLength={9}
                        value={form.address.zip_code}
                        onChange={e => {
                            const val = e.target.value.replace(/\D/g, '')
                            setForm(f => ({ ...f, address: { ...f.address, zip_code: val } }))
                            fetchCEP(val)
                        }}
                    />
                    {errors.zip_code && <p className={errorClass}>{errors.zip_code}</p>}
                </div>
                <div>
                    <label className={labelClass}>UF</label>
                    <input
                        className={inputClass}
                        placeholder="RS"
                        maxLength={2}
                        value={form.address.federal_unit}
                        onChange={e => setForm(f => ({
                            ...f,
                            address: { ...f.address, federal_unit: e.target.value.toUpperCase() },
                        }))}
                    />
                    {errors.federal_unit && <p className={errorClass}>{errors.federal_unit}</p>}
                </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                    <label className={labelClass}>Rua</label>
                    <input
                        className={inputClass}
                        placeholder="Rua das Flores"
                        value={form.address.street_name}
                        onChange={e => setForm(f => ({
                            ...f,
                            address: { ...f.address, street_name: e.target.value },
                        }))}
                    />
                    {errors.street_name && <p className={errorClass}>{errors.street_name}</p>}
                </div>
                <div>
                    <label className={labelClass}>Número</label>
                    <input
                        className={inputClass}
                        placeholder="123"
                        value={form.address.street_number}
                        onChange={e => setForm(f => ({
                            ...f,
                            address: { ...f.address, street_number: e.target.value },
                        }))}
                    />
                    {errors.street_number && <p className={errorClass}>{errors.street_number}</p>}
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className={labelClass}>Bairro</label>
                    <input
                        className={inputClass}
                        placeholder="Centro"
                        value={form.address.neighborhood}
                        onChange={e => setForm(f => ({
                            ...f,
                            address: { ...f.address, neighborhood: e.target.value },
                        }))}
                    />
                    {errors.neighborhood && <p className={errorClass}>{errors.neighborhood}</p>}
                </div>
                <div>
                    <label className={labelClass}>Cidade</label>
                    <input
                        className={inputClass}
                        placeholder="Porto Alegre"
                        value={form.address.city}
                        onChange={e => setForm(f => ({
                            ...f,
                            address: { ...f.address, city: e.target.value },
                        }))}
                    />
                    {errors.city && <p className={errorClass}>{errors.city}</p>}
                </div>
            </div>

            <Button type="submit" variant="dark" className="w-full mt-2" loading={loading}>
                Gerar QR Code PIX
            </Button>
        </form>
    )
}
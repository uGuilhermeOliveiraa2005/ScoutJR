'use client'
import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
    Elements,
    PaymentElement,
    useStripe,
    useElements,
} from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/Button'
import { Shield } from 'lucide-react'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface CheckoutFormProps {
    tipo: string
    plano: string
    preco: number
    titulo: string
    userEmail: string
}

export function CheckoutForm(props: CheckoutFormProps) {
    const [clientSecret, setClientSecret] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        fetch('/api/stripe/payment-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tipo: props.tipo, plano: props.plano }),
        })
            .then(r => r.json())
            .then(data => {
                if (data.error) {
                    setError(data.error)
                } else {
                    setClientSecret(data.clientSecret)
                }
                setLoading(false)
            })
            .catch(() => {
                setError('Erro ao carregar formulário de pagamento.')
                setLoading(false)
            })
    }, [props.tipo, props.plano])

    if (loading) {
        return (
            <div className="bg-white border border-neutral-200 rounded-2xl p-8 flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-3 text-neutral-400">
                    <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm">Preparando pagamento...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="bg-white border border-neutral-200 rounded-2xl p-8">
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
                    {error}
                </div>
            </div>
        )
    }

    return (
        <Elements
            stripe={stripePromise}
            options={{
                clientSecret,
                appearance: {
                    theme: 'stripe',
                    variables: {
                        colorPrimary: '#1D9E75',
                        colorBackground: '#ffffff',
                        colorText: '#1a1a18',
                        colorDanger: '#ef4444',
                        fontFamily: 'DM Sans, sans-serif',
                        borderRadius: '10px',
                        spacingUnit: '4px',
                    },
                    rules: {
                        '.Input': {
                            border: '1px solid #f1f0ec',
                            boxShadow: 'none',
                            padding: '10px 12px',
                        },
                        '.Input:focus': {
                            border: '1px solid #1D9E75',
                            boxShadow: '0 0 0 3px rgba(29, 158, 117, 0.1)',
                        },
                        '.Label': {
                            fontSize: '11px',
                            fontWeight: '500',
                            textTransform: 'uppercase',
                            letterSpacing: '0.05em',
                            color: '#888780',
                        },
                    },
                },
            }}
        >
            <InnerForm {...props} />
        </Elements>
    )
}

function InnerForm({ tipo, plano, preco, titulo, userEmail }: CheckoutFormProps) {
    const stripe = useStripe()
    const elements = useElements()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!stripe || !elements) return

        setLoading(true)
        setError('')

        const { error: submitError } = await elements.submit()
        if (submitError) {
            setError(submitError.message || 'Erro ao processar pagamento.')
            setLoading(false)
            return
        }

        const { error: confirmError } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/checkout/sucesso?tipo=${tipo}&plano=${plano}`,
                payment_method_data: {
                    billing_details: { email: userEmail },
                },
            },
        })

        if (confirmError) {
            setError(confirmError.message || 'Erro ao confirmar pagamento.')
            setLoading(false)
        }
    }

    return (
        <div className="bg-white border border-neutral-200 rounded-2xl p-6">
            <p className="text-xs uppercase tracking-widest text-neutral-400 mb-6">Dados de pagamento</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <PaymentElement
                    options={{
                        layout: 'tabs',
                        defaultValues: {
                            billingDetails: { email: userEmail },
                        },
                    }}
                />

                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
                        {error}
                    </div>
                )}

                <Button
                    type="submit"
                    variant="dark"
                    size="lg"
                    loading={loading}
                    disabled={!stripe || !elements}
                    className="w-full"
                >
                    <Shield size={16} />
                    Pagar R$ {preco.toLocaleString('pt-BR')}
                </Button>

                <p className="text-center text-xs text-neutral-400">
                    Ao confirmar você concorda com nossos{' '}
                    <a href="/termos" className="underline hover:text-neutral-600">Termos de Uso</a>
                    {' '}e{' '}
                    <a href="/privacidade" className="underline hover:text-neutral-600">Política de Privacidade</a>
                </p>
            </form>
        </div>
    )
}
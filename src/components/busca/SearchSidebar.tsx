'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, SlidersHorizontal } from 'lucide-react'
import { POSICOES, ESTADOS } from '@/lib/utils'
import { CitySelect } from '@/components/ui/CitySelect'

export function SearchSidebar({ params }: { params: any }) {
    const router = useRouter()
    const [estado, setEstado] = useState(params.estado || '')
    const [cidade, setCidade] = useState(params.cidade || '')
    const [nome, setNome] = useState(params.nome || '')

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        const newParams = new URLSearchParams()
        if (nome) newParams.set('nome', nome)
        if (params.posicao) newParams.set('posicao', params.posicao)
        if (estado) newParams.set('estado', estado)
        if (cidade) newParams.set('cidade', cidade)
        
        router.push(`/busca?${newParams.toString()}`)
    }

    const clearFilters = () => {
        router.push('/busca')
    }

    return (
        <div className="bg-white border border-neutral-200 rounded-xl p-5 sticky top-20">
            <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium flex items-center gap-2">
                    <SlidersHorizontal size={15} /> Filtros
                </span>
                {(params.nome || params.posicao || params.estado || params.cidade) && (
                    <button 
                        onClick={clearFilters}
                        className="text-xs text-green-600 hover:text-green-700"
                    >
                        Limpar
                    </button>
                )}
            </div>

            <form onSubmit={handleSearch} className="flex flex-col gap-4">
                <div>
                    <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wide mb-1.5">Nome</label>
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                        <input
                            name="nome"
                            value={nome}
                            onChange={e => setNome(e.target.value)}
                            placeholder="Nome do atleta..."
                            className="w-full pl-9 pr-3 py-2 text-sm border border-neutral-200 rounded-lg outline-none focus:border-green-400 bg-white"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wide mb-1.5">Posição</label>
                    <div className="grid grid-cols-3 gap-1.5">
                        <button
                            type="button"
                            onClick={() => {
                                const p = new URLSearchParams(params)
                                p.delete('posicao')
                                router.push(`/busca?${p.toString()}`)
                            }}
                            className={`text-center py-1.5 text-xs border rounded-lg transition-colors ${!params.posicao ? 'bg-green-100 border-green-400 text-green-700 font-medium' : 'border-neutral-200 text-neutral-500 hover:border-neutral-300'
                                }`}
                        >
                            Todos
                        </button>
                        {POSICOES.slice(0, 8).map(p => (
                            <button
                                key={p.value}
                                type="button"
                                onClick={() => {
                                    const ps = new URLSearchParams(params)
                                    ps.set('posicao', p.value)
                                    router.push(`/busca?${ps.toString()}`)
                                }}
                                className={`text-center py-1.5 text-xs border rounded-lg transition-colors ${params.posicao === p.value ? 'bg-green-100 border-green-400 text-green-700 font-medium' : 'border-neutral-200 text-neutral-500 hover:border-neutral-300'
                                    }`}
                            >
                                {p.value}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wide mb-1.5">Estado</label>
                    <select
                        name="estado"
                        value={estado}
                        onChange={e => { setEstado(e.target.value); setCidade('') }}
                        className="w-full px-3 py-2 text-sm border border-neutral-200 rounded-lg outline-none focus:border-green-400 bg-white appearance-none cursor-pointer"
                    >
                        <option value="">Todos</option>
                        {ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-medium text-neutral-400 uppercase tracking-wide mb-1.5">Cidade</label>
                    <CitySelect
                        estado={estado}
                        value={cidade}
                        onChange={e => setCidade(e.target.value)}
                        placeholder="Todas"
                        className="py-2"
                    />
                </div>

                <button
                    type="submit"
                    className="w-full py-2 text-sm bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors font-medium"
                >
                    Buscar
                </button>
            </form>
        </div>
    )
}

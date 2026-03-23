'use client'

import { useState, useRef, useEffect } from 'react'
import { Camera, Loader2, Eye, MapPin, MessageCircle, ImageIcon } from 'lucide-react'
import { ESTADOS, POSICAO_LABEL, cn } from '@/lib/utils'
import { updateAtleta } from './actions'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { CitySelect } from '@/components/ui/CitySelect'

const POSICOES = [
    { value: 'GK', label: 'GK', sub: 'Goleiro' },
    { value: 'LD', label: 'LD', sub: 'Lat. Dir.' },
    { value: 'LE', label: 'LE', sub: 'Lat. Esq.' },
    { value: 'ZAG', label: 'ZAG', sub: 'Zagueiro' },
    { value: 'VOL', label: 'VOL', sub: 'Volante' },
    { value: 'MEI', label: 'MEI', sub: 'Meia' },
    { value: 'EXT', label: 'EXT', sub: 'Extremo' },
    { value: 'SA', label: 'SA', sub: '2° Ataq.' },
    { value: 'CA', label: 'CA', sub: 'C. Avante' },
]

const HABILIDADES = [
    { key: 'hab_tecnica', label: 'Técnica' },
    { key: 'hab_velocidade', label: 'Velocidade' },
    { key: 'hab_visao', label: 'Visão de jogo' },
    { key: 'hab_fisico', label: 'Físico' },
    { key: 'hab_finalizacao', label: 'Finalização' },
    { key: 'hab_passes', label: 'Passes' },
]

const HAB_FIELDS: Record<string, keyof typeof initialHab> = {
    hab_tecnica: 'hab_tecnica',
    hab_velocidade: 'hab_velocidade',
    hab_visao: 'hab_visao',
    hab_fisico: 'hab_fisico',
    hab_finalizacao: 'hab_finalizacao',
    hab_passes: 'hab_passes',
}

const initialHab = {
    hab_tecnica: 50, hab_velocidade: 50, hab_visao: 50,
    hab_fisico: 50, hab_finalizacao: 50, hab_passes: 50,
}

export function AtletaConfigForm({ atleta }: { atleta: any }) {
    const router = useRouter()
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [loading, setLoading] = useState(false)
    const [preview, setPreview] = useState('')
    const [selectedFile, setSelectedFile] = useState<File | null>(null)

    // Dados básicos
    const [nome, setNome] = useState(atleta?.nome ?? '')
    const [descricao, setDescricao] = useState(atleta?.descricao ?? '')
    const [dataNasc, setDataNasc] = useState(atleta?.data_nascimento ?? '')
    const [estado, setEstado] = useState(atleta?.estado ?? '')
    const [cidade, setCidade] = useState(atleta?.cidade ?? '')
    const [posicao, setPosicao] = useState(atleta?.posicao ?? 'MEI')
    const [peDominante, setPeDominante] = useState(atleta?.pe_dominante ?? 'destro')
    const [escolinhaAt, setEscolinhaAt] = useState(atleta?.escolinha_atual ?? '')

    // Habilidades
    const [habilidades, setHabilidades] = useState({
        hab_tecnica: atleta?.habilidade_tecnica ?? 50,
        hab_velocidade: atleta?.habilidade_velocidade ?? 50,
        hab_visao: atleta?.habilidade_visao ?? 50,
        hab_fisico: atleta?.habilidade_fisico ?? 50,
        hab_finalizacao: atleta?.habilidade_finalizacao ?? 50,
        hab_passes: atleta?.habilidade_passes ?? 50,
    })

    // Privacidade
    const [visivel, setVisivel] = useState(atleta?.visivel ?? true)
    const [exibirCidade, setExibirCidade] = useState(atleta?.exibir_cidade ?? true)
    const [aceitarMensagens, setAceitarMsg] = useState(atleta?.aceitar_mensagens ?? false)

    // Sincronizar estado local com props quando o servidor atualizar (router.refresh)
    useEffect(() => {
        setNome(atleta?.nome ?? '')
        setDescricao(atleta?.descricao ?? '')
        setDataNasc(atleta?.data_nascimento ?? '')
        setEstado(atleta?.estado ?? '')
        setCidade(atleta?.cidade ?? '')
        setPosicao(atleta?.posicao ?? 'MEI')
        setPeDominante(atleta?.pe_dominante ?? 'destro')
        setEscolinhaAt(atleta?.escolinha_atual ?? '')
        setHabilidades({
            hab_tecnica: atleta?.habilidade_tecnica ?? 50,
            hab_velocidade: atleta?.habilidade_velocidade ?? 50,
            hab_visao: atleta?.habilidade_visao ?? 50,
            hab_fisico: atleta?.habilidade_fisico ?? 50,
            hab_finalizacao: atleta?.habilidade_finalizacao ?? 50,
            hab_passes: atleta?.habilidade_passes ?? 50,
        })
        setVisivel(atleta?.visivel ?? true)
        setExibirCidade(atleta?.exibir_cidade ?? true)
        setAceitarMsg(atleta?.aceitar_mensagens ?? false)
        setPreview('')
        setSelectedFile(null)
    }, [atleta])

    const currentFoto = atleta?.foto_url ?? ''
    const validFoto = currentFoto && currentFoto !== 'null' ? currentFoto : ''
    const displayFoto = preview || validFoto

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        const fd = new FormData()
        fd.append('atleta_id', atleta.id)
        fd.append('nome', nome)
        fd.append('descricao', descricao)
        fd.append('data_nascimento', dataNasc)
        fd.append('estado', estado)
        fd.append('cidade', cidade)
        fd.append('posicao', posicao)
        fd.append('pe_dominante', peDominante)
        fd.append('escolinha_atual', escolinhaAt)
        fd.append('current_foto_url', validFoto)
        fd.append('visivel', String(visivel))
        fd.append('exibir_cidade', String(exibirCidade))
        fd.append('aceitar_mensagens', String(aceitarMensagens))
        Object.entries(habilidades).forEach(([k, v]) => fd.append(k, String(v)))
        if (selectedFile) fd.append('foto_url', selectedFile)

        const res = await updateAtleta(fd)
        setLoading(false)
        if (res?.error) toast.error(res.error)
        else { toast.success('Perfil do atleta atualizado!'); setSelectedFile(null); router.refresh() }
    }

    const inputClass = 'w-full px-3 py-2.5 text-sm border border-neutral-200 rounded-lg bg-white outline-none focus:border-green-400 focus:ring-2 focus:ring-green-100 transition-colors'

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">

            {/* Foto de capa */}
            <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wide mb-3">
                    Foto de capa / perfil
                </label>
                <div className="flex items-center gap-4">
                    <div
                        className="relative w-20 h-20 rounded-xl bg-neutral-100 border-2 border-dashed border-neutral-300 overflow-hidden cursor-pointer group flex-shrink-0"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        {displayFoto
                            ? <img src={displayFoto} className="w-full h-full object-cover" alt="Capa" />
                            : <ImageIcon size={24} className="absolute inset-0 m-auto text-neutral-400" />}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera size={18} className="text-white" />
                        </div>
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                        onChange={e => {
                            const file = e.target.files?.[0]
                            if (file) {
                                setSelectedFile(file)
                                const reader = new FileReader()
                                reader.onload = ev => setPreview(ev.target?.result as string)
                                reader.readAsDataURL(file)
                            }
                        }} />
                    <div>
                        <div className="text-xs font-medium text-neutral-700 mb-0.5">Foto do atleta</div>
                        <div className="text-[10px] text-neutral-400">
                            {selectedFile ? `📎 ${selectedFile.name}` : 'Clique para alterar'}
                        </div>
                    </div>
                </div>
            </div>

            <hr className="border-neutral-100" />

            {/* Dados básicos */}
            <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wide mb-3">
                    Dados do atleta
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Field label="Nome completo">
                        <input value={nome} onChange={e => setNome(e.target.value)} className={inputClass} />
                    </Field>
                    <Field label="Data de nascimento">
                        <input type="date" value={dataNasc} onChange={e => setDataNasc(e.target.value)} className={inputClass} />
                    </Field>
                    <Field label="Estado">
                        <select 
                            value={estado} 
                            onChange={e => { setEstado(e.target.value); setCidade('') }} 
                            className={`${inputClass} appearance-none`}
                        >
                            <option value="">Selecione</option>
                            {ESTADOS.map(e => <option key={e.value} value={e.value}>{e.label}</option>)}
                        </select>
                    </Field>
                    <Field label="Cidade">
                        <CitySelect
                            estado={estado}
                            value={cidade}
                            onChange={e => setCidade(e.target.value)}
                            placeholder="Selecione a cidade"
                        />
                    </Field>
                    <Field label="Pé dominante">
                        <select value={peDominante} onChange={e => setPeDominante(e.target.value)} className={`${inputClass} appearance-none`}>
                            <option value="destro">Destro</option>
                            <option value="canhoto">Canhoto</option>
                            <option value="ambidestro">Ambidestro</option>
                        </select>
                    </Field>
                    <Field label="Escolinha atual">
                        <input value={escolinhaAt} onChange={e => setEscolinhaAt(e.target.value)} className={inputClass} placeholder="Opcional" />
                    </Field>
                    <Field label="Descrição / Bio" className="sm:col-span-2">
                        <textarea value={descricao} onChange={e => setDescricao(e.target.value)}
                            rows={3} className={`${inputClass} resize-none`}
                            placeholder="Conte a história do atleta, pontos fortes..." />
                    </Field>
                </div>
            </div>

            <hr className="border-neutral-100" />

            {/* Posição */}
            <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wide mb-3">
                    Posição principal
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {POSICOES.map(p => (
                        <button key={p.value} type="button" onClick={() => setPosicao(p.value)}
                            className={cn('p-2 border rounded-lg text-center transition-all',
                                posicao === p.value
                                    ? 'border-green-400 bg-green-50 text-green-700'
                                    : 'border-neutral-200 hover:border-neutral-300 text-neutral-600'
                            )}>
                            <div className="text-xs sm:text-sm font-bold">{p.label}</div>
                            <div className="text-[9px] sm:text-[10px] text-neutral-400">{p.sub}</div>
                        </button>
                    ))}
                </div>
            </div>

            <hr className="border-neutral-100" />

            {/* Habilidades */}
            <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wide mb-3">
                    Habilidades
                </label>
                <div className="flex flex-col gap-4">
                    {HABILIDADES.map(h => (
                        <div key={h.key} className="flex items-center gap-3 sm:gap-4">
                            <span className="w-24 sm:w-28 flex-shrink-0 text-xs sm:text-sm font-medium text-neutral-700">
                                {h.label}
                            </span>
                            <input
                                type="range" min={1} max={99}
                                value={habilidades[h.key as keyof typeof habilidades]}
                                onChange={e => setHabilidades(prev => ({ ...prev, [h.key]: +e.target.value }))}
                                className="flex-1 accent-green-500"
                            />
                            <div className="w-9 h-8 bg-green-100 text-green-700 rounded-lg flex items-center justify-center text-xs sm:text-sm font-bold flex-shrink-0">
                                {habilidades[h.key as keyof typeof habilidades]}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <hr className="border-neutral-100" />

            {/* Privacidade */}
            <div>
                <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wide mb-3">
                    Privacidade
                </label>
                <div className="border border-neutral-200 rounded-xl overflow-hidden">
                    {[
                        { key: 'visivel', value: visivel, setter: setVisivel, icon: <Eye size={14} />, title: 'Perfil visível para escolinhas', sub: 'Quando desativado, nenhuma escolinha verá o perfil' },
                        { key: 'exibir_cidade', value: exibirCidade, setter: setExibirCidade, icon: <MapPin size={14} />, title: 'Exibir cidade e estado', sub: 'Nunca o endereço completo' },
                        { key: 'aceitar_mensagens', value: aceitarMensagens, setter: setAceitarMsg, icon: <MessageCircle size={14} />, title: 'Receber mensagens', sub: 'Escolinhas podem enviar mensagens diretas' },
                    ].map((item, i, arr) => (
                        <div key={item.key} className={cn('flex items-center gap-3 sm:gap-4 p-3.5 sm:p-4', i < arr.length - 1 && 'border-b border-neutral-100')}>
                            <div className="w-8 h-8 rounded-lg bg-neutral-100 text-neutral-500 flex items-center justify-center flex-shrink-0">
                                {item.icon}
                            </div>
                            <div className="flex-1">
                                <div className="text-xs sm:text-sm font-medium text-neutral-800">{item.title}</div>
                                <div className="text-[10px] text-neutral-400 mt-0.5">{item.sub}</div>
                            </div>
                            <button type="button" onClick={() => item.setter((v: boolean) => !v)}
                                className={cn('relative w-9 sm:w-10 h-5 sm:h-6 rounded-full transition-colors flex-shrink-0',
                                    item.value ? 'bg-green-400' : 'bg-neutral-300'
                                )}>
                                <span className={cn('absolute top-0.5 sm:top-1 w-3.5 sm:w-4 h-3.5 sm:h-4 bg-white rounded-full shadow transition-all',
                                    item.value ? 'left-4 sm:left-5' : 'left-0.5 sm:left-1'
                                )} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end pt-2">
                <button type="submit" disabled={loading}
                    className="px-6 py-2.5 text-sm bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors font-medium disabled:opacity-50 flex items-center gap-2">
                    {loading && <Loader2 size={14} className="animate-spin" />}
                    {loading ? 'Salvando...' : 'Salvar alterações do atleta'}
                </button>
            </div>
        </form>
    )
}

function Field({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
    return (
        <div className={className}>
            <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wide mb-1.5">
                {label}
            </label>
            {children}
        </div>
    )
}
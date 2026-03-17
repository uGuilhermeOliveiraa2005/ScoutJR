import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// -----------------------------------------------
// Tailwind class merger
// -----------------------------------------------
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// -----------------------------------------------
// Formatters
// -----------------------------------------------
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(date))
}

export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }
  return phone
}

export function calcularIdade(dataNascimento: string): number {
  const hoje = new Date()
  const nasc = new Date(dataNascimento)
  let idade = hoje.getFullYear() - nasc.getFullYear()
  const m = hoje.getMonth() - nasc.getMonth()
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--
  return idade
}

// -----------------------------------------------
// Labels
// -----------------------------------------------
export const POSICAO_LABEL: Record<string, string> = {
  GK: 'Goleiro',
  LD: 'Lateral Direito',
  LE: 'Lateral Esquerdo',
  ZAG: 'Zagueiro',
  VOL: 'Volante',
  MEI: 'Meia',
  EXT: 'Extremo',
  SA: '2º Atacante',
  CA: 'Centroavante',
}

export const ESTADO_LABEL: Record<string, string> = {
  AC: 'Acre', AL: 'Alagoas', AP: 'Amapá', AM: 'Amazonas',
  BA: 'Bahia', CE: 'Ceará', DF: 'Distrito Federal',
  ES: 'Espírito Santo', GO: 'Goiás', MA: 'Maranhão',
  MT: 'Mato Grosso', MS: 'Mato Grosso do Sul', MG: 'Minas Gerais',
  PA: 'Pará', PB: 'Paraíba', PR: 'Paraná', PE: 'Pernambuco',
  PI: 'Piauí', RJ: 'Rio de Janeiro', RN: 'Rio Grande do Norte',
  RS: 'Rio Grande do Sul', RO: 'Rondônia', RR: 'Roraima',
  SC: 'Santa Catarina', SP: 'São Paulo', SE: 'Sergipe', TO: 'Tocantins',
}

export const ESTADOS = Object.entries(ESTADO_LABEL).map(([value, label]) => ({
  value,
  label,
}))

export const POSICOES = Object.entries(POSICAO_LABEL).map(([value, label]) => ({
  value,
  label,
}))

// -----------------------------------------------
// Score color
// -----------------------------------------------
export function scoreColor(score: number): string {
  if (score >= 85) return 'text-green-700'
  if (score >= 70) return 'text-amber-600'
  return 'text-slate-500'
}

export function scoreBg(score: number): string {
  if (score >= 85) return 'bg-green-100 text-green-800'
  if (score >= 70) return 'bg-amber-100 text-amber-800'
  return 'bg-slate-100 text-slate-600'
}

// -----------------------------------------------
// Truncate text
// -----------------------------------------------
export function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + '...' : str
}

// -----------------------------------------------
// Initials from name
// -----------------------------------------------
export function getInitials(name: string): string {
  const parts = name.trim().split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

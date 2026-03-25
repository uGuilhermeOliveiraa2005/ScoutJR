'use client'

import { forwardRef, useEffect, useState } from 'react'
import { Select } from './Form'

interface CitySelectProps {
  estado: string
  value: string
  onChange: (e: any) => void
  placeholder?: string
  error?: string
  disabled?: boolean
  className?: string
  name?: string
}

// Cache simples em memória para as cidades
const citiesCache: Record<string, { value: string; label: string }[]> = {}

export const CitySelect = forwardRef<HTMLSelectElement, CitySelectProps>(({
  estado,
  value,
  onChange,
  placeholder = 'Selecione a cidade',
  error,
  disabled,
  className,
  name,
}, ref) => {
  const [cities, setCities] = useState<{ value: string; label: string }[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!estado) {
      setCities([])
      return
    }

    if (citiesCache[estado]) {
      setCities(citiesCache[estado])
      return
    }

    async function fetchCities() {
      setLoading(true)
      try {
        const response = await fetch(
          `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${estado}/municipios?orderBy=nome`
        )
        const data = await response.json()
        const formatted = data.map((c: any) => ({
          value: c.nome,
          label: c.nome,
        }))
        citiesCache[estado] = formatted
        setCities(formatted)
      } catch (err) {
        console.error('Erro ao buscar cidades:', err)
        setCities([])
      } finally {
        setLoading(false)
      }
    }

    fetchCities()
  }, [estado])

  return (
    <Select
      ref={ref}
      name={name}
      options={cities}
      value={value}
      onChange={onChange}
      placeholder={
        loading
          ? 'Carregando cidades...'
          : !estado
          ? 'Selecione o estado'
          : placeholder
      }
      error={error}
      disabled={disabled || loading || !estado}
      className={className}
    />
  )
})

CitySelect.displayName = 'CitySelect'

'use client'

import { useState } from 'react'
import { MdRestartAlt, MdSearch } from 'react-icons/md'

import Button from '@/components/ui/Button'
import FiltroCard from '@/components/ui/FiltroCard'
import Input from '@/components/ui/Input'
import { FiltroRelatorioGestaoFiscal } from '../types'

interface Props {
  valoresIniciais?: FiltroRelatorioGestaoFiscal
  onFiltrar: (filtros: FiltroRelatorioGestaoFiscal) => void
}

const initialState: FiltroRelatorioGestaoFiscal = {
  ano: undefined,
  periodo: ''
}

export default function RelatorioGestaoFiscalFiltro({ valoresIniciais, onFiltrar }: Props) {
  const [filtros, setFiltros] = useState<FiltroRelatorioGestaoFiscal>({ ...initialState, ...valoresIniciais })

  const filtrosAtivosCount = Object.entries(filtros).filter(
    ([, v]) => v !== undefined && v !== ''
  ).length

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target

    setFiltros(prev => {
      let novoValor: string | number | undefined = value

      if (name === 'ano') {
        novoValor = value ? Number(value) : undefined
      } else if (value === '') {
        novoValor = undefined
      }

      return { ...prev, [name]: novoValor }
    })
  }

  function handleFiltrar() {
    const cleanFilters = Object.fromEntries(
      Object.entries(filtros).filter(([, v]) => v !== undefined && v !== '')
    )
    onFiltrar(cleanFilters as FiltroRelatorioGestaoFiscal)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleFiltrar()
    }
  }

  function limparFiltros() {
    setFiltros(initialState)
    onFiltrar({})
  }

  return (
    <FiltroCard subtituloPadrao="Refine por ano e período" filtrosAtivosCount={filtrosAtivosCount}>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        <div>
          <label className="text-xs uppercase font-semibold text-text-secondary/60 mb-1 block" htmlFor="ano">
            Ano
          </label>
          <Input
            id="ano"
            name="ano"
            value={filtros.ano ?? ''}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="2026"
          />
        </div>

        <div>
          <label className="text-xs uppercase font-semibold text-text-secondary/60 mb-1 block" htmlFor="periodo">
            Período
          </label>
          <Input
            id="periodo"
            name="periodo"
            value={filtros.periodo ?? ''}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Ex: 1º Quadrimestre"
          />
        </div>

      </div>

      <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-border/20">
        <Button onClick={limparFiltros} variant="ghost">
          <MdRestartAlt />
          Limpar
        </Button>

        <Button onClick={handleFiltrar} variant="primary" size="lg" className="shadow-sm active:scale-95">
          <MdSearch />
          Aplicar
        </Button>
      </div>

    </FiltroCard>
  )
}

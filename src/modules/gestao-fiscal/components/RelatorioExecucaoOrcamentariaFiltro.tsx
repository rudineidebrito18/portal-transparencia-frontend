'use client'

import { useState } from 'react'
import { MdRestartAlt, MdSearch } from 'react-icons/md'

import Button from '@/components/ui/Button'
import FiltroCard from '@/components/ui/FiltroCard'
import Input from '@/components/ui/Input'
import { FiltroRelatorioExecucaoOrcamentaria } from '../types'

interface Props {
  valoresIniciais?: FiltroRelatorioExecucaoOrcamentaria
  onFiltrar: (filtros: FiltroRelatorioExecucaoOrcamentaria) => void
}

const initialState: FiltroRelatorioExecucaoOrcamentaria = {
  ano: undefined,
  bimestre: undefined,
  descricao: ''
}

export default function RelatorioExecucaoOrcamentariaFiltro({ valoresIniciais, onFiltrar }: Props) {
  const [filtros, setFiltros] = useState<FiltroRelatorioExecucaoOrcamentaria>({ ...initialState, ...valoresIniciais })

  const filtrosAtivosCount = Object.entries(filtros).filter(
    ([, v]) => v !== undefined && v !== ''
  ).length

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target

    setFiltros(prev => {
      let novoValor: string | number | undefined = value

      if (name === 'ano' || name === 'bimestre') {
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
    onFiltrar(cleanFilters as FiltroRelatorioExecucaoOrcamentaria)
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
    <FiltroCard subtituloPadrao="Refine por ano, bimestre e descrição" filtrosAtivosCount={filtrosAtivosCount}>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

        <div className="md:col-span-1 lg:col-span-1">
          <label className="text-xs uppercase font-semibold text-text-muted mb-1 block" htmlFor="descricao">
            Descrição
          </label>
          <Input
            id="descricao"
            name="descricao"
            value={filtros.descricao ?? ''}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Ex: Relatório Resumido"
          />
        </div>

        <div>
          <label className="text-xs uppercase font-semibold text-text-muted mb-1 block" htmlFor="ano">
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
          <label className="text-xs uppercase font-semibold text-text-muted mb-1 block" htmlFor="bimestre">
            Bimestre
          </label>
          <Input
            id="bimestre"
            name="bimestre"
            value={filtros.bimestre ?? ''}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="1 a 6"
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

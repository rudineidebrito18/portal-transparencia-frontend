'use client'

import { useState } from 'react'
import { MdRestartAlt, MdSearch } from 'react-icons/md'

import FiltroCard from '@/components/ui/FiltroCard'
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

  const inputClass =
    'w-full border border-border/30 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all'

  return (
    <FiltroCard subtituloPadrao="Refine por ano, bimestre e descrição" filtrosAtivosCount={filtrosAtivosCount}>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

        <div className="md:col-span-1 lg:col-span-1">
          <label className="text-[11px] uppercase font-semibold text-text-secondary/60 mb-1 block">
            Descrição
          </label>
          <input
            name="descricao"
            value={filtros.descricao ?? ''}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className={inputClass}
            placeholder="Ex: Relatório Resumido"
          />
        </div>

        <div>
          <label className="text-[11px] uppercase font-semibold text-text-secondary/60 mb-1 block">
            Ano
          </label>
          <input
            name="ano"
            value={filtros.ano ?? ''}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className={inputClass}
            placeholder="2026"
          />
        </div>

        <div>
          <label className="text-[11px] uppercase font-semibold text-text-secondary/60 mb-1 block">
            Bimestre
          </label>
          <input
            name="bimestre"
            value={filtros.bimestre ?? ''}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className={inputClass}
            placeholder="1 a 6"
          />
        </div>

      </div>

      <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-border/20">
        <button
          onClick={limparFiltros}
          className="flex items-center gap-1 px-3 py-2 text-sm text-text-secondary hover:text-red-600 transition-colors"
        >
          <MdRestartAlt />
          Limpar
        </button>

        <button
          onClick={handleFiltrar}
          className="flex items-center gap-2 px-6 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all shadow-sm active:scale-95"
        >
          <MdSearch />
          Aplicar
        </button>
      </div>

    </FiltroCard>
  )
}

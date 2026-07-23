'use client'

import { useState } from 'react'
import { MdRestartAlt, MdSearch } from 'react-icons/md'

import FiltroCard from '@/components/ui/FiltroCard'
import { FiltroTabelaValores, TipoViagem, TipoViagemDescricao } from '../types'

interface Props {
  valoresIniciais?: FiltroTabelaValores
  onFiltrar: (filtros: FiltroTabelaValores) => void
}

const initialState: FiltroTabelaValores = {
  descricao: '',
  tipoViagem: undefined,
  dataInicial: '',
  dataFinal: ''
}

export default function TabelaValoresFiltro({ valoresIniciais, onFiltrar }: Props) {
  const [filtros, setFiltros] = useState<FiltroTabelaValores>({ ...initialState, ...valoresIniciais })

  const filtrosAtivosCount = Object.entries(filtros).filter(
    ([, v]) => v !== undefined && v !== ''
  ).length

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target
    setFiltros(prev => ({ ...prev, [name]: value === '' ? undefined : value }))
  }

  function handleFiltrar() {
    const cleanFilters = Object.fromEntries(
      Object.entries(filtros).filter(([, v]) => v !== undefined && v !== '')
    )
    onFiltrar(cleanFilters as FiltroTabelaValores)
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
    "w-full border border-border/30 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"

  return (
    <FiltroCard subtituloPadrao="Refine por descrição, tipo de viagem e datas" filtrosAtivosCount={filtrosAtivosCount}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">

        <div className="md:col-span-2">
          <label className="text-[11px] uppercase font-semibold text-text-secondary/50 mb-1 block">
            Descrição
          </label>
          <input
            name="descricao"
            value={filtros.descricao ?? ''}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className={inputClass}
            placeholder="Ex: Tabela 2025"
          />
        </div>

        <div>
          <label className="text-[11px] uppercase font-semibold text-text-secondary/50 mb-1 block">
            Tipo de viagem
          </label>
          <select
            name="tipoViagem"
            value={filtros.tipoViagem ?? ''}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="">Todos</option>
            {Object.values(TipoViagem).map(tipo => (
              <option key={tipo} value={tipo}>{TipoViagemDescricao[tipo]}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] uppercase font-semibold text-text-secondary/50 mb-1 block">
            Data inicial
          </label>
          <input
            type="date"
            name="dataInicial"
            value={filtros.dataInicial ?? ''}
            onChange={handleChange}
            className={inputClass}
          />
        </div>

        <div>
          <label className="text-[11px] uppercase font-semibold text-text-secondary/50 mb-1 block">
            Data final
          </label>
          <input
            type="date"
            name="dataFinal"
            value={filtros.dataFinal ?? ''}
            onChange={handleChange}
            className={inputClass}
          />
        </div>

      </div>

      <div className="flex items-center justify-end gap-3 mt-5 pt-4 border-t border-border/20">
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

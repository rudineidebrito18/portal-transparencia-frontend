'use client'

import { useState } from 'react'
import { MdRestartAlt, MdSearch } from 'react-icons/md'

import Button from '@/components/ui/Button'
import FiltroCard from '@/components/ui/FiltroCard'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
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

  return (
    <FiltroCard subtituloPadrao="Refine por descrição, tipo de viagem e datas" filtrosAtivosCount={filtrosAtivosCount}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">

        <div className="md:col-span-2">
          <label className="text-xs uppercase font-semibold text-text-muted mb-1 block" htmlFor="descricao">
            Descrição
          </label>
          <Input
            id="descricao"
            name="descricao"
            value={filtros.descricao ?? ''}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Ex: Tabela 2025"
          />
        </div>

        <div>
          <label className="text-xs uppercase font-semibold text-text-muted mb-1 block" htmlFor="tipoViagem">
            Tipo de viagem
          </label>
          <Select
            id="tipoViagem"
            name="tipoViagem"
            value={filtros.tipoViagem ?? ''}
            onChange={handleChange}
          >
            <option value="">Todos</option>
            {Object.values(TipoViagem).map(tipo => (
              <option key={tipo} value={tipo}>{TipoViagemDescricao[tipo]}</option>
            ))}
          </Select>
        </div>

        <div>
          <label className="text-xs uppercase font-semibold text-text-muted mb-1 block" htmlFor="dataInicial">
            Data inicial
          </label>
          <Input
            type="date"
            id="dataInicial"
            name="dataInicial"
            value={filtros.dataInicial ?? ''}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="text-xs uppercase font-semibold text-text-muted mb-1 block" htmlFor="dataFinal">
            Data final
          </label>
          <Input
            type="date"
            id="dataFinal"
            name="dataFinal"
            value={filtros.dataFinal ?? ''}
            onChange={handleChange}
          />
        </div>

      </div>

      <div className="flex items-center justify-end gap-3 mt-5 pt-4 border-t border-border/20">
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

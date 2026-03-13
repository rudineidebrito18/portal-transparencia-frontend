'use client'

import { useState } from 'react'
import { MdEvent, MdFormatListBulleted, MdSearch } from 'react-icons/md'

import {
  TipoProcedimentoDescricao,
  TipoProcedimentoLicitacao
} from '@/interfaces/enums/TipoProcedimentoLicitacao'
import { FiltroLicitacao } from '@/interfaces/licitacao/Licitacao'

interface Props {
  onFiltrar: (filtros: FiltroLicitacao) => void
}

export default function LicitacaoFiltro({ onFiltrar }: Props) {
  const [filtros, setFiltros] = useState<FiltroLicitacao>({})

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target

    setFiltros(prev => ({
      ...prev,
      [name]: value || undefined
    }))
  }

  function handleFiltrar() {
    // Ajuste: converte o tipoProcedimento para o enum que a API espera
    const filtrosFormatados = { ...filtros }
    if (filtros.tipoProcedimento === '') delete filtrosFormatados.tipoProcedimento
    onFiltrar(filtrosFormatados)
  }

  function limparFiltros() {
    const vazio = {}
    setFiltros(vazio)
    onFiltrar(vazio)
  }

  return (
    <div className="bg-neutral-light p-4 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-semibold text-text-secondary mb-4 flex items-center gap-2">
        <MdFormatListBulleted />
        Filtros de Licitação
      </h2>

      <div className="grid md:grid-cols-3 gap-4">

        {/* Tipo de procedimento */}
        <div>
          <label className="block text-sm text-text-secondary mb-1">
            Modalidade
          </label>

          <select
            name="tipoProcedimento"
            value={filtros.tipoProcedimento ?? ''}
            onChange={handleChange}
            className="w-full border border-border rounded px-3 py-2"
          >
            <option value="">Todas</option>
            {Object.values(TipoProcedimentoLicitacao).map(tipo => (
              <option key={tipo} value={tipo}>
                {TipoProcedimentoDescricao[tipo]}
              </option>
            ))}
          </select>
        </div>

        {/* Número */}
        <div>
          <label className="block text-sm text-text-secondary mb-1">
            Número
          </label>
          <input
            name="numeroInstrumento"
            value={filtros.numeroInstrumento ?? ''}
            onChange={handleChange}
            className="w-full border border-border rounded px-3 py-2"
            placeholder="Ex: 001"
          />
        </div>

        {/* Objeto */}
        <div>
          <label className="block text-sm text-text-secondary mb-1">
            Objeto
          </label>
          <input
            name="objeto"
            value={filtros.objeto ?? ''}
            onChange={handleChange}
            className="w-full border border-border rounded px-3 py-2"
            placeholder="Buscar por objeto"
          />
        </div>

        {/* Data início */}
        <div>
          <label className="text-sm text-text-secondary mb-1 flex items-center gap-1">
            <MdEvent />
            Publicado de
          </label>
          <input
            type="date"
            name="dataInicio"
            value={filtros.dataInicio ?? ''}
            onChange={handleChange}
            className="w-full border border-border rounded px-3 py-2"
          />
        </div>

        {/* Data fim */}
        <div>
          <label className="text-sm text-text-secondary mb-1 flex items-center gap-1">
            <MdEvent />
            até
          </label>
          <input
            type="date"
            name="dataFim"
            value={filtros.dataFim ?? ''}
            onChange={handleChange}
            className="w-full border border-border rounded px-3 py-2"
          />
        </div>

        {/* Botões */}
        <div className="flex items-end gap-2">
          <button
            onClick={handleFiltrar}
            className="bg-primary hover:bg-primary-light text-text-primary px-4 py-2 rounded flex items-center gap-2 w-full justify-center"
          >
            <MdSearch />
            Buscar
          </button>

          <button
            onClick={limparFiltros}
            className="border border-border px-4 py-2 rounded text-text-secondary hover:bg-neutral"
          >
            Limpar
          </button>
        </div>
      </div>
    </div>
  )
}
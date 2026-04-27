'use client'

import { useState } from 'react'
import {
  MdCoronavirus,
  MdExpandLess,
  MdExpandMore,
  MdFilterList,
  MdRestartAlt,
  MdSearch
} from 'react-icons/md'

import { StatusLicitacao, StatusLicitacaoDescricao } from '@/interfaces/enums/StatusLicitacao'
import {
  TipoProcedimentoDescricao,
  TipoProcedimentoLicitacao
} from '@/interfaces/enums/TipoProcedimentoLicitacao'
import { FiltroLicitacao } from '@/interfaces/licitacao/Licitacao'

interface Props {
  onFiltrar: (filtros: FiltroLicitacao) => void
}

const initialState: FiltroLicitacao = {
  numeroInstrumento: '',
  objeto: '',
  tipoProcedimento: '',
  status: '',
  ano: undefined,
  covid: undefined,
  dataInicio: '',
  dataFim: ''
}

const anoAtual = new Date().getFullYear();
const anos = Array.from({ length: 21 }, (_, i) => anoAtual - i);

export default function LicitacaoFiltro({ onFiltrar }: Props) {
  const [filtros, setFiltros] = useState<FiltroLicitacao>(initialState)
  const [isExpanded, setIsExpanded] = useState(false)

  // Conta quantos filtros estão preenchidos para mostrar no badge
  const filtrosAtivosCount = Object.entries(filtros).filter(
    ([, v]) => v !== undefined && v !== ''
  ).length

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target

    setFiltros(prev => {
      let novoValor: string | number | boolean | undefined = value

      if (name === 'ano') {
        novoValor = value ? parseInt(value, 10) : undefined
      } else if (name === 'covid') {
        novoValor = value === '' ? undefined : value === 'true'
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
    onFiltrar(cleanFilters as FiltroLicitacao)
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
    <div className="bg-white rounded-xl shadow-sm border border-border mb-8 overflow-hidden">
      {/* Header / Trigger */}
      <div
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-neutral-light transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg text-primary">
            <MdFilterList className="text-xl" />
          </div>
          <div>
            <h2 className="font-bold text-text-primary">Filtros de Busca</h2>
            <p className="text-xs text-text-secondary">
              {filtrosAtivosCount > 0
                ? `${filtrosAtivosCount} filtro(s) aplicado(s)`
                : 'Refine sua busca por modalidade, data, ano e mais'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {filtrosAtivosCount > 0 && !isExpanded && (
            <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {filtrosAtivosCount}
            </span>
          )}
          {isExpanded ? <MdExpandLess className="text-2xl text-text-secondary" /> : <MdExpandMore className="text-2xl text-text-secondary" />}
        </div>
      </div>

      {/* Painel de Filtros (Corpo) */}
      {isExpanded && (
        <div className="p-6 border-t border-border bg-neutral-50/30 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-6">

            {/* Objeto */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase text-text-secondary mb-2">Objeto</label>
              <input
                name="objeto"
                value={filtros.objeto ?? ''}
                autoFocus
                onKeyDown={handleKeyDown}
                onChange={handleChange}
                className="w-full border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 outline-none"
                placeholder="Ex: Merenda, Obras, Software..."
              />
            </div>

            {/* Modalidade */}
            <div>
              <label className="block text-xs font-bold uppercase text-text-secondary mb-2">Modalidade</label>
              <select
                name="tipo"
                value={filtros.tipo ?? ''}
                onChange={handleChange}
                className="w-full border border-border rounded-lg px-3 py-2 outline-none"
              >
                <option value="">Todas</option>
                {Object.values(TipoProcedimentoLicitacao).map(tipo => (
                  <option key={tipo} value={tipo}>{TipoProcedimentoDescricao[tipo]}</option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-bold uppercase text-text-secondary mb-2">Status</label>
              <select
                name="status"
                value={filtros.status ?? ''}
                onChange={handleChange}
                className="w-full border border-border rounded-lg px-3 py-2 outline-none"
              >
                <option value="">Todos</option>
                {Object.values(StatusLicitacao).map(status => (
                  <option key={status} value={status}>{StatusLicitacaoDescricao[status]}</option>
                ))}
              </select>
            </div>

            {/* Numero e Ano */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold uppercase text-text-secondary mb-2">Número</label>
                <input
                  name="numeroInstrumento"
                  value={filtros.numeroInstrumento ?? ''}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  className="w-full border border-border rounded-lg px-3 py-2"
                  placeholder="001"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-text-secondary mb-2">
                  Ano
                </label>
                <select
                  name="ano"
                  value={filtros.ano ?? ''}
                  onChange={handleChange}
                  className="w-full border border-border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">Todos</option>
                  {anos.map(ano => (
                    <option key={ano} value={ano}>
                      {ano}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Datas */}
            <div className="lg:col-span-2 grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold uppercase text-text-secondary mb-2">Início</label>
                <input type="date" name="dataInicio" value={filtros.dataInicio ?? ''} onChange={handleChange} className="w-full border border-border rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-text-secondary mb-2">Fim</label>
                <input type="date" name="dataFim" value={filtros.dataFim ?? ''} onChange={handleChange} className="w-full border border-border rounded-lg px-3 py-2" />
              </div>
            </div>

            {/* Covid */}
            <div>
              <label className="block text-xs font-bold uppercase text-text-secondary mb-2 flex items-center gap-1">
                <MdCoronavirus className="text-danger" /> COVID-19?
              </label>
              <select
                name="covid"
                value={filtros.covid === undefined ? '' : String(filtros.covid)}
                onChange={handleChange}
                className="w-full border border-border rounded-lg px-3 py-2 outline-none"
              >
                <option value="">Não filtrar</option>
                <option value="true">Sim</option>
                <option value="false">Não</option>
              </select>
            </div>

            {/* Botões */}
            <div className="md:col-span-2 lg:col-span-4 flex items-center justify-end gap-3 pt-4 border-t border-border/50">
              <button
                onClick={limparFiltros}
                className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-danger transition-colors flex items-center gap-1"
              >
                <MdRestartAlt /> Limpar
              </button>
              <button
                onClick={handleFiltrar}
                className="bg-primary hover:bg-primary-dark text-white px-8 py-2 rounded-lg font-bold flex items-center gap-2 transition-all shadow-md active:scale-95"
              >
                <MdSearch className="text-lg" />
                Aplicar Filtros
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
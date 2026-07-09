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

import { StatusLicitacao, StatusLicitacaoDescricao, TipoProcedimentoDescricao, TipoProcedimentoLicitacao } from '../enums'
import { FiltroLicitacao } from '../types'

interface Props {
  onFiltrar: (filtros: FiltroLicitacao) => void
}

const initialState: FiltroLicitacao = {
  numeroInstrumento: '',
  numeroProcesso: '',
  tipoProcedimentoLicitacao: '',
  status: '',
  ano: undefined,
  covid: undefined,
  dataAberturaInicio: '',
  dataAberturaFim: '',
  dataPublicacaoInicio: '',
  dataPublicacaoFim: ''
}

const anoAtual = new Date().getFullYear()
const anos = Array.from({ length: 21 }, (_, i) => anoAtual - i)

export default function LicitacaoFiltro({ onFiltrar }: Props) {
  const [filtros, setFiltros] = useState<FiltroLicitacao>(initialState)
  const [isExpanded, setIsExpanded] = useState(true)

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

  const inputClass =
    "w-full border border-border/30 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"

  return (
    <div className="bg-white border border-border/30 rounded-2xl shadow-sm mb-8 overflow-hidden">

      {/* HEADER */}
      <div
        className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-neutral-light/40 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg text-primary">
            <MdFilterList size={20} />
          </div>

          <div>
            <h2 className="text-sm font-bold text-primary">
              Filtros de Busca
            </h2>
            <p className="text-xs text-text-secondary">
              {filtrosAtivosCount > 0
                ? `${filtrosAtivosCount} filtro(s) aplicado(s)`
                : 'Refine por modalidade, status, datas e mais'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {filtrosAtivosCount > 0 && !isExpanded && (
            <span className="bg-primary text-white text-[11px] px-2 py-0.5 rounded-full font-semibold">
              {filtrosAtivosCount}
            </span>
          )}
          {isExpanded ? <MdExpandLess size={22} /> : <MdExpandMore size={22} />}
        </div>
      </div>

      {/* BODY */}
      {isExpanded && (
        <div className="px-6 pb-6 pt-2 border-t border-border/20 animate-in fade-in zoom-in-95 duration-200">

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

            {/* NÚMERO DO PROCESSO */}
            <div className="md:col-span-2">
              <label className="text-[11px] uppercase font-semibold text-text-secondary/50 mb-1 block">
                Número do Processo
              </label>
              <input
                name="numeroProcesso"
                value={filtros.numeroProcesso ?? ''}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className={inputClass}
                placeholder="Ex: 456/2025"
              />
            </div>

            {/* MODALIDADE */}
            <div>
              <label className="text-[11px] uppercase font-semibold text-text-secondary/50 mb-1 block">
                Modalidade
              </label>
              <select
                name="tipoProcedimentoLicitacao"
                value={filtros.tipoProcedimentoLicitacao ?? ''}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Todas</option>
                {Object.values(TipoProcedimentoLicitacao).map(tipo => (
                  <option key={tipo} value={tipo}>
                    {TipoProcedimentoDescricao[tipo]}
                  </option>
                ))}
              </select>
            </div>

            {/* STATUS */}
            <div>
              <label className="text-[11px] uppercase font-semibold text-text-secondary/50 mb-1 block">
                Status
              </label>
              <select
                name="status"
                value={filtros.status ?? ''}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Todos</option>
                {Object.values(StatusLicitacao).map(status => (
                  <option key={status} value={status}>
                    {StatusLicitacaoDescricao[status]}
                  </option>
                ))}
              </select>
            </div>

            {/* NÚMERO + ANO */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] uppercase font-semibold text-text-secondary/50 mb-1 block">
                  Número
                </label>
                <input
                  name="numeroInstrumento"
                  value={filtros.numeroInstrumento ?? ''}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  className={inputClass}
                  placeholder="001"
                />
              </div>

              <div>
                <label className="text-[11px] uppercase font-semibold text-text-secondary/50 mb-1 block">
                  Ano
                </label>
                <select
                  name="ano"
                  value={filtros.ano ?? ''}
                  onChange={handleChange}
                  className={inputClass}
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

            {/* DATAS DE ABERTURA */}
            <div className="lg:col-span-2 grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] uppercase font-semibold text-text-secondary/50 mb-1 block">
                  Abertura (início)
                </label>
                <input
                  type="date"
                  name="dataAberturaInicio"
                  value={filtros.dataAberturaInicio ?? ''}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-[11px] uppercase font-semibold text-text-secondary/50 mb-1 block">
                  Abertura (fim)
                </label>
                <input
                  type="date"
                  name="dataAberturaFim"
                  value={filtros.dataAberturaFim ?? ''}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>

            {/* DATAS DE PUBLICAÇÃO */}
            <div className="lg:col-span-2 grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] uppercase font-semibold text-text-secondary/50 mb-1 block">
                  Publicação (início)
                </label>
                <input
                  type="date"
                  name="dataPublicacaoInicio"
                  value={filtros.dataPublicacaoInicio ?? ''}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-[11px] uppercase font-semibold text-text-secondary/50 mb-1 block">
                  Publicação (fim)
                </label>
                <input
                  type="date"
                  name="dataPublicacaoFim"
                  value={filtros.dataPublicacaoFim ?? ''}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>

            {/* COVID */}
            <div>
              <label className="text-[11px] uppercase font-semibold text-text-secondary/50 mb-1 flex items-center gap-1">
                <MdCoronavirus size={14} /> COVID-19
              </label>
              <select
                name="covid"
                value={filtros.covid === undefined ? '' : String(filtros.covid)}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Não filtrar</option>
                <option value="true">Sim</option>
                <option value="false">Não</option>
              </select>
            </div>

          </div>

          {/* ACTIONS */}
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

        </div>
      )}
    </div>
  )
}

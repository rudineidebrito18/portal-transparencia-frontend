'use client'

import { useState } from 'react'
import { MdExpandLess, MdExpandMore, MdFilterList, MdRestartAlt, MdSearch } from 'react-icons/md'

import { FiltroDiaria } from '../types'

interface Props {
  valoresIniciais?: FiltroDiaria
  onFiltrar: (filtros: FiltroDiaria) => void
}

const initialState: FiltroDiaria = {
  beneficiario: '',
  cargo: '',
  destino: '',
  motivo: '',
  dataInicio: '',
  dataTermino: ''
}

export default function DiariaFiltro({ valoresIniciais, onFiltrar }: Props) {
  const [filtros, setFiltros] = useState<FiltroDiaria>({ ...initialState, ...valoresIniciais })
  const [isExpanded, setIsExpanded] = useState(true)

  const filtrosAtivosCount = Object.entries(filtros).filter(
    ([, v]) => v !== undefined && v !== ''
  ).length

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setFiltros(prev => ({ ...prev, [name]: value === '' ? undefined : value }))
  }

  function handleFiltrar() {
    const cleanFilters = Object.fromEntries(
      Object.entries(filtros).filter(([, v]) => v !== undefined && v !== '')
    )
    onFiltrar(cleanFilters as FiltroDiaria)
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
                : 'Refine por beneficiário, cargo, destino e mais'}
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

            <div className="md:col-span-2">
              <label className="text-[11px] uppercase font-semibold text-text-secondary/50 mb-1 block">
                Beneficiário
              </label>
              <input
                name="beneficiario"
                value={filtros.beneficiario ?? ''}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className={inputClass}
                placeholder="Ex: Maria"
              />
            </div>

            <div>
              <label className="text-[11px] uppercase font-semibold text-text-secondary/50 mb-1 block">
                Cargo
              </label>
              <input
                name="cargo"
                value={filtros.cargo ?? ''}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className={inputClass}
                placeholder="Ex: Secretário"
              />
            </div>

            <div>
              <label className="text-[11px] uppercase font-semibold text-text-secondary/50 mb-1 block">
                Destino
              </label>
              <input
                name="destino"
                value={filtros.destino ?? ''}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className={inputClass}
                placeholder="Ex: São Luís - MA"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-[11px] uppercase font-semibold text-text-secondary/50 mb-1 block">
                Motivo
              </label>
              <input
                name="motivo"
                value={filtros.motivo ?? ''}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className={inputClass}
                placeholder="Ex: Capacitação técnica"
              />
            </div>

            <div>
              <label className="text-[11px] uppercase font-semibold text-text-secondary/50 mb-1 block">
                Viagem (início)
              </label>
              <input
                type="date"
                name="dataInicio"
                value={filtros.dataInicio ?? ''}
                onChange={handleChange}
                className={inputClass}
              />
            </div>

            <div>
              <label className="text-[11px] uppercase font-semibold text-text-secondary/50 mb-1 block">
                Viagem (término)
              </label>
              <input
                type="date"
                name="dataTermino"
                value={filtros.dataTermino ?? ''}
                onChange={handleChange}
                className={inputClass}
              />
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

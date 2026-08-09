'use client'

import { useState } from 'react'
import { MdRestartAlt, MdSearch } from 'react-icons/md'

import FiltroCard from '@/components/ui/FiltroCard'
import { FiltroCargo } from '../types'

interface Props {
  valoresIniciais?: FiltroCargo
  onFiltrar: (filtros: FiltroCargo) => void
}

const initialState: FiltroCargo = {
  cargo: '',
  valorBrutoMin: undefined,
  valorBrutoMax: undefined
}

export default function CargoFiltro({ valoresIniciais, onFiltrar }: Props) {
  const [filtros, setFiltros] = useState<FiltroCargo>({ ...initialState, ...valoresIniciais })

  const filtrosAtivosCount = Object.entries(filtros).filter(
    ([, v]) => v !== undefined && v !== ''
  ).length

  function handleChangeTexto(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setFiltros(prev => ({ ...prev, [name]: value === '' ? undefined : value }))
  }

  function handleChangeNumero(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setFiltros(prev => ({ ...prev, [name]: value === '' ? undefined : Number(value) }))
  }

  function handleFiltrar() {
    const cleanFilters = Object.fromEntries(
      Object.entries(filtros).filter(([, v]) => v !== undefined && v !== '')
    )
    onFiltrar(cleanFilters as FiltroCargo)
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
    "w-full border border-border/30 rounded-lg px-3 py-2 text-sm bg-white focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary outline-none transition-all"

  return (
    <FiltroCard subtituloPadrao="Refine por cargo e faixa de valor bruto" filtrosAtivosCount={filtrosAtivosCount}>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        <div>
          <label className="text-xs uppercase font-semibold text-text-secondary/60 mb-1 block" htmlFor="cargo">
            Cargo
          </label>
          <input
            id="cargo"
            name="cargo"
            value={filtros.cargo ?? ''}
            onChange={handleChangeTexto}
            onKeyDown={handleKeyDown}
            className={inputClass}
            placeholder="Ex: Professor"
          />
        </div>

        <div>
          <label className="text-xs uppercase font-semibold text-text-secondary/60 mb-1 block" htmlFor="valorBrutoMin">
            Valor bruto (mínimo)
          </label>
          <input
            type="number"
            step="0.01"
            min={0}
            id="valorBrutoMin"
            name="valorBrutoMin"
            value={filtros.valorBrutoMin ?? ''}
            onChange={handleChangeNumero}
            onKeyDown={handleKeyDown}
            className={inputClass}
            placeholder="R$ 0,00"
          />
        </div>

        <div>
          <label className="text-xs uppercase font-semibold text-text-secondary/60 mb-1 block" htmlFor="valorBrutoMax">
            Valor bruto (máximo)
          </label>
          <input
            type="number"
            step="0.01"
            min={0}
            id="valorBrutoMax"
            name="valorBrutoMax"
            value={filtros.valorBrutoMax ?? ''}
            onChange={handleChangeNumero}
            onKeyDown={handleKeyDown}
            className={inputClass}
            placeholder="R$ 0,00"
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

    </FiltroCard>
  )
}

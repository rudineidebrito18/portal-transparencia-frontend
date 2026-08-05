'use client'

import { useState } from 'react'
import { MdRestartAlt, MdSearch } from 'react-icons/md'

import FiltroCard from '@/components/ui/FiltroCard'
import { FiltroConteudoInstitucional } from '../types'

interface Props {
  valoresIniciais?: FiltroConteudoInstitucional
  onFiltrar: (filtros: FiltroConteudoInstitucional) => void
  variant: 'noticia' | 'aviso'
}

const initialState: FiltroConteudoInstitucional = {
  titulo: '',
  dataInicial: '',
  dataFinal: ''
}

export default function ConteudoInstitucionalFiltro({ valoresIniciais, onFiltrar, variant }: Props) {
  const [filtros, setFiltros] = useState<FiltroConteudoInstitucional>({ ...initialState, ...valoresIniciais })

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
    onFiltrar(cleanFilters as FiltroConteudoInstitucional)
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
    <FiltroCard
      subtituloPadrao="Refine por título e período de publicação"
      filtrosAtivosCount={filtrosAtivosCount}
    >

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        <div>
          <label className="text-[11px] uppercase font-semibold text-text-secondary/60 mb-1 block">
            Título
          </label>
          <input
            name="titulo"
            value={filtros.titulo ?? ''}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className={inputClass}
            placeholder={variant === 'aviso' ? 'Ex: Ponto facultativo' : 'Ex: Vacinação'}
          />
        </div>

        <div>
          <label className="text-[11px] uppercase font-semibold text-text-secondary/60 mb-1 block">
            Publicação (início)
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
          <label className="text-[11px] uppercase font-semibold text-text-secondary/60 mb-1 block">
            Publicação (fim)
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

'use client'

import { useState } from 'react'
import { MdRestartAlt, MdSearch } from 'react-icons/md'

import FiltroCard from '@/components/ui/FiltroCard'
import { FiltroEmpresaDividaAtiva } from '../types'

interface Props {
  valoresIniciais?: FiltroEmpresaDividaAtiva
  onFiltrar: (filtros: FiltroEmpresaDividaAtiva) => void
}

const initialState: FiltroEmpresaDividaAtiva = {
  nome: '',
  razaoSocial: '',
  cnpj: '',
  dataInicial: '',
  dataFinal: ''
}

export default function EmpresaDividaAtivaFiltro({ valoresIniciais, onFiltrar }: Props) {
  const [filtros, setFiltros] = useState<FiltroEmpresaDividaAtiva>({ ...initialState, ...valoresIniciais })

  const filtrosAtivosCount = Object.entries(filtros).filter(
    ([, v]) => v !== undefined && v !== ''
  ).length

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setFiltros(prev => ({ ...prev, [name]: value || undefined }))
  }

  function handleFiltrar() {
    const cleanFilters = Object.fromEntries(
      Object.entries(filtros).filter(([, v]) => v !== undefined && v !== '')
    )
    onFiltrar(cleanFilters as FiltroEmpresaDividaAtiva)
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
    'w-full border border-border/30 rounded-lg px-3 py-2 text-sm bg-white focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary outline-none transition-all'

  return (
    <FiltroCard subtituloPadrao="Refine por nome, razão social, CNPJ e datas" filtrosAtivosCount={filtrosAtivosCount}>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

        <div>
          <label className="text-xs uppercase font-semibold text-text-secondary/60 mb-1 block" htmlFor="nome">
            Nome
          </label>
          <input
            id="nome"
            name="nome"
            value={filtros.nome ?? ''}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className={inputClass}
            placeholder="Ex: Barros EIRELI"
          />
        </div>

        <div>
          <label className="text-xs uppercase font-semibold text-text-secondary/60 mb-1 block" htmlFor="razaoSocial">
            Razão Social
          </label>
          <input
            id="razaoSocial"
            name="razaoSocial"
            value={filtros.razaoSocial ?? ''}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className={inputClass}
            placeholder="Ex: Barros LTDA"
          />
        </div>

        <div>
          <label className="text-xs uppercase font-semibold text-text-secondary/60 mb-1 block" htmlFor="cnpj">
            CNPJ
          </label>
          <input
            id="cnpj"
            name="cnpj"
            value={filtros.cnpj ?? ''}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className={inputClass}
            placeholder="Somente números"
          />
        </div>

        <div>
          <label className="text-xs uppercase font-semibold text-text-secondary/60 mb-1 block" htmlFor="dataInicial">
            Data (início)
          </label>
          <input
            id="dataInicial"
            type="date"
            name="dataInicial"
            value={filtros.dataInicial ?? ''}
            onChange={handleChange}
            className={inputClass}
          />
        </div>

        <div>
          <label className="text-xs uppercase font-semibold text-text-secondary/60 mb-1 block" htmlFor="dataFinal">
            Data (fim)
          </label>
          <input
            id="dataFinal"
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

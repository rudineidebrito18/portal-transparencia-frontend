'use client'

import { useState } from 'react'
import { MdRestartAlt, MdSearch } from 'react-icons/md'

import FiltroCard from '@/components/ui/FiltroCard'
import { FiltroContrato } from '../types'

interface Props {
  valoresIniciais?: FiltroContrato
  onFiltrar: (filtros: FiltroContrato) => void
}

export default function FiscalContratoFiltro({ valoresIniciais, onFiltrar }: Props) {
  const [gestorContrato, setGestorContrato] = useState(valoresIniciais?.gestorContrato ?? '')
  const [numeroContrato, setNumeroContrato] = useState(
    valoresIniciais?.numeroContrato ? String(valoresIniciais.numeroContrato) : ''
  )

  const filtrosAtivosCount = [gestorContrato, numeroContrato].filter(v => v !== '').length

  const inputClass =
    'w-full border border-border/30 rounded-lg px-3 py-2 text-sm bg-white focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary outline-none transition-all'

  function handleFiltrar() {
    onFiltrar({
      gestorContrato: gestorContrato || undefined,
      numeroContrato: numeroContrato ? Number(numeroContrato) : undefined
    })
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleFiltrar()
    }
  }

  function limparFiltros() {
    setGestorContrato('')
    setNumeroContrato('')
    onFiltrar({})
  }

  return (
    <FiltroCard subtituloPadrao="Refine por nome do fiscal/gestor e número do contrato" filtrosAtivosCount={filtrosAtivosCount}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        <div>
          <label className="text-xs uppercase font-semibold text-text-secondary/60 mb-1 block" htmlFor="gestorContrato">
            Nome do Fiscal
          </label>
          <input
            id="gestorContrato"
            value={gestorContrato}
            onChange={(e) => setGestorContrato(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ex: Maria Oliveira"
            className={inputClass}
          />
        </div>

        <div>
          <label className="text-xs uppercase font-semibold text-text-secondary/60 mb-1 block" htmlFor="numeroContrato">
            Nº do Contrato
          </label>
          <input
            type="number"
            id="numeroContrato"
            value={numeroContrato}
            onChange={(e) => setNumeroContrato(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ex: 123"
            className={inputClass}
          />
        </div>

        <div className="flex items-end gap-3">
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
    </FiltroCard>
  )
}

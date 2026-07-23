'use client'

import { useState } from 'react'
import { MdRestartAlt, MdSearch } from 'react-icons/md'

import FiltroCard from '@/components/ui/FiltroCard'
import { FiltroSecretaria } from '../types'

interface Props {
  valoresIniciais?: FiltroSecretaria
  onFiltrar: (filtros: FiltroSecretaria) => void
}

export default function SecretariaFiltro({ valoresIniciais, onFiltrar }: Props) {
  const [nome, setNome] = useState(valoresIniciais?.nome ?? '')
  const [vigencia, setVigencia] = useState(valoresIniciais?.vigencia ?? '')

  const filtrosAtivosCount = [nome, vigencia].filter(v => v !== '').length

  const inputClass =
    'w-full border border-border/30 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all'

  function handleFiltrar() {
    onFiltrar({
      nome: nome || undefined,
      vigencia: vigencia || undefined
    })
  }

  function limparFiltros() {
    setNome('')
    setVigencia('')
    onFiltrar({})
  }

  return (
    <FiltroCard subtituloPadrao="Refine por nome ou vigência" filtrosAtivosCount={filtrosAtivosCount}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        <div>
          <label className="text-[11px] uppercase font-semibold text-text-secondary/50 mb-1 block">
            Nome
          </label>
          <input
            value={nome}
            onChange={e => setNome(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleFiltrar() }}
            placeholder="Nome da secretaria/órgão..."
            className={inputClass}
          />
        </div>

        <div>
          <label className="text-[11px] uppercase font-semibold text-text-secondary/50 mb-1 block">
            Vigência
          </label>
          <input
            type="date"
            value={vigencia}
            onChange={e => setVigencia(e.target.value)}
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

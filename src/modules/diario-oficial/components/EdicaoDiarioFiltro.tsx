'use client'

import { useState } from 'react'
import { MdRestartAlt, MdSearch } from 'react-icons/md'

import FiltroCard from '@/components/ui/FiltroCard'
import { TipoEdicaoDiario, TipoEdicaoDiarioDescricao } from '../enums'
import { FiltroEdicaoDiario } from '../types'

interface Props {
  valoresIniciais?: FiltroEdicaoDiario
  onFiltrar: (filtros: FiltroEdicaoDiario) => void
}

export default function EdicaoDiarioFiltro({ valoresIniciais, onFiltrar }: Props) {
  const [tipo, setTipo] = useState(valoresIniciais?.tipo ?? '')
  const [numeroEdicao, setNumeroEdicao] = useState(
    valoresIniciais?.numeroEdicao ? String(valoresIniciais.numeroEdicao) : ''
  )
  const [dataInicial, setDataInicial] = useState(valoresIniciais?.dataInicial ?? '')
  const [dataFinal, setDataFinal] = useState(valoresIniciais?.dataFinal ?? '')

  const filtrosAtivosCount = [tipo, numeroEdicao, dataInicial, dataFinal].filter(v => v !== '').length

  const inputClass =
    'w-full border border-border/30 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all'

  function handleFiltrar() {
    onFiltrar({
      tipo: tipo || undefined,
      numeroEdicao: numeroEdicao ? Number(numeroEdicao) : undefined,
      dataInicial: dataInicial || undefined,
      dataFinal: dataFinal || undefined
    })
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleFiltrar()
    }
  }

  function limparFiltros() {
    setTipo('')
    setNumeroEdicao('')
    setDataInicial('')
    setDataFinal('')
    onFiltrar({})
  }

  return (
    <FiltroCard subtituloPadrao="Refine por tipo, número e datas" filtrosAtivosCount={filtrosAtivosCount}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">

        <div>
          <label className="text-[11px] uppercase font-semibold text-text-secondary/50 mb-1 block">
            Tipo
          </label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className={inputClass}
          >
            <option value="">Todos</option>
            {Object.values(TipoEdicaoDiario).map(t => (
              <option key={t} value={t}>{TipoEdicaoDiarioDescricao[t]}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] uppercase font-semibold text-text-secondary/50 mb-1 block">
            Número da Edição
          </label>
          <input
            type="number"
            value={numeroEdicao}
            onChange={(e) => setNumeroEdicao(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ex: 123"
            className={inputClass}
          />
        </div>

        <div>
          <label className="text-[11px] uppercase font-semibold text-text-secondary/50 mb-1 block">
            Publicação (início)
          </label>
          <input
            type="date"
            value={dataInicial}
            onChange={(e) => setDataInicial(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label className="text-[11px] uppercase font-semibold text-text-secondary/50 mb-1 block">
            Publicação (fim)
          </label>
          <input
            type="date"
            value={dataFinal}
            onChange={(e) => setDataFinal(e.target.value)}
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

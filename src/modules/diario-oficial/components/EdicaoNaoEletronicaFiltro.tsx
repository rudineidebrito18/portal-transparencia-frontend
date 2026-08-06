'use client'

import { useState } from 'react'
import { MdRestartAlt, MdSearch } from 'react-icons/md'

import FiltroCard from '@/components/ui/FiltroCard'
import { TipoEdicaoDiario, TipoEdicaoDiarioDescricao } from '../enums'
import { FiltroEdicaoNaoEletronica } from '../types'

interface Props {
  valoresIniciais?: FiltroEdicaoNaoEletronica
  onFiltrar: (filtros: FiltroEdicaoNaoEletronica) => void
}

export default function EdicaoNaoEletronicaFiltro({ valoresIniciais, onFiltrar }: Props) {
  const [descricao, setDescricao] = useState(valoresIniciais?.descricao ?? '')
  const [tipo, setTipo] = useState(valoresIniciais?.tipo ?? '')
  const [dataInicial, setDataInicial] = useState(valoresIniciais?.dataInicial ?? '')
  const [dataFinal, setDataFinal] = useState(valoresIniciais?.dataFinal ?? '')

  const filtrosAtivosCount = [descricao, tipo, dataInicial, dataFinal].filter(v => v !== '').length

  const inputClass =
    'w-full border border-border/30 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all'

  function handleFiltrar() {
    onFiltrar({
      descricao: descricao || undefined,
      tipo: tipo || undefined,
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
    setDescricao('')
    setTipo('')
    setDataInicial('')
    setDataFinal('')
    onFiltrar({})
  }

  return (
    <FiltroCard subtituloPadrao="Refine por descrição, tipo e datas" filtrosAtivosCount={filtrosAtivosCount}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">

        <div>
          <label className="text-[11px] uppercase font-semibold text-text-secondary/60 mb-1 block">
            Descrição
          </label>
          <input
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ex: Decreto 12/2018"
            className={inputClass}
          />
        </div>

        <div>
          <label className="text-[11px] uppercase font-semibold text-text-secondary/60 mb-1 block">
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
          <label className="text-[11px] uppercase font-semibold text-text-secondary/60 mb-1 block">
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
          <label className="text-[11px] uppercase font-semibold text-text-secondary/60 mb-1 block">
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

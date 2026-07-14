'use client'

import { useState } from 'react'
import { MdFilterList, MdRestartAlt, MdSearch } from 'react-icons/md'

import { TipoEmenda, TipoEmendaDescricao } from '../enums'
import { FiltroEmendaParlamentar } from '../types'

interface Props {
  valoresIniciais?: FiltroEmendaParlamentar
  onFiltrar: (filtros: FiltroEmendaParlamentar) => void
}

const anoAtual = new Date().getFullYear()
const anos = Array.from({ length: 10 }, (_, i) => anoAtual - i)

// O backend só filtra por tipo OU por ano (endpoints separados), nunca os dois ao
// mesmo tempo — por isso escolher um aqui limpa o outro automaticamente.
export default function EmendaParlamentarFiltro({ valoresIniciais, onFiltrar }: Props) {
  const [tipo, setTipo] = useState(valoresIniciais?.tipo ?? '')
  const [ano, setAno] = useState(valoresIniciais?.ano ? String(valoresIniciais.ano) : '')

  const inputClass =
    'w-full border border-border/30 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all'

  function handleFiltrar() {
    onFiltrar({
      tipo: tipo || undefined,
      ano: ano ? Number(ano) : undefined
    })
  }

  function limparFiltros() {
    setTipo('')
    setAno('')
    onFiltrar({})
  }

  return (
    <div className="bg-white border border-border/30 rounded-2xl shadow-sm mb-8 px-6 py-5">

      <div className="flex items-center gap-3 mb-4">
        <div className="bg-primary/10 p-2 rounded-lg text-primary">
          <MdFilterList size={20} />
        </div>
        <h2 className="text-sm font-bold text-primary">Filtros de Busca</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        <div>
          <label className="text-[11px] uppercase font-semibold text-text-secondary/50 mb-1 block">
            Tipo
          </label>
          <select
            value={tipo}
            onChange={(e) => { setTipo(e.target.value); setAno('') }}
            className={inputClass}
          >
            <option value="">Todos</option>
            {Object.values(TipoEmenda).map(t => (
              <option key={t} value={t}>{TipoEmendaDescricao[t]}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] uppercase font-semibold text-text-secondary/50 mb-1 block">
            Ano de Publicação
          </label>
          <select
            value={ano}
            onChange={(e) => { setAno(e.target.value); setTipo('') }}
            className={inputClass}
          >
            <option value="">Todos</option>
            {anos.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
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
    </div>
  )
}

'use client'

import { useState } from 'react'
import { MdRestartAlt, MdSearch } from 'react-icons/md'

import Button from '@/components/ui/Button'
import FiltroCard from '@/components/ui/FiltroCard'
import Select from '@/components/ui/Select'
import { FiltroEmendaEstadual } from '../types'

interface Props {
  valoresIniciais?: FiltroEmendaEstadual
  onFiltrar: (filtros: FiltroEmendaEstadual) => void
}

const anoAtual = new Date().getFullYear()
const anos = Array.from({ length: 10 }, (_, i) => anoAtual - i)

// Backend só filtra por ano — tipo/modalidade são texto livre da fonte, sem conjunto fechado
// de valores pra virar filtro.
export default function EmendaEstadualFiltro({ valoresIniciais, onFiltrar }: Props) {
  const [ano, setAno] = useState(valoresIniciais?.ano ? String(valoresIniciais.ano) : '')

  const filtrosAtivosCount = ano !== '' ? 1 : 0

  function handleFiltrar() {
    onFiltrar({ ano: ano ? Number(ano) : undefined })
  }

  function limparFiltros() {
    setAno('')
    onFiltrar({})
  }

  return (
    <FiltroCard subtituloPadrao="Refine por ano" filtrosAtivosCount={filtrosAtivosCount}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        <div>
          <label className="text-xs uppercase font-semibold text-text-muted mb-1 block" htmlFor="ano">
            Ano
          </label>
          <Select
            id="ano"
            value={ano}
            onChange={(e) => setAno(e.target.value)}
          >
            <option value="">Todos</option>
            {anos.map(a => (
              <option key={a} value={a}>{a}</option>
            ))}
          </Select>
        </div>

        <div className="flex items-end gap-3">
          <Button onClick={limparFiltros} variant="ghost">
            <MdRestartAlt />
            Limpar
          </Button>

          <Button onClick={handleFiltrar} variant="primary" size="lg" className="shadow-sm active:scale-95">
            <MdSearch />
            Aplicar
          </Button>
        </div>

      </div>
    </FiltroCard>
  )
}

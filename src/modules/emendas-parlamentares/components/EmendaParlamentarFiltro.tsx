'use client'

import { useState } from 'react'
import { MdRestartAlt, MdSearch } from 'react-icons/md'

import Button from '@/components/ui/Button'
import FiltroCard from '@/components/ui/FiltroCard'
import Select from '@/components/ui/Select'
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

  const filtrosAtivosCount = [tipo, ano].filter(v => v !== '').length

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
    <FiltroCard subtituloPadrao="Refine por tipo ou ano" filtrosAtivosCount={filtrosAtivosCount}>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        <div>
          <label className="text-xs uppercase font-semibold text-text-secondary/60 mb-1 block" htmlFor="tipo">
            Tipo
          </label>
          <Select
            id="tipo"
            value={tipo}
            onChange={(e) => { setTipo(e.target.value); setAno('') }}
          >
            <option value="">Todos</option>
            {Object.values(TipoEmenda).map(t => (
              <option key={t} value={t}>{TipoEmendaDescricao[t]}</option>
            ))}
          </Select>
        </div>

        <div>
          <label className="text-xs uppercase font-semibold text-text-secondary/60 mb-1 block" htmlFor="ano">
            Ano de Publicação
          </label>
          <Select
            id="ano"
            value={ano}
            onChange={(e) => { setAno(e.target.value); setTipo('') }}
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

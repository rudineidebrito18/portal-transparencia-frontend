'use client'

import { useState } from 'react'
import { MdRestartAlt, MdSearch } from 'react-icons/md'

import Button from '@/components/ui/Button'
import FiltroCard from '@/components/ui/FiltroCard'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
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
          <label className="text-xs uppercase font-semibold text-text-muted mb-1 block" htmlFor="tipo">
            Tipo
          </label>
          <Select
            id="tipo"
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
          >
            <option value="">Todos</option>
            {Object.values(TipoEdicaoDiario).map(t => (
              <option key={t} value={t}>{TipoEdicaoDiarioDescricao[t]}</option>
            ))}
          </Select>
        </div>

        <div>
          <label className="text-xs uppercase font-semibold text-text-muted mb-1 block" htmlFor="numeroEdicao">
            Número da Edição
          </label>
          <Input
            id="numeroEdicao"
            type="number"
            value={numeroEdicao}
            onChange={(e) => setNumeroEdicao(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ex: 123"
          />
        </div>

        <div>
          <label className="text-xs uppercase font-semibold text-text-muted mb-1 block" htmlFor="dataInicial">
            Publicação (início)
          </label>
          <Input
            id="dataInicial"
            type="date"
            value={dataInicial}
            onChange={(e) => setDataInicial(e.target.value)}
          />
        </div>

        <div>
          <label className="text-xs uppercase font-semibold text-text-muted mb-1 block" htmlFor="dataFinal">
            Publicação (fim)
          </label>
          <Input
            id="dataFinal"
            type="date"
            value={dataFinal}
            onChange={(e) => setDataFinal(e.target.value)}
          />
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

'use client'

import { useState } from 'react'
import { MdRestartAlt, MdSearch } from 'react-icons/md'

import Button from '@/components/ui/Button'
import FiltroCard from '@/components/ui/FiltroCard'
import Input from '@/components/ui/Input'
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
          <label className="text-xs uppercase font-semibold text-text-muted mb-1 block" htmlFor="gestorContrato">
            Nome do Fiscal
          </label>
          <Input
            id="gestorContrato"
            value={gestorContrato}
            onChange={(e) => setGestorContrato(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ex: Maria Oliveira"
          />
        </div>

        <div>
          <label className="text-xs uppercase font-semibold text-text-muted mb-1 block" htmlFor="numeroContrato">
            Nº do Contrato
          </label>
          <Input
            type="number"
            id="numeroContrato"
            value={numeroContrato}
            onChange={(e) => setNumeroContrato(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ex: 123"
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

'use client'

import { useState } from 'react'
import { MdRestartAlt, MdSearch } from 'react-icons/md'

import Button from '@/components/ui/Button'
import FiltroCard from '@/components/ui/FiltroCard'
import Input from '@/components/ui/Input'
import { FiltroDocumentoGenerico } from '../../types/DocumentoGenerico'

interface Props {
  valoresIniciais?: FiltroDocumentoGenerico
  onFiltrar: (filtros: FiltroDocumentoGenerico) => void
}

const initialState: FiltroDocumentoGenerico = {
  descricao: '',
  dataInicial: '',
  dataFinal: ''
}

export default function DocumentoGenericoFiltro({ valoresIniciais, onFiltrar }: Props) {
  const [filtros, setFiltros] = useState<FiltroDocumentoGenerico>({ ...initialState, ...valoresIniciais })

  const filtrosAtivosCount = Object.entries(filtros).filter(
    ([, v]) => v !== undefined && v !== ''
  ).length

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setFiltros(prev => ({ ...prev, [name]: value === '' ? undefined : value }))
  }

  function handleFiltrar() {
    const cleanFilters = Object.fromEntries(
      Object.entries(filtros).filter(([, v]) => v !== undefined && v !== '')
    )
    onFiltrar(cleanFilters as FiltroDocumentoGenerico)
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

  return (
    <FiltroCard subtituloPadrao="Refine por descrição e datas" filtrosAtivosCount={filtrosAtivosCount}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">

        <div className="md:col-span-2">
          <label className="text-xs uppercase font-semibold text-text-muted mb-1 block" htmlFor="descricao">
            Descrição
          </label>
          <Input
            id="descricao"
            name="descricao"
            value={filtros.descricao ?? ''}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Ex: Balanço 2024"
          />
        </div>

        <div>
          <label className="text-xs uppercase font-semibold text-text-muted mb-1 block" htmlFor="dataInicial">
            Data inicial
          </label>
          <Input
            id="dataInicial"
            type="date"
            name="dataInicial"
            value={filtros.dataInicial ?? ''}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="text-xs uppercase font-semibold text-text-muted mb-1 block" htmlFor="dataFinal">
            Data final
          </label>
          <Input
            id="dataFinal"
            type="date"
            name="dataFinal"
            value={filtros.dataFinal ?? ''}
            onChange={handleChange}
          />
        </div>

      </div>

      <div className="flex items-center justify-end gap-3 mt-5 pt-4 border-t border-border/20">
        <Button onClick={limparFiltros} variant="ghost">
          <MdRestartAlt />
          Limpar
        </Button>

        <Button onClick={handleFiltrar} variant="primary" size="lg" className="shadow-sm active:scale-95">
          <MdSearch />
          Aplicar
        </Button>
      </div>
    </FiltroCard>
  )
}

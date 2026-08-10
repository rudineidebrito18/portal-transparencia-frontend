'use client'

import { useState } from 'react'
import { MdRestartAlt, MdSearch } from 'react-icons/md'

import Button from '@/components/ui/Button'
import FiltroCard from '@/components/ui/FiltroCard'
import Input from '@/components/ui/Input'
import { FiltroCargo } from '../types'

interface Props {
  valoresIniciais?: FiltroCargo
  onFiltrar: (filtros: FiltroCargo) => void
}

const initialState: FiltroCargo = {
  cargo: '',
  valorBrutoMin: undefined,
  valorBrutoMax: undefined
}

export default function CargoFiltro({ valoresIniciais, onFiltrar }: Props) {
  const [filtros, setFiltros] = useState<FiltroCargo>({ ...initialState, ...valoresIniciais })

  const filtrosAtivosCount = Object.entries(filtros).filter(
    ([, v]) => v !== undefined && v !== ''
  ).length

  function handleChangeTexto(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setFiltros(prev => ({ ...prev, [name]: value === '' ? undefined : value }))
  }

  function handleChangeNumero(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target
    setFiltros(prev => ({ ...prev, [name]: value === '' ? undefined : Number(value) }))
  }

  function handleFiltrar() {
    const cleanFilters = Object.fromEntries(
      Object.entries(filtros).filter(([, v]) => v !== undefined && v !== '')
    )
    onFiltrar(cleanFilters as FiltroCargo)
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
    <FiltroCard subtituloPadrao="Refine por cargo e faixa de valor bruto" filtrosAtivosCount={filtrosAtivosCount}>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        <div>
          <label className="text-xs uppercase font-semibold text-text-muted mb-1 block" htmlFor="cargo">
            Cargo
          </label>
          <Input
            id="cargo"
            name="cargo"
            value={filtros.cargo ?? ''}
            onChange={handleChangeTexto}
            onKeyDown={handleKeyDown}
            placeholder="Ex: Professor"
          />
        </div>

        <div>
          <label className="text-xs uppercase font-semibold text-text-muted mb-1 block" htmlFor="valorBrutoMin">
            Valor bruto (mínimo)
          </label>
          <Input
            type="number"
            step="0.01"
            min={0}
            id="valorBrutoMin"
            name="valorBrutoMin"
            value={filtros.valorBrutoMin ?? ''}
            onChange={handleChangeNumero}
            onKeyDown={handleKeyDown}
            placeholder="R$ 0,00"
          />
        </div>

        <div>
          <label className="text-xs uppercase font-semibold text-text-muted mb-1 block" htmlFor="valorBrutoMax">
            Valor bruto (máximo)
          </label>
          <Input
            type="number"
            step="0.01"
            min={0}
            id="valorBrutoMax"
            name="valorBrutoMax"
            value={filtros.valorBrutoMax ?? ''}
            onChange={handleChangeNumero}
            onKeyDown={handleKeyDown}
            placeholder="R$ 0,00"
          />
        </div>

      </div>

      {/* ACTIONS */}
      <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-border/20">

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

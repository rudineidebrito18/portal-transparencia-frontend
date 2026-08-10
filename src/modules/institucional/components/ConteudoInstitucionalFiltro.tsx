'use client'

import { useState } from 'react'
import { MdRestartAlt, MdSearch } from 'react-icons/md'

import Button from '@/components/ui/Button'
import FiltroCard from '@/components/ui/FiltroCard'
import Input from '@/components/ui/Input'
import { FiltroConteudoInstitucional } from '../types'

interface Props {
  valoresIniciais?: FiltroConteudoInstitucional
  onFiltrar: (filtros: FiltroConteudoInstitucional) => void
  variant: 'noticia' | 'aviso'
}

const initialState: FiltroConteudoInstitucional = {
  titulo: '',
  dataInicial: '',
  dataFinal: ''
}

export default function ConteudoInstitucionalFiltro({ valoresIniciais, onFiltrar, variant }: Props) {
  const [filtros, setFiltros] = useState<FiltroConteudoInstitucional>({ ...initialState, ...valoresIniciais })

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
    onFiltrar(cleanFilters as FiltroConteudoInstitucional)
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
    <FiltroCard
      subtituloPadrao="Refine por título e período de publicação"
      filtrosAtivosCount={filtrosAtivosCount}
    >

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        <div>
          <label className="text-xs uppercase font-semibold text-text-muted mb-1 block" htmlFor="titulo">
            Título
          </label>
          <Input
            id="titulo"
            name="titulo"
            value={filtros.titulo ?? ''}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={variant === 'aviso' ? 'Ex: Ponto facultativo' : 'Ex: Vacinação'}
          />
        </div>

        <div>
          <label className="text-xs uppercase font-semibold text-text-muted mb-1 block" htmlFor="dataInicial">
            Publicação (início)
          </label>
          <Input
            type="date"
            id="dataInicial"
            name="dataInicial"
            value={filtros.dataInicial ?? ''}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="text-xs uppercase font-semibold text-text-muted mb-1 block" htmlFor="dataFinal">
            Publicação (fim)
          </label>
          <Input
            type="date"
            id="dataFinal"
            name="dataFinal"
            value={filtros.dataFinal ?? ''}
            onChange={handleChange}
          />
        </div>

      </div>

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

'use client'

import { useState } from 'react'
import { MdRestartAlt, MdSearch } from 'react-icons/md'

import Button from '@/components/ui/Button'
import FiltroCard from '@/components/ui/FiltroCard'
import Input from '@/components/ui/Input'
import { FiltroConcurso } from '../types'

interface Props {
  valoresIniciais?: FiltroConcurso
  onFiltrar: (filtros: FiltroConcurso) => void
}

const initialState: FiltroConcurso = {
  numero: undefined,
  ano: undefined,
  descricao: '',
  dataAberturaInicial: '',
  dataAberturaFinal: ''
}

export default function ConcursoFiltro({ valoresIniciais, onFiltrar }: Props) {
  const [filtros, setFiltros] = useState<FiltroConcurso>({ ...initialState, ...valoresIniciais })

  const filtrosAtivosCount = Object.entries(filtros).filter(
    ([, v]) => v !== undefined && v !== ''
  ).length

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target

    setFiltros(prev => {
      let novoValor: string | number | undefined = value

      if (name === 'numero' || name === 'ano') {
        novoValor = value ? Number(value) : undefined
      } else if (value === '') {
        novoValor = undefined
      }

      return { ...prev, [name]: novoValor }
    })
  }

  function handleFiltrar() {
    const cleanFilters = Object.fromEntries(
      Object.entries(filtros).filter(([, v]) => v !== undefined && v !== '')
    )
    onFiltrar(cleanFilters as FiltroConcurso)
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
    <FiltroCard subtituloPadrao="Refine por número, ano, descrição e datas" filtrosAtivosCount={filtrosAtivosCount}>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

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
            placeholder="Ex: Concurso Público"
          />
        </div>

        <div>
          <label className="text-xs uppercase font-semibold text-text-muted mb-1 block" htmlFor="numero">
            Número
          </label>
          <Input
            id="numero"
            name="numero"
            value={filtros.numero ?? ''}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="001"
          />
        </div>

        <div>
          <label className="text-xs uppercase font-semibold text-text-muted mb-1 block" htmlFor="ano">
            Ano
          </label>
          <Input
            id="ano"
            name="ano"
            value={filtros.ano ?? ''}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="2026"
          />
        </div>

        <div>
          <label className="text-xs uppercase font-semibold text-text-muted mb-1 block" htmlFor="dataAberturaInicial">
            Abertura (início)
          </label>
          <Input
            type="date"
            id="dataAberturaInicial"
            name="dataAberturaInicial"
            value={filtros.dataAberturaInicial ?? ''}
            onChange={handleChange}
          />
        </div>

        <div>
          <label className="text-xs uppercase font-semibold text-text-muted mb-1 block" htmlFor="dataAberturaFinal">
            Abertura (fim)
          </label>
          <Input
            type="date"
            id="dataAberturaFinal"
            name="dataAberturaFinal"
            value={filtros.dataAberturaFinal ?? ''}
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

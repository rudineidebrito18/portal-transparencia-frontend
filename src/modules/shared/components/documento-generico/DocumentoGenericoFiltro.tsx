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
  // Só true nos módulos "quase genéricos" com campo de exercício próprio (Parecer Prévio,
  // Julgamento de Contas TCE — item 22 do backlog). Mantém o filtro genérico enxuto pros
  // outros ~20 módulos que não têm esse campo.
  comExercicio?: boolean
}

const initialState: FiltroDocumentoGenerico = {
  descricao: '',
  dataInicial: '',
  dataFinal: '',
  exercicio: undefined
}

export default function DocumentoGenericoFiltro({ valoresIniciais, onFiltrar, comExercicio = false }: Props) {
  const [filtros, setFiltros] = useState<FiltroDocumentoGenerico>({ ...initialState, ...valoresIniciais })

  const filtrosAtivosCount = Object.entries(filtros).filter(
    ([, v]) => v !== undefined && v !== ''
  ).length

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target

    setFiltros(prev => {
      const novoValor = name === 'exercicio'
        ? (value ? Number(value) : undefined)
        : (value === '' ? undefined : value)

      return { ...prev, [name]: novoValor }
    })
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
    <FiltroCard
      subtituloPadrao={comExercicio ? 'Refine por descrição, exercício e datas' : 'Refine por descrição e datas'}
      filtrosAtivosCount={filtrosAtivosCount}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">

        <div className={comExercicio ? '' : 'md:col-span-2'}>
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

        {comExercicio && (
          <div>
            <label className="text-xs uppercase font-semibold text-text-muted mb-1 block" htmlFor="exercicio">
              Exercício
            </label>
            <Input
              id="exercicio"
              name="exercicio"
              value={filtros.exercicio ?? ''}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              placeholder="Ex: 2025"
            />
          </div>
        )}

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

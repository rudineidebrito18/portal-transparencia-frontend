'use client'

import { useEffect, useState } from 'react'
import { MdRestartAlt, MdSearch } from 'react-icons/md'

import Button from '@/components/ui/Button'
import FiltroCard from '@/components/ui/FiltroCard'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { secretariasService } from '@/modules/secretarias/secretarias.service'
import { Unidade } from '@/modules/secretarias/types'
import { FiltroContrato } from '../types'

interface Props {
  valoresIniciais?: FiltroContrato
  onFiltrar: (filtros: FiltroContrato) => void
}

const initialState: FiltroContrato = {
  numeroContrato: undefined,
  exercicio: undefined,
  fornecedor: '',
  objeto: '',
  status: '',
  unidadeId: undefined,
  gestorContrato: '',
  dataInicial: '',
  dataFinal: ''
}

export default function ContratoFiltro({ valoresIniciais, onFiltrar }: Props) {
  const [filtros, setFiltros] = useState<FiltroContrato>({ ...initialState, ...valoresIniciais })

  const [unidades, setUnidades] = useState<Unidade[]>([])
  useEffect(() => {
    secretariasService.listar({ sort: 'nome,asc' }).then(setUnidades).catch(() => {})
  }, [])

  const filtrosAtivosCount = Object.entries(filtros).filter(
    ([, v]) => v !== undefined && v !== ''
  ).length

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target

    setFiltros(prev => {
      let novoValor: string | number | undefined = value

      if (name === 'numeroContrato' || name === 'exercicio' || name === 'unidadeId') {
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
    onFiltrar(cleanFilters as FiltroContrato)
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
    <FiltroCard subtituloPadrao="Refine por número, fornecedor, unidade e mais" filtrosAtivosCount={filtrosAtivosCount}>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

        <div>
          <label className="text-xs uppercase font-semibold text-text-secondary/60 mb-1 block" htmlFor="numeroContrato">
            Número do contrato
          </label>
          <Input
            id="numeroContrato"
            name="numeroContrato"
            value={filtros.numeroContrato ?? ''}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Ex: 12"
          />
        </div>

        <div>
          <label className="text-xs uppercase font-semibold text-text-secondary/60 mb-1 block" htmlFor="exercicio">
            Exercício
          </label>
          <Input
            id="exercicio"
            name="exercicio"
            value={filtros.exercicio ?? ''}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Ex: 2026"
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-xs uppercase font-semibold text-text-secondary/60 mb-1 block" htmlFor="fornecedor">
            Fornecedor
          </label>
          <Input
            id="fornecedor"
            name="fornecedor"
            value={filtros.fornecedor ?? ''}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Ex: Construtora ABC Ltda"
          />
        </div>

        <div>
          <label className="text-xs uppercase font-semibold text-text-secondary/60 mb-1 block" htmlFor="unidadeId">
            Unidade
          </label>
          <Select
            id="unidadeId"
            name="unidadeId"
            value={filtros.unidadeId ?? ''}
            onChange={handleChange}
          >
            <option value="">Todas</option>
            {unidades.map(u => (
              <option key={u.id} value={u.id}>{u.nome}</option>
            ))}
          </Select>
        </div>

        <div>
          <label className="text-xs uppercase font-semibold text-text-secondary/60 mb-1 block" htmlFor="status">
            Status
          </label>
          <Input
            id="status"
            name="status"
            value={filtros.status ?? ''}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Ex: EM_ANDAMENTO"
          />
        </div>

        <div>
          <label className="text-xs uppercase font-semibold text-text-secondary/60 mb-1 block" htmlFor="gestorContrato">
            Gestor do contrato
          </label>
          <Input
            id="gestorContrato"
            name="gestorContrato"
            value={filtros.gestorContrato ?? ''}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Ex: Maria"
          />
        </div>

        <div>
          <label className="text-xs uppercase font-semibold text-text-secondary/60 mb-1 block" htmlFor="objeto">
            Objeto
          </label>
          <Input
            id="objeto"
            name="objeto"
            value={filtros.objeto ?? ''}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Ex: reforma"
          />
        </div>

        <div>
          <label className="text-xs uppercase font-semibold text-text-secondary/60 mb-1 block" htmlFor="dataInicial">
            Assinatura (início)
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
          <label className="text-xs uppercase font-semibold text-text-secondary/60 mb-1 block" htmlFor="dataFinal">
            Assinatura (fim)
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

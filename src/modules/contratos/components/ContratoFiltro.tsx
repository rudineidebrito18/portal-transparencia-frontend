'use client'

import { useEffect, useState } from 'react'
import { MdRestartAlt, MdSearch } from 'react-icons/md'

import FiltroCard from '@/components/ui/FiltroCard'
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

  const inputClass =
    "w-full border border-border/30 rounded-lg px-3 py-2 text-sm bg-white focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary outline-none transition-all"

  return (
    <FiltroCard subtituloPadrao="Refine por número, fornecedor, unidade e mais" filtrosAtivosCount={filtrosAtivosCount}>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

        <div>
          <label className="text-xs uppercase font-semibold text-text-secondary/60 mb-1 block" htmlFor="numeroContrato">
            Número do contrato
          </label>
          <input
            id="numeroContrato"
            name="numeroContrato"
            value={filtros.numeroContrato ?? ''}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className={inputClass}
            placeholder="Ex: 12"
          />
        </div>

        <div>
          <label className="text-xs uppercase font-semibold text-text-secondary/60 mb-1 block" htmlFor="exercicio">
            Exercício
          </label>
          <input
            id="exercicio"
            name="exercicio"
            value={filtros.exercicio ?? ''}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className={inputClass}
            placeholder="Ex: 2026"
          />
        </div>

        <div className="md:col-span-2">
          <label className="text-xs uppercase font-semibold text-text-secondary/60 mb-1 block" htmlFor="fornecedor">
            Fornecedor
          </label>
          <input
            id="fornecedor"
            name="fornecedor"
            value={filtros.fornecedor ?? ''}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className={inputClass}
            placeholder="Ex: Construtora ABC Ltda"
          />
        </div>

        <div>
          <label className="text-xs uppercase font-semibold text-text-secondary/60 mb-1 block" htmlFor="unidadeId">
            Unidade
          </label>
          <select
            id="unidadeId"
            name="unidadeId"
            value={filtros.unidadeId ?? ''}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="">Todas</option>
            {unidades.map(u => (
              <option key={u.id} value={u.id}>{u.nome}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs uppercase font-semibold text-text-secondary/60 mb-1 block" htmlFor="status">
            Status
          </label>
          <input
            id="status"
            name="status"
            value={filtros.status ?? ''}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className={inputClass}
            placeholder="Ex: EM_ANDAMENTO"
          />
        </div>

        <div>
          <label className="text-xs uppercase font-semibold text-text-secondary/60 mb-1 block" htmlFor="gestorContrato">
            Gestor do contrato
          </label>
          <input
            id="gestorContrato"
            name="gestorContrato"
            value={filtros.gestorContrato ?? ''}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className={inputClass}
            placeholder="Ex: Maria"
          />
        </div>

        <div>
          <label className="text-xs uppercase font-semibold text-text-secondary/60 mb-1 block" htmlFor="objeto">
            Objeto
          </label>
          <input
            id="objeto"
            name="objeto"
            value={filtros.objeto ?? ''}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className={inputClass}
            placeholder="Ex: reforma"
          />
        </div>

        <div>
          <label className="text-xs uppercase font-semibold text-text-secondary/60 mb-1 block" htmlFor="dataInicial">
            Assinatura (início)
          </label>
          <input
            type="date"
            id="dataInicial"
            name="dataInicial"
            value={filtros.dataInicial ?? ''}
            onChange={handleChange}
            className={inputClass}
          />
        </div>

        <div>
          <label className="text-xs uppercase font-semibold text-text-secondary/60 mb-1 block" htmlFor="dataFinal">
            Assinatura (fim)
          </label>
          <input
            type="date"
            id="dataFinal"
            name="dataFinal"
            value={filtros.dataFinal ?? ''}
            onChange={handleChange}
            className={inputClass}
          />
        </div>

      </div>

      <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-border/20">

        <button
          onClick={limparFiltros}
          className="flex items-center gap-1 px-3 py-2 text-sm text-text-secondary hover:text-red-600 transition-colors"
        >
          <MdRestartAlt />
          Limpar
        </button>

        <button
          onClick={handleFiltrar}
          className="flex items-center gap-2 px-6 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary-dark transition-all shadow-sm active:scale-95"
        >
          <MdSearch />
          Aplicar
        </button>

      </div>

    </FiltroCard>
  )
}

'use client'

import { useEffect, useState } from 'react'
import { MdRestartAlt, MdSearch } from 'react-icons/md'

import Button from '@/components/ui/Button'
import FiltroCard from '@/components/ui/FiltroCard'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { fornecedorService } from '@/modules/fornecedores/fornecedor.service'
import { Fornecedor } from '@/modules/fornecedores/types'
import { secretariasService } from '@/modules/secretarias/secretarias.service'
import { Unidade } from '@/modules/secretarias/types'
import { FiltroObraPublica, StatusObra, StatusObraDescricao, TipoObra, TipoObraDescricao } from '../types'

interface Props {
  valoresIniciais?: FiltroObraPublica
  onFiltrar: (filtros: FiltroObraPublica) => void
}

const initialState: FiltroObraPublica = {
  numero: undefined,
  status: undefined,
  tipo: undefined,
  unidadeId: undefined,
  fornecedorId: undefined,
  paralisada: undefined
}

export default function ObraFiltro({ valoresIniciais, onFiltrar }: Props) {
  const [filtros, setFiltros] = useState<FiltroObraPublica>({ ...initialState, ...valoresIniciais })

  const [unidades, setUnidades] = useState<Unidade[]>([])
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([])
  useEffect(() => {
    secretariasService.listar({ sort: 'nome,asc' }).then(setUnidades).catch(() => {})
    fornecedorService.listar().then(setFornecedores).catch(() => {})
  }, [])

  const filtrosAtivosCount = Object.entries(filtros).filter(
    ([, v]) => v !== undefined && v !== ''
  ).length

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target

    setFiltros(prev => {
      let novoValor: string | number | boolean | undefined = value

      if (name === 'numero' || name === 'unidadeId' || name === 'fornecedorId') {
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
    onFiltrar(cleanFilters as FiltroObraPublica)
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
    <FiltroCard subtituloPadrao="Refine por número, status, tipo e mais" filtrosAtivosCount={filtrosAtivosCount}>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

        <div>
          <label className="text-xs uppercase font-semibold text-text-secondary/60 mb-1 block" htmlFor="numero">
            Número
          </label>
          <Input
            id="numero"
            name="numero"
            value={filtros.numero ?? ''}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Ex: 12"
          />
        </div>

        <div>
          <label className="text-xs uppercase font-semibold text-text-secondary/60 mb-1 block" htmlFor="status">
            Status
          </label>
          <Select id="status" name="status" value={filtros.status ?? ''} onChange={handleChange}>
            <option value="">Todos</option>
            {Object.values(StatusObra).map(s => (
              <option key={s} value={s}>{StatusObraDescricao[s]}</option>
            ))}
          </Select>
        </div>

        <div>
          <label className="text-xs uppercase font-semibold text-text-secondary/60 mb-1 block" htmlFor="tipo">
            Tipo
          </label>
          <Select id="tipo" name="tipo" value={filtros.tipo ?? ''} onChange={handleChange}>
            <option value="">Todos</option>
            {Object.values(TipoObra).map(t => (
              <option key={t} value={t}>{TipoObraDescricao[t]}</option>
            ))}
          </Select>
        </div>

        <div>
          <label className="text-xs uppercase font-semibold text-text-secondary/60 mb-1 block" htmlFor="unidadeId">
            Unidade
          </label>
          <Select id="unidadeId" name="unidadeId" value={filtros.unidadeId ?? ''} onChange={handleChange}>
            <option value="">Todas</option>
            {unidades.map(u => (
              <option key={u.id} value={u.id}>{u.nome}</option>
            ))}
          </Select>
        </div>

        <div>
          <label className="text-xs uppercase font-semibold text-text-secondary/60 mb-1 block" htmlFor="fornecedorId">
            Fornecedor
          </label>
          <Select id="fornecedorId" name="fornecedorId" value={filtros.fornecedorId ?? ''} onChange={handleChange}>
            <option value="">Todos</option>
            {fornecedores.map(f => (
              <option key={f.id} value={f.id}>{f.nome}</option>
            ))}
          </Select>
        </div>

        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm text-text-secondary pb-2">
            <input
              type="checkbox"
              checked={filtros.paralisada ?? false}
              onChange={e => setFiltros(prev => ({ ...prev, paralisada: e.target.checked || undefined }))}
            />
            Só obras paralisadas
          </label>
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

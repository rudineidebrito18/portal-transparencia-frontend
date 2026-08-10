'use client'

import { useEffect, useState } from 'react'
import { MdRestartAlt, MdSearch } from 'react-icons/md'

import Button from '@/components/ui/Button'
import FiltroCard from '@/components/ui/FiltroCard'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { secretariasService } from '@/modules/secretarias/secretarias.service'
import { Unidade } from '@/modules/secretarias/types'
import { FiltroDiaria } from '../types'

interface Props {
  valoresIniciais?: FiltroDiaria
  onFiltrar: (filtros: FiltroDiaria) => void
}

const initialState: FiltroDiaria = {
  beneficiario: '',
  cargo: '',
  destino: '',
  motivo: '',
  dataInicio: '',
  dataTermino: '',
  unidadeId: undefined
}

export default function DiariaFiltro({ valoresIniciais, onFiltrar }: Props) {
  const [filtros, setFiltros] = useState<FiltroDiaria>({ ...initialState, ...valoresIniciais })

  const [unidades, setUnidades] = useState<Unidade[]>([])
  useEffect(() => {
    secretariasService.listar({ sort: 'nome,asc' }).then(setUnidades).catch(() => {})
  }, [])

  const filtrosAtivosCount = Object.entries(filtros).filter(
    ([, v]) => v !== undefined && v !== ''
  ).length

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target

    if (name === 'unidadeId') {
      setFiltros(prev => ({ ...prev, unidadeId: value ? Number(value) : undefined }))
      return
    }

    setFiltros(prev => ({ ...prev, [name]: value === '' ? undefined : value }))
  }

  function handleFiltrar() {
    const cleanFilters = Object.fromEntries(
      Object.entries(filtros).filter(([, v]) => v !== undefined && v !== '')
    )
    onFiltrar(cleanFilters as FiltroDiaria)
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
    <FiltroCard subtituloPadrao="Refine por beneficiário, cargo, destino e mais" filtrosAtivosCount={filtrosAtivosCount}>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

            <div className="md:col-span-2">
              <label className="text-xs uppercase font-semibold text-text-muted mb-1 block" htmlFor="beneficiario">
                Beneficiário
              </label>
              <Input
                id="beneficiario"
                name="beneficiario"
                value={filtros.beneficiario ?? ''}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="Ex: Maria"
              />
            </div>

            <div>
              <label className="text-xs uppercase font-semibold text-text-muted mb-1 block" htmlFor="cargo">
                Cargo
              </label>
              <Input
                id="cargo"
                name="cargo"
                value={filtros.cargo ?? ''}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="Ex: Secretário"
              />
            </div>

            <div>
              <label className="text-xs uppercase font-semibold text-text-muted mb-1 block" htmlFor="destino">
                Destino
              </label>
              <Input
                id="destino"
                name="destino"
                value={filtros.destino ?? ''}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="Ex: São Luís - MA"
              />
            </div>

            <div>
              <label className="text-xs uppercase font-semibold text-text-muted mb-1 block" htmlFor="unidadeId">
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

            <div className="md:col-span-2">
              <label className="text-xs uppercase font-semibold text-text-muted mb-1 block" htmlFor="motivo">
                Motivo
              </label>
              <Input
                id="motivo"
                name="motivo"
                value={filtros.motivo ?? ''}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="Ex: Capacitação técnica"
              />
            </div>

            <div>
              <label className="text-xs uppercase font-semibold text-text-muted mb-1 block" htmlFor="dataInicio">
                Viagem (início)
              </label>
              <Input
                type="date"
                id="dataInicio"
                name="dataInicio"
                value={filtros.dataInicio ?? ''}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="text-xs uppercase font-semibold text-text-muted mb-1 block" htmlFor="dataTermino">
                Viagem (término)
              </label>
              <Input
                type="date"
                id="dataTermino"
                name="dataTermino"
                value={filtros.dataTermino ?? ''}
                onChange={handleChange}
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

'use client'

import { useState } from 'react'
import { MdRestartAlt, MdSearch } from 'react-icons/md'

import Button from '@/components/ui/Button'
import FiltroCard from '@/components/ui/FiltroCard'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { FiltroServidor } from '../types'

interface Props {
  valoresIniciais?: FiltroServidor
  onFiltrar: (filtros: FiltroServidor) => void
}

const initialState: FiltroServidor = {
  name: '',
  cpf: '',
  cargo: '',
  cargaHoraria: undefined,
  dataAdmissaoInicio: '',
  dataAdmissaoFim: ''
}

export default function ServidorFiltro({ valoresIniciais, onFiltrar }: Props) {
  const [filtros, setFiltros] = useState<FiltroServidor>({ ...initialState, ...valoresIniciais })

  const filtrosAtivosCount = Object.entries(filtros).filter(
    ([, v]) => v !== undefined && v !== ''
  ).length

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target

    setFiltros(prev => {
      let novoValor: string | number | undefined = value

      if (name === 'cargaHoraria') {
        novoValor = value ? parseInt(value, 10) : undefined
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
    onFiltrar(cleanFilters as FiltroServidor)
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
    <FiltroCard subtituloPadrao="Refine por nome, CPF, cargo e mais" filtrosAtivosCount={filtrosAtivosCount}>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

            {/* NOME */}
            <div className="md:col-span-2">
              <label className="text-xs uppercase font-semibold text-text-muted mb-1 block" htmlFor="name">
                Nome
              </label>
              <Input
                id="name"
                name="name"
                value={filtros.name ?? ''}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="Ex: Maria"
              />
            </div>

            {/* CPF */}
            <div>
              <label className="text-xs uppercase font-semibold text-text-muted mb-1 block" htmlFor="cpf">
                CPF
              </label>
              <Input
                id="cpf"
                name="cpf"
                value={filtros.cpf ?? ''}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="000.000.000-00"
              />
            </div>

            {/* CARGO */}
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
                placeholder="Ex: Professor"
              />
            </div>

            {/* CARGA HORÁRIA */}
            <div>
              <label className="text-xs uppercase font-semibold text-text-muted mb-1 block" htmlFor="cargaHoraria">
                Carga Horária
              </label>
              <Select
                id="cargaHoraria"
                name="cargaHoraria"
                value={filtros.cargaHoraria ?? ''}
                onChange={handleChange}
              >
                <option value="">Todas</option>
                <option value="20">20h/semana</option>
                <option value="30">30h/semana</option>
                <option value="40">40h/semana</option>
                <option value="44">44h/semana</option>
              </Select>
            </div>

            {/* DATAS DE ADMISSÃO */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs uppercase font-semibold text-text-muted mb-1 block" htmlFor="dataAdmissaoInicio">
                  Admissão (início)
                </label>
                <Input
                  type="date"
                  id="dataAdmissaoInicio"
                  name="dataAdmissaoInicio"
                  value={filtros.dataAdmissaoInicio ?? ''}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="text-xs uppercase font-semibold text-text-muted mb-1 block" htmlFor="dataAdmissaoFim">
                  Admissão (fim)
                </label>
                <Input
                  type="date"
                  id="dataAdmissaoFim"
                  name="dataAdmissaoFim"
                  value={filtros.dataAdmissaoFim ?? ''}
                  onChange={handleChange}
                />
              </div>
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

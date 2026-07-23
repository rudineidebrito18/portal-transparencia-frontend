'use client'

import { useState } from 'react'
import { MdRestartAlt, MdSearch } from 'react-icons/md'

import FiltroCard from '@/components/ui/FiltroCard'
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

  const inputClass =
    "w-full border border-border/30 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"

  return (
    <FiltroCard subtituloPadrao="Refine por nome, CPF, cargo e mais" filtrosAtivosCount={filtrosAtivosCount}>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

            {/* NOME */}
            <div className="md:col-span-2">
              <label className="text-[11px] uppercase font-semibold text-text-secondary/50 mb-1 block">
                Nome
              </label>
              <input
                name="name"
                value={filtros.name ?? ''}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className={inputClass}
                placeholder="Ex: Maria"
              />
            </div>

            {/* CPF */}
            <div>
              <label className="text-[11px] uppercase font-semibold text-text-secondary/50 mb-1 block">
                CPF
              </label>
              <input
                name="cpf"
                value={filtros.cpf ?? ''}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className={inputClass}
                placeholder="000.000.000-00"
              />
            </div>

            {/* CARGO */}
            <div>
              <label className="text-[11px] uppercase font-semibold text-text-secondary/50 mb-1 block">
                Cargo
              </label>
              <input
                name="cargo"
                value={filtros.cargo ?? ''}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className={inputClass}
                placeholder="Ex: Professor"
              />
            </div>

            {/* CARGA HORÁRIA */}
            <div>
              <label className="text-[11px] uppercase font-semibold text-text-secondary/50 mb-1 block">
                Carga Horária
              </label>
              <select
                name="cargaHoraria"
                value={filtros.cargaHoraria ?? ''}
                onChange={handleChange}
                className={inputClass}
              >
                <option value="">Todas</option>
                <option value="20">20h/semana</option>
                <option value="30">30h/semana</option>
                <option value="40">40h/semana</option>
                <option value="44">44h/semana</option>
              </select>
            </div>

            {/* DATAS DE ADMISSÃO */}
            <div className="lg:col-span-2 grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] uppercase font-semibold text-text-secondary/50 mb-1 block">
                  Admissão (início)
                </label>
                <input
                  type="date"
                  name="dataAdmissaoInicio"
                  value={filtros.dataAdmissaoInicio ?? ''}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>

              <div>
                <label className="text-[11px] uppercase font-semibold text-text-secondary/50 mb-1 block">
                  Admissão (fim)
                </label>
                <input
                  type="date"
                  name="dataAdmissaoFim"
                  value={filtros.dataAdmissaoFim ?? ''}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>

          </div>

          {/* ACTIONS */}
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

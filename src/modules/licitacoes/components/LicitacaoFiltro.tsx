'use client'

import { useEffect, useState } from 'react'
import { MdCoronavirus, MdRestartAlt, MdSearch } from 'react-icons/md'

import Button from '@/components/ui/Button'
import FiltroCard from '@/components/ui/FiltroCard'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { secretariasService } from '@/modules/secretarias/secretarias.service'
import { Unidade } from '@/modules/secretarias/types'
import { StatusLicitacao, StatusLicitacaoDescricao, TipoProcedimentoDescricao, TipoProcedimentoLicitacao } from '../enums'
import { FiltroLicitacao } from '../types'

interface Props {
  valoresIniciais?: FiltroLicitacao
  onFiltrar: (filtros: FiltroLicitacao) => void
}

const initialState: FiltroLicitacao = {
  numeroInstrumento: '',
  numeroProcesso: '',
  tipoProcedimentoLicitacao: '',
  status: '',
  ano: undefined,
  unidadeId: undefined,
  covid: undefined,
  dataAberturaInicio: '',
  dataAberturaFim: '',
  dataPublicacaoInicio: '',
  dataPublicacaoFim: ''
}

const anoAtual = new Date().getFullYear()
const anos = Array.from({ length: 21 }, (_, i) => anoAtual - i)

export default function LicitacaoFiltro({ valoresIniciais, onFiltrar }: Props) {
  const [filtros, setFiltros] = useState<FiltroLicitacao>({ ...initialState, ...valoresIniciais })

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
      let novoValor: string | number | boolean | undefined = value

      if (name === 'ano' || name === 'unidadeId') {
        novoValor = value ? parseInt(value, 10) : undefined
      } else if (name === 'covid') {
        novoValor = value === '' ? undefined : value === 'true'
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
    onFiltrar(cleanFilters as FiltroLicitacao)
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
    <FiltroCard subtituloPadrao="Refine por modalidade, status, datas e mais" filtrosAtivosCount={filtrosAtivosCount}>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

            {/* NÚMERO DO PROCESSO */}
            <div className="md:col-span-2">
              <label className="text-xs uppercase font-semibold text-text-secondary/60 mb-1 block" htmlFor="numeroProcesso">
                Número do Processo
              </label>
              <Input
                id="numeroProcesso"
                name="numeroProcesso"
                value={filtros.numeroProcesso ?? ''}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="Ex: 456/2025"
              />
            </div>

            {/* MODALIDADE */}
            <div>
              <label className="text-xs uppercase font-semibold text-text-secondary/60 mb-1 block" htmlFor="tipoProcedimentoLicitacao">
                Modalidade
              </label>
              <Select
                id="tipoProcedimentoLicitacao"
                name="tipoProcedimentoLicitacao"
                value={filtros.tipoProcedimentoLicitacao ?? ''}
                onChange={handleChange}
              >
                <option value="">Todas</option>
                {Object.values(TipoProcedimentoLicitacao).map(tipo => (
                  <option key={tipo} value={tipo}>
                    {TipoProcedimentoDescricao[tipo]}
                  </option>
                ))}
              </Select>
            </div>

            {/* STATUS */}
            <div>
              <label className="text-xs uppercase font-semibold text-text-secondary/60 mb-1 block" htmlFor="status">
                Status
              </label>
              <Select
                id="status"
                name="status"
                value={filtros.status ?? ''}
                onChange={handleChange}
              >
                <option value="">Todos</option>
                {Object.values(StatusLicitacao).map(status => (
                  <option key={status} value={status}>
                    {StatusLicitacaoDescricao[status]}
                  </option>
                ))}
              </Select>
            </div>

            {/* NÚMERO + ANO */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs uppercase font-semibold text-text-secondary/60 mb-1 block" htmlFor="numeroInstrumento">
                  Número
                </label>
                <Input
                  id="numeroInstrumento"
                  name="numeroInstrumento"
                  value={filtros.numeroInstrumento ?? ''}
                  onChange={handleChange}
                  onKeyDown={handleKeyDown}
                  placeholder="001"
                />
              </div>

              <div>
                <label className="text-xs uppercase font-semibold text-text-secondary/60 mb-1 block" htmlFor="ano">
                  Ano
                </label>
                <Select
                  id="ano"
                  name="ano"
                  value={filtros.ano ?? ''}
                  onChange={handleChange}
                >
                  <option value="">Todos</option>
                  {anos.map(ano => (
                    <option key={ano} value={ano}>
                      {ano}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {/* UNIDADE */}
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

            {/* DATAS DE ABERTURA */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs uppercase font-semibold text-text-secondary/60 mb-1 block" htmlFor="dataAberturaInicio">
                  Abertura (início)
                </label>
                <Input
                  type="date"
                  id="dataAberturaInicio"
                  name="dataAberturaInicio"
                  value={filtros.dataAberturaInicio ?? ''}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="text-xs uppercase font-semibold text-text-secondary/60 mb-1 block" htmlFor="dataAberturaFim">
                  Abertura (fim)
                </label>
                <Input
                  type="date"
                  id="dataAberturaFim"
                  name="dataAberturaFim"
                  value={filtros.dataAberturaFim ?? ''}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* DATAS DE PUBLICAÇÃO */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs uppercase font-semibold text-text-secondary/60 mb-1 block" htmlFor="dataPublicacaoInicio">
                  Publicação (início)
                </label>
                <Input
                  type="date"
                  id="dataPublicacaoInicio"
                  name="dataPublicacaoInicio"
                  value={filtros.dataPublicacaoInicio ?? ''}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="text-xs uppercase font-semibold text-text-secondary/60 mb-1 block" htmlFor="dataPublicacaoFim">
                  Publicação (fim)
                </label>
                <Input
                  type="date"
                  id="dataPublicacaoFim"
                  name="dataPublicacaoFim"
                  value={filtros.dataPublicacaoFim ?? ''}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* COVID */}
            <div>
              <label className="text-xs uppercase font-semibold text-text-secondary/60 mb-1 flex items-center gap-1" htmlFor="covid">
                <MdCoronavirus size={14} /> COVID-19
              </label>
              <Select
                id="covid"
                name="covid"
                value={filtros.covid === undefined ? '' : String(filtros.covid)}
                onChange={handleChange}
              >
                <option value="">Não filtrar</option>
                <option value="true">Sim</option>
                <option value="false">Não</option>
              </Select>
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

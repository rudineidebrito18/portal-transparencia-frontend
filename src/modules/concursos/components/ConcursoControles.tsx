'use client'

import { useState } from 'react'
import { MdDownload, MdSwapVert } from 'react-icons/md'

import ModalExportar from '@/components/ui/ModalExportar'
import Select from '@/components/ui/Select'
import { formatarData, formatarDataHora } from '@/utils/date'
import { ColunaExportacao } from '@/utils/exportacao'
import { concursoService } from '../concurso.service'
import { useConcursoUrlState } from '../hooks/useConcursoUrlState'
import { Concurso } from '../types'
import ConcursoFiltro from './ConcursoFiltro'

const LIMITE_EXPORTACAO = 2000

const COLUNAS_EXPORTACAO: ColunaExportacao<Concurso>[] = [
  { chave: 'numero', rotulo: 'Número' },
  { chave: 'ano', rotulo: 'Ano' },
  { chave: 'descricao', rotulo: 'Descrição' },
  { chave: 'dataAbertura', rotulo: 'Abertura', formatar: item => formatarData(item.dataAbertura) },
  { chave: 'dataInscricoes', rotulo: 'Início das Inscrições', formatar: item => formatarData(item.dataInscricoes) },
  { chave: 'dataTerminoInscricoes', rotulo: 'Término das Inscrições', formatar: item => formatarData(item.dataTerminoInscricoes) },
  { chave: 'validate', rotulo: 'Validade', formatar: item => item.validate ? formatarData(item.validate) : '' },
  { chave: 'resumo', rotulo: 'Resumo' }
]

interface Props {
  totalElements: number
  atualizadoEm: string
  ordenacaoPadrao?: string
}

export default function ConcursoControles({
  totalElements,
  atualizadoEm,
  ordenacaoPadrao = 'dataAbertura,desc'
}: Props) {
  const { ordenacao, filtros, setOrdenacao, setFiltros } = useConcursoUrlState(ordenacaoPadrao)

  const [exportando, setExportando] = useState(false)
  const [exportarAberto, setExportarAberto] = useState(false)
  const [itensExportar, setItensExportar] = useState<Concurso[]>([])
  const [truncadoExportar, setTruncadoExportar] = useState(false)

  async function handleExportar() {
    setExportando(true)
    try {
      const resultado = await concursoService.listar({
        ...filtros,
        page: 0,
        size: LIMITE_EXPORTACAO,
        sort: ordenacao
      })
      setItensExportar(resultado.content)
      setTruncadoExportar(resultado.totalElements > LIMITE_EXPORTACAO)
      setExportarAberto(true)
    } finally {
      setExportando(false)
    }
  }

  return (
    <>
      <ConcursoFiltro valoresIniciais={filtros} onFiltrar={setFiltros} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-border/30 rounded-xl px-5 py-3 shadow-sm mb-6">
        <span className="text-sm text-text-secondary">
          <strong className="text-primary">{totalElements}</strong> concursos encontrados
          <span className="text-text-muted"> · atualizado em {formatarDataHora(new Date(atualizadoEm))}</span>
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportar}
            disabled={totalElements === 0 || exportando}
            aria-label="Exportar todos os resultados dos filtros aplicados"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-semibold hover:bg-primary hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MdDownload size={18} className={exportando ? 'animate-pulse' : ''} />
            {exportando ? 'Preparando...' : 'Exportar'}
          </button>

          <div className="flex items-center gap-2 text-text-secondary text-sm">
            <MdSwapVert />
            Ordenar
          </div>

          <Select
            value={ordenacao}
            onChange={(e) => setOrdenacao(e.target.value)}
            aria-label="Ordenar por"
            fullWidth={false}
          >
            <option value="dataAbertura,desc">Mais recentes</option>
            <option value="dataAbertura,asc">Mais antigos</option>
          </Select>
        </div>
      </div>

      <ModalExportar
        aberto={exportarAberto}
        aoFechar={() => setExportarAberto(false)}
        titulo="Exportar concursos"
        itens={itensExportar}
        colunas={COLUNAS_EXPORTACAO}
        nomeBaseArquivo="concursos"
        truncado={truncadoExportar}
      />
    </>
  )
}

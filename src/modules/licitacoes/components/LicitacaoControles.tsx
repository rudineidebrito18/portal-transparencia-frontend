'use client'

import { useState } from 'react'
import { MdDownload, MdSwapVert } from 'react-icons/md'

import ModalExportar from '@/components/ui/ModalExportar'
import Select from '@/components/ui/Select'
import { formatarMoeda } from '@/utils/currency'
import { formatarData, formatarDataHora } from '@/utils/date'
import { ColunaExportacao } from '@/utils/exportacao'
import { TipoProcedimentoDescricao, TipoProcedimentoLicitacao } from '../enums'
import { useLicitacaoUrlState } from '../hooks/useLicitacaoUrlState'
import { licitacaoService } from '../licitacao.service'
import { LicitacaoResumo } from '../types'
import LicitacaoFiltro from './LicitacaoFiltro'

// Mesmo teto de usePageableResource.buscarTudoParaExportar — ver comentário lá.
const LIMITE_EXPORTACAO = 2000

const COLUNAS_EXPORTACAO: ColunaExportacao<LicitacaoResumo>[] = [
  { chave: 'numeroSequencial', rotulo: 'Nº Sequencial' },
  { chave: 'numeroInstrumento', rotulo: 'Nº Instrumento' },
  { chave: 'ano', rotulo: 'Ano' },
  {
    chave: 'tipoProcedimentoLicitacao',
    rotulo: 'Modalidade',
    formatar: item => TipoProcedimentoDescricao[item.tipoProcedimentoLicitacao as TipoProcedimentoLicitacao] || item.tipoProcedimentoLicitacao
  },
  { chave: 'statusDescricao', rotulo: 'Status' },
  { chave: 'objeto', rotulo: 'Objeto' },
  { chave: 'unidade', rotulo: 'Unidade' },
  { chave: 'dataAbertura', rotulo: 'Abertura', formatar: item => formatarData(item.dataAbertura) },
  { chave: 'valorTotalDespesa', rotulo: 'Valor', formatar: item => item.valorTotalDespesa ? formatarMoeda(item.valorTotalDespesa) : 'Não informado' }
]

interface Props {
  totalElements: number
  atualizadoEm: string
  ordenacaoPadrao?: string
}

export default function LicitacaoControles({
  totalElements,
  atualizadoEm,
  ordenacaoPadrao = 'dataPublicacao,desc'
}: Props) {
  const { ordenacao, filtros, setOrdenacao, setFiltros } = useLicitacaoUrlState(ordenacaoPadrao)

  const [exportando, setExportando] = useState(false)
  const [exportarAberto, setExportarAberto] = useState(false)
  const [itensExportar, setItensExportar] = useState<LicitacaoResumo[]>([])
  const [truncadoExportar, setTruncadoExportar] = useState(false)

  async function handleExportar() {
    setExportando(true)
    try {
      const resultado = await licitacaoService.listar({
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
      <LicitacaoFiltro valoresIniciais={filtros} onFiltrar={setFiltros} />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-border/30 rounded-xl px-5 py-3 shadow-sm">
        <span className="text-sm text-text-secondary">
          <strong className="text-primary">{totalElements}</strong> resultados encontrados
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
            <option value="dataPublicacao,desc">Mais recentes</option>
            <option value="dataPublicacao,asc">Mais antigos</option>
          </Select>
        </div>
      </div>

      <ModalExportar
        aberto={exportarAberto}
        aoFechar={() => setExportarAberto(false)}
        titulo="Exportar licitações"
        itens={itensExportar}
        colunas={COLUNAS_EXPORTACAO}
        nomeBaseArquivo="licitacoes"
        truncado={truncadoExportar}
      />
    </>
  )
}

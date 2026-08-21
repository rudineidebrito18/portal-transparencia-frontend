'use client'

import { useState } from 'react'
import { MdDownload, MdSwapVert } from 'react-icons/md'

import ModalExportar from '@/components/ui/ModalExportar'
import Select from '@/components/ui/Select'
import { useDocumentoGenericoUrlState } from '@/modules/shared/hooks/useDocumentoGenericoUrlState'
import { formatarData, formatarDataHora } from '@/utils/date'
import { ColunaExportacao } from '@/utils/exportacao'
import DocumentoGenericoFiltro from '@/modules/shared/components/documento-generico/DocumentoGenericoFiltro'
import { ConvenioDocumento, FiltroConvenio } from '../types'
import { Page } from '@/modules/shared/types/Page'

// Mesmo teto de usePageableResource.buscarTudoParaExportar — ver comentário lá.
const LIMITE_EXPORTACAO = 2000

const COLUNAS_EXPORTACAO: ColunaExportacao<ConvenioDocumento>[] = [
  { chave: 'descricao', rotulo: 'Descrição' },
  { chave: 'data', rotulo: 'Data de Publicação', formatar: item => formatarData(item.data) },
  { chave: 'dataInicio', rotulo: 'Vigência Início', formatar: item => formatarData(item.dataInicio) },
  { chave: 'dataFim', rotulo: 'Vigência Fim', formatar: item => formatarData(item.dataFim) }
]

interface Props {
  totalElements: number
  atualizadoEm: string
  nomeBaseArquivo: string
  ordenacaoPadrao?: string
}

interface ServicoParaExportar {
  listar(params: FiltroConvenio & { page?: number; size?: number; sort?: string }): Promise<Page<ConvenioDocumento>>
}

// Factory, mesmo padrão de criarDocumentoGenericoControles (shared/) — o service dos 3
// sub-recursos de convênios (Transferências Recebidas/Realizadas, Acordos Firmados) já vem
// pronto por módulo (não é 1 service parametrizado por recurso como educação/saúde), então
// cada sub-recurso instancia esta factory no seu próprio arquivo 'use client' (ver
// TransferenciasRecebidasControles.tsx etc.) — mesma razão de fronteira Server/Client já
// documentada em CompetenciasControles.tsx. Reaproveita useDocumentoGenericoUrlState e
// DocumentoGenericoFiltro porque FiltroConvenio é literalmente FiltroDocumentoGenerico (ver
// types.ts) — não precisou de hook/filtro próprio.
export function criarConvenioControles(service: ServicoParaExportar) {
  return function ConvenioControles({
    totalElements,
    atualizadoEm,
    nomeBaseArquivo,
    ordenacaoPadrao = 'data,desc'
  }: Props) {
    const { ordenacao, filtros, setOrdenacao, setFiltros } = useDocumentoGenericoUrlState(ordenacaoPadrao)

    const [exportando, setExportando] = useState(false)
    const [exportarAberto, setExportarAberto] = useState(false)
    const [itensExportar, setItensExportar] = useState<ConvenioDocumento[]>([])
    const [truncadoExportar, setTruncadoExportar] = useState(false)

    async function handleExportar() {
      setExportando(true)
      try {
        const resultado = await service.listar({
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
        <DocumentoGenericoFiltro valoresIniciais={filtros} onFiltrar={setFiltros} />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-border/30 rounded-xl px-5 py-3 shadow-sm">
          <span className="text-sm text-text-secondary">
            <strong className="text-primary">{totalElements}</strong> documentos encontrados
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
              <option value="data,desc">Mais recentes</option>
              <option value="data,asc">Mais antigos</option>
            </Select>
          </div>
        </div>

        <ModalExportar
          aberto={exportarAberto}
          aoFechar={() => setExportarAberto(false)}
          titulo="Exportar documentos"
          itens={itensExportar}
          colunas={COLUNAS_EXPORTACAO}
          nomeBaseArquivo={nomeBaseArquivo}
          truncado={truncadoExportar}
        />
      </>
    )
  }
}

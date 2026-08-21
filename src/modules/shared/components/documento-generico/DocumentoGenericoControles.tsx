'use client'

import { useState } from 'react'
import { MdDownload, MdSwapVert } from 'react-icons/md'

import ModalExportar from '@/components/ui/ModalExportar'
import Select from '@/components/ui/Select'
import { formatarData, formatarDataHora } from '@/utils/date'
import { ColunaExportacao } from '@/utils/exportacao'
import { useDocumentoGenericoUrlState } from '../../hooks/useDocumentoGenericoUrlState'
import { ListarParams } from '../../services/documentoGenerico.service'
import { DocumentoGenerico, FiltroDocumentoGenerico } from '../../types/DocumentoGenerico'
import { Page } from '../../types/Page'
import DocumentoGenericoFiltro from './DocumentoGenericoFiltro'

// Mesmo teto de usePageableResource.buscarTudoParaExportar — ver comentário lá (também é o
// max-page-size padrão do Spring Data, então pedir mais já seria truncado no backend mesmo).
const LIMITE_EXPORTACAO = 2000

const COLUNAS_EXPORTACAO: ColunaExportacao<DocumentoGenerico>[] = [
  { chave: 'descricao', rotulo: 'Descrição' },
  { chave: 'data', rotulo: 'Data de Publicação', formatar: item => formatarData(item.data) }
]

const COLUNAS_EXPORTACAO_COM_EXERCICIO: ColunaExportacao<DocumentoGenerico>[] = [
  ...COLUNAS_EXPORTACAO,
  { chave: 'exercicio', rotulo: 'Exercício' }
]

interface BaseProps {
  totalElements: number
  atualizadoEm: string
  ordenacaoPadrao?: string
  comExercicio?: boolean
  nomeBaseArquivo: string
  // Chamada client-side existente (axios, via /api) pro botão de exportar buscar TODOS os
  // resultados do filtro atual (não só a página exibida) — a listagem em si já veio pronta do
  // servidor, não passa por este componente. Recebe filtros/ordenacao atuais (lidos da URL)
  // prontos, só falta decidir QUAL recurso buscar — por isso é uma função, não um service+recurso
  // fixo: os módulos com aba (educação, saúde) têm o recurso escolhido em tempo de render, não
  // fixo em build/import time.
  aoExportar: (params: FiltroDocumentoGenerico & { page: number; size: number; sort: string }) => Promise<Page<DocumentoGenerico>>
}

// Componente base, direto (não factory) — filtro + ordenação + exportar. Usado tanto pelos 17
// módulos de recurso fixo (via criarDocumentoGenericoControles abaixo) quanto pelos módulos com
// aba/recurso dinâmico (EducacaoControles, SaudeControles — montam aoExportar com o recurso da
// aba ativa e renderizam este componente direto, sem passar pela factory).
export function DocumentoGenericoControlesBase({
  totalElements,
  atualizadoEm,
  ordenacaoPadrao = 'data,desc',
  comExercicio = false,
  nomeBaseArquivo,
  aoExportar
}: BaseProps) {
  const { ordenacao, filtros, setOrdenacao, setFiltros } = useDocumentoGenericoUrlState(ordenacaoPadrao)

  const [exportando, setExportando] = useState(false)
  const [exportarAberto, setExportarAberto] = useState(false)
  const [itensExportar, setItensExportar] = useState<DocumentoGenerico[]>([])
  const [truncadoExportar, setTruncadoExportar] = useState(false)

  async function handleExportar() {
    setExportando(true)
    try {
      const resultado = await aoExportar({
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
      <DocumentoGenericoFiltro valoresIniciais={filtros} onFiltrar={setFiltros} comExercicio={comExercicio} />

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
        colunas={comExercicio ? COLUNAS_EXPORTACAO_COM_EXERCICIO : COLUNAS_EXPORTACAO}
        nomeBaseArquivo={nomeBaseArquivo}
        truncado={truncadoExportar}
      />
    </>
  )
}

interface Props {
  totalElements: number
  atualizadoEm: string
  ordenacaoPadrao?: string
  comExercicio?: boolean
  nomeBaseArquivo: string
}

interface ServicoParaExportar {
  listar(params: ListarParams): Promise<Page<DocumentoGenerico>>
}

// Factory, não componente direto — mesmo padrão de criarUseDocumentosGenerico (o service e o
// recurso já bindados ficam presos no closure, então o Server Component de cada módulo só
// passa os poucos props que dependem do fetch/estado, sem viés de tipo genérico ali). Usada
// pelos módulos de recurso FIXO (um por página, ex.: competencias, legislacao) — módulos com
// aba (recurso escolhido em tempo de render, ex.: educação/saúde) usam
// DocumentoGenericoControlesBase direto, ver comentário lá.
export function criarDocumentoGenericoControles(service: ServicoParaExportar) {
  return function DocumentoGenericoControles(props: Props) {
    return <DocumentoGenericoControlesBase {...props} aoExportar={params => service.listar(params)} />
  }
}

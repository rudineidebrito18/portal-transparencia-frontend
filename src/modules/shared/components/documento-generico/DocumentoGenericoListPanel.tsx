'use client'

import { useState } from 'react'
import { MdDownload, MdSwapVert } from 'react-icons/md'

import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import ModalExportar from '@/components/ui/ModalExportar'
import Pagination from '@/components/ui/Pagination'
import Select from '@/components/ui/Select'
import Skeleton from '@/components/ui/Skeleton'
import { usePageableResource } from '@/hooks/usePageableResource'
import { formatarData, formatarDataHora } from '@/utils/date'
import { ColunaExportacao } from '@/utils/exportacao'
import { DocumentoGenerico, FiltroDocumentoGenerico } from '../../types/DocumentoGenerico'
import DocumentoGenericoCard from './DocumentoGenericoCard'
import DocumentoGenericoFiltro from './DocumentoGenericoFiltro'

type Props = ReturnType<typeof usePageableResource<DocumentoGenerico, FiltroDocumentoGenerico>> & {
  origem?: { label: string; href: string }
}

const COLUNAS_EXPORTACAO: ColunaExportacao<DocumentoGenerico>[] = [
  { chave: 'descricao', rotulo: 'Descrição' },
  { chave: 'data', rotulo: 'Data de Publicação', formatar: item => formatarData(item.data) }
]

export default function DocumentoGenericoListPanel({
  data: documentos,
  loading,
  erro,
  pagina,
  totalPaginas,
  totalElements,
  atualizadoEm,
  setPagina,
  filtros,
  setFiltros,
  setOrdenacao,
  ordenacao,
  origem
}: Props) {
  const [exportarAberto, setExportarAberto] = useState(false)
  // Nome do arquivo derivado do label da origem (ex.: "Legislação" -> "legislacao"),
  // pra cada módulo baixar com um nome próprio.
  const nomeBaseArquivo =
    origem?.label.toLowerCase().normalize('NFD').replace(/[^a-z0-9]+/g, '-').replace(/-+/g, '-') ?? 'documentos'

  return (
    <div className="space-y-6">

      {/* FILTRO */}
      <DocumentoGenericoFiltro valoresIniciais={filtros} onFiltrar={setFiltros} />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-border/30 rounded-xl px-5 py-3 shadow-sm">

        <span className="text-sm text-text-secondary">
          <strong className="text-primary">{totalElements}</strong> documentos encontrados
          {atualizadoEm && (
            <span className="text-text-muted"> · atualizado em {formatarDataHora(atualizadoEm)}</span>
          )}
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setExportarAberto(true)}
            disabled={documentos.length === 0}
            aria-label="Exportar os dados exibidos na tela"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-semibold hover:bg-primary hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MdDownload size={18} />
            Exportar
          </button>

          <div className="flex items-center gap-2 text-text-secondary text-sm">
            <MdSwapVert />
            Ordenar
          </div>

          <Select
            value={ordenacao || 'data,desc'}
            onChange={(e) => setOrdenacao(e.target.value)}
            aria-label="Ordenar por"
            fullWidth={false}
          >
            <option value="data,desc">Mais recentes</option>
            <option value="data,asc">Mais antigos</option>
          </Select>
        </div>

      </div>

      {/* ERRO */}
      {erro && <ErrorState message={erro} />}

      {/* LOADING */}
      {loading ? (
        <div className="grid gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        <>
          {/* LISTA */}
          <div className="grid gap-4">
            {documentos.length > 0 ? (
              documentos.map(item => (
                <DocumentoGenericoCard key={item.id} documento={item} origem={origem} />
              ))
            ) : (
              <EmptyState message="Nenhum documento encontrado com os filtros aplicados." />
            )}
          </div>

          {/* PAGINAÇÃO */}
          <Pagination pagina={pagina} totalPaginas={totalPaginas} onChange={setPagina} className="mt-6" />
        </>
      )}

      {/* EXPORTAÇÃO (somente os dados da página atual) */}
      <ModalExportar
        aberto={exportarAberto}
        aoFechar={() => setExportarAberto(false)}
        titulo="Exportar documentos"
        itens={documentos}
        colunas={COLUNAS_EXPORTACAO}
        nomeBaseArquivo={nomeBaseArquivo}
      />
    </div>
  )
}

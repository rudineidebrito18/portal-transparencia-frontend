'use client'

import { MdSwapVert } from 'react-icons/md'

import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import Pagination from '@/components/ui/Pagination'
import Skeleton from '@/components/ui/Skeleton'
import { usePageableResource } from '@/hooks/usePageableResource'
import { formatarDataHora } from '@/utils/date'
import { DocumentoGenerico, FiltroDocumentoGenerico } from '../../types/DocumentoGenerico'
import DocumentoGenericoCard from './DocumentoGenericoCard'
import DocumentoGenericoFiltro from './DocumentoGenericoFiltro'

type Props = ReturnType<typeof usePageableResource<DocumentoGenerico, FiltroDocumentoGenerico>> & {
  origem?: { label: string; href: string }
}

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
  return (
    <div className="space-y-6">

      {/* FILTRO */}
      <DocumentoGenericoFiltro valoresIniciais={filtros} onFiltrar={setFiltros} />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-border/30 rounded-xl px-5 py-3 shadow-sm">

        <span className="text-sm text-text-secondary">
          <strong className="text-primary">{totalElements}</strong> documentos encontrados
          {atualizadoEm && (
            <span className="text-text-secondary/60"> · atualizado em {formatarDataHora(atualizadoEm)}</span>
          )}
        </span>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-text-secondary text-sm">
            <MdSwapVert />
            Ordenar
          </div>

          <select
            value={ordenacao || 'data,desc'}
            onChange={(e) => setOrdenacao(e.target.value)}
            aria-label="Ordenar por"
            className="border border-border/30 rounded-lg px-3 py-2 text-sm bg-white focus-visible:ring-2 focus-visible:ring-primary/40 outline-none"
          >
            <option value="data,desc">Mais recentes</option>
            <option value="data,asc">Mais antigos</option>
          </select>
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
    </div>
  )
}

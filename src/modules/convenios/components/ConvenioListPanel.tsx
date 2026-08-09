'use client'

import { MdSwapVert } from 'react-icons/md'

import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import Pagination from '@/components/ui/Pagination'
import Select from '@/components/ui/Select'
import Skeleton from '@/components/ui/Skeleton'
import { usePageableResource } from '@/hooks/usePageableResource'
import { formatarDataHora } from '@/utils/date'
import DocumentoGenericoFiltro from '@/modules/shared/components/documento-generico/DocumentoGenericoFiltro'
import { ConvenioDocumento, FiltroConvenio } from '../types'
import ConvenioCard from './ConvenioCard'

type Props = ReturnType<typeof usePageableResource<ConvenioDocumento, FiltroConvenio>> & {
  emptyMessage: string
}

export default function ConvenioListPanel({
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
  emptyMessage
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
                <ConvenioCard key={item.id} documento={item} />
              ))
            ) : (
              <EmptyState message={emptyMessage} />
            )}
          </div>

          {/* PAGINAÇÃO */}
          <Pagination pagina={pagina} totalPaginas={totalPaginas} onChange={setPagina} className="mt-6" />
        </>
      )}
    </div>
  )
}

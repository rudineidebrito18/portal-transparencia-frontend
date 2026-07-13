'use client'

import { MdSwapVert } from 'react-icons/md'

import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import Pagination from '@/components/ui/Pagination'
import Skeleton from '@/components/ui/Skeleton'
import { useTabelaValores } from '../hooks/useTabelaValores'
import TabelaValoresCard from './TabelaValoresCard'
import TabelaValoresFiltro from './TabelaValoresFiltro'

export default function TabelaValoresListView() {
  const {
    data: documentos,
    loading,
    erro,
    pagina,
    totalPaginas,
    totalElements,
    setPagina,
    filtros,
    setFiltros,
    setOrdenacao,
    ordenacao
  } = useTabelaValores()

  return (
    <div className="space-y-6">

      {/* FILTRO */}
      <TabelaValoresFiltro valoresIniciais={filtros} onFiltrar={setFiltros} />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-border/30 rounded-xl px-5 py-3 shadow-sm">

        <span className="text-sm text-text-secondary">
          <strong className="text-primary">{totalElements}</strong> documentos encontrados
        </span>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-text-secondary text-sm">
            <MdSwapVert />
            Ordenar
          </div>

          <select
            value={ordenacao || 'data,desc'}
            onChange={(e) => setOrdenacao(e.target.value)}
            className="border border-border/30 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-primary/20 outline-none"
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
                <TabelaValoresCard key={item.id} documento={item} />
              ))
            ) : (
              <EmptyState message="Nenhuma tabela de valores encontrada com os filtros aplicados." />
            )}
          </div>

          {/* PAGINAÇÃO */}
          <Pagination pagina={pagina} totalPaginas={totalPaginas} onChange={setPagina} className="mt-6" />
        </>
      )}
    </div>
  )
}

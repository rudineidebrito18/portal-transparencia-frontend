'use client'

import { MdSwapVert } from 'react-icons/md'

import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import Pagination from '@/components/ui/Pagination'
import Skeleton from '@/components/ui/Skeleton'
import { useServidores } from '../hooks/useServidores'
import ServidorCard from './ServidorCard'
import ServidorFiltro from './ServidorFiltro'

export default function ServidorListView() {
  const {
    data: servidores,
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
  } = useServidores()

  return (
    <div className="space-y-6">

      {/* FILTRO */}
      <ServidorFiltro valoresIniciais={filtros} onFiltrar={setFiltros} />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-border/30 rounded-xl px-5 py-3 shadow-sm">

        <span className="text-sm text-text-secondary">
          <strong className="text-primary">{totalElements}</strong> servidores encontrados
        </span>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-text-secondary text-sm">
            <MdSwapVert />
            Ordenar
          </div>

          <select
            value={ordenacao || 'name,asc'}
            onChange={(e) => setOrdenacao(e.target.value)}
            className="border border-border/30 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-primary/20 outline-none"
          >
            <option value="name,asc">Nome (A-Z)</option>
            <option value="name,desc">Nome (Z-A)</option>
            <option value="dataAdmissao,desc">Admissão mais recente</option>
            <option value="dataAdmissao,asc">Admissão mais antiga</option>
          </select>
        </div>

      </div>

      {/* ERRO */}
      {erro && <ErrorState message={erro} />}

      {/* LOADING */}
      {loading ? (
        <div className="grid gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} />
          ))}
        </div>
      ) : (
        <>
          {/* LISTA */}
          <div className="grid gap-4">
            {servidores.length > 0 ? (
              servidores.map(item => (
                <ServidorCard key={item.id} servidor={item} />
              ))
            ) : (
              <EmptyState message="Nenhum servidor encontrado com os filtros aplicados." />
            )}
          </div>

          {/* PAGINAÇÃO */}
          <Pagination pagina={pagina} totalPaginas={totalPaginas} onChange={setPagina} className="mt-6" />
        </>
      )}
    </div>
  )
}

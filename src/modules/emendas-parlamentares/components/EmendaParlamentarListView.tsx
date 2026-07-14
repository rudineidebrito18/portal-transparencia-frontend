'use client'

import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import Pagination from '@/components/ui/Pagination'
import Skeleton from '@/components/ui/Skeleton'
import { useEmendasParlamentares } from '../hooks/useEmendasParlamentares'
import EmendaParlamentarCard from './EmendaParlamentarCard'
import EmendaParlamentarFiltro from './EmendaParlamentarFiltro'

export default function EmendaParlamentarListView() {
  const {
    data: emendas,
    loading,
    erro,
    pagina,
    totalPaginas,
    totalElements,
    setPagina,
    filtros,
    setFiltros
  } = useEmendasParlamentares()

  return (
    <div className="space-y-6">

      {/* FILTRO */}
      <EmendaParlamentarFiltro valoresIniciais={filtros} onFiltrar={setFiltros} />

      {/* HEADER */}
      <div className="flex items-center justify-between bg-white border border-border/30 rounded-xl px-5 py-3 shadow-sm">
        <span className="text-sm text-text-secondary">
          <strong className="text-primary">{totalElements}</strong> resultados encontrados
        </span>
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
            {emendas.length > 0 ? (
              emendas.map(item => (
                <EmendaParlamentarCard key={item.id} emenda={item} />
              ))
            ) : (
              <EmptyState message="Nenhuma emenda parlamentar encontrada com os filtros aplicados." />
            )}
          </div>

          {/* PAGINAÇÃO */}
          <Pagination pagina={pagina} totalPaginas={totalPaginas} onChange={setPagina} className="mt-6" />
        </>
      )}
    </div>
  )
}

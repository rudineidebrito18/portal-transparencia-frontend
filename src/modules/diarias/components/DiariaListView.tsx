'use client'

import { MdSwapVert } from 'react-icons/md'

import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import Pagination from '@/components/ui/Pagination'
import Skeleton from '@/components/ui/Skeleton'
import { useDiarias } from '../hooks/useDiarias'
import DiariaCard from './DiariaCard'
import DiariaFiltro from './DiariaFiltro'

export default function DiariaListView() {
  const {
    data: diarias,
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
  } = useDiarias()

  return (
    <div className="space-y-6">

      {/* FILTRO */}
      <DiariaFiltro valoresIniciais={filtros} onFiltrar={setFiltros} />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-border/30 rounded-xl px-5 py-3 shadow-sm">

        <span className="text-sm text-text-secondary">
          <strong className="text-primary">{totalElements}</strong> diárias encontradas
        </span>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-text-secondary text-sm">
            <MdSwapVert />
            Ordenar
          </div>

          <select
            value={ordenacao || 'dataInicio,desc'}
            onChange={(e) => setOrdenacao(e.target.value)}
            className="border border-border/30 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-primary/20 outline-none"
          >
            <option value="dataInicio,desc">Mais recentes</option>
            <option value="dataInicio,asc">Mais antigas</option>
            <option value="valorConcedido,desc">Maior valor</option>
            <option value="valorConcedido,asc">Menor valor</option>
          </select>
        </div>

      </div>

      {/* ERRO */}
      {erro && <ErrorState message={erro} />}

      {/* LOADING */}
      {loading ? (
        <div className="grid gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : (
        <>
          {/* LISTA */}
          <div className="grid gap-4">
            {diarias.length > 0 ? (
              diarias.map(item => (
                <DiariaCard key={item.id} diaria={item} />
              ))
            ) : (
              <EmptyState message="Nenhuma diária encontrada com os filtros aplicados." />
            )}
          </div>

          {/* PAGINAÇÃO */}
          <Pagination pagina={pagina} totalPaginas={totalPaginas} onChange={setPagina} className="mt-6" />
        </>
      )}
    </div>
  )
}

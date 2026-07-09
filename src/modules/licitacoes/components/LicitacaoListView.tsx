'use client'

import { MdSwapVert } from 'react-icons/md'

import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import Pagination from '@/components/ui/Pagination'
import Skeleton from '@/components/ui/Skeleton'
import { useLicitacoes } from '../hooks/useLicitacoes'
import LicitacaoCard from './LicitacaoCard'
import LicitacaoFiltro from './LicitacaoFiltro'

export default function LicitacaoListView() {
  const {
    data: licitacoes,
    loading,
    erro,
    pagina,
    totalPaginas,
    totalElements,
    setPagina,
    setFiltros,
    setOrdenacao,
    ordenacao
  } = useLicitacoes()

  function handleFiltrar(novosFiltros: Parameters<typeof setFiltros>[0]) {
    setFiltros(novosFiltros)
    setPagina(0)
  }

  return (
    <div className="space-y-6">

      {/* FILTRO */}
      <LicitacaoFiltro onFiltrar={handleFiltrar} />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-border/30 rounded-xl px-5 py-3 shadow-sm">

        <span className="text-sm text-text-secondary">
          <strong className="text-primary">{totalElements}</strong> resultados encontrados
        </span>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-text-secondary text-sm">
            <MdSwapVert />
            Ordenar
          </div>

          <select
            value={ordenacao || 'dataPublicacao,desc'}
            onChange={(e) => setOrdenacao(e.target.value)}
            className="border border-border/30 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-primary/20 outline-none"
          >
            <option value="dataPublicacao,desc">Mais recentes</option>
            <option value="dataPublicacao,asc">Mais antigos</option>
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
            {licitacoes.length > 0 ? (
              licitacoes.map(item => (
                <LicitacaoCard key={item.id} licitacao={item} />
              ))
            ) : (
              <EmptyState message="Nenhuma licitação encontrada com os filtros aplicados." />
            )}
          </div>

          {/* PAGINAÇÃO */}
          <Pagination pagina={pagina} totalPaginas={totalPaginas} onChange={setPagina} className="mt-6" />
        </>
      )}
    </div>
  )
}

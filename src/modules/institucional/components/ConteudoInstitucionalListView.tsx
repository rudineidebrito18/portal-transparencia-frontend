'use client'

import { MdSwapVert } from 'react-icons/md'

import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import Pagination from '@/components/ui/Pagination'
import Skeleton from '@/components/ui/Skeleton'
import { formatarDataHora } from '@/utils/date'
import { ConteudoInstitucional, FiltroConteudoInstitucional } from '../types'
import ConteudoInstitucionalCard from './ConteudoInstitucionalCard'
import ConteudoInstitucionalFiltro from './ConteudoInstitucionalFiltro'

interface Props {
  data: ConteudoInstitucional[]
  loading: boolean
  erro: string | null
  pagina: number
  totalPaginas: number
  totalElements: number
  atualizadoEm: Date | null
  setPagina: (pagina: number) => void
  ordenacao: string
  setOrdenacao: (ordenacao: string) => void
  filtros: FiltroConteudoInstitucional
  setFiltros: (filtros: FiltroConteudoInstitucional) => void
  variant: 'noticia' | 'aviso'
  emptyMessage: string
}

export default function ConteudoInstitucionalListView({
  data,
  loading,
  erro,
  pagina,
  totalPaginas,
  totalElements,
  atualizadoEm,
  setPagina,
  ordenacao,
  setOrdenacao,
  filtros,
  setFiltros,
  variant,
  emptyMessage
}: Props) {

  return (
    <div className="space-y-6">

      {/* FILTRO */}
      <ConteudoInstitucionalFiltro valoresIniciais={filtros} onFiltrar={setFiltros} variant={variant} />

      {erro && <ErrorState message={erro} />}

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      )}

      {!loading && !erro && (
        <>
          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-border/30 rounded-xl px-5 py-3 shadow-sm">
            <span className="text-sm text-text-secondary">
              <strong className="text-primary">{totalElements}</strong>{' '}
              {variant === 'aviso' ? 'avisos encontrados' : 'notícias encontradas'}
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
                className="border border-border/30 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-primary/20 outline-none"
              >
                <option value="data,desc">Mais recentes</option>
                <option value="data,asc">Mais antigos</option>
                <option value="titulo,asc">Título (A-Z)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.length > 0 ? (
              data.map(item => (
                <ConteudoInstitucionalCard key={item.id} item={item} variant={variant} />
              ))
            ) : (
              <EmptyState message={emptyMessage} className="col-span-full" />
            )}
          </div>

          <Pagination pagina={pagina} totalPaginas={totalPaginas} onChange={setPagina} />
        </>
      )}
    </div>
  )
}

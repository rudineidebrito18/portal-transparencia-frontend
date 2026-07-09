'use client'

import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import Pagination from '@/components/ui/Pagination'
import Skeleton from '@/components/ui/Skeleton'
import { ConteudoInstitucional } from '../types'
import ConteudoInstitucionalCard from './ConteudoInstitucionalCard'

interface Props {
  data: ConteudoInstitucional[]
  loading: boolean
  erro: string | null
  pagina: number
  totalPaginas: number
  setPagina: (pagina: number) => void
  variant: 'noticia' | 'aviso'
  emptyMessage: string
}

export default function ConteudoInstitucionalListView({
  data,
  loading,
  erro,
  pagina,
  totalPaginas,
  setPagina,
  variant,
  emptyMessage
}: Props) {

  if (erro) {
    return <ErrorState message={erro} />
  }

  if (loading) {
    return (
      <div className="grid gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">

      <div className="grid gap-4">
        {data.length > 0 ? (
          data.map(item => (
            <ConteudoInstitucionalCard key={item.id} item={item} variant={variant} />
          ))
        ) : (
          <EmptyState message={emptyMessage} />
        )}
      </div>

      <Pagination pagina={pagina} totalPaginas={totalPaginas} onChange={setPagina} />
    </div>
  )
}

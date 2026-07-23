import { ReactNode } from 'react'

import EmptyState from './EmptyState'
import ErrorState from './ErrorState'
import Skeleton from './Skeleton'

interface Props<T> {
  loading: boolean
  erro: string | null
  data: T[]
  renderItem: (item: T) => ReactNode
  emptyMessage: string
  skeletonCount?: number
  skeletonClassName?: string
  gridClassName?: string
}

export default function AsyncList<T>({
  loading,
  erro,
  data,
  renderItem,
  emptyMessage,
  skeletonCount = 4,
  skeletonClassName = 'h-24',
  gridClassName = 'grid gap-4'
}: Props<T>) {
  if (loading) {
    return (
      <div className={gridClassName}>
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <Skeleton key={i} className={skeletonClassName} />
        ))}
      </div>
    )
  }

  if (erro) return <ErrorState message={erro} />

  if (data.length === 0) return <EmptyState message={emptyMessage} />

  return <div className={gridClassName}>{data.map(renderItem)}</div>
}

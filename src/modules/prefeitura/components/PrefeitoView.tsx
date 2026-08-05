'use client'

import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import Skeleton from '@/components/ui/Skeleton'
import { usePrefeito } from '../hooks/usePrefeito'
import AutoridadeView from './AutoridadeView'

export default function PrefeitoView() {
  const { data: prefeito, loading, erro } = usePrefeito()

  if (loading) {
    return (
      <div className="grid gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    )
  }

  if (erro) return <ErrorState message={erro} />

  if (!prefeito) return <EmptyState message="O perfil do Prefeito ainda não foi cadastrado." />

  return <AutoridadeView autoridade={prefeito} />
}

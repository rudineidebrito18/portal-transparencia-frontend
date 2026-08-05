'use client'

import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import Skeleton from '@/components/ui/Skeleton'
import { useVicePrefeito } from '../hooks/useVicePrefeito'
import AutoridadeView from './AutoridadeView'

export default function VicePrefeitoView() {
  const { data: vicePrefeito, loading, erro } = useVicePrefeito()

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

  if (!vicePrefeito) return <EmptyState message="O perfil do Vice-Prefeito ainda não foi cadastrado." />

  return <AutoridadeView autoridade={vicePrefeito} />
}

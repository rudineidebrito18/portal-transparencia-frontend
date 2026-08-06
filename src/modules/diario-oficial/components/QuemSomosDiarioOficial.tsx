'use client'

import Card from '@/components/ui/Card'
import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import Skeleton from '@/components/ui/Skeleton'
import { useDiarioOficialInfo } from '../hooks/useDiarioOficialInfo'

export default function QuemSomosDiarioOficial() {
  const { data: info, loading, erro } = useDiarioOficialInfo()

  if (loading) return <Skeleton className="h-40" />
  if (erro) return <ErrorState message={erro} />
  if (!info?.quemSomos) return <EmptyState message="Ainda não há um texto de apresentação cadastrado." />

  return (
    <Card className="p-6" hoverable={false}>
      <h2 className="text-base font-bold text-primary mb-3">{info.name}</h2>
      <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">
        {info.quemSomos}
      </p>
    </Card>
  )
}

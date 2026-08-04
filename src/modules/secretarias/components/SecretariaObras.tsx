'use client'

import Link from 'next/link'
import { MdArrowForward } from 'react-icons/md'

import EmptyState from '@/components/ui/EmptyState'
import ErrorState from '@/components/ui/ErrorState'
import Skeleton from '@/components/ui/Skeleton'
import { useAsyncData } from '@/hooks/useAsyncData'
import ObraCard from '@/modules/obras/components/ObraCard'
import { obraService } from '@/modules/obras/obra.service'
import { Page } from '@/modules/shared/types/Page'
import { ObraPublica } from '@/modules/obras/types'

// Navegação cruzada por órgão (inspirada em Bom Lugar) — só existe pra Obras porque é o
// único dos três módulos (Contratos/Obras/Diárias) cujo filtro no backend aceita
// `unidadeId` (confirmado via /v3/api-docs). Contratos e Diárias ainda não têm essa
// dimensão de filtro — ver Pendências de Backend na auditoria.
export default function SecretariaObras({ unidadeId }: { unidadeId: number }) {
  const { data: pagina, loading, erro } = useAsyncData<Page<ObraPublica> | null>(
    () => obraService.listar({ unidadeId, size: 5, sort: 'dataInicio,desc' }),
    [unidadeId],
    null
  )

  if (loading) {
    return (
      <div className="grid gap-4">
        {Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-40" />)}
      </div>
    )
  }

  if (erro) return <ErrorState message={erro} />

  if (!pagina || pagina.content.length === 0) {
    return <EmptyState message="Nenhuma obra pública cadastrada para esta secretaria." />
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {pagina.content.map(obra => (
          <ObraCard key={obra.id} obra={obra} />
        ))}
      </div>

      {pagina.totalElements > pagina.content.length && (
        <Link
          href={`/obras?unidadeId=${unidadeId}`}
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
        >
          Ver todas as {pagina.totalElements} obras desta secretaria
          <MdArrowForward size={16} />
        </Link>
      )}
    </div>
  )
}

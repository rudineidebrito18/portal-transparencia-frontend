import { Suspense } from 'react'

import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'
import TransferenciaVoluntariaListView from '@/modules/execucao-orcamentaria/components/TransferenciaVoluntariaListView'

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function TransferenciaVoluntaria({ searchParams }: Props) {
  const params = await searchParams

  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader title="Transferências Voluntárias (EC nº 105)" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Transferências Voluntárias (EC nº 105)' }
        ]} />

      <Suspense fallback={<div className="grid gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>}>
        <TransferenciaVoluntariaListView searchParams={params} />
      </Suspense>
    </div>
  )
}

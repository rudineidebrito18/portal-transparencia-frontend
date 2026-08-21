import { Suspense } from 'react'

import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'
import EmendaFederalListView from '@/modules/emendas-federais/components/EmendaFederalListView'

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function EmendasFederais({ searchParams }: Props) {
  const params = await searchParams

  return (
    <div className="max-w-6xl mx-auto p-2">
      <PageHeader title="Emendas Federais" breadcrumbItems={[
          { label: 'Transparência', href: '/transparencia' },
          { label: 'Emendas federais' }
        ]} />

      <Suspense fallback={<div className="grid gap-4">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)}</div>}>
        <EmendaFederalListView searchParams={params} />
      </Suspense>
    </div>
  )
}
